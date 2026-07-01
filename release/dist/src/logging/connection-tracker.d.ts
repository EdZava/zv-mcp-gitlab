import type { ConnectionStats, ConnectionCloseReason } from './types.js';
export declare class ConnectionTracker {
    private connections;
    private enabled;
    constructor(enabled?: boolean);
    isEnabled(): boolean;
    setEnabled(enabled: boolean): void;
    openConnection(sessionId: string, clientIp: string): void;
    getStats(sessionId: string): ConnectionStats | undefined;
    incrementRequests(sessionId: string): void;
    incrementTools(sessionId: string): void;
    recordError(sessionId: string, error: string): void;
    closeConnection(sessionId: string, reason: ConnectionCloseReason): string | undefined;
    hasConnection(sessionId: string): boolean;
    getActiveConnectionCount(): number;
    getAllSessionIds(): string[];
    closeAllConnections(reason?: ConnectionCloseReason): void;
    clear(): void;
}
export declare function getConnectionTracker(): ConnectionTracker;
export declare function resetConnectionTracker(): void;
