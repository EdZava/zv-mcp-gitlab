import { InstanceRateLimiter, RateLimitMetrics } from './InstanceRateLimiter.js';
import { GitLabInstanceConfig, GitLabInstanceState, ConnectionStatus, CachedIntrospection } from '../config/instances-schema.js';
import { PoolStats } from './InstanceConnectionPool.js';
import { GraphQLClient } from '../graphql/client.js';
interface RegistryEntry {
    config: GitLabInstanceConfig;
    state: GitLabInstanceState;
    rateLimiter: InstanceRateLimiter;
}
export interface InstanceSummary {
    url: string;
    label: string | undefined;
    connectionStatus: ConnectionStatus;
    lastHealthCheck: Date | null;
    hasOAuth: boolean;
    rateLimit: RateLimitMetrics;
    introspection: {
        version: string | null;
        tier: string | null;
        cachedAt: Date | null;
        isExpired: boolean;
    };
}
export declare class InstanceRegistry {
    private static instance;
    private instances;
    private configSource;
    private configSourceDetails;
    private initialized;
    private constructor();
    static getInstance(): InstanceRegistry;
    initialize(): Promise<void>;
    register(config: GitLabInstanceConfig): void;
    get(baseUrl: string): RegistryEntry | undefined;
    getConfig(baseUrl: string): GitLabInstanceConfig | undefined;
    getState(baseUrl: string): GitLabInstanceState | undefined;
    list(): InstanceSummary[];
    has(baseUrl: string): boolean;
    unregister(baseUrl: string): boolean;
    getUrls(): string[];
    getDefaultUrl(): string | undefined;
    acquireSlot(baseUrl: string): Promise<() => void>;
    getRateLimitMetrics(baseUrl: string): RateLimitMetrics | undefined;
    getIntrospection(baseUrl: string): CachedIntrospection | null;
    setIntrospection(baseUrl: string, introspection: CachedIntrospection): void;
    updateConnectionStatus(baseUrl: string, status: ConnectionStatus): void;
    clearIntrospectionCache(baseUrl?: string): void;
    getConfigSource(): {
        source: string;
        details: string;
    };
    isInitialized(): boolean;
    getGraphQLClient(baseUrl: string, authHeaders?: Record<string, string>): GraphQLClient | undefined;
    getConnectionPoolStats(): PoolStats[];
    getInstancePoolStats(baseUrl: string): PoolStats | undefined;
    getDispatcher(baseUrl: string): unknown;
    reset(): void;
    resetWithPools(): Promise<void>;
}
export {};
