"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callbackHandler = callbackHandler;
const config_1 = require("../config");
const session_store_1 = require("../session-store");
const gitlab_device_flow_1 = require("../gitlab-device-flow");
const token_utils_1 = require("../token-utils");
const logger_1 = require("../../logger");
const config_2 = require("../../config");
async function callbackHandler(req, res) {
    const config = (0, config_1.loadOAuthConfig)();
    if (!config) {
        res.status(500).json({
            error: 'server_error',
            error_description: 'OAuth not configured',
        });
        return;
    }
    const { code, state, error, error_description } = req.query;
    if (error) {
        (0, logger_1.logWarn)('GitLab authorization error', { error, error_description });
        if (state) {
            const flow = session_store_1.sessionStore.getAuthCodeFlow(state);
            if (flow) {
                session_store_1.sessionStore.deleteAuthCodeFlow(state);
                const redirectUrl = new URL(flow.clientRedirectUri);
                redirectUrl.searchParams.set('error', error);
                if (error_description) {
                    redirectUrl.searchParams.set('error_description', error_description);
                }
                if (flow.clientState) {
                    redirectUrl.searchParams.set('state', flow.clientState);
                }
                res.redirect(redirectUrl.toString());
                return;
            }
        }
        res.status(400).json({
            error: error,
            error_description: error_description ?? 'GitLab authorization failed',
        });
        return;
    }
    if (!code) {
        res.status(400).json({
            error: 'invalid_request',
            error_description: 'Missing authorization code from GitLab',
        });
        return;
    }
    if (!state) {
        res.status(400).json({
            error: 'invalid_request',
            error_description: 'Missing state parameter',
        });
        return;
    }
    const flow = session_store_1.sessionStore.getAuthCodeFlow(state);
    if (!flow) {
        res.status(400).json({
            error: 'invalid_request',
            error_description: 'Invalid or expired state. Please start authorization again.',
        });
        return;
    }
    if (Date.now() > flow.expiresAt) {
        session_store_1.sessionStore.deleteAuthCodeFlow(state);
        res.status(400).json({
            error: 'invalid_request',
            error_description: 'Authorization flow expired. Please start again.',
        });
        return;
    }
    try {
        const gitlabTokens = await (0, gitlab_device_flow_1.exchangeGitLabAuthCode)(code, flow.callbackUri, config);
        const userInfo = await (0, gitlab_device_flow_1.getGitLabUser)(gitlabTokens.access_token);
        const sessionId = (0, token_utils_1.generateSessionId)();
        const now = Date.now();
        const mcpAuthCode = (0, token_utils_1.generateAuthorizationCode)();
        session_store_1.sessionStore.storeAuthCode({
            code: mcpAuthCode,
            sessionId,
            clientId: flow.clientId,
            codeChallenge: flow.codeChallenge,
            codeChallengeMethod: flow.codeChallengeMethod,
            redirectUri: flow.clientRedirectUri,
            expiresAt: now + 10 * 60 * 1000,
        });
        session_store_1.sessionStore.createSession({
            id: sessionId,
            mcpAccessToken: '',
            mcpRefreshToken: '',
            mcpTokenExpiry: 0,
            gitlabAccessToken: gitlabTokens.access_token,
            gitlabRefreshToken: gitlabTokens.refresh_token,
            gitlabTokenExpiry: (0, token_utils_1.calculateTokenExpiry)(gitlabTokens.expires_in),
            gitlabUserId: userInfo.id,
            gitlabUsername: userInfo.username,
            gitlabApiUrl: flow.selectedInstance ?? config_2.GITLAB_BASE_URL,
            instanceLabel: flow.selectedInstanceLabel,
            clientId: flow.clientId,
            scopes: ['mcp:tools', 'mcp:resources'],
            createdAt: now,
            updatedAt: now,
        });
        session_store_1.sessionStore.deleteAuthCodeFlow(state);
        (0, logger_1.logInfo)('Authorization Code Flow completed successfully', {
            sessionId: (0, logger_1.truncateId)(sessionId),
            userId: userInfo.id,
            username: userInfo.username,
        });
        const redirectUrl = new URL(flow.clientRedirectUri);
        redirectUrl.searchParams.set('code', mcpAuthCode);
        if (flow.clientState) {
            redirectUrl.searchParams.set('state', flow.clientState);
        }
        (0, logger_1.logDebug)('Redirecting to client with authorization code', {
            redirectUri: flow.clientRedirectUri,
        });
        res.redirect(redirectUrl.toString());
    }
    catch (error) {
        (0, logger_1.logError)('Failed to complete authorization code flow', { err: error });
        session_store_1.sessionStore.deleteAuthCodeFlow(state);
        const redirectUrl = new URL(flow.clientRedirectUri);
        redirectUrl.searchParams.set('error', 'server_error');
        redirectUrl.searchParams.set('error_description', error instanceof Error ? error.message : 'Failed to complete authorization');
        if (flow.clientState) {
            redirectUrl.searchParams.set('state', flow.clientState);
        }
        res.redirect(redirectUrl.toString());
    }
}
//# sourceMappingURL=callback.js.map