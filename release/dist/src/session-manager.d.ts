import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
export declare const STDIO_SESSION_ID = "stdio";
export declare class SessionManager {
    private sessions;
    private cleanupInterval;
    private readonly sessionTimeoutMs;
    private schemaModeDetected;
    constructor(sessionTimeoutMs?: number);
    start(): void;
    createSession(sessionId: string, transport: Transport, instanceUrl?: string): Promise<Server>;
    touchSession(sessionId: string): void;
    setSessionInstanceUrl(sessionId: string, url: string): void;
    getSessionInstanceUrl(sessionId: string): string | undefined;
    getSessionsByInstance(): Map<string, number>;
    removeSession(sessionId: string): Promise<void>;
    broadcastToolsListChanged(instanceUrl?: string): Promise<void>;
    get activeSessionCount(): number;
    private cleanupStaleSessions;
    shutdown(): Promise<void>;
}
export declare function getSessionManager(): SessionManager;
export declare function resetSessionManager(): void;
