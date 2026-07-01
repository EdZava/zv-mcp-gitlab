"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oauthAuthMiddleware = oauthAuthMiddleware;
exports.createOAuthMiddleware = createOAuthMiddleware;
exports.optionalOAuthMiddleware = optionalOAuthMiddleware;
const config_1 = require("../oauth/config");
const session_store_1 = require("../oauth/session-store");
const token_utils_1 = require("../oauth/token-utils");
const gitlab_device_flow_1 = require("../oauth/gitlab-device-flow");
const metadata_1 = require("../oauth/endpoints/metadata");
const logger_1 = require("../logger");
const request_logger_1 = require("../utils/request-logger");
const config_2 = require("../config");
async function oauthAuthMiddleware(req, res, next) {
    const config = (0, config_1.loadOAuthConfig)();
    if (!config) {
        sendUnauthorized(req, res, 'server_error', 'OAuth not configured');
        return;
    }
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        sendUnauthorized(req, res, 'unauthorized', 'Missing Authorization header');
        return;
    }
    if (!authHeader.startsWith('Bearer ')) {
        sendUnauthorized(req, res, 'unauthorized', 'Invalid Authorization header format. Expected: Bearer <token>');
        return;
    }
    const token = authHeader.slice(7);
    if (!token) {
        sendUnauthorized(req, res, 'unauthorized', 'Empty Bearer token');
        return;
    }
    const payload = (0, token_utils_1.verifyMCPToken)(token, config.sessionSecret);
    if (!payload) {
        sendUnauthorized(req, res, 'invalid_token', 'Token is invalid or expired');
        return;
    }
    const sessionId = payload.sid;
    const session = session_store_1.sessionStore.getSession(sessionId);
    if (!session) {
        sendUnauthorized(req, res, 'invalid_token', 'Session not found or expired');
        return;
    }
    if (session.mcpAccessToken !== token) {
        sendUnauthorized(req, res, 'invalid_token', 'Token has been superseded');
        return;
    }
    if ((0, token_utils_1.isTokenExpiringSoon)(session.gitlabTokenExpiry)) {
        try {
            const newTokens = await (0, gitlab_device_flow_1.refreshGitLabToken)(session.gitlabRefreshToken, config);
            session_store_1.sessionStore.updateSession(sessionId, {
                gitlabAccessToken: newTokens.access_token,
                gitlabRefreshToken: newTokens.refresh_token,
                gitlabTokenExpiry: (0, token_utils_1.calculateTokenExpiry)(newTokens.expires_in),
            });
            (0, logger_1.logDebug)('GitLab token refreshed during request', {
                sessionId: (0, logger_1.truncateId)(sessionId),
            });
        }
        catch (error) {
            (0, logger_1.logError)('Failed to refresh GitLab token during request', { err: error });
            sendUnauthorized(req, res, 'invalid_token', 'GitLab token refresh failed. Please re-authenticate.');
            return;
        }
    }
    const updatedSession = session_store_1.sessionStore.getSession(sessionId);
    if (!updatedSession) {
        sendUnauthorized(req, res, 'invalid_token', 'Session lost during token refresh');
        return;
    }
    res.locals.oauthSessionId = updatedSession.id;
    res.locals.gitlabToken = updatedSession.gitlabAccessToken;
    res.locals.gitlabUserId = updatedSession.gitlabUserId;
    res.locals.gitlabUsername = updatedSession.gitlabUsername;
    res.locals.gitlabApiUrl = updatedSession.gitlabApiUrl ?? config_2.GITLAB_BASE_URL;
    res.locals.instanceLabel = updatedSession.instanceLabel;
    (0, logger_1.logDebug)('OAuth session validated, passing to route handler', {
        sessionId: (0, logger_1.truncateId)(updatedSession.id),
        method: req.method,
        path: req.path,
    });
    next();
}
function createOAuthMiddleware() {
    return oauthAuthMiddleware;
}
async function optionalOAuthMiddleware(req, res, next) {
    const config = (0, config_1.loadOAuthConfig)();
    if (!config) {
        next();
        return;
    }
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        next();
        return;
    }
    const token = authHeader.slice(7);
    if (!token) {
        next();
        return;
    }
    const payload = (0, token_utils_1.verifyMCPToken)(token, config.sessionSecret);
    if (!payload) {
        next();
        return;
    }
    const session = session_store_1.sessionStore.getSession(payload.sid);
    if (session?.mcpAccessToken !== token) {
        next();
        return;
    }
    res.locals.oauthSessionId = session.id;
    res.locals.gitlabToken = session.gitlabAccessToken;
    res.locals.gitlabUserId = session.gitlabUserId;
    res.locals.gitlabUsername = session.gitlabUsername;
    res.locals.gitlabApiUrl = session.gitlabApiUrl ?? config_2.GITLAB_BASE_URL;
    res.locals.instanceLabel = session.instanceLabel;
    next();
}
function sendUnauthorized(req, res, error, description) {
    (0, logger_1.logWarn)('Authentication rejected', {
        event: 'auth_rejected',
        ...(0, request_logger_1.getMinimalRequestContext)(req),
        reason: error,
        description,
    });
    const response = {
        error,
        error_description: description,
    };
    const baseUrl = (0, metadata_1.getBaseUrl)(req);
    res.setHeader('WWW-Authenticate', `Bearer realm="gitlab-mcp", resource_metadata="${baseUrl}/.well-known/oauth-protected-resource"`);
    res.status(401).json(response);
}
//# sourceMappingURL=oauth-auth.js.map