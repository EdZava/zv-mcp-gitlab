"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenHandler = tokenHandler;
const config_1 = require("../config");
const session_store_1 = require("../session-store");
const token_utils_1 = require("../token-utils");
const gitlab_device_flow_1 = require("../gitlab-device-flow");
const metadata_1 = require("./metadata");
const logger_1 = require("../../logger");
const request_logger_1 = require("../../utils/request-logger");
async function tokenHandler(req, res) {
    const config = (0, config_1.loadOAuthConfig)();
    if (!config) {
        sendError(req, res, 500, 'server_error', 'OAuth not configured');
        return;
    }
    const { grant_type } = req.body;
    switch (grant_type) {
        case 'authorization_code':
            await handleAuthorizationCode(req, res, config);
            break;
        case 'refresh_token':
            await handleRefreshToken(req, res, config);
            break;
        default:
            sendError(req, res, 400, 'unsupported_grant_type', `Grant type "${grant_type}" is not supported`);
    }
}
async function handleAuthorizationCode(req, res, config) {
    const { code, code_verifier, redirect_uri } = req.body;
    if (!code) {
        sendError(req, res, 400, 'invalid_request', 'Missing authorization code');
        return;
    }
    if (!code_verifier) {
        sendError(req, res, 400, 'invalid_request', 'Missing code_verifier (PKCE required)');
        return;
    }
    const authCode = session_store_1.sessionStore.getAuthCode(code);
    if (!authCode) {
        sendError(req, res, 400, 'invalid_grant', 'Invalid or expired authorization code');
        return;
    }
    if (Date.now() > authCode.expiresAt) {
        session_store_1.sessionStore.deleteAuthCode(code);
        sendError(req, res, 400, 'invalid_grant', 'Authorization code has expired');
        return;
    }
    if (!(0, token_utils_1.verifyCodeChallenge)(code_verifier, authCode.codeChallenge, authCode.codeChallengeMethod)) {
        sendError(req, res, 400, 'invalid_grant', 'Invalid code_verifier');
        return;
    }
    if (authCode.redirectUri && redirect_uri !== authCode.redirectUri) {
        sendError(req, res, 400, 'invalid_grant', 'redirect_uri does not match');
        return;
    }
    const session = session_store_1.sessionStore.getSession(authCode.sessionId);
    if (!session) {
        sendError(req, res, 400, 'invalid_grant', 'Session not found');
        return;
    }
    const baseUrl = (0, metadata_1.getBaseUrl)(req);
    const accessToken = (0, token_utils_1.createJWT)({
        iss: baseUrl,
        sub: session.gitlabUserId.toString(),
        aud: authCode.clientId,
        sid: session.id,
        scope: session.scopes.join(' '),
        gitlab_user: session.gitlabUsername,
    }, config.sessionSecret, config.tokenTtl);
    const refreshToken = (0, token_utils_1.generateRefreshToken)();
    session_store_1.sessionStore.updateSession(session.id, {
        mcpAccessToken: accessToken,
        mcpRefreshToken: refreshToken,
        mcpTokenExpiry: (0, token_utils_1.calculateTokenExpiry)(config.tokenTtl),
    });
    session_store_1.sessionStore.deleteAuthCode(code);
    (0, logger_1.logInfo)('MCP tokens issued via authorization_code grant', {
        sessionId: (0, logger_1.truncateId)(session.id),
        userId: session.gitlabUserId,
    });
    const response = {
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: config.tokenTtl,
        refresh_token: refreshToken,
        scope: session.scopes.join(' '),
    };
    res.json(response);
}
async function handleRefreshToken(req, res, config) {
    const { refresh_token } = req.body;
    if (!refresh_token) {
        sendError(req, res, 400, 'invalid_request', 'Missing refresh_token');
        return;
    }
    const session = session_store_1.sessionStore.getSessionByRefreshToken(refresh_token);
    if (!session) {
        sendError(req, res, 400, 'invalid_grant', 'Invalid refresh token');
        return;
    }
    let updatedSession = session;
    if ((0, token_utils_1.isTokenExpiringSoon)(session.gitlabTokenExpiry)) {
        try {
            const newTokens = await (0, gitlab_device_flow_1.refreshGitLabToken)(session.gitlabRefreshToken, config);
            session_store_1.sessionStore.updateSession(session.id, {
                gitlabAccessToken: newTokens.access_token,
                gitlabRefreshToken: newTokens.refresh_token,
                gitlabTokenExpiry: (0, token_utils_1.calculateTokenExpiry)(newTokens.expires_in),
            });
            const refreshedSession = session_store_1.sessionStore.getSession(session.id);
            if (!refreshedSession) {
                sendError(req, res, 400, 'invalid_grant', 'Session lost during refresh');
                return;
            }
            updatedSession = refreshedSession;
            (0, logger_1.logDebug)('GitLab token refreshed', { sessionId: (0, logger_1.truncateId)(session.id) });
        }
        catch (error) {
            (0, logger_1.logError)('Failed to refresh GitLab token', { err: error });
            sendError(req, res, 400, 'invalid_grant', 'Failed to refresh underlying GitLab token');
            return;
        }
    }
    const baseUrl = (0, metadata_1.getBaseUrl)(req);
    const accessToken = (0, token_utils_1.createJWT)({
        iss: baseUrl,
        sub: updatedSession.gitlabUserId.toString(),
        aud: updatedSession.clientId,
        sid: updatedSession.id,
        scope: updatedSession.scopes.join(' '),
        gitlab_user: updatedSession.gitlabUsername,
    }, config.sessionSecret, config.tokenTtl);
    const newRefreshToken = (0, token_utils_1.generateRefreshToken)();
    session_store_1.sessionStore.updateSession(updatedSession.id, {
        mcpAccessToken: accessToken,
        mcpRefreshToken: newRefreshToken,
        mcpTokenExpiry: (0, token_utils_1.calculateTokenExpiry)(config.tokenTtl),
    });
    (0, logger_1.logInfo)('MCP tokens refreshed via refresh_token grant', {
        sessionId: (0, logger_1.truncateId)(updatedSession.id),
        userId: updatedSession.gitlabUserId,
    });
    const response = {
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: config.tokenTtl,
        refresh_token: newRefreshToken,
        scope: updatedSession.scopes.join(' '),
    };
    res.json(response);
}
function sendError(req, res, status, error, description) {
    (0, logger_1.logWarn)('OAuth token request failed', {
        event: 'oauth_error',
        endpoint: '/token',
        ip: (0, request_logger_1.getIpAddress)(req),
        error,
        description,
    });
    const response = {
        error,
        error_description: description,
    };
    res.status(status).json(response);
}
//# sourceMappingURL=token.js.map