"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionManager = exports.STDIO_SESSION_ID = void 0;
exports.getSessionManager = getSessionManager;
exports.resetSessionManager = resetSessionManager;
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const config_1 = require("./config");
const handlers_1 = require("./handlers");
const schema_utils_1 = require("./utils/schema-utils");
const logger_1 = require("./logger");
const url_1 = require("./utils/url");
const DEFAULT_SESSION_TIMEOUT_MS = 30 * 60 * 1000;
exports.STDIO_SESSION_ID = 'stdio';
class SessionManager {
    sessions = new Map();
    cleanupInterval = null;
    sessionTimeoutMs;
    schemaModeDetected = false;
    constructor(sessionTimeoutMs) {
        this.sessionTimeoutMs = sessionTimeoutMs ?? DEFAULT_SESSION_TIMEOUT_MS;
    }
    start() {
        this.cleanupInterval = setInterval(() => {
            this.cleanupStaleSessions();
        }, 60_000);
        this.cleanupInterval.unref();
        (0, logger_1.logInfo)('Session manager started', { sessionTimeoutMs: this.sessionTimeoutMs });
    }
    async createSession(sessionId, transport, instanceUrl) {
        if (this.sessions.has(sessionId)) {
            (0, logger_1.logWarn)('Duplicate sessionId detected — closing existing session', { sessionId });
            await this.removeSession(sessionId);
        }
        const server = new index_js_1.Server({ name: config_1.packageName, version: config_1.packageVersion }, { capabilities: { tools: { listChanged: true } } });
        server.oninitialized = () => {
            if (!this.schemaModeDetected) {
                this.schemaModeDetected = true;
                const clientVersion = server.getClientVersion();
                (0, schema_utils_1.setDetectedSchemaMode)(clientVersion?.name);
            }
        };
        await (0, handlers_1.setupHandlers)(server);
        await server.connect(transport);
        const now = Date.now();
        this.sessions.set(sessionId, {
            server,
            sessionId,
            createdAt: now,
            lastActivityAt: now,
            instanceUrl: (0, url_1.normalizeInstanceUrl)(instanceUrl ?? config_1.GITLAB_BASE_URL),
        });
        (0, logger_1.logInfo)('Session created', { sessionId, activeSessions: this.sessions.size });
        return server;
    }
    touchSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.lastActivityAt = Date.now();
        }
    }
    setSessionInstanceUrl(sessionId, url) {
        const normalizedUrl = (0, url_1.normalizeInstanceUrl)(url);
        const session = this.sessions.get(sessionId);
        if (session && session.instanceUrl !== normalizedUrl) {
            session.instanceUrl = normalizedUrl;
            (0, logger_1.logDebug)('Session instance URL updated', { sessionId, instanceUrl: normalizedUrl });
            void session.server
                .notification({ method: 'notifications/tools/list_changed' })
                .catch((error) => {
                (0, logger_1.logDebug)('Failed to notify session of tool list change after instance URL update', {
                    sessionId,
                    instanceUrl: normalizedUrl,
                    err: error,
                });
            });
        }
    }
    getSessionInstanceUrl(sessionId) {
        return this.sessions.get(sessionId)?.instanceUrl;
    }
    getSessionsByInstance() {
        const counts = new Map();
        for (const session of this.sessions.values()) {
            counts.set(session.instanceUrl, (counts.get(session.instanceUrl) ?? 0) + 1);
        }
        return counts;
    }
    async removeSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session)
            return;
        this.sessions.delete(sessionId);
        try {
            await session.server.close();
        }
        catch (error) {
            (0, logger_1.logDebug)('Error closing session server (may already be closed)', { err: error, sessionId });
        }
        (0, logger_1.logInfo)('Session removed', { sessionId, activeSessions: this.sessions.size });
    }
    async broadcastToolsListChanged(instanceUrl) {
        const normalizedFilter = instanceUrl !== undefined ? (0, url_1.normalizeInstanceUrl)(instanceUrl) : undefined;
        const promises = [];
        for (const [sessionId, session] of this.sessions) {
            if (normalizedFilter !== undefined && session.instanceUrl !== normalizedFilter) {
                continue;
            }
            promises.push(session.server
                .notification({ method: 'notifications/tools/list_changed' })
                .then(() => {
                (0, logger_1.logDebug)('Sent tools/list_changed to session', { sessionId });
            })
                .catch((error) => {
                (0, logger_1.logDebug)('Failed to send tools/list_changed to session', { err: error, sessionId });
            }));
        }
        await Promise.allSettled(promises);
        (0, logger_1.logInfo)('Broadcast tools/list_changed', {
            sessionCount: this.sessions.size,
            notifiedCount: promises.length,
            instanceUrl: normalizedFilter ?? 'all',
        });
    }
    get activeSessionCount() {
        return this.sessions.size;
    }
    cleanupStaleSessions() {
        const now = Date.now();
        const stale = [];
        for (const [sessionId, session] of this.sessions) {
            if (sessionId === exports.STDIO_SESSION_ID)
                continue;
            if (now - session.lastActivityAt > this.sessionTimeoutMs) {
                stale.push(sessionId);
            }
        }
        if (stale.length === 0)
            return;
        (0, logger_1.logInfo)('Cleaning up stale sessions', {
            staleCount: stale.length,
            activeSessions: this.sessions.size,
        });
        for (const sessionId of stale) {
            this.removeSession(sessionId).catch((error) => {
                (0, logger_1.logError)('Error during stale session cleanup', { err: error, sessionId });
            });
        }
    }
    async shutdown() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        const sessionIds = [...this.sessions.keys()];
        await Promise.allSettled(sessionIds.map((id) => this.removeSession(id)));
        (0, logger_1.logInfo)('Session manager shut down');
    }
}
exports.SessionManager = SessionManager;
let sessionManagerInstance = null;
function getSessionManager() {
    sessionManagerInstance ??= new SessionManager();
    return sessionManagerInstance;
}
function resetSessionManager() {
    sessionManagerInstance = null;
}
//# sourceMappingURL=session-manager.js.map