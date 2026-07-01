"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConnection = testConnection;
exports.validateGitLabUrl = validateGitLabUrl;
exports.isGitLabSaas = isGitLabSaas;
exports.getPatCreationUrl = getPatCreationUrl;
const fetch_1 = require("../../utils/fetch");
async function testConnection(instanceUrl, token) {
    const baseUrl = instanceUrl.replace(/\/$/, '').replace(/\/api\/v4\/?$/, '');
    const apiUrl = `${baseUrl}/api/v4`;
    try {
        const userResponse = await (0, fetch_1.enhancedFetch)(`${apiUrl}/user`, {
            headers: {
                'PRIVATE-TOKEN': token,
                Accept: 'application/json',
            },
            retry: false,
            skipAuth: true,
            rateLimit: false,
        });
        if (!userResponse.ok) {
            if (userResponse.status === 401) {
                return {
                    success: false,
                    error: 'Invalid token - authentication failed',
                };
            }
            if (userResponse.status === 403) {
                return {
                    success: false,
                    error: 'Token lacks required permissions',
                };
            }
            return {
                success: false,
                error: `GitLab API error: ${userResponse.status} ${userResponse.statusText}`,
            };
        }
        const userData = (await userResponse.json());
        let gitlabVersion;
        try {
            const versionResponse = await (0, fetch_1.enhancedFetch)(`${apiUrl}/version`, {
                headers: {
                    'PRIVATE-TOKEN': token,
                    Accept: 'application/json',
                },
                retry: false,
                skipAuth: true,
                rateLimit: false,
            });
            if (versionResponse.ok) {
                const versionData = (await versionResponse.json());
                gitlabVersion = versionData.version;
            }
        }
        catch {
        }
        return {
            success: true,
            username: userData.username,
            email: userData.email,
            isAdmin: userData.is_admin,
            gitlabVersion,
        };
    }
    catch (error) {
        if (error instanceof fetch_1.GitLabTimeoutError) {
            return {
                success: false,
                error: `Connection timeout - ${instanceUrl} did not respond`,
            };
        }
        if (error instanceof TypeError && error.message.includes('fetch')) {
            return {
                success: false,
                error: `Cannot connect to ${instanceUrl} - check URL and network`,
            };
        }
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}
function validateGitLabUrl(url) {
    if (!url) {
        return { valid: false, error: 'URL is required' };
    }
    if (!url.startsWith('https://') && !url.startsWith('http://')) {
        return { valid: false, error: 'URL must start with https:// or http://' };
    }
    try {
        const parsed = new URL(url);
        if (!parsed.hostname) {
            return { valid: false, error: 'Invalid URL hostname' };
        }
        return { valid: true };
    }
    catch {
        return { valid: false, error: 'Invalid URL format' };
    }
}
function isGitLabSaas(url) {
    try {
        const parsed = new URL(url);
        const hostname = parsed.hostname.toLowerCase();
        return hostname === 'gitlab.com' || hostname.endsWith('.gitlab.com');
    }
    catch {
        return false;
    }
}
function getPatCreationUrl(instanceUrl, readOnly = false) {
    const baseUrl = instanceUrl.replace(/\/$/, '');
    const scopes = readOnly ? 'read_api,read_user' : 'api,read_user';
    return `${baseUrl}/-/user_settings/personal_access_tokens?name=gitlab-mcp&scopes=${scopes}`;
}
//# sourceMappingURL=connection.js.map