"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initiateDeviceFlow = initiateDeviceFlow;
exports.pollDeviceFlowOnce = pollDeviceFlowOnce;
exports.pollForToken = pollForToken;
exports.refreshGitLabToken = refreshGitLabToken;
exports.getGitLabUser = getGitLabUser;
exports.validateGitLabToken = validateGitLabToken;
exports.exchangeGitLabAuthCode = exchangeGitLabAuthCode;
exports.buildGitLabAuthUrl = buildGitLabAuthUrl;
const config_1 = require("../config");
const logger_1 = require("../logger");
const fetch_1 = require("../utils/fetch");
async function throwOnHttpError(response, operation) {
    if (!response.ok) {
        const rawText = await response.text();
        const details = rawText.trim().slice(0, 500) || response.statusText;
        (0, logger_1.logError)(`Failed to ${operation}`, { status: response.status, error: details });
        throw new Error(`Failed to ${operation}: ${response.status} ${details}`);
    }
}
const OAUTH_FETCH_OPTS = {
    retry: false,
    rateLimit: false,
    rateLimitBaseUrl: config_1.GITLAB_BASE_URL,
    skipAuth: true,
};
async function initiateDeviceFlow(config) {
    const url = `${config_1.GITLAB_BASE_URL}/oauth/authorize_device`;
    (0, logger_1.logDebug)('Initiating GitLab device flow', { url, clientId: config.gitlabClientId });
    const scopes = config.gitlabScopes.replace(/,/g, ' ');
    const response = await (0, fetch_1.enhancedFetch)(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
        },
        body: new URLSearchParams({
            client_id: config.gitlabClientId,
            scope: scopes,
        }),
        ...OAUTH_FETCH_OPTS,
    });
    await throwOnHttpError(response, 'initiate device flow');
    const data = (await response.json());
    (0, logger_1.logInfo)('Device flow initiated', {
        userCode: data.user_code,
        verificationUri: data.verification_uri,
        expiresIn: data.expires_in,
    });
    return data;
}
async function pollDeviceFlowOnce(deviceCode, config) {
    const url = `${config_1.GITLAB_BASE_URL}/oauth/token`;
    const params = {
        client_id: config.gitlabClientId,
        device_code: deviceCode,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
    };
    if (config.gitlabClientSecret) {
        params.client_secret = config.gitlabClientSecret;
    }
    const response = await (0, fetch_1.enhancedFetch)(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
        },
        body: new URLSearchParams(params),
        ...OAUTH_FETCH_OPTS,
    });
    if (response.ok) {
        const data = (await response.json());
        (0, logger_1.logInfo)('Device flow authorization completed successfully');
        return data;
    }
    const error = (await response.json());
    switch (error.error) {
        case 'authorization_pending':
            return null;
        case 'slow_down':
            (0, logger_1.logDebug)('Device flow: slow_down received, should increase poll interval');
            return null;
        case 'expired_token':
            throw new Error('Device code expired. Please start a new authorization.');
        case 'access_denied':
            throw new Error('User denied the authorization request.');
        case 'invalid_grant':
            throw new Error('Invalid device code or grant.');
        default:
            throw new Error(`Device flow error: ${error.error_description ?? error.error}`);
    }
}
async function pollForToken(deviceCode, config, onPending) {
    const startTime = Date.now();
    const timeout = config.deviceTimeout * 1000;
    let interval = config.devicePollInterval * 1000;
    while (Date.now() - startTime < timeout) {
        await sleep(interval);
        try {
            const result = await pollDeviceFlowOnce(deviceCode, config);
            if (result) {
                return result;
            }
            onPending?.();
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('expired') ||
                    error.message.includes('denied') ||
                    error.message.includes('invalid')) {
                    throw error;
                }
            }
            (0, logger_1.logWarn)('Device flow poll error, will retry', { err: error });
        }
    }
    throw new Error(`Device flow timeout after ${config.deviceTimeout} seconds`);
}
async function refreshGitLabToken(refreshToken, config) {
    const url = `${config_1.GITLAB_BASE_URL}/oauth/token`;
    const params = {
        client_id: config.gitlabClientId,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
    };
    if (config.gitlabClientSecret) {
        params.client_secret = config.gitlabClientSecret;
    }
    (0, logger_1.logDebug)('Refreshing GitLab token');
    const response = await (0, fetch_1.enhancedFetch)(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
        },
        body: new URLSearchParams(params),
        ...OAUTH_FETCH_OPTS,
    });
    await throwOnHttpError(response, 'refresh token');
    const data = (await response.json());
    (0, logger_1.logInfo)('GitLab token refreshed successfully');
    return data;
}
async function getGitLabUser(accessToken) {
    const url = `${config_1.GITLAB_BASE_URL}/api/v4/user`;
    const response = await (0, fetch_1.enhancedFetch)(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
        },
        ...OAUTH_FETCH_OPTS,
    });
    await throwOnHttpError(response, 'get GitLab user info');
    const user = (await response.json());
    (0, logger_1.logDebug)('Retrieved GitLab user info', { userId: user.id, username: user.username });
    return {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
    };
}
async function validateGitLabToken(accessToken) {
    try {
        const url = `${config_1.GITLAB_BASE_URL}/api/v4/user`;
        const response = await (0, fetch_1.enhancedFetch)(url, {
            method: 'HEAD',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            ...OAUTH_FETCH_OPTS,
        });
        return response.ok;
    }
    catch {
        return false;
    }
}
async function exchangeGitLabAuthCode(code, redirectUri, config) {
    const url = `${config_1.GITLAB_BASE_URL}/oauth/token`;
    const params = {
        client_id: config.gitlabClientId,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
    };
    if (config.gitlabClientSecret) {
        params.client_secret = config.gitlabClientSecret;
    }
    (0, logger_1.logDebug)('Exchanging GitLab authorization code for tokens', { redirectUri });
    const response = await (0, fetch_1.enhancedFetch)(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
        },
        body: new URLSearchParams(params),
        ...OAUTH_FETCH_OPTS,
    });
    await throwOnHttpError(response, 'exchange authorization code');
    const data = (await response.json());
    (0, logger_1.logInfo)('GitLab authorization code exchanged successfully');
    return data;
}
function buildGitLabAuthUrl(config, redirectUri, state) {
    const scopes = config.gitlabScopes.replace(/,/g, ' ');
    const params = new URLSearchParams({
        client_id: config.gitlabClientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        state: state,
        scope: scopes,
    });
    return `${config_1.GITLAB_BASE_URL}/oauth/authorize?${params.toString()}`;
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
//# sourceMappingURL=gitlab-device-flow.js.map