"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIpAddress = getIpAddress;
exports.truncateId = truncateId;
exports.getRequestContext = getRequestContext;
exports.getMinimalRequestContext = getMinimalRequestContext;
exports.buildRateLimitInfo = buildRateLimitInfo;
const crypto_1 = require("crypto");
function generateRequestId() {
    return (0, crypto_1.randomUUID)().substring(0, 8);
}
function getIpAddress(req) {
    return req.ip ?? req.socket?.remoteAddress ?? 'unknown';
}
const logger_1 = require("../logger");
function truncateId(id) {
    if (!id)
        return undefined;
    return (0, logger_1.truncateId)(id);
}
function getRequestContext(req, res) {
    const mcpSessionId = req.headers['mcp-session-id'];
    const oauthSessionId = res.locals.oauthSessionId;
    return {
        requestId: generateRequestId(),
        ip: getIpAddress(req),
        method: req.method,
        path: req.path,
        userAgent: req.headers['user-agent'],
        hasOAuthSession: !!oauthSessionId,
        hasMcpSessionHeader: !!mcpSessionId,
        oauthSessionId: truncateId(oauthSessionId),
        mcpSessionId: truncateId(mcpSessionId),
    };
}
function getMinimalRequestContext(req) {
    return {
        requestId: generateRequestId(),
        ip: getIpAddress(req),
        method: req.method,
        path: req.path,
        userAgent: req.headers['user-agent'],
    };
}
function buildRateLimitInfo(type, key, used, limit, resetAt) {
    const resetInSec = Math.max(0, Math.ceil((resetAt - Date.now()) / 1000));
    return {
        type,
        key: type === 'session' ? (truncateId(key) ?? key) : key,
        used,
        limit,
        resetInSec,
    };
}
//# sourceMappingURL=request-logger.js.map