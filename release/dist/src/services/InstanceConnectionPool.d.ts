import { GraphQLClient } from '../graphql/client.js';
import { GitLabInstanceConfig } from '../config/instances-schema.js';
interface UndiciAgent {
    destroy(): Promise<void>;
}
interface UndiciPool extends UndiciAgent {
    stats: {
        connected: number;
        free: number;
        pending: number;
        queued: number;
        running: number;
        size: number;
    };
}
export interface ConnectionPoolConfig {
    maxConnections: number;
    keepAliveTimeout: number;
    keepAliveMaxTimeout: number;
    pipelining: number;
    connectTimeout: number;
    headersTimeout: number;
    bodyTimeout: number;
}
export interface PoolStats {
    baseUrl: string;
    graphqlEndpoint: string;
    connected: number;
    free: number;
    pending: number;
    queued: number;
    running: number;
    size: number;
    createdAt: Date;
    lastUsedAt: Date;
}
export declare class InstanceConnectionPool {
    private static instance;
    private pools;
    private config;
    private constructor();
    static getInstance(config?: Partial<ConnectionPoolConfig>): InstanceConnectionPool;
    getGraphQLClient(instanceConfig: GitLabInstanceConfig, authHeaders?: Record<string, string>): GraphQLClient;
    getDispatcher(baseUrl: string): UndiciPool | undefined;
    getStats(): PoolStats[];
    getInstanceStats(baseUrl: string): PoolStats | undefined;
    destroyPool(baseUrl: string): Promise<void>;
    destroyAll(): Promise<void>;
    static resetInstance(): Promise<void>;
    private getOrCreateEntry;
    private createEntry;
    private normalizeUrl;
}
export {};
