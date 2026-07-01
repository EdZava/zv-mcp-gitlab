import type { RequestStack } from './types.js';
export interface RequestContext {
    requestId: string;
}
export declare function getCurrentRequestId(): string | undefined;
export declare function runWithRequestContext<T>(requestId: string, fn: () => T): T;
export declare function runWithRequestContextAsync<T>(requestId: string, fn: () => Promise<T>): Promise<T>;
export declare class RequestTracker {
    private stacks;
    private enabled;
    constructor(enabled?: boolean);
    isEnabled(): boolean;
    setEnabled(enabled: boolean): void;
    openStack(requestId: string, clientIp: string, method: string, path: string, sessionId?: string): void;
    getStack(requestId: string): RequestStack | undefined;
    setTool(requestId: string, tool: string, action?: string): void;
    setGitLabResponse(requestId: string, status: number | 'timeout' | 'error', durationMs?: number): void;
    addDetail(requestId: string, key: string, value: string | number | boolean): void;
    addDetails(requestId: string, details: Record<string, string | number | boolean>): void;
    setError(requestId: string, error: string): void;
    setContext(requestId: string, context: string): void;
    setReadOnly(requestId: string, readOnly: boolean): void;
    setSessionId(requestId: string, sessionId: string): void;
    closeStack(requestId: string, status: number): string | undefined;
    closeStackWithError(requestId: string, error: string): string | undefined;
    hasStack(requestId: string): boolean;
    getOpenStackCount(): number;
    clear(): void;
    setToolForCurrentRequest(tool: string, action?: string): void;
    setGitLabResponseForCurrentRequest(status: number | 'timeout' | 'error', durationMs?: number): void;
    addDetailForCurrentRequest(key: string, value: string | number | boolean): void;
    addDetailsForCurrentRequest(details: Record<string, string | number | boolean>): void;
    setErrorForCurrentRequest(error: string): void;
    setContextForCurrentRequest(context: string): void;
    setReadOnlyForCurrentRequest(readOnly: boolean): void;
    setSessionIdForCurrentRequest(sessionId: string): void;
}
export declare function getRequestTracker(): RequestTracker;
export declare function resetRequestTracker(): void;
