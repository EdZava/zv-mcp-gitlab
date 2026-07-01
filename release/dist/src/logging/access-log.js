"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessLogFormatter = void 0;
exports.truncateSessionId = truncateSessionId;
exports.formatDuration = formatDuration;
exports.formatGitLabStatus = formatGitLabStatus;
exports.formatDetails = formatDetails;
exports.createAccessLogEntry = createAccessLogEntry;
exports.formatAccessLog = formatAccessLog;
exports.createConnectionCloseEntry = createConnectionCloseEntry;
exports.formatConnectionClose = formatConnectionClose;
const logger_js_1 = require("../logger.js");
function truncateSessionId(sessionId) {
    if (!sessionId)
        return '-';
    return (0, logger_js_1.truncateId)(sessionId);
}
function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
        const remainingMinutes = minutes % 60;
        return `${hours}h${remainingMinutes}m`;
    }
    if (minutes > 0) {
        const remainingSeconds = seconds % 60;
        return `${minutes}m${remainingSeconds}s`;
    }
    return `${seconds}s`;
}
function formatGitLabStatus(status) {
    if (status === undefined)
        return '-';
    if (status === 'timeout')
        return 'GL:timeout';
    if (status === 'error')
        return 'GL:error';
    return `GL:${status}`;
}
function escapeLogValue(value) {
    return value
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
}
function needsQuoting(value) {
    return /[\s"\\]/.test(value) || /[\n\r\t]/.test(value);
}
function formatDetails(details) {
    const entries = Object.entries(details);
    if (entries.length === 0)
        return '';
    return entries
        .map(([key, value]) => {
        const strValue = String(value);
        if (needsQuoting(strValue)) {
            return `${key}="${escapeLogValue(strValue)}"`;
        }
        return `${key}=${strValue}`;
    })
        .join(' ');
}
function createAccessLogEntry(stack) {
    const now = Date.now();
    const durationMs = now - stack.startTime;
    return {
        timestamp: new Date(now).toISOString(),
        clientIp: stack.clientIp,
        session: truncateSessionId(stack.sessionId),
        ctx: stack.context ?? '-',
        ro: stack.readOnly ? 'RO' : '-',
        method: stack.method,
        path: stack.path,
        status: stack.status ?? 0,
        durationMs,
        tool: stack.tool ?? '-',
        action: stack.action ?? '-',
        gitlabStatus: formatGitLabStatus(stack.gitlabStatus),
        gitlabDurationMs: stack.gitlabDuration !== undefined ? `${stack.gitlabDuration}ms` : '-',
        details: formatDetails(stack.details),
    };
}
function formatAccessLog(entry) {
    const parts = [
        entry.clientIp,
        entry.session,
        entry.ctx,
        entry.ro,
        entry.method,
        entry.path,
        String(entry.status),
        `${entry.durationMs}ms`,
        '|',
        entry.tool,
        entry.action,
        '|',
        entry.gitlabStatus,
        entry.gitlabDurationMs,
        '|',
        entry.details || '-',
    ];
    return parts.join(' ');
}
function createConnectionCloseEntry(stats, reason) {
    const now = Date.now();
    const durationMs = now - stats.connectedAt;
    return {
        timestamp: new Date(now).toISOString(),
        clientIp: stats.clientIp,
        session: truncateSessionId(stats.sessionId),
        duration: formatDuration(durationMs),
        reason,
        requests: stats.requestCount,
        tools: stats.toolCount,
        errors: stats.errorCount,
        lastError: stats.lastError,
    };
}
function formatConnectionClose(entry) {
    const parts = [
        `[${entry.timestamp}]`,
        'CONN_CLOSE',
        entry.clientIp,
        entry.session,
        entry.duration,
        entry.reason,
        '|',
        `reqs=${entry.requests}`,
        `tools=${entry.tools}`,
        `errs=${entry.errors}`,
    ];
    if (entry.lastError) {
        parts.push(`last_err="${escapeLogValue(entry.lastError)}"`);
    }
    return parts.join(' ');
}
class AccessLogFormatter {
    formatRequest(stack) {
        const entry = createAccessLogEntry(stack);
        return formatAccessLog(entry);
    }
    formatConnectionClose(stats, reason) {
        const entry = createConnectionCloseEntry(stats, reason);
        return formatConnectionClose(entry);
    }
    getAccessLogEntry(stack) {
        return createAccessLogEntry(stack);
    }
    getConnectionCloseEntry(stats, reason) {
        return createConnectionCloseEntry(stats, reason);
    }
}
exports.AccessLogFormatter = AccessLogFormatter;
//# sourceMappingURL=access-log.js.map