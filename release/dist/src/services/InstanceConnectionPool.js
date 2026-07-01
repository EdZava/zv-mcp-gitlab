"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstanceConnectionPool = void 0;
const client_js_1 = require("../graphql/client.js");
const logger_js_1 = require("../logger.js");
const config_js_1 = require("../config.js");
const undici = require('undici');
const DEFAULT_POOL_CONFIG = {
    maxConnections: config_js_1.POOL_MAX_CONNECTIONS,
    keepAliveTimeout: 30000,
    keepAliveMaxTimeout: 300000,
    pipelining: 1,
    connectTimeout: config_js_1.CONNECT_TIMEOUT_MS,
    headersTimeout: config_js_1.HEADERS_TIMEOUT_MS,
    bodyTimeout: config_js_1.BODY_TIMEOUT_MS,
};
class InstanceConnectionPool {
    static instance = null;
    pools = new Map();
    config;
    constructor(config) {
        this.config = { ...DEFAULT_POOL_CONFIG, ...config };
    }
    static getInstance(config) {
        InstanceConnectionPool.instance ??= new InstanceConnectionPool(config);
        return InstanceConnectionPool.instance;
    }
    getGraphQLClient(instanceConfig, authHeaders) {
        const entry = this.getOrCreateEntry(instanceConfig);
        entry.lastUsedAt = new Date();
        if (!authHeaders) {
            return entry.graphqlClient;
        }
        const baseClient = entry.graphqlClient;
        const clientWithAuth = new Proxy(baseClient, {
            get(target, prop, receiver) {
                if (prop === 'request' || prop === 'rawRequest') {
                    const original = target[prop];
                    if (typeof original !== 'function') {
                        return Reflect.get(target, prop, receiver);
                    }
                    return (...args) => {
                        const extraHeaders = authHeaders ?? {};
                        if (Object.keys(extraHeaders).length === 0) {
                            return original.apply(target, args);
                        }
                        const adjustedArgs = [...args];
                        if (args.length >= 3) {
                            const lastArg = adjustedArgs[adjustedArgs.length - 1];
                            if (lastArg && typeof lastArg === 'object' && !Array.isArray(lastArg)) {
                                adjustedArgs[adjustedArgs.length - 1] = {
                                    ...lastArg,
                                    ...extraHeaders,
                                };
                                return original.apply(target, adjustedArgs);
                            }
                        }
                        adjustedArgs.push(extraHeaders);
                        return original.apply(target, adjustedArgs);
                    };
                }
                return Reflect.get(target, prop, receiver);
            },
        });
        return clientWithAuth;
    }
    getDispatcher(baseUrl) {
        const normalizedUrl = this.normalizeUrl(baseUrl);
        const entry = this.pools.get(normalizedUrl);
        if (entry) {
            entry.lastUsedAt = new Date();
        }
        return entry?.pool;
    }
    getStats() {
        return Array.from(this.pools.values()).map((entry) => ({
            baseUrl: entry.baseUrl,
            graphqlEndpoint: entry.graphqlEndpoint,
            ...entry.pool.stats,
            createdAt: entry.createdAt,
            lastUsedAt: entry.lastUsedAt,
        }));
    }
    getInstanceStats(baseUrl) {
        const normalizedUrl = this.normalizeUrl(baseUrl);
        const entry = this.pools.get(normalizedUrl);
        if (!entry)
            return undefined;
        return {
            baseUrl: entry.baseUrl,
            graphqlEndpoint: entry.graphqlEndpoint,
            ...entry.pool.stats,
            createdAt: entry.createdAt,
            lastUsedAt: entry.lastUsedAt,
        };
    }
    async destroyPool(baseUrl) {
        const normalizedUrl = this.normalizeUrl(baseUrl);
        const entry = this.pools.get(normalizedUrl);
        if (entry) {
            await entry.pool.destroy();
            this.pools.delete(normalizedUrl);
            (0, logger_js_1.logDebug)('Connection pool destroyed', { baseUrl: normalizedUrl });
        }
    }
    async destroyAll() {
        const destroyPromises = Array.from(this.pools.values()).map((entry) => entry.pool.destroy());
        await Promise.all(destroyPromises);
        this.pools.clear();
        (0, logger_js_1.logInfo)('All connection pools destroyed');
    }
    static async resetInstance() {
        if (InstanceConnectionPool.instance) {
            await InstanceConnectionPool.instance.destroyAll();
            InstanceConnectionPool.instance = null;
        }
    }
    getOrCreateEntry(instanceConfig) {
        const normalizedUrl = this.normalizeUrl(instanceConfig.url);
        let entry = this.pools.get(normalizedUrl);
        if (entry) {
            return entry;
        }
        entry = this.createEntry(instanceConfig, normalizedUrl);
        this.pools.set(normalizedUrl, entry);
        (0, logger_js_1.logInfo)('Connection pool created for instance', {
            baseUrl: normalizedUrl,
            maxConnections: this.config.maxConnections,
            keepAliveTimeout: this.config.keepAliveTimeout,
        });
        return entry;
    }
    createEntry(instanceConfig, normalizedUrl) {
        const connectOptions = {
            timeout: this.config.connectTimeout,
            keepAlive: true,
            keepAliveInitialDelay: 30000,
        };
        if (instanceConfig.insecureSkipVerify) {
            connectOptions.rejectUnauthorized = false;
            (0, logger_js_1.logWarn)('TLS verification disabled for instance', { url: normalizedUrl });
        }
        const poolOrigin = new URL(normalizedUrl).origin;
        const pool = new undici.Pool(poolOrigin, {
            connections: this.config.maxConnections,
            keepAliveTimeout: this.config.keepAliveTimeout,
            keepAliveMaxTimeout: this.config.keepAliveMaxTimeout,
            pipelining: this.config.pipelining,
            headersTimeout: this.config.headersTimeout,
            bodyTimeout: this.config.bodyTimeout,
            connect: connectOptions,
        });
        const graphqlEndpoint = `${normalizedUrl}/api/graphql`;
        const graphqlClient = new client_js_1.GraphQLClient(graphqlEndpoint, {});
        return {
            pool,
            graphqlClient,
            graphqlEndpoint,
            baseUrl: normalizedUrl,
            insecureSkipVerify: instanceConfig.insecureSkipVerify ?? false,
            createdAt: new Date(),
            lastUsedAt: new Date(),
        };
    }
    normalizeUrl(url) {
        let normalized = url;
        if (normalized.endsWith('/')) {
            normalized = normalized.slice(0, -1);
        }
        if (normalized.endsWith('/api/v4')) {
            normalized = normalized.slice(0, -7);
        }
        if (normalized.endsWith('/api/graphql')) {
            normalized = normalized.slice(0, -12);
        }
        return normalized;
    }
}
exports.InstanceConnectionPool = InstanceConnectionPool;
//# sourceMappingURL=InstanceConnectionPool.js.map