import { RequestHandler } from 'express';
export declare function stopCleanup(): void;
export declare function rateLimiterMiddleware(): RequestHandler;
export declare function getRateLimitStats(): {
    totalEntries: number;
    entries: Array<{
        key: string;
        count: number;
        resetAt: Date;
    }>;
};
