import { OAuthSession, DeviceFlowState, AuthCodeFlowState, AuthorizationCode } from '../types';
export interface SessionStorageBackend {
    readonly type: 'memory' | 'file' | 'postgresql' | 'redis';
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
    initialize(): Promise<void>;
    cleanup(): Promise<void>;
    close(): Promise<void>;
    getStats(): Promise<SessionStorageStats>;
}
export interface SessionStorageStats {
    sessions: number;
    deviceFlows: number;
    authCodeFlows: number;
    authCodes: number;
    mcpSessionMappings?: number;
}
export interface StorageConfig {
    type: 'memory' | 'file' | 'postgresql';
    file?: {
        path: string;
        saveInterval?: number;
    };
    postgresql?: {
        connectionString: string;
        tablePrefix?: string;
        ssl?: boolean;
    };
}
export interface StorageData {
    version: number;
    exportedAt: number;
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
}
export declare const STORAGE_DATA_VERSION = 1;
