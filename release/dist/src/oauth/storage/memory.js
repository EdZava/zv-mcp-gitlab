"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryStorageBackend = void 0;
const logger_1 = require("../../logger");
class MemoryStorageBackend {
    type = 'memory';
    sessions = new Map();
    deviceFlows = new Map();
    authCodeFlows = new Map();
    authCodes = new Map();
    tokenToSession = new Map();
    refreshTokenToSession = new Map();
    mcpSessionToOAuthSession = new Map();
    cleanupIntervalId = null;
    silent;
    constructor(options) {
        this.silent = options?.silent ?? false;
    }
    async initialize() {
        this.startCleanupInterval();
        if (!this.silent) {
            (0, logger_1.logInfo)('Memory storage backend initialized');
        }
    }
    async createSession(session) {
        this.sessions.set(session.id, session);
        if (session.mcpAccessToken) {
            this.tokenToSession.set(session.mcpAccessToken, session.id);
        }
        if (session.mcpRefreshToken) {
            this.refreshTokenToSession.set(session.mcpRefreshToken, session.id);
        }
        (0, logger_1.logDebug)('Session created', { sessionId: session.id, userId: session.gitlabUserId });
    }
    async getSession(sessionId) {
        return this.sessions.get(sessionId);
    }
    async getSessionByToken(token) {
        const sessionId = this.tokenToSession.get(token);
        return sessionId ? this.sessions.get(sessionId) : undefined;
    }
    async getSessionByRefreshToken(refreshToken) {
        const sessionId = this.refreshTokenToSession.get(refreshToken);
        return sessionId ? this.sessions.get(sessionId) : undefined;
    }
    async updateSession(sessionId, updates) {
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
        (0, logger_1.logDebug)('Session updated', { sessionId });
        return true;
    }
    async deleteSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session)
            return false;
        if (session.mcpAccessToken) {
            this.tokenToSession.delete(session.mcpAccessToken);
        }
        if (session.mcpRefreshToken) {
            this.refreshTokenToSession.delete(session.mcpRefreshToken);
        }
        this.sessions.delete(sessionId);
        (0, logger_1.logDebug)('Session deleted', { sessionId });
        return true;
    }
    async getAllSessions() {
        return Array.from(this.sessions.values());
    }
    async storeDeviceFlow(state, flow) {
        this.deviceFlows.set(state, flow);
        (0, logger_1.logDebug)('Device flow stored', { state, userCode: flow.userCode });
    }
    async getDeviceFlow(state) {
        return this.deviceFlows.get(state);
    }
    async getDeviceFlowByDeviceCode(deviceCode) {
        for (const flow of this.deviceFlows.values()) {
            if (flow.deviceCode === deviceCode)
                return flow;
        }
        return undefined;
    }
    async deleteDeviceFlow(state) {
        const deleted = this.deviceFlows.delete(state);
        if (deleted)
            (0, logger_1.logDebug)('Device flow deleted', { state });
        return deleted;
    }
    async storeAuthCodeFlow(internalState, flow) {
        this.authCodeFlows.set(internalState, flow);
        (0, logger_1.logDebug)('Auth code flow stored', { internalState: (0, logger_1.truncateId)(internalState) });
    }
    async getAuthCodeFlow(internalState) {
        return this.authCodeFlows.get(internalState);
    }
    async deleteAuthCodeFlow(internalState) {
        const deleted = this.authCodeFlows.delete(internalState);
        if (deleted) {
            (0, logger_1.logDebug)('Auth code flow deleted', { internalState: (0, logger_1.truncateId)(internalState) });
        }
        return deleted;
    }
    async storeAuthCode(code) {
        this.authCodes.set(code.code, code);
        (0, logger_1.logDebug)('Auth code stored', { code: (0, logger_1.truncateId)(code.code) });
    }
    async getAuthCode(code) {
        return this.authCodes.get(code);
    }
    async deleteAuthCode(code) {
        const deleted = this.authCodes.delete(code);
        if (deleted)
            (0, logger_1.logDebug)('Auth code deleted', { code: (0, logger_1.truncateId)(code) });
        return deleted;
    }
    async associateMcpSession(mcpSessionId, oauthSessionId) {
        this.mcpSessionToOAuthSession.set(mcpSessionId, oauthSessionId);
        (0, logger_1.logDebug)('MCP session associated with OAuth session', {
            mcpSessionId,
            oauthSessionId: (0, logger_1.truncateId)(oauthSessionId),
        });
    }
    async getSessionByMcpSessionId(mcpSessionId) {
        const oauthSessionId = this.mcpSessionToOAuthSession.get(mcpSessionId);
        if (!oauthSessionId)
            return undefined;
        return this.sessions.get(oauthSessionId);
    }
    async removeMcpSessionAssociation(mcpSessionId) {
        const deleted = this.mcpSessionToOAuthSession.delete(mcpSessionId);
        if (deleted)
            (0, logger_1.logDebug)('MCP session association removed', { mcpSessionId });
        return deleted;
    }
    async cleanup() {
        const now = Date.now();
        let expiredSessions = 0;
        let expiredDeviceFlows = 0;
        let expiredAuthCodeFlows = 0;
        let expiredAuthCodes = 0;
        const maxAge = 7 * 24 * 60 * 60 * 1000;
        for (const [id, session] of this.sessions) {
            if (session.createdAt + maxAge < now) {
                await this.deleteSession(id);
                expiredSessions++;
            }
        }
        for (const [state, flow] of this.deviceFlows) {
            if (flow.expiresAt < now) {
                this.deviceFlows.delete(state);
                expiredDeviceFlows++;
            }
        }
        for (const [state, flow] of this.authCodeFlows) {
            if (flow.expiresAt < now) {
                this.authCodeFlows.delete(state);
                expiredAuthCodeFlows++;
            }
        }
        for (const [code, auth] of this.authCodes) {
            if (auth.expiresAt < now) {
                this.authCodes.delete(code);
                expiredAuthCodes++;
            }
        }
        if (expiredSessions > 0 ||
            expiredDeviceFlows > 0 ||
            expiredAuthCodeFlows > 0 ||
            expiredAuthCodes > 0) {
            (0, logger_1.logDebug)('Memory storage cleanup completed', {
                expiredSessions,
                expiredDeviceFlows,
                expiredAuthCodeFlows,
                expiredAuthCodes,
                remainingSessions: this.sessions.size,
            });
        }
    }
    async close() {
        this.stopCleanupInterval();
        if (!this.silent) {
            (0, logger_1.logInfo)('Memory storage backend closed');
        }
    }
    async getStats() {
        return {
            sessions: this.sessions.size,
            deviceFlows: this.deviceFlows.size,
            authCodeFlows: this.authCodeFlows.size,
            authCodes: this.authCodes.size,
            mcpSessionMappings: this.mcpSessionToOAuthSession.size,
        };
    }
    startCleanupInterval() {
        this.cleanupIntervalId = setInterval(() => {
            this.cleanup().catch((err) => (0, logger_1.logError)('Cleanup error', { err }));
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
    exportData() {
        return {
            sessions: Array.from(this.sessions.values()),
            deviceFlows: Array.from(this.deviceFlows.entries()).map(([state, flow]) => ({ state, flow })),
            authCodeFlows: Array.from(this.authCodeFlows.entries()).map(([internalState, flow]) => ({
                internalState,
                flow,
            })),
            authCodes: Array.from(this.authCodes.values()),
            mcpSessionMappings: Array.from(this.mcpSessionToOAuthSession.entries()).map(([mcpSessionId, oauthSessionId]) => ({ mcpSessionId, oauthSessionId })),
        };
    }
    importData(data) {
        this.sessions.clear();
        this.deviceFlows.clear();
        this.authCodeFlows.clear();
        this.authCodes.clear();
        this.tokenToSession.clear();
        this.refreshTokenToSession.clear();
        this.mcpSessionToOAuthSession.clear();
        if (data.sessions) {
            for (const session of data.sessions) {
                this.sessions.set(session.id, session);
                if (session.mcpAccessToken) {
                    this.tokenToSession.set(session.mcpAccessToken, session.id);
                }
                if (session.mcpRefreshToken) {
                    this.refreshTokenToSession.set(session.mcpRefreshToken, session.id);
                }
            }
        }
        if (data.deviceFlows) {
            for (const { state, flow } of data.deviceFlows) {
                this.deviceFlows.set(state, flow);
            }
        }
        if (data.authCodeFlows) {
            for (const { internalState, flow } of data.authCodeFlows) {
                this.authCodeFlows.set(internalState, flow);
            }
        }
        if (data.authCodes) {
            for (const code of data.authCodes) {
                this.authCodes.set(code.code, code);
            }
        }
        if (data.mcpSessionMappings) {
            for (const { mcpSessionId, oauthSessionId } of data.mcpSessionMappings) {
                this.mcpSessionToOAuthSession.set(mcpSessionId, oauthSessionId);
            }
        }
        (0, logger_1.logInfo)('Data imported into memory storage', {
            sessions: this.sessions.size,
            deviceFlows: this.deviceFlows.size,
            authCodeFlows: this.authCodeFlows.size,
            authCodes: this.authCodes.size,
        });
    }
}
exports.MemoryStorageBackend = MemoryStorageBackend;
//# sourceMappingURL=memory.js.map