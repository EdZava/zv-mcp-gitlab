export declare const DEFAULT_HEADERS: Record<string, string>;
export declare function getGitLabBaseUrl(): string;
export declare function getAuthHeaders(): Record<string, string>;
export declare function createFetchOptions(): Record<string, unknown>;
export type TimeoutPhase = 'connect' | 'headers' | 'body';
export declare class GitLabTimeoutError extends Error {
    readonly phase: TimeoutPhase;
    readonly timeoutMs: number;
    constructor(phase: TimeoutPhase, timeoutMs: number, cause?: Error);
}
export interface FetchWithRetryOptions extends RequestInit {
    retry?: boolean;
    maxRetries?: number;
    rateLimit?: boolean;
    rateLimitBaseUrl?: string;
    skipAuth?: boolean;
}
export declare function extractBaseUrl(url: string): string | undefined;
export declare function enhancedFetch(url: string, options?: FetchWithRetryOptions): Promise<Response>;
export declare function resetDispatcherCache(): void;
