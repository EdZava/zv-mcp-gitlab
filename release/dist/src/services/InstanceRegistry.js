"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstanceRegistry = void 0;
const logger_js_1 = require("../logger.js");
const url_1 = require("../utils/url");
const InstanceRateLimiter_js_1 = require("./InstanceRateLimiter.js");
const instances_loader_js_1 = require("../config/instances-loader.js");
const InstanceConnectionPool_js_1 = require("./InstanceConnectionPool.js");
const INTROSPECTION_CACHE_TTL_MS = 10 * 60 * 1000;
class InstanceRegistry {
    static instance = null;
    instances = new Map();
    configSource = 'none';
    configSourceDetails = '';
    initialized = false;
    constructor() { }
    static getInstance() {
        InstanceRegistry.instance ??= new InstanceRegistry();
        return InstanceRegistry.instance;
    }
    async initialize() {
        if (this.initialized) {
            (0, logger_js_1.logDebug)('InstanceRegistry already initialized, skipping');
            return;
        }
        const config = await (0, instances_loader_js_1.loadInstancesConfig)();
        this.configSource = config.source;
        this.configSourceDetails = config.sourceDetails;
        for (const instanceConfig of config.instances) {
            this.register(instanceConfig);
        }
        this.initialized = true;
        (0, logger_js_1.logInfo)('InstanceRegistry initialized', {
            source: this.configSource,
            sourceDetails: this.configSourceDetails,
            instanceCount: this.instances.size,
            instances: Array.from(this.instances.keys()),
        });
    }
    register(config) {
        const normalizedUrl = (0, url_1.normalizeInstanceUrl)(config.url);
        if (this.instances.has(normalizedUrl)) {
            (0, logger_js_1.logWarn)('Instance already registered, updating configuration', {
                url: normalizedUrl,
            });
        }
        const rateLimiterConfig = config.rateLimit ?? InstanceRateLimiter_js_1.DEFAULT_RATE_LIMIT_CONFIG;
        const rateLimiter = new InstanceRateLimiter_js_1.InstanceRateLimiter(rateLimiterConfig);
        const state = {
            ...config,
            url: normalizedUrl,
            connectionStatus: 'healthy',
            lastHealthCheck: null,
            introspectionCache: null,
        };
        this.instances.set(normalizedUrl, {
            config: { ...config, url: normalizedUrl },
            state,
            rateLimiter,
        });
        (0, logger_js_1.logDebug)('Instance registered', {
            url: normalizedUrl,
            label: config.label,
            hasOAuth: !!config.oauth,
            rateLimit: rateLimiterConfig,
        });
    }
    get(baseUrl) {
        const normalizedUrl = (0, url_1.normalizeInstanceUrl)(baseUrl);
        return this.instances.get(normalizedUrl);
    }
    getConfig(baseUrl) {
        return this.get(baseUrl)?.config;
    }
    getState(baseUrl) {
        return this.get(baseUrl)?.state;
    }
    list() {
        return Array.from(this.instances.values()).map((entry) => {
            const cache = entry.state.introspectionCache;
            const isExpired = cache !== null && Date.now() - cache.cachedAt.getTime() > INTROSPECTION_CACHE_TTL_MS;
            return {
                url: entry.config.url,
                label: entry.config.label,
                connectionStatus: entry.state.connectionStatus,
                lastHealthCheck: entry.state.lastHealthCheck,
                hasOAuth: !!entry.config.oauth,
                rateLimit: entry.rateLimiter.getMetrics(),
                introspection: {
                    version: cache?.version ?? null,
                    tier: cache?.tier ?? null,
                    cachedAt: cache?.cachedAt ?? null,
                    isExpired,
                },
            };
        });
    }
    has(baseUrl) {
        const normalizedUrl = (0, url_1.normalizeInstanceUrl)(baseUrl);
        return this.instances.has(normalizedUrl);
    }
    unregister(baseUrl) {
        const normalizedUrl = (0, url_1.normalizeInstanceUrl)(baseUrl);
        const existed = this.instances.delete(normalizedUrl);
        if (existed) {
            (0, logger_js_1.logInfo)('Instance unregistered', { url: normalizedUrl });
        }
        return existed;
    }
    getUrls() {
        return Array.from(this.instances.keys());
    }
    getDefaultUrl() {
        const urls = this.getUrls();
        return urls.length > 0 ? urls[0] : undefined;
    }
    async acquireSlot(baseUrl) {
        const entry = this.get(baseUrl);
        if (!entry) {
            (0, logger_js_1.logDebug)('Rate limit slot requested for unregistered instance, allowing', {
                url: baseUrl,
            });
            return () => { };
        }
        return entry.rateLimiter.acquire();
    }
    getRateLimitMetrics(baseUrl) {
        return this.get(baseUrl)?.rateLimiter.getMetrics();
    }
    getIntrospection(baseUrl) {
        const entry = this.get(baseUrl);
        if (!entry)
            return null;
        const cache = entry.state.introspectionCache;
        if (!cache)
            return null;
        const age = Date.now() - cache.cachedAt.getTime();
        if (age > INTROSPECTION_CACHE_TTL_MS) {
            (0, logger_js_1.logDebug)('Introspection cache expired', {
                url: baseUrl,
                ageMs: age,
                ttlMs: INTROSPECTION_CACHE_TTL_MS,
            });
            return null;
        }
        return cache;
    }
    setIntrospection(baseUrl, introspection) {
        const entry = this.get(baseUrl);
        if (!entry) {
            (0, logger_js_1.logWarn)('Cannot cache introspection for unregistered instance', { url: baseUrl });
            return;
        }
        entry.state.introspectionCache = introspection;
        (0, logger_js_1.logDebug)('Introspection cached for instance', {
            url: baseUrl,
            version: introspection.version,
            tier: introspection.tier,
        });
    }
    updateConnectionStatus(baseUrl, status) {
        const entry = this.get(baseUrl);
        if (!entry)
            return;
        entry.state.connectionStatus = status;
        entry.state.lastHealthCheck = new Date();
        (0, logger_js_1.logDebug)('Instance connection status updated', {
            url: baseUrl,
            status,
        });
    }
    clearIntrospectionCache(baseUrl) {
        if (baseUrl) {
            const entry = this.get(baseUrl);
            if (entry) {
                entry.state.introspectionCache = null;
                (0, logger_js_1.logDebug)('Introspection cache cleared', { url: baseUrl });
            }
        }
        else {
            for (const entry of this.instances.values()) {
                entry.state.introspectionCache = null;
            }
            (0, logger_js_1.logDebug)('All introspection caches cleared');
        }
    }
    getConfigSource() {
        return {
            source: this.configSource,
            details: this.configSourceDetails,
        };
    }
    isInitialized() {
        return this.initialized;
    }
    getGraphQLClient(baseUrl, authHeaders) {
        const entry = this.get(baseUrl);
        if (!entry)
            return undefined;
        const connectionPool = InstanceConnectionPool_js_1.InstanceConnectionPool.getInstance();
        return connectionPool.getGraphQLClient(entry.config, authHeaders);
    }
    getConnectionPoolStats() {
        const connectionPool = InstanceConnectionPool_js_1.InstanceConnectionPool.getInstance();
        return connectionPool.getStats();
    }
    getInstancePoolStats(baseUrl) {
        const connectionPool = InstanceConnectionPool_js_1.InstanceConnectionPool.getInstance();
        return connectionPool.getInstanceStats((0, url_1.normalizeInstanceUrl)(baseUrl));
    }
    getDispatcher(baseUrl) {
        const connectionPool = InstanceConnectionPool_js_1.InstanceConnectionPool.getInstance();
        const normalizedUrl = (0, url_1.normalizeInstanceUrl)(baseUrl);
        let dispatcher = connectionPool.getDispatcher(normalizedUrl);
        if (!dispatcher) {
            const entry = this.instances.get(normalizedUrl);
            if (entry) {
                connectionPool.getGraphQLClient(entry.config);
                dispatcher = connectionPool.getDispatcher(normalizedUrl);
            }
        }
        return dispatcher;
    }
    reset() {
        this.instances.clear();
        this.configSource = 'none';
        this.configSourceDetails = '';
        this.initialized = false;
        (0, logger_js_1.logDebug)('InstanceRegistry reset');
    }
    async resetWithPools() {
        this.reset();
        await InstanceConnectionPool_js_1.InstanceConnectionPool.resetInstance();
        (0, logger_js_1.logDebug)('InstanceRegistry and connection pools reset');
    }
}
exports.InstanceRegistry = InstanceRegistry;
//# sourceMappingURL=InstanceRegistry.js.map