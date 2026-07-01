"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeWhoami = executeWhoami;
const config_1 = require("../../config");
const logger_1 = require("../../logger");
const index_js_1 = require("../../oauth/index.js");
const token_context_1 = require("../../oauth/token-context");
const ConnectionManager_1 = require("../../services/ConnectionManager");
const TokenScopeDetector_1 = require("../../services/TokenScopeDetector");
const registry_manager_1 = require("../../registry-manager");
const server_1 = require("../../server");
const fetch_1 = require("../../utils/fetch");
const context_manager_1 = require("./context-manager");
function getHost() {
    try {
        const url = new URL(config_1.GITLAB_BASE_URL);
        return url.hostname;
    }
    catch {
        return config_1.GITLAB_BASE_URL;
    }
}
async function fetchCurrentUser() {
    try {
        const response = await (0, fetch_1.enhancedFetch)(`${config_1.GITLAB_BASE_URL}/api/v4/user`, {
            retry: false,
        });
        if (!response.ok) {
            (0, logger_1.logDebug)('Failed to fetch current user', { status: response.status });
            return null;
        }
        const data = (await response.json());
        return {
            id: data.id,
            username: data.username,
            name: data.name,
            email: data.email,
            avatarUrl: data.avatar_url,
            isAdmin: data.is_admin,
            state: data.state,
        };
    }
    catch (error) {
        (0, logger_1.logDebug)('Error fetching current user', {
            error: error instanceof Error ? error.message : String(error),
        });
        return null;
    }
}
function buildTokenInfo() {
    try {
        const connectionManager = ConnectionManager_1.ConnectionManager.getInstance();
        const tokenScopeInfo = connectionManager.getTokenScopeInfo();
        if (!tokenScopeInfo) {
            if ((0, index_js_1.isOAuthEnabled)()) {
                return {
                    type: 'oauth',
                    name: null,
                    scopes: [],
                    expiresAt: null,
                    daysUntilExpiry: null,
                    isValid: true,
                    hasGraphQLAccess: true,
                    hasWriteAccess: true,
                };
            }
            return null;
        }
        return {
            type: tokenScopeInfo.tokenType,
            name: tokenScopeInfo.name,
            scopes: tokenScopeInfo.scopes,
            expiresAt: tokenScopeInfo.expiresAt,
            daysUntilExpiry: tokenScopeInfo.daysUntilExpiry,
            isValid: tokenScopeInfo.active,
            hasGraphQLAccess: tokenScopeInfo.hasGraphQLAccess,
            hasWriteAccess: tokenScopeInfo.hasWriteAccess,
        };
    }
    catch {
        return null;
    }
}
function buildServerInfo() {
    let version = 'unknown';
    let tier = 'unknown';
    const edition = 'unknown';
    try {
        const connectionManager = ConnectionManager_1.ConnectionManager.getInstance();
        const instanceInfo = connectionManager.getInstanceInfo((0, token_context_1.getGitLabApiUrlFromContext)());
        version = instanceInfo.version;
        tier = instanceInfo.tier;
    }
    catch {
    }
    return {
        host: getHost(),
        apiUrl: config_1.GITLAB_BASE_URL,
        version,
        tier,
        edition,
        readOnlyMode: config_1.GITLAB_READ_ONLY_MODE,
        oauthEnabled: (0, index_js_1.isOAuthEnabled)(),
    };
}
function buildCapabilities(tokenInfo) {
    const registryManager = registry_manager_1.RegistryManager.getInstance();
    const filterStats = registryManager.getFilterStats();
    const canBrowse = tokenInfo === null ||
        tokenInfo.scopes.length === 0 ||
        tokenInfo.scopes.some((s) => ['api', 'read_api', 'read_user'].includes(s));
    const canManage = tokenInfo?.hasWriteAccess ?? false;
    const canAccessGraphQL = tokenInfo?.hasGraphQLAccess ?? false;
    return {
        canBrowse,
        canManage,
        canAccessGraphQL,
        availableToolCount: filterStats.available,
        totalToolCount: filterStats.total,
        filteredByScopes: filterStats.filteredByScopes,
        filteredByReadOnly: filterStats.filteredByReadOnly,
        filteredByTier: filterStats.filteredByTier,
        filteredByDeniedRegex: filterStats.filteredByDeniedRegex,
        filteredByActionDenial: filterStats.filteredByActionDenial,
        filteredByAdmin: filterStats.filteredByAdmin,
    };
}
function buildContextInfo() {
    const contextManager = (0, context_manager_1.getContextManager)();
    const context = contextManager.getContext();
    return {
        activePreset: context.presetName ?? null,
        activeProfile: context.profileName ?? null,
        scope: context.scope ?? null,
    };
}
function generateWarnings(tokenInfo, capabilities, isAdmin) {
    const warnings = [];
    if (tokenInfo && tokenInfo.daysUntilExpiry !== null) {
        const days = tokenInfo.daysUntilExpiry;
        if (days < 0) {
            warnings.push(`Token has expired (${Math.abs(days)} days ago)`);
        }
        else if (days === 0) {
            warnings.push('Token expires today!');
        }
        else if (days <= 7) {
            warnings.push(`Token expires in ${days} day(s)`);
        }
    }
    if (tokenInfo && !tokenInfo.isValid) {
        warnings.push('Token is invalid or revoked - authentication may fail');
    }
    if (capabilities.filteredByScopes > 0) {
        const pct = Math.round((capabilities.filteredByScopes / capabilities.totalToolCount) * 100);
        warnings.push(`Limited token scopes: ${capabilities.availableToolCount} of ${capabilities.totalToolCount} tools available (${pct}% filtered)`);
        if (!capabilities.canAccessGraphQL) {
            warnings.push('No GraphQL access - project/MR/issue operations unavailable');
        }
        if (!capabilities.canManage) {
            warnings.push('No write access - all manage_* operations blocked');
        }
    }
    if (capabilities.filteredByReadOnly > 0) {
        warnings.push(`Read-only mode enabled: ${capabilities.filteredByReadOnly} write tools disabled`);
    }
    if (capabilities.filteredByTier > 0) {
        warnings.push(`GitLab tier restrictions: ${capabilities.filteredByTier} tools unavailable for current tier`);
    }
    if (capabilities.filteredByAdmin > 0) {
        warnings.push(isAdmin === false
            ? `Administrator privileges required: ${capabilities.filteredByAdmin} admin-only tools unavailable for this account`
            : `Admin-mode elevation inactive: ${capabilities.filteredByAdmin} admin-only tools unavailable`);
    }
    if (capabilities.filteredByDeniedRegex > 0) {
        warnings.push(`Tool access restrictions: ${capabilities.filteredByDeniedRegex} tools blocked by configuration`);
    }
    return warnings;
}
function generateRecommendations(tokenInfo, capabilities, serverInfo, isAdmin) {
    const recommendations = [];
    if (tokenInfo && tokenInfo.daysUntilExpiry !== null && tokenInfo.daysUntilExpiry < 0) {
        recommendations.push({
            action: 'renew_token',
            message: 'Your token has expired. Create a new token to restore access.',
            url: (0, TokenScopeDetector_1.getTokenCreationUrl)(config_1.GITLAB_BASE_URL, ['api', 'read_user']),
            priority: 'high',
        });
    }
    if (tokenInfo &&
        tokenInfo.daysUntilExpiry !== null &&
        tokenInfo.daysUntilExpiry >= 0 &&
        tokenInfo.daysUntilExpiry <= 7) {
        recommendations.push({
            action: 'renew_token',
            message: `Your token expires in ${tokenInfo.daysUntilExpiry} day(s). Renew soon to avoid service interruption.`,
            url: (0, TokenScopeDetector_1.getTokenCreationUrl)(config_1.GITLAB_BASE_URL, ['api', 'read_user']),
            priority: 'medium',
        });
    }
    const needsNewToken = capabilities.filteredByScopes > 0 && !capabilities.canManage;
    if (needsNewToken) {
        recommendations.push({
            action: 'create_new_token',
            message: "Create a token with 'api' scope for full GitLab functionality",
            url: (0, TokenScopeDetector_1.getTokenCreationUrl)(config_1.GITLAB_BASE_URL, ['api', 'read_user']),
            priority: 'high',
        });
    }
    if (!needsNewToken &&
        !capabilities.canAccessGraphQL &&
        tokenInfo &&
        tokenInfo.scopes.length > 0) {
        recommendations.push({
            action: 'add_scope',
            message: "Add 'api' or 'read_api' scope to enable project, issue, and MR operations",
            url: (0, TokenScopeDetector_1.getTokenCreationUrl)(config_1.GITLAB_BASE_URL, ['api', 'read_user']),
            priority: 'high',
        });
    }
    if (capabilities.filteredByTier > 0 && serverInfo.tier === 'free') {
        recommendations.push({
            action: 'contact_admin',
            message: 'Some features require GitLab Premium or Ultimate. Contact your administrator for tier upgrade.',
            priority: 'low',
        });
    }
    if (capabilities.filteredByAdmin > 0 && isAdmin !== false) {
        recommendations.push({
            action: 'enable_admin_mode',
            message: 'Some tools require an active admin-mode session. If you are an instance admin, enable admin mode to use them.',
            priority: 'medium',
        });
    }
    return recommendations;
}
async function executeWhoami() {
    let scopesRefreshed = false;
    try {
        const connectionManager = ConnectionManager_1.ConnectionManager.getInstance();
        scopesRefreshed = await connectionManager.refreshTokenScopes();
        if (scopesRefreshed) {
            (0, logger_1.logInfo)('Token scopes changed - refreshing tool registry');
            registry_manager_1.RegistryManager.getInstance().refreshCache();
            await (0, server_1.sendToolsListChangedNotification)();
        }
    }
    catch (error) {
        (0, logger_1.logDebug)('Failed to refresh token scopes', {
            error: error instanceof Error ? error.message : String(error),
        });
    }
    const [userInfo, tokenInfo] = await Promise.all([
        fetchCurrentUser(),
        Promise.resolve(buildTokenInfo()),
    ]);
    let effectiveIsAdmin = userInfo?.isAdmin;
    if (userInfo) {
        try {
            const adminInfo = ConnectionManager_1.ConnectionManager.getInstance().getAdminInfo();
            if (adminInfo) {
                effectiveIsAdmin = adminInfo.isAdmin;
                userInfo.isAdmin = adminInfo.isAdmin;
                userInfo.adminModeActive = adminInfo.adminModeActive;
            }
        }
        catch {
        }
    }
    const serverInfo = buildServerInfo();
    const capabilities = buildCapabilities(tokenInfo);
    const contextInfo = buildContextInfo();
    const warnings = generateWarnings(tokenInfo, capabilities, effectiveIsAdmin);
    if (userInfo?.isAdmin && userInfo.adminModeActive === false) {
        warnings.push('Admin role detected but admin mode is not active - admin-only endpoints will return 403. ' +
            'Re-authenticate with admin mode enabled (OAuth tokens cannot elevate).');
    }
    const recommendations = generateRecommendations(tokenInfo, capabilities, serverInfo, effectiveIsAdmin);
    (0, logger_1.logDebug)('Whoami executed', {
        hasUser: userInfo !== null,
        hasToken: tokenInfo !== null,
        availableTools: capabilities.availableToolCount,
        warnings: warnings.length,
        recommendations: recommendations.length,
        scopesRefreshed,
    });
    return {
        user: userInfo,
        token: tokenInfo,
        server: serverInfo,
        capabilities,
        context: contextInfo,
        warnings,
        recommendations,
        scopesRefreshed,
    };
}
//# sourceMappingURL=whoami.js.map