import { OAuthSession, DeviceFlowState, AuthCodeFlowState, AuthorizationCode } from '../types';
import { SessionStorageBackend, SessionStorageStats } from './types';
export interface FileStorageOptions {
    filePath: string;
    saveInterval?: number;
    saveDebounce?: number;
}
export declare class FileStorageBackend implements SessionStorageBackend {
    readonly type: "file";
    private memory;
    private filePath;
    private saveInterval;
    private saveDebounce;
    private saveIntervalId;
    private saveDebounceId;
    private pendingSave;
    private initialized;
    constructor(options: FileStorageOptions);
    initialize(): Promise<void>;
    private loadFromFile;
    private saveToFile;
    private scheduleSave;
    private startSaveInterval;
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
    forceSave(): Promise<void>;
}
