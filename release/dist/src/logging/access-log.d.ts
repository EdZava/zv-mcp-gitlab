import type { RequestStack, ConnectionStats, AccessLogEntry, ConnectionCloseEntry, ConnectionCloseReason } from './types.js';
export declare function truncateSessionId(sessionId?: string): string;
export declare function formatDuration(ms: number): string;
export declare function formatGitLabStatus(status?: number | 'timeout' | 'error'): string;
export declare function formatDetails(details: Record<string, string | number | boolean>): string;
export declare function createAccessLogEntry(stack: RequestStack): AccessLogEntry;
export declare function formatAccessLog(entry: AccessLogEntry): string;
export declare function createConnectionCloseEntry(stats: ConnectionStats, reason: ConnectionCloseReason): ConnectionCloseEntry;
export declare function formatConnectionClose(entry: ConnectionCloseEntry): string;
export declare class AccessLogFormatter {
    formatRequest(stack: RequestStack): string;
    formatConnectionClose(stats: ConnectionStats, reason: ConnectionCloseReason): string;
    getAccessLogEntry(stack: RequestStack): AccessLogEntry;
    getConnectionCloseEntry(stats: ConnectionStats, reason: ConnectionCloseReason): ConnectionCloseEntry;
}
