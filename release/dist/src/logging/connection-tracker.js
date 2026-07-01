"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionTracker = void 0;
exports.getConnectionTracker = getConnectionTracker;
exports.resetConnectionTracker = resetConnectionTracker;
const access_log_js_1 = require("./access-log.js");
const logger_js_1 = require("../logger.js");
class ConnectionTracker {
    connections = new Map();
    enabled;
    constructor(enabled = true) {
        this.enabled = enabled;
    }
    isEnabled() {
        return this.enabled;
    }
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    openConnection(sessionId, clientIp) {
        if (!this.enabled)
            return;
        const stats = {
            connectedAt: Date.now(),
            clientIp,
            sessionId,
            requestCount: 0,
            toolCount: 0,
            errorCount: 0,
        };
        this.connections.set(sessionId, stats);
        (0, logger_js_1.logDebug)('Connection opened for tracking', { sessionId, clientIp });
    }
    getStats(sessionId) {
        return this.connections.get(sessionId);
    }
    incrementRequests(sessionId) {
        const stats = this.connections.get(sessionId);
        if (!stats)
            return;
        stats.requestCount++;
    }
    incrementTools(sessionId) {
        const stats = this.connections.get(sessionId);
        if (!stats)
            return;
        stats.toolCount++;
    }
    recordError(sessionId, error) {
        const stats = this.connections.get(sessionId);
        if (!stats)
            return;
        stats.errorCount++;
        stats.lastError = error;
    }
    closeConnection(sessionId, reason) {
        const stats = this.connections.get(sessionId);
        if (!stats) {
            if (this.enabled) {
                (0, logger_js_1.logDebug)('Connection not found on close', { sessionId });
            }
            return undefined;
        }
        this.connections.delete(sessionId);
        if (!this.enabled) {
            return undefined;
        }
        const entry = (0, access_log_js_1.createConnectionCloseEntry)(stats, reason);
        const logLine = (0, access_log_js_1.formatConnectionClose)(entry);
        if (logger_js_1.LOG_JSON) {
            (0, logger_js_1.logInfo)(logLine, { connectionClose: entry });
        }
        else {
            (0, logger_js_1.logInfo)(logLine);
        }
        return logLine;
    }
    hasConnection(sessionId) {
        return this.connections.has(sessionId);
    }
    getActiveConnectionCount() {
        return this.connections.size;
    }
    getAllSessionIds() {
        return Array.from(this.connections.keys());
    }
    closeAllConnections(reason = 'server_shutdown') {
        const sessionIds = this.getAllSessionIds();
        for (const sessionId of sessionIds) {
            this.closeConnection(sessionId, reason);
        }
    }
    clear() {
        this.connections.clear();
    }
}
exports.ConnectionTracker = ConnectionTracker;
let globalConnectionTracker = null;
function getConnectionTracker() {
    globalConnectionTracker ??= new ConnectionTracker();
    return globalConnectionTracker;
}
function resetConnectionTracker() {
    globalConnectionTracker = null;
}
//# sourceMappingURL=connection-tracker.js.map