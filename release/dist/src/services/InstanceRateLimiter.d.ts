export interface RateLimiterConfig {
    maxConcurrent: number;
    queueSize: number;
    queueTimeout: number;
}
export interface RateLimitMetrics {
    activeRequests: number;
    maxConcurrent: number;
    queuedRequests: number;
    queueSize: number;
    requestsTotal: number;
    requestsQueued: number;
    requestsRejected: number;
    avgQueueWaitMs: number;
}
export declare const DEFAULT_RATE_LIMIT_CONFIG: RateLimiterConfig;
export declare class InstanceRateLimiter {
    private readonly config;
    private activeRequests;
    private queue;
    private requestsTotal;
    private requestsQueued;
    private requestsRejected;
    private totalQueueWaitMs;
    private queuedRequestsCompleted;
    constructor(config?: Partial<RateLimiterConfig>);
    acquire(): Promise<() => void>;
    private release;
    private createIdempotentRelease;
    getMetrics(): RateLimitMetrics;
    getConfig(): Readonly<RateLimiterConfig>;
    isAtCapacity(): boolean;
    isQueueFull(): boolean;
    resetMetrics(): void;
}
