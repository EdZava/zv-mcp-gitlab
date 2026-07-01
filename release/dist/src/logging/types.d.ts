export interface RequestStack {
    startTime: number;
    clientIp: string;
    sessionId?: string;
    context?: string;
    readOnly?: boolean;
    method: string;
    path: string;
    tool?: string;
    action?: string;
    gitlabStatus?: number | 'timeout' | 'error';
    gitlabDuration?: number;
    details: Record<string, string | number | boolean>;
    status?: number;
    error?: string;
}
export type ConnectionCloseReason = 'client_disconnect' | 'idle_timeout' | 'server_shutdown' | 'transport_error' | 'auth_expired' | 'session_closed' | 'destroyed' | 'normal_close' | 'heartbeat_failed' | 'write_timeout' | `peer_reset:${string}`;
export interface ConnectionStats {
    connectedAt: number;
    clientIp: string;
    sessionId: string;
    requestCount: number;
    toolCount: number;
    errorCount: number;
    lastError?: string;
}
export interface AccessLogEntry {
    timestamp: string;
    clientIp: string;
    session: string;
    ctx: string;
    ro: string;
    method: string;
    path: string;
    status: number;
    durationMs: number;
    tool: string;
    action: string;
    gitlabStatus: string;
    gitlabDurationMs: string;
    details: string;
}
export interface ConnectionCloseEntry {
    timestamp: string;
    clientIp: string;
    session: string;
    duration: string;
    reason: ConnectionCloseReason;
    requests: number;
    tools: number;
    errors: number;
    lastError?: string;
}
export type LogFormat = 'condensed' | 'verbose';
export declare const DEFAULT_LOG_FORMAT: LogFormat;
