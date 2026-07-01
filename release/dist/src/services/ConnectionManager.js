"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionManager = void 0;
const client_1 = require("../graphql/client");
const GitLabVersionDetector_1 = require("./GitLabVersionDetector");
const SchemaIntrospector_1 = require("./SchemaIntrospector");
const TokenScopeDetector_1 = require("./TokenScopeDetector");
const AdminDetector_1 = require("./AdminDetector");
const config_1 = require("../config");
const index_1 = require("../oauth/index");
const fetch_1 = require("../utils/fetch");
const logger_1 = require("../logger");
const InstanceRegistry_1 = require("./InstanceRegistry");
const url_1 = require("../utils/url");
class ConnectionManager {
    static instance = null;
    instances = new Map();
    currentInstanceUrl = null;
    introspectionPromises = new Map();
    static introspectionCache = new Map();
    static CACHE_TTL = 10 * 60 * 1000;
    initializePromises = new Map();
    latestRequestedUrl = null;
    instanceAccessTimes = new Map();
    static MAX_INSTANCES = Number.isFinite(config_1.GITLAB_INSTANCE_CACHE_MAX)
        ? config_1.GITLAB_INSTANCE_CACHE_MAX
        : 100;
    static INSTANCE_TTL_MS = Number.isFinite(config_1.GITLAB_INSTANCE_TTL_MS)
        ? config_1.GITLAB_INSTANCE_TTL_MS
        : 60 * 60 * 1000;
    touchInstance(url) {
        this.instanceAccessTimes.set(url, Date.now());
    }
    dropInstance(url) {
        this.instances.delete(url);
        this.instanceAccessTimes.delete(url);
        ConnectionManager.introspectionCache.delete(url);
        ConnectionManager.introspectionCache.delete(`${url}/api/graphql`);
    }
    evictExpired() {
        const now = Date.now();
        for (const [url, accessedAt] of this.instanceAccessTimes) {
            if (now - accessedAt <= ConnectionManager.INSTANCE_TTL_MS)
                continue;
            if (url === this.currentInstanceUrl ||
                this.initializePromises.has(url) ||
                this.introspectionPromises.has(url))
                continue;
            this.dropInstance(url);
            (0, logger_1.logDebug)('Evicted expired InstanceState', { url, ageMs: now - accessedAt });
        }
    }
    evictLRUIfOverCapacity() {
        while (this.instances.size > ConnectionManager.MAX_INSTANCES) {
            let lruUrl = null;
            let lruTime = Infinity;
            for (const [url, accessedAt] of this.instanceAccessTimes) {
                if (url === this.currentInstanceUrl ||
                    this.initializePromises.has(url) ||
                    this.introspectionPromises.has(url))
                    continue;
                if (accessedAt < lruTime) {
                    lruTime = accessedAt;
                    lruUrl = url;
                }
            }
            if (!lruUrl)
                break;
            this.dropInstance(lruUrl);
            (0, logger_1.logDebug)('Evicted LRU InstanceState', { url: lruUrl });
        }
    }
    constructor() { }
    static getInstance() {
        ConnectionManager.instance ??= new ConnectionManager();
        return ConnectionManager.instance;
    }
    async initialize(instanceUrl) {
        const url = (0, url_1.normalizeInstanceUrl)(instanceUrl ?? config_1.GITLAB_BASE_URL);
        this.latestRequestedUrl = url;
        const existing = this.instances.get(url);
        if (existing?.isInitialized) {
            this.touchInstance(url);
            this.currentInstanceUrl = url;
            return;
        }
        const inflight = this.initializePromises.get(url);
        if (inflight) {
            return inflight;
        }
        const promise = this.doInitialize(url);
        this.initializePromises.set(url, promise);
        try {
            await promise;
            const isOurPromise = this.initializePromises.get(url) === promise;
            const initSucceeded = this.instances.get(url)?.isInitialized === true;
            if ((isOurPromise && url === this.latestRequestedUrl) ||
                (!this.currentInstanceUrl && initSucceeded)) {
                this.currentInstanceUrl = url;
            }
        }
        finally {
            if (this.initializePromises.get(url) === promise) {
                this.initializePromises.delete(url);
            }
        }
    }
    async doInitialize(baseUrl) {
        let state;
        try {
            const oauthMode = (0, index_1.isOAuthEnabled)();
            const registry = InstanceRegistry_1.InstanceRegistry.getInstance();
            if (!registry.isInitialized()) {
                await registry.initialize();
            }
            if (!baseUrl) {
                throw new Error('GitLab base URL is required');
            }
            if (!oauthMode && !config_1.GITLAB_TOKEN) {
                throw new Error('GITLAB_TOKEN is required in static authentication mode. ' +
                    'Run `npx @structured-world/gitlab-mcp setup` for interactive configuration, ' +
                    'or set the environment variable and restart. ' +
                    'Docs: https://gitlab-mcp.sw.foundation/guide/quick-start');
            }
            const endpoint = `${baseUrl}/api/graphql`;
            const clientOptions = oauthMode
                ? {}
                : { headers: { 'PRIVATE-TOKEN': String(config_1.GITLAB_TOKEN) } };
            const client = new client_1.GraphQLClient(endpoint, clientOptions);
            const versionDetector = new GitLabVersionDetector_1.GitLabVersionDetector(client);
            const schemaIntrospector = new SchemaIntrospector_1.SchemaIntrospector(client);
            state = {
                client,
                versionDetector,
                schemaIntrospector,
                instanceInfo: null,
                schemaInfo: null,
                tokenScopeInfo: null,
                adminInfo: null,
                isInitialized: false,
                introspectedInstanceUrl: null,
            };
            this.instances.set(baseUrl, state);
            this.touchInstance(baseUrl);
            this.evictExpired();
            this.evictLRUIfOverCapacity();
            if (oauthMode) {
                (0, logger_1.logInfo)('OAuth mode: attempting unauthenticated version detection');
                try {
                    const versionResponse = await (0, fetch_1.enhancedFetch)(`${baseUrl}/api/v4/version`, {
                        retry: false,
                        skipAuth: true,
                    });
                    if (versionResponse.ok) {
                        const versionData = (await versionResponse.json());
                        (0, logger_1.logInfo)('Detected GitLab version without authentication', {
                            version: versionData.version,
                        });
                        state.instanceInfo = {
                            version: versionData.version,
                            tier: versionData.enterprise ? 'premium' : 'free',
                            features: this.getDefaultFeatures(versionData.enterprise ?? false),
                            detectedAt: new Date(),
                        };
                        (0, logger_1.logInfo)('OAuth mode: version detected, full introspection deferred until first authenticated request');
                    }
                    else {
                        (0, logger_1.logInfo)('OAuth mode: unauthenticated version detection failed, deferring all introspection', {
                            status: versionResponse.status,
                        });
                    }
                }
                catch (error) {
                    (0, logger_1.logInfo)('OAuth mode: unauthenticated version detection failed, deferring all introspection', {
                        error: error instanceof Error ? error.message : String(error),
                    });
                }
                if (this.instances.get(baseUrl) !== state)
                    return;
                state.isInitialized = true;
                return;
            }
            state.tokenScopeInfo = await (0, TokenScopeDetector_1.detectTokenScopes)(baseUrl);
            state.adminInfo = await (0, AdminDetector_1.detectAdminStatus)(baseUrl);
            if (state.tokenScopeInfo) {
                const totalTools = Object.keys((0, TokenScopeDetector_1.getToolScopeRequirements)()).length;
                (0, TokenScopeDetector_1.logTokenScopeInfo)(state.tokenScopeInfo, totalTools, baseUrl);
                if (!state.tokenScopeInfo.hasGraphQLAccess) {
                    state.instanceInfo = await this.detectVersionViaREST(baseUrl);
                    state.isInitialized = true;
                    return;
                }
            }
            const cached = ConnectionManager.introspectionCache.get(endpoint);
            const now = Date.now();
            if (cached && now - cached.timestamp < ConnectionManager.CACHE_TTL) {
                if (this.instances.get(baseUrl) !== state)
                    return;
                (0, logger_1.logInfo)('Using cached GraphQL introspection data');
                state.instanceInfo = cached.instanceInfo;
                state.schemaInfo = cached.schemaInfo;
                state.schemaIntrospector.rehydrate(cached.schemaInfo);
                state.introspectedInstanceUrl = baseUrl;
            }
            else {
                (0, logger_1.logDebug)('Introspecting GitLab GraphQL schema...');
                const [instanceInfo, schemaInfo] = await Promise.all([
                    versionDetector.detectInstance(),
                    schemaIntrospector.introspectSchema(),
                ]);
                if (this.instances.get(baseUrl) !== state)
                    return;
                state.instanceInfo = instanceInfo;
                state.schemaInfo = schemaInfo;
                state.introspectedInstanceUrl = baseUrl;
                ConnectionManager.introspectionCache.set(endpoint, {
                    instanceInfo,
                    schemaInfo,
                    timestamp: now,
                });
                (0, logger_1.logInfo)('GraphQL schema introspection completed');
            }
            state.isInitialized = true;
            (0, logger_1.logInfo)('GitLab instance and schema detected', {
                version: state.instanceInfo?.version,
                tier: state.instanceInfo?.tier,
                features: state.instanceInfo
                    ? Object.entries(state.instanceInfo.features)
                        .filter(([, enabled]) => enabled)
                        .map(([feature]) => feature)
                    : [],
                widgetTypes: state.schemaInfo?.workItemWidgetTypes.length || 0,
                schemaTypes: state.schemaInfo?.typeDefinitions.size || 0,
            });
        }
        catch (error) {
            if (state && this.instances.get(baseUrl) === state) {
                this.dropInstance(baseUrl);
            }
            (0, logger_1.logError)('Failed to initialize connection', { err: error });
            throw error;
        }
    }
    async ensureIntrospected(explicitUrl) {
        const instanceUrl = (0, url_1.normalizeInstanceUrl)(explicitUrl ?? (0, index_1.getGitLabApiUrlFromContext)() ?? this.currentInstanceUrl ?? config_1.GITLAB_BASE_URL);
        const state = this.instances.get(instanceUrl);
        if (!state?.client || !state.versionDetector || !state.schemaIntrospector) {
            throw new Error('Connection not initialized. Call initialize() first.');
        }
        this.touchInstance(instanceUrl);
        if (state.instanceInfo && state.schemaInfo && state.introspectedInstanceUrl === instanceUrl) {
            return;
        }
        if (state.tokenScopeInfo && !state.tokenScopeInfo.hasGraphQLAccess) {
            return;
        }
        const existingPromise = this.introspectionPromises.get(instanceUrl);
        if (existingPromise) {
            (0, logger_1.logDebug)('Awaiting existing introspection for instance', { url: instanceUrl });
            await existingPromise;
            return;
        }
        const promise = this.doIntrospection(instanceUrl);
        this.introspectionPromises.set(instanceUrl, promise);
        try {
            await promise;
        }
        finally {
            if (this.introspectionPromises.get(instanceUrl) === promise) {
                this.introspectionPromises.delete(instanceUrl);
            }
        }
    }
    async doIntrospection(instanceUrl) {
        const state = this.instances.get(instanceUrl);
        if (!state?.client || !state.versionDetector || !state.schemaIntrospector) {
            throw new Error('Connection not initialized. Call initialize() first.');
        }
        const { client, versionDetector, schemaIntrospector } = state;
        const endpoint = client.endpoint;
        const registry = InstanceRegistry_1.InstanceRegistry.getInstance();
        if (registry.isInitialized()) {
            const cachedIntrospection = registry.getIntrospection(instanceUrl);
            if (cachedIntrospection) {
                (0, logger_1.logInfo)('Using cached introspection from InstanceRegistry', { url: instanceUrl });
                state.instanceInfo = {
                    version: cachedIntrospection.version,
                    tier: cachedIntrospection.tier,
                    features: cachedIntrospection.features,
                    detectedAt: cachedIntrospection.cachedAt,
                };
                const restoredSchema = cachedIntrospection.schemaInfo;
                state.schemaInfo = restoredSchema;
                state.schemaIntrospector.rehydrate(restoredSchema);
                state.introspectedInstanceUrl = instanceUrl;
                return;
            }
        }
        const primaryCacheKey = instanceUrl;
        const legacyCacheKey = endpoint;
        let cached = ConnectionManager.introspectionCache.get(primaryCacheKey);
        if (!cached && primaryCacheKey !== legacyCacheKey) {
            cached = ConnectionManager.introspectionCache.get(legacyCacheKey);
        }
        const now = Date.now();
        if (cached && now - cached.timestamp < ConnectionManager.CACHE_TTL) {
            (0, logger_1.logInfo)('Using cached GraphQL introspection data');
            state.instanceInfo = cached.instanceInfo;
            state.schemaInfo = cached.schemaInfo;
            state.schemaIntrospector.rehydrate(cached.schemaInfo);
            state.introspectedInstanceUrl = instanceUrl;
            return;
        }
        (0, logger_1.logDebug)('Introspecting GitLab GraphQL schema (deferred OAuth mode)...');
        const [instanceInfo, schemaInfo] = await Promise.all([
            versionDetector.detectInstance(),
            schemaIntrospector.introspectSchema(),
        ]);
        if (this.instances.get(instanceUrl) !== state)
            return;
        state.instanceInfo = instanceInfo;
        state.schemaInfo = schemaInfo;
        state.introspectedInstanceUrl = instanceUrl;
        ConnectionManager.introspectionCache.set(primaryCacheKey, {
            instanceInfo,
            schemaInfo,
            timestamp: now,
        });
        if (registry.isInitialized()) {
            const cachedIntrospection = {
                version: instanceInfo.version,
                tier: instanceInfo.tier,
                features: instanceInfo.features,
                schemaInfo,
                cachedAt: new Date(),
            };
            registry.setIntrospection(instanceUrl, cachedIntrospection);
        }
        (0, logger_1.logInfo)('GraphQL schema introspection completed (deferred)', {
            version: state.instanceInfo?.version,
            tier: state.instanceInfo?.tier,
            widgetTypes: state.schemaInfo?.workItemWidgetTypes.length || 0,
        });
    }
    resolveState(instanceUrl) {
        const url = instanceUrl ? (0, url_1.normalizeInstanceUrl)(instanceUrl) : this.currentInstanceUrl;
        if (!url) {
            throw new Error('Connection not initialized. Call initialize() first.');
        }
        const state = this.instances.get(url);
        if (!state) {
            throw new Error(`Connection not initialized for ${url}. Call initialize() first.`);
        }
        this.touchInstance(url);
        return [state, url];
    }
    getClient(instanceUrl) {
        const [state] = this.resolveState(instanceUrl);
        return state.client;
    }
    getInstanceClient(instanceUrl, authHeaders) {
        const registry = InstanceRegistry_1.InstanceRegistry.getInstance();
        const rawTargetUrl = instanceUrl ?? (0, index_1.getGitLabApiUrlFromContext)() ?? this.currentInstanceUrl;
        const targetUrl = rawTargetUrl ? (0, url_1.normalizeInstanceUrl)(rawTargetUrl) : null;
        if (targetUrl && registry.isInitialized() && registry.has(targetUrl)) {
            const client = registry.getGraphQLClient(targetUrl, authHeaders);
            if (client) {
                return client;
            }
        }
        if (targetUrl) {
            const state = this.instances.get(targetUrl);
            if (state) {
                this.touchInstance(targetUrl);
                return state.client;
            }
            throw new Error(`Connection not initialized for ${targetUrl}. Call initialize() first.`);
        }
        return this.getClient();
    }
    getVersionDetector(instanceUrl) {
        const [state] = this.resolveState(instanceUrl);
        return state.versionDetector;
    }
    getSchemaIntrospector(instanceUrl) {
        const [state] = this.resolveState(instanceUrl);
        return state.schemaIntrospector;
    }
    getInstanceInfo(instanceUrl) {
        const [state, resolvedUrl] = this.resolveState(instanceUrl);
        if (!state.instanceInfo) {
            throw new Error(`Instance information is not available for ${resolvedUrl}. Initialization may have completed without version detection (OAuth deferred/REST-only mode).`);
        }
        return state.instanceInfo;
    }
    getInstanceCapabilities(instanceUrl) {
        const info = this.getInstanceInfo(instanceUrl);
        const scopeInfo = this.getTokenScopeInfo(instanceUrl);
        const adminInfo = this.getAdminInfo(instanceUrl);
        return {
            version: info.version,
            tier: info.tier,
            features: info.features,
            scopes: scopeInfo?.scopes ?? [],
            isAdmin: adminInfo?.isAdmin,
            adminModeActive: adminInfo?.adminModeActive,
        };
    }
    getSchemaInfo(instanceUrl) {
        const [state, resolvedUrl] = this.resolveState(instanceUrl);
        if (!state.schemaInfo) {
            throw new Error(`Schema information is not available for ${resolvedUrl}. Initialization may have completed without schema introspection.`);
        }
        return state.schemaInfo;
    }
    getCurrentInstanceUrl() {
        return this.currentInstanceUrl;
    }
    isConnected(instanceUrl) {
        const url = instanceUrl ? (0, url_1.normalizeInstanceUrl)(instanceUrl) : this.currentInstanceUrl;
        if (!url)
            return false;
        const state = this.instances.get(url);
        if (state)
            this.touchInstance(url);
        return state?.isInitialized ?? false;
    }
    isFeatureAvailable(feature, instanceUrl) {
        const url = instanceUrl ? (0, url_1.normalizeInstanceUrl)(instanceUrl) : this.currentInstanceUrl;
        if (!url)
            return false;
        const state = this.instances.get(url);
        if (!state?.instanceInfo)
            return false;
        this.touchInstance(url);
        return state.instanceInfo.features[feature];
    }
    getTier(instanceUrl) {
        const url = instanceUrl ? (0, url_1.normalizeInstanceUrl)(instanceUrl) : this.currentInstanceUrl;
        if (!url)
            return 'unknown';
        const state = this.instances.get(url);
        if (!state?.instanceInfo)
            return 'unknown';
        this.touchInstance(url);
        return state.instanceInfo.tier;
    }
    getVersion(instanceUrl) {
        const url = instanceUrl ? (0, url_1.normalizeInstanceUrl)(instanceUrl) : this.currentInstanceUrl;
        if (!url)
            return 'unknown';
        const state = this.instances.get(url);
        if (!state?.instanceInfo)
            return 'unknown';
        this.touchInstance(url);
        return state.instanceInfo.version;
    }
    isWidgetAvailable(widgetType, instanceUrl) {
        const url = instanceUrl ? (0, url_1.normalizeInstanceUrl)(instanceUrl) : this.currentInstanceUrl;
        if (!url)
            return false;
        const state = this.instances.get(url);
        if (state)
            this.touchInstance(url);
        return state?.schemaInfo?.workItemWidgetTypes.includes(widgetType) ?? false;
    }
    getTokenScopeInfo(instanceUrl) {
        const url = instanceUrl ? (0, url_1.normalizeInstanceUrl)(instanceUrl) : this.currentInstanceUrl;
        if (!url)
            return null;
        const state = this.instances.get(url);
        if (state)
            this.touchInstance(url);
        return state?.tokenScopeInfo ?? null;
    }
    getAdminInfo(instanceUrl) {
        const url = instanceUrl ? (0, url_1.normalizeInstanceUrl)(instanceUrl) : this.currentInstanceUrl;
        if (!url)
            return null;
        const state = this.instances.get(url);
        if (state)
            this.touchInstance(url);
        return state?.adminInfo ?? null;
    }
    async refreshTokenScopes() {
        if ((0, index_1.isOAuthEnabled)()) {
            return false;
        }
        const url = this.currentInstanceUrl;
        if (!url)
            return false;
        const state = this.instances.get(url);
        if (!state)
            return false;
        const previousScopes = state.tokenScopeInfo?.scopes ?? [];
        const previousHasGraphQL = state.tokenScopeInfo?.hasGraphQLAccess ?? false;
        const previousHasWrite = state.tokenScopeInfo?.hasWriteAccess ?? false;
        const newScopeInfo = await (0, TokenScopeDetector_1.detectTokenScopes)(url);
        if (!newScopeInfo) {
            return false;
        }
        const newScopes = newScopeInfo.scopes;
        const scopesChanged = previousScopes.length !== newScopes.length ||
            !previousScopes.every((s) => newScopes.includes(s)) ||
            previousHasGraphQL !== newScopeInfo.hasGraphQLAccess ||
            previousHasWrite !== newScopeInfo.hasWriteAccess;
        const currentState = this.instances.get(url);
        if (currentState !== state) {
            return false;
        }
        state.tokenScopeInfo = newScopeInfo;
        if (scopesChanged) {
            (0, logger_1.logInfo)('Token scopes changed - tool registry will be refreshed', {
                previousScopes,
                newScopes,
                hasGraphQLAccess: newScopeInfo.hasGraphQLAccess,
                hasWriteAccess: newScopeInfo.hasWriteAccess,
            });
        }
        return scopesChanged;
    }
    async detectVersionViaREST(baseUrl) {
        try {
            const url = baseUrl ?? this.currentInstanceUrl ?? config_1.GITLAB_BASE_URL;
            const response = await (0, fetch_1.enhancedFetch)(`${url}/api/v4/version`, {
                headers: {
                    'PRIVATE-TOKEN': config_1.GITLAB_TOKEN ?? '',
                    Accept: 'application/json',
                },
                retry: false,
            });
            if (response.ok) {
                const data = (await response.json());
                (0, logger_1.logInfo)('Detected GitLab version via REST (GraphQL unavailable)', {
                    version: data.version,
                    enterprise: data.enterprise,
                });
                return {
                    version: data.version,
                    tier: data.enterprise ? 'premium' : 'free',
                    features: this.getDefaultFeatures(data.enterprise ?? false),
                    detectedAt: new Date(),
                };
            }
            (0, logger_1.logInfo)('REST version detection failed, using defaults', { status: response.status });
        }
        catch (error) {
            (0, logger_1.logInfo)('REST version detection failed, using defaults', {
                error: error instanceof Error ? error.message : String(error),
            });
        }
        return {
            version: 'unknown',
            tier: 'free',
            features: this.getDefaultFeatures(false),
            detectedAt: new Date(),
        };
    }
    getDefaultFeatures(isEnterprise) {
        return {
            workItems: true,
            epics: isEnterprise,
            iterations: isEnterprise,
            roadmaps: isEnterprise,
            portfolioManagement: isEnterprise,
            advancedSearch: true,
            codeReview: true,
            securityDashboard: isEnterprise,
            complianceFramework: isEnterprise,
            valueStreamAnalytics: isEnterprise,
            customFields: isEnterprise,
            okrs: isEnterprise,
            healthStatus: isEnterprise,
            weight: isEnterprise,
            multiLevelEpics: isEnterprise,
            serviceDesk: true,
            requirements: isEnterprise,
            qualityManagement: isEnterprise,
            timeTracking: true,
            crmContacts: true,
            vulnerabilities: isEnterprise,
            errorTracking: true,
            designManagement: true,
            linkedResources: true,
            emailParticipants: true,
        };
    }
    async reinitialize(rawInstanceUrl) {
        const newInstanceUrl = (0, url_1.normalizeInstanceUrl)(rawInstanceUrl);
        (0, logger_1.logInfo)('Re-initializing ConnectionManager for new instance', {
            newInstanceUrl,
        });
        const previousUrl = this.currentInstanceUrl;
        const savedState = this.instances.get(newInstanceUrl);
        const restorableState = savedState?.isInitialized ? savedState : undefined;
        this.initializePromises.delete(newInstanceUrl);
        this.introspectionPromises.delete(newInstanceUrl);
        this.instances.delete(newInstanceUrl);
        this.instanceAccessTimes.delete(newInstanceUrl);
        try {
            const registry = InstanceRegistry_1.InstanceRegistry.getInstance();
            registry.clearIntrospectionCache(newInstanceUrl);
        }
        catch {
        }
        ConnectionManager.introspectionCache.delete(newInstanceUrl);
        ConnectionManager.introspectionCache.delete(`${newInstanceUrl}/api/graphql`);
        try {
            await this.initialize(newInstanceUrl);
        }
        catch (error) {
            if (restorableState) {
                this.instances.set(newInstanceUrl, restorableState);
                this.touchInstance(newInstanceUrl);
            }
            if (previousUrl && this.instances.has(previousUrl)) {
                this.currentInstanceUrl = previousUrl;
            }
            else if (restorableState) {
                this.currentInstanceUrl = newInstanceUrl;
            }
            throw error;
        }
        if (previousUrl && previousUrl !== newInstanceUrl) {
            this.initializePromises.delete(previousUrl);
            this.introspectionPromises.delete(previousUrl);
            this.instances.delete(previousUrl);
            this.instanceAccessTimes.delete(previousUrl);
        }
        const state = this.instances.get(newInstanceUrl);
        (0, logger_1.logInfo)('ConnectionManager re-initialized', {
            version: state?.instanceInfo?.version,
            tier: state?.instanceInfo?.tier,
            instanceUrl: this.currentInstanceUrl,
        });
    }
    clearInflight(rawUrl) {
        const url = (0, url_1.normalizeInstanceUrl)(rawUrl);
        this.initializePromises.delete(url);
        this.introspectionPromises.delete(url);
    }
    reset() {
        this.instances.clear();
        this.instanceAccessTimes.clear();
        this.currentInstanceUrl = null;
        this.latestRequestedUrl = null;
        this.introspectionPromises.clear();
        this.initializePromises.clear();
        ConnectionManager.introspectionCache.clear();
        try {
            InstanceRegistry_1.InstanceRegistry.getInstance().clearIntrospectionCache();
        }
        catch {
        }
    }
}
exports.ConnectionManager = ConnectionManager;
//# sourceMappingURL=ConnectionManager.js.map