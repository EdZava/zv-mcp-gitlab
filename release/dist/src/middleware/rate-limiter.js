"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopCleanup = stopCleanup;
exports.rateLimiterMiddleware = rateLimiterMiddleware;
exports.getRateLimitStats = getRateLimitStats;
const config_1 = require("../config");
const logger_1 = require("../logger");
const request_logger_1 = require("../utils/request-logger");
const rateLimitStore = new Map();
const CLEANUP_INTERVAL_MS = 60000;
let cleanupInterval = null;
function startCleanup() {
    if (cleanupInterval)
        return;
    cleanupInterval = setInterval(() => {
        const now = Date.now();
        let cleaned = 0;
        for (const [key, entry] of rateLimitStore.entries()) {
            if (entry.resetAt <= now) {
                rateLimitStore.delete(key);
                cleaned++;
            }
        }
        if (cleaned > 0) {
            (0, logger_1.logDebug)('Rate limiter cleanup: removed expired entries', { cleaned });
        }
    }, CLEANUP_INTERVAL_MS);
    cleanupInterval.unref();
}
function stopCleanup() {
    if (cleanupInterval) {
        clearInterval(cleanupInterval);
        cleanupInterval = null;
    }
}
function getIpAddress(req) {
    return req.ip ?? req.socket.remoteAddress ?? 'unknown';
}
function isAuthenticated(req, res) {
    const oauthSessionId = res.locals.oauthSessionId;
    if (oauthSessionId) {
        return true;
    }
    const mcpSessionId = req.headers['mcp-session-id'];
    if (mcpSessionId) {
        return true;
    }
    return false;
}
function checkRateLimit(key, windowMs, maxRequests) {
    const now = Date.now();
    let entry = rateLimitStore.get(key);
    if (!entry || entry.resetAt <= now) {
        entry = {
            count: 0,
            resetAt: now + windowMs,
        };
        rateLimitStore.set(key, entry);
    }
    const allowed = entry.count < maxRequests;
    if (allowed) {
        entry.count++;
    }
    return {
        allowed,
        remaining: Math.max(0, maxRequests - entry.count),
        resetAt: entry.resetAt,
        total: maxRequests,
        used: entry.count,
    };
}
function setRateLimitHeaders(res, info) {
    res.set('X-RateLimit-Limit', info.total.toString());
    res.set('X-RateLimit-Remaining', info.remaining.toString());
    res.set('X-RateLimit-Reset', Math.ceil(info.resetAt / 1000).toString());
}
function rateLimiterMiddleware() {
    startCleanup();
    return (req, res, next) => {
        if (req.path === '/health') {
            next();
            return;
        }
        const authenticated = isAuthenticated(req, res);
        if (authenticated) {
            if (!config_1.RATE_LIMIT_SESSION_ENABLED) {
                next();
                return;
            }
            const sessionId = res.locals.oauthSessionId || req.headers['mcp-session-id'];
            const key = `session:${sessionId}`;
            const info = checkRateLimit(key, config_1.RATE_LIMIT_SESSION_WINDOW_MS, config_1.RATE_LIMIT_SESSION_MAX_REQUESTS);
            setRateLimitHeaders(res, info);
            const usagePercent = (info.used / info.total) * 100;
            if (info.allowed && usagePercent >= 80) {
                const rateLimitInfo = (0, request_logger_1.buildRateLimitInfo)('session', sessionId, info.used, info.total, info.resetAt);
                (0, logger_1.logDebug)('Approaching session rate limit threshold', {
                    event: 'rate_limit_warning',
                    ...(0, request_logger_1.getMinimalRequestContext)(req),
                    rateLimit: rateLimitInfo,
                });
            }
            if (!info.allowed) {
                const retryAfter = Math.ceil((info.resetAt - Date.now()) / 1000);
                const rateLimitInfo = (0, request_logger_1.buildRateLimitInfo)('session', sessionId, info.used, info.total, info.resetAt);
                (0, logger_1.logWarn)('Session rate limit exceeded', {
                    event: 'rate_limit_exceeded',
                    ...(0, request_logger_1.getMinimalRequestContext)(req),
                    rateLimit: rateLimitInfo,
                    hasOAuthSession: !!res.locals.oauthSessionId,
                    hasMcpSessionHeader: !!req.headers['mcp-session-id'],
                });
                res.set('Retry-After', retryAfter.toString());
                res.status(429).json({
                    error: 'Too Many Requests',
                    message: 'Session rate limit exceeded. Please slow down your requests.',
                    retryAfter,
                    limit: info.total,
                    remaining: info.remaining,
                    resetAt: new Date(info.resetAt).toISOString(),
                });
                return;
            }
            next();
            return;
        }
        if (!config_1.RATE_LIMIT_IP_ENABLED) {
            next();
            return;
        }
        const ip = getIpAddress(req);
        const key = `ip:${ip}`;
        const info = checkRateLimit(key, config_1.RATE_LIMIT_IP_WINDOW_MS, config_1.RATE_LIMIT_IP_MAX_REQUESTS);
        setRateLimitHeaders(res, info);
        const usagePercent = (info.used / info.total) * 100;
        if (info.allowed && usagePercent >= 80) {
            const rateLimitInfo = (0, request_logger_1.buildRateLimitInfo)('ip', ip, info.used, info.total, info.resetAt);
            (0, logger_1.logDebug)('Approaching IP rate limit threshold', {
                event: 'rate_limit_warning',
                ...(0, request_logger_1.getMinimalRequestContext)(req),
                rateLimit: rateLimitInfo,
                authClassification: 'anonymous',
                authReason: 'no OAuth session and no MCP-Session-Id header',
            });
        }
        if (!info.allowed) {
            const retryAfter = Math.ceil((info.resetAt - Date.now()) / 1000);
            const rateLimitInfo = (0, request_logger_1.buildRateLimitInfo)('ip', ip, info.used, info.total, info.resetAt);
            const mcpSessionHeader = req.headers['mcp-session-id'];
            (0, logger_1.logWarn)('IP rate limit exceeded', {
                event: 'rate_limit_exceeded',
                ...(0, request_logger_1.getMinimalRequestContext)(req),
                rateLimit: rateLimitInfo,
                authClassification: 'anonymous',
                authReason: 'no OAuth session and no MCP-Session-Id header',
                mcpSessionId: (0, request_logger_1.truncateId)(mcpSessionHeader),
            });
            res.set('Retry-After', retryAfter.toString());
            res.status(429).json({
                error: 'Too Many Requests',
                message: 'Rate limit exceeded. Please authenticate or slow down your requests.',
                retryAfter,
                limit: info.total,
                remaining: info.remaining,
                resetAt: new Date(info.resetAt).toISOString(),
            });
            return;
        }
        next();
    };
}
function getRateLimitStats() {
    const entries = Array.from(rateLimitStore.entries()).map(([key, entry]) => ({
        key,
        count: entry.count,
        resetAt: new Date(entry.resetAt),
    }));
    return {
        totalEntries: rateLimitStore.size,
        entries,
    };
}
//# sourceMappingURL=rate-limiter.js.map