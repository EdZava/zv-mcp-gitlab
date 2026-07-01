"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetHandlersState = resetHandlersState;
exports.setupHandlers = setupHandlers;
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const ConnectionManager_1 = require("./services/ConnectionManager");
const HealthMonitor_1 = require("./services/HealthMonitor");
const url_1 = require("./utils/url");
const logger_1 = require("./logger");
const error_handler_1 = require("./utils/error-handler");
const fetch_1 = require("./utils/fetch");
const index_1 = require("./logging/index");
const config_1 = require("./config");
function hasAction(value) {
    return (typeof value === 'object' &&
        value !== null &&
        'action' in value &&
        typeof value.action === 'string');
}
function extractActionFromError(error) {
    if (hasAction(error)) {
        return error.action;
    }
    const cause = error.cause;
    if (hasAction(cause)) {
        return cause.action;
    }
    return undefined;
}
function recordEarlyReturnError(toolName, action, errorMessage) {
    const requestTracker = (0, index_1.getRequestTracker)();
    if (config_1.LOG_FORMAT === 'condensed') {
        requestTracker.setToolForCurrentRequest(toolName, action);
        requestTracker.setErrorForCurrentRequest(errorMessage);
    }
    const currentRequestId = (0, index_1.getCurrentRequestId)();
    if (currentRequestId) {
        const stack = requestTracker.getStack(currentRequestId);
        if (stack?.sessionId) {
            (0, index_1.getConnectionTracker)().recordError(stack.sessionId, errorMessage);
        }
    }
}
function isIdempotentOperation(toolName) {
    return (toolName.startsWith('browse_') ||
        toolName.startsWith('list_') ||
        toolName.startsWith('get_') ||
        toolName.startsWith('download_') ||
        toolName === 'manage_context');
}
function toStructuredError(error, toolName, toolArgs) {
    if ((0, error_handler_1.isStructuredToolError)(error)) {
        return error.structuredError;
    }
    const cause = error.cause;
    if ((0, error_handler_1.isStructuredToolError)(cause)) {
        return cause.structuredError;
    }
    if (!(error instanceof Error))
        return null;
    let action = extractActionFromError(error);
    if (!action && toolArgs && typeof toolArgs.action === 'string') {
        action = toolArgs.action;
    }
    action ??= 'unknown';
    if (error instanceof fetch_1.GitLabTimeoutError ||
        (error instanceof Error &&
            error.name === 'GitLabTimeoutError' &&
            'timeoutMs' in error &&
            typeof error.timeoutMs === 'number')) {
        const retryable = isIdempotentOperation(toolName);
        return (0, error_handler_1.createTimeoutError)(toolName, action, error.timeoutMs, retryable);
    }
    if (error instanceof Error) {
        const timeoutMs = (0, error_handler_1.parseTimeoutError)(error.message);
        if (timeoutMs !== null) {
            const retryable = isIdempotentOperation(toolName);
            return (0, error_handler_1.createTimeoutError)(toolName, action, timeoutMs, retryable);
        }
    }
    const parsed = (0, error_handler_1.parseGitLabApiError)(error.message);
    if (!parsed)
        return null;
    return (0, error_handler_1.handleGitLabError)({ status: parsed.status, message: parsed.message }, toolName, action, toolArgs);
}
function checkUnreachableInstance(toolName, toolArguments, effectiveInstanceUrl, healthMonitor) {
    if (healthMonitor.isInstanceReachable(effectiveInstanceUrl) || toolName === 'manage_context') {
        return null;
    }
    const action = toolArguments && typeof toolArguments.action === 'string' ? toolArguments.action : 'unknown';
    const rawState = healthMonitor.getState(effectiveInstanceUrl);
    let connectionState;
    if (rawState === 'failed') {
        connectionState = 'failed';
    }
    else if (rawState === 'connecting') {
        connectionState = 'connecting';
    }
    else {
        connectionState = 'disconnected';
    }
    const connError = (0, error_handler_1.createConnectionFailedError)(toolName, action, effectiveInstanceUrl, connectionState);
    recordEarlyReturnError(toolName, action, connError.message);
    return { content: [{ type: 'text', text: JSON.stringify(connError, null, 2) }], isError: true };
}
async function resyncSessionAfterSwitchProfile(toolName, toolArguments, sessionId) {
    if (toolName !== 'manage_context' || !sessionId)
        return;
    const action = toolArguments && typeof toolArguments.action === 'string' ? toolArguments.action : undefined;
    if (action !== 'switch_profile')
        return;
    try {
        const { getContextManager } = await Promise.resolve().then(() => __importStar(require('./entities/context/context-manager')));
        const newProfileUrl = await getContextManager().getCurrentProfileUrl();
        if (!newProfileUrl)
            return;
        const normalized = (0, url_1.normalizeInstanceUrl)(newProfileUrl);
        const { getSessionManager } = await Promise.resolve().then(() => __importStar(require('./session-manager')));
        const sessionManager = getSessionManager();
        const pinnedUrl = sessionManager.getSessionInstanceUrl(sessionId);
        if (pinnedUrl && (0, url_1.normalizeInstanceUrl)(pinnedUrl) === normalized)
            return;
        sessionManager.setSessionInstanceUrl(sessionId, normalized);
    }
    catch (err) {
        (0, logger_1.logWarn)('Failed to re-pin session after switch_profile', {
            error: err instanceof Error ? err.message : String(err),
        });
    }
}
async function tryManageContextFastPath(toolName, toolArguments, effectiveInstanceUrl, healthMonitor, sessionId) {
    if (toolName !== 'manage_context' || healthMonitor.isInstanceReachable(effectiveInstanceUrl)) {
        return null;
    }
    if (config_1.LOG_FORMAT === 'condensed') {
        const action = toolArguments && typeof toolArguments.action === 'string' ? toolArguments.action : undefined;
        const requestTracker = (0, index_1.getRequestTracker)();
        requestTracker.setToolForCurrentRequest(toolName, action);
    }
    const { RegistryManager } = await Promise.resolve().then(() => __importStar(require('./registry-manager')));
    const registryManager = RegistryManager.getInstance();
    if (registryManager.hasToolHandler(toolName, effectiveInstanceUrl)) {
        const result = await registryManager.executeTool(toolName, toolArguments, effectiveInstanceUrl);
        if (result === undefined) {
            return null;
        }
        await resyncSessionAfterSwitchProfile(toolName, toolArguments, sessionId);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
    return null;
}
async function ensureBootstrapped(ctx) {
    const { toolName, toolArguments, effectiveInstanceUrl, oauthMode, connectionManager, healthMonitor, isTimedOut, bootstrapState, } = ctx;
    bootstrapState.started = true;
    try {
        if (!connectionManager.isConnected(effectiveInstanceUrl)) {
            if (config_1.LOG_FORMAT === 'verbose') {
                (0, logger_1.logInfo)('Connection not initialized, attempting to initialize...');
            }
            await connectionManager.initialize(effectiveInstanceUrl);
        }
        connectionManager.getClient(effectiveInstanceUrl);
        if (oauthMode) {
            await connectionManager.ensureIntrospected(effectiveInstanceUrl);
        }
        bootstrapState.complete = true;
        try {
            const { RegistryManager } = await Promise.resolve().then(() => __importStar(require('./registry-manager')));
            RegistryManager.getInstance().refreshCache(effectiveInstanceUrl);
        }
        catch (cacheError) {
            (0, logger_1.logWarn)('Failed to refresh registry cache after bootstrap', {
                instanceUrl: effectiveInstanceUrl,
                err: cacheError,
            });
        }
        if (config_1.LOG_FORMAT === 'verbose') {
            try {
                const instanceInfo = connectionManager.getInstanceInfo(effectiveInstanceUrl);
                (0, logger_1.logInfo)(`Connection verified: ${instanceInfo.version} ${instanceInfo.tier}`);
            }
            catch {
                (0, logger_1.logDebug)('Connection verified but instance info not yet available', {
                    instanceUrl: effectiveInstanceUrl,
                });
            }
        }
        return undefined;
    }
    catch (initError) {
        const errorCategory = initError instanceof Error ? (0, error_handler_1.classifyError)(initError) : 'permanent';
        if (initError instanceof Error) {
            if (!isTimedOut() || errorCategory === 'auth' || errorCategory === 'permanent') {
                healthMonitor.reportError(effectiveInstanceUrl, initError);
            }
        }
        (0, logger_1.logError)(`Connection initialization failed: ${initError instanceof Error ? initError.message : String(initError)}`, {
            instanceUrl: effectiveInstanceUrl,
            err: initError instanceof Error ? initError : new Error(String(initError)),
        });
        const action = toolArguments && typeof toolArguments.action === 'string' ? toolArguments.action : 'unknown';
        const monitorState = healthMonitor.getState(effectiveInstanceUrl);
        let derivedState;
        if (monitorState === 'connecting' || monitorState === 'failed') {
            derivedState = monitorState;
        }
        else if (errorCategory === 'auth' || errorCategory === 'permanent') {
            derivedState = 'failed';
        }
        else {
            derivedState = 'disconnected';
        }
        const connError = (0, error_handler_1.createConnectionFailedError)(toolName, action, effectiveInstanceUrl, derivedState);
        if (!isTimedOut()) {
            recordEarlyReturnError(toolName, action, connError.message);
        }
        return {
            content: [{ type: 'text', text: JSON.stringify(connError, null, 2) }],
            isError: true,
        };
    }
}
let healthMonitorStartup = null;
let stateChangeRegistered = false;
function resetHandlersState() {
    healthMonitorStartup = null;
    stateChangeRegistered = false;
}
async function setupHandlers(server) {
    const { isAuthenticationConfigured } = await Promise.resolve().then(() => __importStar(require('./oauth/index')));
    if (isAuthenticationConfigured()) {
        healthMonitorStartup ??= (async () => {
            try {
                const healthMonitor = HealthMonitor_1.HealthMonitor.getInstance();
                if (!stateChangeRegistered) {
                    stateChangeRegistered = true;
                    const broadcastToolsListChangedForStateChange = async (instanceUrl, from, to) => {
                        const { RegistryManager } = await Promise.resolve().then(() => __importStar(require('./registry-manager')));
                        RegistryManager.getInstance().refreshCache(instanceUrl);
                        const { getSessionManager } = await Promise.resolve().then(() => __importStar(require('./session-manager')));
                        await getSessionManager().broadcastToolsListChanged(instanceUrl);
                        (0, logger_1.logInfo)('Tool list updated after connection state change', {
                            instanceUrl,
                            from,
                            to,
                        });
                    };
                    healthMonitor.onStateChange((instanceUrl, from, to) => {
                        if (from !== to) {
                            broadcastToolsListChangedForStateChange(instanceUrl, from, to).catch((error) => {
                                (0, logger_1.logWarn)('Failed to broadcast tools/list_changed after state change', {
                                    instanceUrl,
                                    err: error,
                                });
                            });
                        }
                    });
                }
                await healthMonitor.initialize();
                const state = healthMonitor.getState();
                (0, logger_1.logInfo)('Connection health monitor initialized', { state });
                try {
                    const { RegistryManager } = await Promise.resolve().then(() => __importStar(require('./registry-manager')));
                    RegistryManager.getInstance().refreshCache();
                }
                catch (cacheError) {
                    (0, logger_1.logWarn)('Failed to refresh registry cache during handler setup', {
                        err: cacheError,
                    });
                }
            }
            catch (error) {
                healthMonitorStartup = null;
                throw error;
            }
        })();
        await healthMonitorStartup;
    }
    else {
        (0, logger_1.logInfo)('Skipping connection initialization - no authentication configured');
    }
    server.setRequestHandler(types_js_1.ListToolsRequestSchema, async (_request, extra) => {
        (0, logger_1.logInfo)('ListToolsRequest received');
        const { getSessionManager: getSessionMgr } = await Promise.resolve().then(() => __importStar(require('./session-manager')));
        const sessionMgr = getSessionMgr();
        const listToolsSessionId = extra?.sessionId;
        const sessionInstanceUrl = listToolsSessionId !== undefined
            ? sessionMgr.getSessionInstanceUrl(listToolsSessionId)
            : undefined;
        const { RegistryManager } = await Promise.resolve().then(() => __importStar(require('./registry-manager')));
        const registryManager = RegistryManager.getInstance();
        const tools = registryManager.getAllToolDefinitions(sessionInstanceUrl);
        (0, logger_1.logInfo)('Returning tools list', { toolCount: tools.length });
        function resolveRefs(schema, rootSchema) {
            if (!schema || typeof schema !== 'object')
                return schema;
            rootSchema ??= schema;
            if (Array.isArray(schema)) {
                return schema.map((item) => resolveRefs(item, rootSchema));
            }
            if (schema.$ref && typeof schema.$ref === 'string') {
                const refPath = schema.$ref.replace('#/properties/', '');
                const referencedProperty = rootSchema.properties?.[refPath];
                if (referencedProperty) {
                    const resolvedRef = resolveRefs(referencedProperty, rootSchema);
                    const schemaWithoutRef = { ...schema };
                    delete schemaWithoutRef.$ref;
                    return { ...resolvedRef, ...schemaWithoutRef };
                }
                const schemaWithoutRef = { ...schema };
                delete schemaWithoutRef.$ref;
                return schemaWithoutRef;
            }
            const result = {};
            for (const [key, value] of Object.entries(schema)) {
                if (key === 'properties' && typeof value === 'object' && value !== null) {
                    const resolvedProperties = {};
                    for (const [propKey, propValue] of Object.entries(value)) {
                        resolvedProperties[propKey] = resolveRefs(propValue, rootSchema);
                    }
                    result[key] = resolvedProperties;
                }
                else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    result[key] = resolveRefs(value, rootSchema);
                }
                else {
                    result[key] = value;
                }
            }
            return result;
        }
        const modifiedTools = tools.map((tool) => {
            let inputSchema = tool.inputSchema;
            if (inputSchema && typeof inputSchema === 'object') {
                inputSchema = { ...inputSchema, type: 'object' };
            }
            if (inputSchema && typeof inputSchema === 'object') {
                const resolved = resolveRefs(inputSchema);
                if (resolved && typeof resolved === 'object' && !Array.isArray(resolved)) {
                    inputSchema = resolved;
                }
            }
            if (inputSchema && typeof inputSchema === 'object' && '$schema' in inputSchema) {
                const cleanedSchema = { ...inputSchema };
                delete cleanedSchema.$schema;
                inputSchema = cleanedSchema;
            }
            return { ...tool, inputSchema };
        });
        return {
            tools: modifiedTools,
        };
    });
    server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request, extra) => {
        const { getGitLabApiUrlFromContext: getUrlFromCtx, isOAuthEnabled } = await Promise.resolve().then(() => __importStar(require('./oauth/index')));
        const oauthEnabled = isOAuthEnabled();
        const oauthContextUrl = oauthEnabled ? getUrlFromCtx() : undefined;
        const rawInstanceUrl = oauthEnabled
            ? (oauthContextUrl ?? config_1.GITLAB_BASE_URL)
            : (ConnectionManager_1.ConnectionManager.getInstance().getCurrentInstanceUrl() ?? config_1.GITLAB_BASE_URL);
        const requestInstanceUrl = (0, url_1.normalizeInstanceUrl)(rawInstanceUrl);
        const callSessionId = extra?.sessionId;
        if (callSessionId && (!oauthEnabled || oauthContextUrl !== undefined)) {
            const { getSessionManager: getSessionMgrForCall } = await Promise.resolve().then(() => __importStar(require('./session-manager')));
            getSessionMgrForCall().setSessionInstanceUrl(callSessionId, requestInstanceUrl);
        }
        let timedOut = false;
        const bootstrapState = { started: false, complete: false };
        const HANDLER_TIMEOUT_SYMBOL = Symbol('handler_timeout');
        let handlerTimeoutId;
        const timeoutPromise = new Promise((resolve) => {
            handlerTimeoutId = setTimeout(() => {
                timedOut = true;
                resolve(HANDLER_TIMEOUT_SYMBOL);
            }, config_1.HANDLER_TIMEOUT_MS);
        });
        const handlerWork = async () => {
            if (!request.params.arguments) {
                throw new Error('Arguments are required');
            }
            if (config_1.LOG_FORMAT === 'verbose') {
                (0, logger_1.logInfo)(`Tool called: ${request.params.name}`);
            }
            const { isOAuthEnabled, isAuthenticationConfigured } = await Promise.resolve().then(() => __importStar(require('./oauth/index')));
            if (!isAuthenticationConfigured()) {
                throw new Error('GITLAB_TOKEN environment variable is required to execute tools. ' +
                    "Run 'npx @structured-world/gitlab-mcp setup' for interactive configuration, " +
                    'or set GITLAB_TOKEN manually. ' +
                    'Documentation: https://gitlab-mcp.sw.foundation/guide/configuration');
            }
            const effectiveInstanceUrl = requestInstanceUrl;
            const connectionManager = ConnectionManager_1.ConnectionManager.getInstance();
            const healthMonitor = HealthMonitor_1.HealthMonitor.getInstance();
            const toolName = request.params.name;
            const toolArguments = request.params.arguments;
            const unreachableResult = checkUnreachableInstance(toolName, toolArguments, effectiveInstanceUrl, healthMonitor);
            if (unreachableResult)
                return unreachableResult;
            const fastPathResult = await tryManageContextFastPath(toolName, toolArguments, effectiveInstanceUrl, healthMonitor, callSessionId);
            if (fastPathResult)
                return fastPathResult;
            const oauthMode = isOAuthEnabled();
            const bootstrapFailure = await ensureBootstrapped({
                toolName,
                toolArguments,
                effectiveInstanceUrl,
                oauthMode,
                connectionManager,
                healthMonitor,
                isTimedOut: () => timedOut,
                bootstrapState,
            });
            if (bootstrapFailure)
                return bootstrapFailure;
            const toolArgs = request.params.arguments;
            const action = toolArgs && typeof toolArgs.action === 'string' ? toolArgs.action : undefined;
            if (config_1.LOG_FORMAT === 'condensed') {
                const requestTracker = (0, index_1.getRequestTracker)();
                requestTracker.setToolForCurrentRequest(toolName, action);
                const { getContextManager } = await Promise.resolve().then(() => __importStar(require('./entities/context/context-manager')));
                const contextManager = getContextManager();
                const sessionContext = contextManager.getContext();
                if (sessionContext.scope?.path) {
                    requestTracker.setContextForCurrentRequest(sessionContext.scope.path);
                }
                requestTracker.setReadOnlyForCurrentRequest(sessionContext.readOnly);
                const currentRequestId = (0, index_1.getCurrentRequestId)();
                if (currentRequestId) {
                    const stack = requestTracker.getStack(currentRequestId);
                    if (stack?.sessionId) {
                        const connectionTracker = (0, index_1.getConnectionTracker)();
                        connectionTracker.incrementTools(stack.sessionId);
                    }
                }
            }
            try {
                const { RegistryManager } = await Promise.resolve().then(() => __importStar(require('./registry-manager')));
                const registryManager = RegistryManager.getInstance();
                if (!registryManager.hasToolHandler(toolName, effectiveInstanceUrl)) {
                    throw new Error(`Tool '${toolName}' is not available or has been filtered out`);
                }
                if (config_1.LOG_FORMAT === 'verbose') {
                    (0, logger_1.logInfo)(`Executing tool: ${toolName}`);
                }
                const { isOAuthEnabled, getTokenContext } = await Promise.resolve().then(() => __importStar(require('./oauth/index')));
                if (isOAuthEnabled()) {
                    const context = getTokenContext();
                    (0, logger_1.logDebug)('OAuth context check before tool execution', {
                        hasContext: !!context,
                        hasToken: !!context?.gitlabToken,
                        tool: toolName,
                    });
                }
                const result = await registryManager.executeTool(toolName, request.params.arguments, effectiveInstanceUrl);
                if (result === undefined) {
                    throw new Error(`Tool '${toolName}' is not available or has been filtered out`);
                }
                await resyncSessionAfterSwitchProfile(toolName, request.params.arguments, callSessionId);
                if (!timedOut) {
                    healthMonitor.reportSuccess(effectiveInstanceUrl);
                }
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            catch (error) {
                if (!timedOut && error instanceof Error) {
                    const category = (0, error_handler_1.classifyError)(error);
                    if (category === 'transient' || category === 'auth') {
                        healthMonitor.reportError(effectiveInstanceUrl, error);
                    }
                }
                const errorMessage = error instanceof Error ? error.message : String(error);
                throw new Error(`Failed to execute tool '${toolName}': ${errorMessage}`, { cause: error });
            }
        };
        try {
            const result = await Promise.race([handlerWork(), timeoutPromise]);
            if (result === HANDLER_TIMEOUT_SYMBOL) {
                const toolName = request.params.name;
                const action = request.params.arguments && typeof request.params.arguments.action === 'string'
                    ? request.params.arguments.action
                    : 'unknown';
                const retryable = isIdempotentOperation(toolName);
                const timeoutError = (0, error_handler_1.createTimeoutError)(toolName, action, config_1.HANDLER_TIMEOUT_MS, retryable);
                (0, logger_1.logError)(`Handler timeout: tool '${toolName}' timed out after ${config_1.HANDLER_TIMEOUT_MS}ms`);
                if (bootstrapState.started && !bootstrapState.complete) {
                    HealthMonitor_1.HealthMonitor.getInstance().reportError(requestInstanceUrl, new Error(`Handler timed out after ${config_1.HANDLER_TIMEOUT_MS}ms — bootstrap did not complete`));
                    ConnectionManager_1.ConnectionManager.getInstance().clearInflight(requestInstanceUrl);
                }
                recordEarlyReturnError(toolName, action, timeoutError.message);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(timeoutError, null, 2),
                        },
                    ],
                    isError: true,
                };
            }
            return result;
        }
        catch (error) {
            const errMsg = error instanceof Error ? error.message : String(error);
            (0, logger_1.logError)(`Error in tool handler: ${errMsg}`);
            const reqTracker = (0, index_1.getRequestTracker)();
            reqTracker.setErrorForCurrentRequest(errMsg);
            const curRequestId = (0, index_1.getCurrentRequestId)();
            if (curRequestId) {
                const stack = reqTracker.getStack(curRequestId);
                if (stack?.sessionId) {
                    const connTracker = (0, index_1.getConnectionTracker)();
                    connTracker.recordError(stack.sessionId, errMsg);
                }
            }
            const toolName = request.params.name;
            const toolArgs = request.params.arguments;
            const structuredError = toStructuredError(error, toolName, toolArgs);
            if (structuredError) {
                (0, logger_1.logDebug)('Returning structured error response', { structuredError });
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(structuredError, null, 2),
                        },
                    ],
                    isError: true,
                };
            }
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({ error: errorMessage }, null, 2),
                    },
                ],
                isError: true,
            };
        }
        finally {
            clearTimeout(handlerTimeoutId);
        }
    });
}
//# sourceMappingURL=handlers.js.map