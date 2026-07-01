"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionStore = exports.SessionStore = void 0;
const storage_1 = require("./storage");
const logger_1 = require("../logger");
class SessionStore {
    backend;
    initialized = false;
    sessions = new Map();
    deviceFlows = new Map();
    authCodeFlows = new Map();
    authCodes = new Map();
    tokenToSession = new Map();
    refreshTokenToSession = new Map();
    mcpSessionToOAuthSession = new Map();
    cleanupIntervalId = null;
    constructor(backend) {
        this.backend = backend ?? (0, storage_1.createStorageBackend)();
    }
    async initialize() {
        if (this.initialized)
            return;
        await this.backend.initialize();
        if (this.backend.type !== 'memory') {
            const sessions = await this.backend.getAllSessions();
            for (const session of sessions) {
                this.sessions.set(session.id, session);
                if (session.mcpAccessToken) {
                    this.tokenToSession.set(session.mcpAccessToken, session.id);
                }
                if (session.mcpRefreshToken) {
                    this.refreshTokenToSession.set(session.mcpRefreshToken, session.id);
                }
            }
            (0, logger_1.logInfo)('Loaded sessions from storage backend', { loadedSessions: sessions.length });
        }
        this.startCleanupInterval();
        this.initialized = true;
        (0, logger_1.logInfo)('Session store initialized', { backendType: this.backend.type });
    }
    getBackendType() {
        return this.backend.type;
    }
    createSession(session) {
        this.sessions.set(session.id, session);
        if (session.mcpAccessToken) {
            this.tokenToSession.set(session.mcpAccessToken, session.id);
        }
        if (session.mcpRefreshToken) {
            this.refreshTokenToSession.set(session.mcpRefreshToken, session.id);
        }
        this.backend.createSession(session).catch((err) => {
            (0, logger_1.logError)('Failed to persist session to backend', { err, sessionId: session.id });
        });
        (0, logger_1.logDebug)('Session created', { sessionId: session.id, userId: session.gitlabUserId });
    }
    getSession(sessionId) {
        return this.sessions.get(sessionId);
    }
    getSessionByToken(token) {
        const sessionId = this.tokenToSession.get(token);
        return sessionId ? this.sessions.get(sessionId) : undefined;
    }
    getSessionByRefreshToken(refreshToken) {
        const sessionId = this.refreshTokenToSession.get(refreshToken);
        return sessionId ? this.sessions.get(sessionId) : undefined;
    }
    updateSession(sessionId, updates) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            (0, logger_1.logWarn)('Attempted to update non-existent session', { sessionId });
            return false;
        }
        if (updates.mcpAccessToken && updates.mcpAccessToken !== session.mcpAccessToken) {
            this.tokenToSession.delete(session.mcpAccessToken);
            this.tokenToSession.set(updates.mcpAccessToken, sessionId);
        }
        if (updates.mcpRefreshToken && updates.mcpRefreshToken !== session.mcpRefreshToken) {
            this.refreshTokenToSession.delete(session.mcpRefreshToken);
            this.refreshTokenToSession.set(updates.mcpRefreshToken, sessionId);
        }
        Object.assign(session, updates, { updatedAt: Date.now() });
        this.backend.updateSession(sessionId, updates).catch((err) => {
            (0, logger_1.logError)('Failed to update session in backend', { err, sessionId });
        });
        (0, logger_1.logDebug)('Session updated', { sessionId });
        return true;
    }
    deleteSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            return false;
        }
        if (session.mcpAccessToken) {
            this.tokenToSession.delete(session.mcpAccessToken);
        }
        if (session.mcpRefreshToken) {
            this.refreshTokenToSession.delete(session.mcpRefreshToken);
        }
        this.sessions.delete(sessionId);
        this.backend.deleteSession(sessionId).catch((err) => {
            (0, logger_1.logError)('Failed to delete session from backend', { err, sessionId });
        });
        (0, logger_1.logDebug)('Session deleted', { sessionId });
        return true;
    }
    getAllSessions() {
        return this.sessions.values();
    }
    getSessionCount() {
        return this.sessions.size;
    }
    storeDeviceFlow(state, flow) {
        this.deviceFlows.set(state, flow);
        this.backend.storeDeviceFlow(state, flow).catch((err) => {
            (0, logger_1.logError)('Failed to persist device flow to backend', { err, state });
        });
        (0, logger_1.logDebug)('Device flow stored', { state, userCode: flow.userCode });
    }
    getDeviceFlow(state) {
        return this.deviceFlows.get(state);
    }
    getDeviceFlowByDeviceCode(deviceCode) {
        for (const flow of this.deviceFlows.values()) {
            if (flow.deviceCode === deviceCode) {
                return flow;
            }
        }
        return undefined;
    }
    deleteDeviceFlow(state) {
        const deleted = this.deviceFlows.delete(state);
        if (deleted) {
            this.backend.deleteDeviceFlow(state).catch((err) => {
                (0, logger_1.logError)('Failed to delete device flow from backend', { err, state });
            });
            (0, logger_1.logDebug)('Device flow deleted', { state });
        }
        return deleted;
    }
    getDeviceFlowCount() {
        return this.deviceFlows.size;
    }
    storeAuthCodeFlow(internalState, flow) {
        this.authCodeFlows.set(internalState, flow);
        this.backend.storeAuthCodeFlow(internalState, flow).catch((err) => {
            (0, logger_1.logError)('Failed to persist auth code flow', {
                err,
                internalState: (0, logger_1.truncateId)(internalState),
            });
        });
        (0, logger_1.logDebug)('Auth code flow stored', { internalState: (0, logger_1.truncateId)(internalState) });
    }
    getAuthCodeFlow(internalState) {
        return this.authCodeFlows.get(internalState);
    }
    deleteAuthCodeFlow(internalState) {
        const deleted = this.authCodeFlows.delete(internalState);
        if (deleted) {
            this.backend.deleteAuthCodeFlow(internalState).catch((err) => {
                (0, logger_1.logError)('Failed to delete auth code flow', {
                    err,
                    internalState: (0, logger_1.truncateId)(internalState),
                });
            });
            (0, logger_1.logDebug)('Auth code flow deleted', { internalState: (0, logger_1.truncateId)(internalState) });
        }
        return deleted;
    }
    getAuthCodeFlowCount() {
        return this.authCodeFlows.size;
    }
    storeAuthCode(code) {
        this.authCodes.set(code.code, code);
        this.backend.storeAuthCode(code).catch((err) => {
            (0, logger_1.logError)('Failed to persist auth code', { err, code: (0, logger_1.truncateId)(code.code) });
        });
        (0, logger_1.logDebug)('Auth code stored', { code: (0, logger_1.truncateId)(code.code) });
    }
    getAuthCode(code) {
        return this.authCodes.get(code);
    }
    deleteAuthCode(code) {
        const deleted = this.authCodes.delete(code);
        if (deleted) {
            this.backend.deleteAuthCode(code).catch((err) => {
                (0, logger_1.logError)('Failed to delete auth code', { err, code: (0, logger_1.truncateId)(code) });
            });
            (0, logger_1.logDebug)('Auth code deleted', { code: (0, logger_1.truncateId)(code) });
        }
        return deleted;
    }
    getAuthCodeCount() {
        return this.authCodes.size;
    }
    associateMcpSession(mcpSessionId, oauthSessionId) {
        this.mcpSessionToOAuthSession.set(mcpSessionId, oauthSessionId);
        this.backend.associateMcpSession(mcpSessionId, oauthSessionId).catch((err) => {
            (0, logger_1.logError)('Failed to persist MCP session association', { err, mcpSessionId });
        });
        (0, logger_1.logDebug)('MCP session associated with OAuth session', {
            mcpSessionId,
            oauthSessionId: (0, logger_1.truncateId)(oauthSessionId),
        });
    }
    getSessionByMcpSessionId(mcpSessionId) {
        const oauthSessionId = this.mcpSessionToOAuthSession.get(mcpSessionId);
        if (!oauthSessionId) {
            return undefined;
        }
        return this.sessions.get(oauthSessionId);
    }
    getGitLabTokenByMcpSessionId(mcpSessionId) {
        const session = this.getSessionByMcpSessionId(mcpSessionId);
        return session?.gitlabAccessToken;
    }
    removeMcpSessionAssociation(mcpSessionId) {
        const deleted = this.mcpSessionToOAuthSession.delete(mcpSessionId);
        if (deleted) {
            this.backend.removeMcpSessionAssociation(mcpSessionId).catch((err) => {
                (0, logger_1.logError)('Failed to remove MCP session association from backend', { err, mcpSessionId });
            });
            (0, logger_1.logDebug)('MCP session association removed', { mcpSessionId });
        }
        return deleted;
    }
    cleanup() {
        const now = Date.now();
        let expiredSessions = 0;
        let expiredDeviceFlows = 0;
        let expiredAuthCodeFlows = 0;
        let expiredAuthCodes = 0;
        const maxAge = 7 * 24 * 60 * 60 * 1000;
        for (const [id, session] of this.sessions) {
            if (session.createdAt + maxAge < now) {
                this.deleteSession(id);
                expiredSessions++;
            }
        }
        for (const [state, flow] of this.deviceFlows) {
            if (flow.expiresAt < now) {
                this.deleteDeviceFlow(state);
                expiredDeviceFlows++;
            }
        }
        for (const [state, flow] of this.authCodeFlows) {
            if (flow.expiresAt < now) {
                this.deleteAuthCodeFlow(state);
                expiredAuthCodeFlows++;
            }
        }
        for (const [code, auth] of this.authCodes) {
            if (auth.expiresAt < now) {
                this.deleteAuthCode(code);
                expiredAuthCodes++;
            }
        }
        if (expiredSessions > 0 ||
            expiredDeviceFlows > 0 ||
            expiredAuthCodeFlows > 0 ||
            expiredAuthCodes > 0) {
            (0, logger_1.logDebug)('Session store cleanup completed', {
                expiredSessions,
                expiredDeviceFlows,
                expiredAuthCodeFlows,
                expiredAuthCodes,
                remainingSessions: this.sessions.size,
            });
        }
    }
    startCleanupInterval() {
        this.cleanupIntervalId = setInterval(() => {
            this.cleanup();
        }, 5 * 60 * 1000);
        if (this.cleanupIntervalId.unref) {
            this.cleanupIntervalId.unref();
        }
    }
    stopCleanupInterval() {
        if (this.cleanupIntervalId) {
            clearInterval(this.cleanupIntervalId);
            this.cleanupIntervalId = null;
        }
    }
    clear() {
        this.sessions.clear();
        this.deviceFlows.clear();
        this.authCodeFlows.clear();
        this.authCodes.clear();
        this.tokenToSession.clear();
        this.refreshTokenToSession.clear();
        this.mcpSessionToOAuthSession.clear();
        (0, logger_1.logDebug)('Session store cleared');
    }
    async close() {
        this.stopCleanupInterval();
        await this.backend.close();
        (0, logger_1.logInfo)('Session store closed');
    }
    getStats() {
        return {
            sessions: this.sessions.size,
            deviceFlows: this.deviceFlows.size,
            authCodeFlows: this.authCodeFlows.size,
            authCodes: this.authCodes.size,
        };
    }
}
exports.SessionStore = SessionStore;
exports.sessionStore = new SessionStore();
//# sourceMappingURL=session-store.js.map