import { OAuthSession, DeviceFlowState, AuthCodeFlowState, AuthorizationCode } from '../types';
import { SessionStorageBackend, SessionStorageStats } from './types';
export interface MemoryStorageOptions {
    silent?: boolean;
}
export declare class MemoryStorageBackend implements SessionStorageBackend {
    readonly type: "memory";
    private sessions;
    private deviceFlows;
    private authCodeFlows;
    private authCodes;
    private tokenToSession;
    private refreshTokenToSession;
    private mcpSessionToOAuthSession;
    private cleanupIntervalId;
    private silent;
    constructor(options?: MemoryStorageOptions);
    initialize(): Promise<void>;
    createSession(session: OAuthSession): Promise<void>;
    getSession(sessionId: string): Promise<OAuthSession | undefined>;
    getSessionByToken(token: string): Promise<OAuthSession | undefined>;
    getSessionByRefreshToken(refreshToken: string): Promise<OAuthSession | undefined>;
    updateSession(sessionId: string, updates: Partial<OAuthSession>): Promise<boolean>;
    deleteSession(sessionId: string): Promise<boolean>;
    getAllSessions(): Promise<OAuthSession[]>;
    storeDeviceFlow(state: string, flow: DeviceFlowState): Promise<void>;
    getDeviceFlow(state: string): Promise<DeviceFlowState | undefined>;
    getDeviceFlowByDeviceCode(deviceCode: string): Promise<DeviceFlowState | undefined>;
    deleteDeviceFlow(state: string): Promise<boolean>;
    storeAuthCodeFlow(internalState: string, flow: AuthCodeFlowState): Promise<void>;
    getAuthCodeFlow(internalState: string): Promise<AuthCodeFlowState | undefined>;
    deleteAuthCodeFlow(internalState: string): Promise<boolean>;
    storeAuthCode(code: AuthorizationCode): Promise<void>;
    getAuthCode(code: string): Promise<AuthorizationCode | undefined>;
    deleteAuthCode(code: string): Promise<boolean>;
    associateMcpSession(mcpSessionId: string, oauthSessionId: string): Promise<void>;
    getSessionByMcpSessionId(mcpSessionId: string): Promise<OAuthSession | undefined>;
    removeMcpSessionAssociation(mcpSessionId: string): Promise<boolean>;
    cleanup(): Promise<void>;
    close(): Promise<void>;
    getStats(): Promise<SessionStorageStats>;
    private startCleanupInterval;
    private stopCleanupInterval;
    exportData(): {
        sessions: OAuthSession[];
        deviceFlows: Array<{
            state: string;
            flow: DeviceFlowState;
        }>;
        authCodeFlows: Array<{
            internalState: string;
            flow: AuthCodeFlowState;
        }>;
        authCodes: AuthorizationCode[];
        mcpSessionMappings: Array<{
            mcpSessionId: string;
            oauthSessionId: string;
        }>;
    };
    importData(data: {
        sessions?: OAuthSession[];
        deviceFlows?: Array<{
            state: string;
            flow: DeviceFlowState;
        }>;
        authCodeFlows?: Array<{
            internalState: string;
            flow: AuthCodeFlowState;
        }>;
        authCodes?: AuthorizationCode[];
        mcpSessionMappings?: Array<{
            mcpSessionId: string;
            oauthSessionId: string;
        }>;
    }): void;
}
