"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthMonitor = exports.InitializationTimeoutError = void 0;
exports.calculateBackoffDelay = calculateBackoffDelay;
const xstate_1 = require("xstate");
const ConnectionManager_1 = require("./ConnectionManager");
const url_1 = require("../utils/url");
const InstanceRegistry_1 = require("./InstanceRegistry");
const error_handler_1 = require("../utils/error-handler");
const fetch_1 = require("../utils/fetch");
const logger_1 = require("../logger");
const config_1 = require("../config");
const index_1 = require("../oauth/index");
class InitializationTimeoutError extends Error {
    constructor(timeoutMs) {
        super(`Initialization timeout after ${timeoutMs}ms`);
        this.name = 'InitializationTimeoutError';
    }
}
exports.InitializationTimeoutError = InitializationTimeoutError;
function calculateBackoffDelay(attempt) {
    const exponential = Math.min(config_1.RECONNECT_BASE_DELAY_MS * Math.pow(2, attempt), config_1.RECONNECT_MAX_DELAY_MS);
    const jitter = exponential * 0.1 * (Math.random() * 2 - 1);
    return Math.max(config_1.RECONNECT_BASE_DELAY_MS, Math.min(Math.round(exponential + jitter), config_1.RECONNECT_MAX_DELAY_MS));
}
function hasSchemaInfo(connectionManager, instanceUrl) {
    try {
        connectionManager.getSchemaInfo(instanceUrl);
        return true;
    }
    catch {
        return false;
    }
}
function isDegradedInstance(connectionManager, instanceUrl) {
    try {
        const info = connectionManager.getInstanceInfo(instanceUrl);
        return info.version === 'unknown' || !hasSchemaInfo(connectionManager, instanceUrl);
    }
    catch {
        return true;
    }
}
const performConnect = (0, xstate_1.fromPromise)(async ({ input }) => {
    const connectionManager = ConnectionManager_1.ConnectionManager.getInstance();
    if (connectionManager.isConnected(input.instanceUrl)) {
        const healthy = await quickHealthCheck(input.instanceUrl, HEALTH_CHECK_PROBE_MS);
        if (!healthy) {
            throw new Error(`Health check failed for ${input.instanceUrl}`);
        }
        await authenticatedTokenCheck(input.instanceUrl, HEALTH_CHECK_PROBE_MS);
        return { degraded: isDegradedInstance(connectionManager, input.instanceUrl) };
    }
    const deadline = Date.now() + config_1.INIT_TIMEOUT_MS;
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new InitializationTimeoutError(config_1.INIT_TIMEOUT_MS)), config_1.INIT_TIMEOUT_MS);
    });
    try {
        await Promise.race([connectionManager.initialize(input.instanceUrl), timeoutPromise]);
    }
    catch (error) {
        const isTimeout = error instanceof InitializationTimeoutError;
        if (isTimeout) {
            connectionManager.clearInflight(input.instanceUrl);
        }
        throw error;
    }
    finally {
        clearTimeout(timeoutId);
    }
    const isDegraded = isDegradedInstance(connectionManager, input.instanceUrl);
    if (isDegraded) {
        const remainingMs = deadline - Date.now();
        if (remainingMs <= 0) {
            return { degraded: isDegraded };
        }
        if (remainingMs < 500) {
            return { degraded: isDegraded };
        }
        const reachable = await quickHealthCheck(input.instanceUrl, remainingMs);
        if (!reachable) {
            throw new Error(`Health check failed for ${input.instanceUrl}: instance unreachable after degraded init`);
        }
    }
    return { degraded: isDegraded };
});
const performHealthCheck = (0, xstate_1.fromPromise)(async ({ input }) => {
    const healthy = await quickHealthCheck(input.instanceUrl);
    if (!healthy) {
        throw new Error(`Health check failed for ${input.instanceUrl}`);
    }
    await authenticatedTokenCheck(input.instanceUrl, HEALTH_CHECK_PROBE_MS);
    const connectionManager = ConnectionManager_1.ConnectionManager.getInstance();
    return { degraded: isDegradedInstance(connectionManager, input.instanceUrl) };
});
const HEALTH_CHECK_PROBE_MS = 3000;
async function quickHealthCheck(instanceUrl, timeoutMs = HEALTH_CHECK_PROBE_MS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await (0, fetch_1.enhancedFetch)(`${instanceUrl}/api/v4/version`, {
            method: 'HEAD',
            signal: controller.signal,
            retry: false,
            skipAuth: true,
            rateLimit: false,
        });
        return response.status < 500;
    }
    catch {
        return false;
    }
    finally {
        clearTimeout(timeoutId);
    }
}
async function authenticatedTokenCheck(instanceUrl, timeoutMs) {
    if ((0, index_1.isOAuthEnabled)())
        return;
    if (!config_1.GITLAB_TOKEN)
        return;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await (0, fetch_1.enhancedFetch)(`${instanceUrl}/api/v4/user`, {
            method: 'HEAD',
            signal: controller.signal,
            retry: false,
            rateLimit: false,
            skipAuth: true,
            headers: { 'PRIVATE-TOKEN': config_1.GITLAB_TOKEN },
        });
        if (response.status === 401 || response.status === 403) {
            throw new Error(`GitLab API error: ${response.status} - token invalid or lacks required scope`);
        }
        if (!response.ok) {
            throw new Error(`GitLab API error: ${response.status} - authenticated health probe failed`);
        }
    }
    catch (error) {
        if (error instanceof Error) {
            const parsed = (0, error_handler_1.parseGitLabApiError)(error.message);
            if (parsed?.status === 401 || parsed?.status === 403)
                throw error;
            if (error.name === 'AbortError' || (0, error_handler_1.classifyError)(error) === 'transient')
                return;
        }
        (0, logger_1.logError)('Unexpected error during authenticated token health check', {
            err: error instanceof Error ? error : new Error(String(error)),
        });
        throw error;
    }
    finally {
        clearTimeout(timeoutId);
    }
}
const healthCheckOnError = [
    {
        guard: 'healthCheckErrorIsAuth',
        target: '#connection.failed',
        actions: 'recordFailure',
    },
    {
        target: 'idle',
        actions: 'recordFailure',
    },
];
const connectionMachine = (0, xstate_1.setup)({
    types: {
        context: {},
        events: {},
        input: {},
    },
    actors: {
        performConnect,
        performHealthCheck,
    },
    delays: {
        reconnectDelay: ({ context }) => calculateBackoffDelay(context.reconnectAttempt),
        healthCheckInterval: () => config_1.HEALTH_CHECK_INTERVAL_MS,
        degradedCheckInterval: () => Math.min(config_1.HEALTH_CHECK_INTERVAL_MS, 30_000),
    },
    guards: {
        isTransient: (_, params) => params.category === 'transient',
        thresholdReached: ({ context }) => context.consecutiveFailures >= config_1.FAILURE_THRESHOLD,
        connectErrorIsTransient: ({ event }) => {
            const error = event.error;
            return (0, error_handler_1.classifyError)(error) === 'transient';
        },
        healthCheckErrorIsAuth: ({ event }) => {
            const error = event.error;
            if (!(error instanceof Error))
                return false;
            const parsed = (0, error_handler_1.parseGitLabApiError)(error.message);
            return parsed?.status === 401 || parsed?.status === 403;
        },
    },
    actions: {
        recordSuccess: (0, xstate_1.assign)({
            consecutiveFailures: 0,
            reconnectAttempt: 0,
            lastSuccessAt: () => Date.now(),
            lastError: null,
        }),
        incrementReconnectAttempt: (0, xstate_1.assign)({
            reconnectAttempt: ({ context }) => context.reconnectAttempt + 1,
        }),
        recordFailure: (0, xstate_1.assign)({
            consecutiveFailures: ({ context }) => context.consecutiveFailures + 1,
            lastFailureAt: () => Date.now(),
            lastError: ({ event }) => {
                const e = event.error;
                return e instanceof Error ? e.message : typeof e === 'string' ? e : String(e);
            },
        }),
    },
}).createMachine({
    id: 'connection',
    initial: 'connecting',
    context: ({ input }) => ({
        instanceUrl: input.instanceUrl,
        consecutiveFailures: 0,
        reconnectAttempt: 0,
        lastSuccessAt: null,
        lastFailureAt: null,
        lastError: null,
    }),
    states: {
        connecting: {
            invoke: {
                src: 'performConnect',
                input: ({ context }) => ({ instanceUrl: context.instanceUrl }),
                onDone: [
                    {
                        guard: ({ event }) => event.output.degraded,
                        target: 'degraded',
                        actions: 'recordSuccess',
                    },
                    {
                        target: 'healthy',
                        actions: 'recordSuccess',
                    },
                ],
                onError: [
                    {
                        guard: 'connectErrorIsTransient',
                        target: 'disconnected',
                        actions: 'recordFailure',
                    },
                    {
                        target: 'failed',
                        actions: (0, xstate_1.assign)({
                            lastFailureAt: () => Date.now(),
                            lastError: ({ event }) => event.error instanceof Error ? event.error.message : String(event.error),
                        }),
                    },
                ],
            },
        },
        healthy: {
            initial: 'idle',
            on: {
                TOOL_SUCCESS: {
                    actions: 'recordSuccess',
                },
                TOOL_FAILURE: [
                    {
                        guard: {
                            type: 'isTransient',
                            params: ({ event }) => ({ category: event.category }),
                        },
                        actions: 'recordFailure',
                    },
                ],
            },
            always: [
                {
                    guard: 'thresholdReached',
                    target: '#connection.disconnected',
                },
            ],
            states: {
                idle: {
                    after: {
                        healthCheckInterval: 'checking',
                    },
                },
                checking: {
                    invoke: {
                        src: 'performHealthCheck',
                        input: ({ context }) => ({ instanceUrl: context.instanceUrl }),
                        onDone: [
                            {
                                guard: ({ event }) => event.output.degraded,
                                target: '#connection.degraded',
                                actions: 'recordSuccess',
                            },
                            {
                                target: 'idle',
                                actions: 'recordSuccess',
                            },
                        ],
                        onError: healthCheckOnError,
                    },
                },
            },
        },
        degraded: {
            initial: 'idle',
            on: {
                TOOL_SUCCESS: {
                    actions: 'recordSuccess',
                },
                TOOL_FAILURE: [
                    {
                        guard: {
                            type: 'isTransient',
                            params: ({ event }) => ({ category: event.category }),
                        },
                        actions: 'recordFailure',
                    },
                ],
            },
            always: [
                {
                    guard: 'thresholdReached',
                    target: '#connection.disconnected',
                },
            ],
            states: {
                idle: {
                    after: {
                        degradedCheckInterval: 'checking',
                    },
                },
                checking: {
                    invoke: {
                        src: 'performHealthCheck',
                        input: ({ context }) => ({ instanceUrl: context.instanceUrl }),
                        onDone: [
                            {
                                guard: ({ event }) => !event.output.degraded,
                                target: '#connection.healthy',
                                actions: 'recordSuccess',
                            },
                            {
                                target: 'idle',
                                actions: 'recordSuccess',
                            },
                        ],
                        onError: healthCheckOnError,
                    },
                },
            },
        },
        disconnected: {
            after: {
                reconnectDelay: 'connecting',
            },
            exit: ['incrementReconnectAttempt'],
            on: {
                RECONNECT: {
                    target: 'connecting',
                },
            },
        },
        failed: {
            on: {
                RECONNECT: {
                    target: 'connecting',
                },
            },
        },
    },
});
class HealthMonitor {
    static instance = null;
    actors = new Map();
    previousStates = new Map();
    stateChangeCallbacks = [];
    subscriptions = new Map();
    constructor() { }
    static getInstance() {
        HealthMonitor.instance ??= new HealthMonitor();
        return HealthMonitor.instance;
    }
    onStateChange(callback) {
        this.stateChangeCallbacks.push(callback);
    }
    async initialize(instanceUrl) {
        const url = this.resolveUrl(instanceUrl);
        const existingActor = this.actors.get(url);
        if (existingActor) {
            (0, logger_1.logDebug)('HealthMonitor: actor already exists for instance', { url });
            if (this.getActorState(existingActor) === 'connecting') {
                await this.waitForInitialState(existingActor);
            }
            return;
        }
        (0, logger_1.logInfo)('HealthMonitor: initializing connection monitoring', { url });
        const actor = (0, xstate_1.createActor)(connectionMachine, {
            input: { instanceUrl: url },
        });
        this.actors.set(url, actor);
        this.previousStates.set(url, 'connecting');
        const subscription = actor.subscribe((snapshot) => {
            this.handleStateChange(url, snapshot);
        });
        this.subscriptions.set(url, subscription);
        actor.start();
        await this.waitForInitialState(actor);
    }
    waitForInitialState(actor) {
        return new Promise((resolve) => {
            const sub = actor.subscribe((snapshot) => {
                const state = this.extractState(snapshot);
                if (state !== 'connecting') {
                    sub.unsubscribe();
                    resolve();
                }
            });
            const currentState = this.getActorState(actor);
            if (currentState !== 'connecting') {
                sub.unsubscribe();
                resolve();
            }
        });
    }
    handleStateChange(instanceUrl, snapshot) {
        const newState = this.extractState(snapshot);
        const previousState = this.previousStates.get(instanceUrl);
        if (previousState === newState)
            return;
        const context = snapshot.context;
        (0, logger_1.logInfo)('Connection state changed', {
            instanceUrl,
            from: previousState,
            to: newState,
            consecutiveFailures: context.consecutiveFailures,
            reconnectAttempt: context.reconnectAttempt,
            lastError: context.lastError,
        });
        try {
            const registry = InstanceRegistry_1.InstanceRegistry.getInstance();
            if (registry.isInitialized()) {
                let registryStatus;
                if (newState === 'healthy') {
                    registryStatus = 'healthy';
                }
                else if (newState === 'degraded') {
                    registryStatus = 'degraded';
                }
                else {
                    registryStatus = 'offline';
                }
                registry.updateConnectionStatus(instanceUrl, registryStatus);
            }
        }
        catch {
        }
        const effectivePrevious = previousState ?? 'connecting';
        for (const callback of this.stateChangeCallbacks) {
            try {
                callback(instanceUrl, effectivePrevious, newState);
            }
            catch (error) {
                (0, logger_1.logError)('State change callback error', { err: error });
            }
        }
        this.previousStates.set(instanceUrl, newState);
    }
    extractState(snapshot) {
        const value = snapshot.value;
        if (typeof value === 'string') {
            return value;
        }
        const topLevel = Object.keys(value)[0];
        return topLevel;
    }
    getActorState(actor) {
        return this.extractState(actor.getSnapshot());
    }
    resolveUrl(instanceUrl) {
        return (0, url_1.normalizeInstanceUrl)(instanceUrl ?? config_1.GITLAB_BASE_URL);
    }
    getActor(instanceUrl) {
        return this.actors.get(this.resolveUrl(instanceUrl));
    }
    getState(instanceUrl) {
        const actor = this.getActor(instanceUrl);
        if (!actor)
            return 'disconnected';
        return this.getActorState(actor);
    }
    getSnapshot(instanceUrl) {
        const actor = this.getActor(instanceUrl);
        if (!actor) {
            return {
                state: 'disconnected',
                consecutiveFailures: 0,
                reconnectAttempt: 0,
                lastSuccessAt: null,
                lastFailureAt: null,
                lastError: null,
            };
        }
        const snapshot = actor.getSnapshot();
        const context = snapshot.context;
        return {
            state: this.extractState(snapshot),
            consecutiveFailures: context.consecutiveFailures,
            reconnectAttempt: context.reconnectAttempt,
            lastSuccessAt: context.lastSuccessAt,
            lastFailureAt: context.lastFailureAt,
            lastError: context.lastError,
        };
    }
    isAnyInstanceHealthy() {
        if (this.actors.size === 0)
            return true;
        for (const actor of this.actors.values()) {
            const state = this.getActorState(actor);
            if (state === 'healthy' || state === 'degraded' || state === 'connecting') {
                return true;
            }
        }
        return false;
    }
    isInstanceReachable(instanceUrl) {
        const actor = this.getActor(instanceUrl);
        if (!actor)
            return true;
        const state = this.getActorState(actor);
        return state === 'healthy' || state === 'degraded';
    }
    reportSuccess(instanceUrl) {
        const actor = this.getActor(instanceUrl);
        if (actor) {
            actor.send({ type: 'TOOL_SUCCESS' });
        }
    }
    reportError(instanceUrl, error) {
        const actor = this.getActor(instanceUrl);
        if (!actor || !error)
            return;
        const category = (0, error_handler_1.classifyError)(error);
        actor.send({
            type: 'TOOL_FAILURE',
            error: error.message,
            category,
        });
        if (category === 'transient') {
            (0, logger_1.logWarn)('Transient error reported to health monitor', {
                instanceUrl: this.resolveUrl(instanceUrl),
                error: error.message,
            });
        }
    }
    forceReconnect(instanceUrl) {
        const actor = this.getActor(instanceUrl);
        if (actor) {
            actor.send({ type: 'RECONNECT' });
        }
    }
    getMonitoredInstances() {
        return [...this.actors.keys()];
    }
    shutdown() {
        for (const [url, actor] of this.actors) {
            try {
                actor.stop();
            }
            catch {
            }
            (0, logger_1.logDebug)('HealthMonitor: stopped actor', { url });
        }
        for (const sub of this.subscriptions.values()) {
            try {
                sub.unsubscribe();
            }
            catch {
            }
        }
        this.actors.clear();
        this.subscriptions.clear();
        this.previousStates.clear();
        this.stateChangeCallbacks = [];
        (0, logger_1.logInfo)('HealthMonitor shut down');
    }
    static resetInstance() {
        if (HealthMonitor.instance) {
            HealthMonitor.instance.shutdown();
            HealthMonitor.instance = null;
        }
    }
}
exports.HealthMonitor = HealthMonitor;
//# sourceMappingURL=HealthMonitor.js.map