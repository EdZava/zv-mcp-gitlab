"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationError = void 0;
exports.loadOAuthConfig = loadOAuthConfig;
exports.validateStaticConfig = validateStaticConfig;
exports.isOAuthEnabled = isOAuthEnabled;
exports.resetOAuthConfigCache = resetOAuthConfigCache;
exports.getAuthModeDescription = getAuthModeDescription;
exports.isStaticTokenConfigured = isStaticTokenConfigured;
exports.isAuthenticationConfigured = isAuthenticationConfigured;
const zod_1 = require("zod");
const logger_1 = require("../logger");
const OAuthConfigSchema = zod_1.z.object({
    enabled: zod_1.z.literal(true),
    sessionSecret: zod_1.z.string().min(32, 'OAUTH_SESSION_SECRET must be at least 32 characters'),
    gitlabClientId: zod_1.z.string().min(1, 'OAUTH_CLIENT_ID is required'),
    gitlabClientSecret: zod_1.z.string().optional(),
    gitlabScopes: zod_1.z.string().default('api,read_user'),
    tokenTtl: zod_1.z.number().positive().default(3600),
    refreshTokenTtl: zod_1.z.number().positive().default(604800),
    devicePollInterval: zod_1.z.number().positive().default(5),
    deviceTimeout: zod_1.z.number().positive().default(300),
});
let cachedOAuthConfig = undefined;
function loadOAuthConfig() {
    if (cachedOAuthConfig !== undefined) {
        return cachedOAuthConfig;
    }
    if (process.env.OAUTH_ENABLED !== 'true') {
        cachedOAuthConfig = null;
        (0, logger_1.logDebug)("OAuth mode disabled (OAUTH_ENABLED !== 'true')");
        return null;
    }
    const result = OAuthConfigSchema.safeParse({
        enabled: true,
        sessionSecret: process.env.OAUTH_SESSION_SECRET,
        gitlabClientId: process.env.OAUTH_CLIENT_ID,
        gitlabClientSecret: process.env.OAUTH_CLIENT_SECRET,
        gitlabScopes: process.env.OAUTH_SCOPES ?? 'api,read_user',
        tokenTtl: parseInt(process.env.OAUTH_TOKEN_TTL ?? '3600', 10),
        refreshTokenTtl: parseInt(process.env.OAUTH_REFRESH_TOKEN_TTL ?? '604800', 10),
        devicePollInterval: parseInt(process.env.OAUTH_DEVICE_POLL_INTERVAL ?? '5', 10),
        deviceTimeout: parseInt(process.env.OAUTH_DEVICE_TIMEOUT ?? '300', 10),
    });
    if (!result.success) {
        const errorMessages = result.error.issues
            .map((e) => `${e.path.join('.')}: ${e.message}`)
            .join(', ');
        throw new Error(`Invalid OAuth configuration: ${errorMessages}`);
    }
    cachedOAuthConfig = result.data;
    (0, logger_1.logInfo)('OAuth mode enabled with valid configuration');
    return result.data;
}
class ConfigurationError extends Error {
    guidance;
    constructor(guidance) {
        super('Missing required configuration');
        this.name = 'ConfigurationError';
        this.guidance = guidance;
    }
}
exports.ConfigurationError = ConfigurationError;
const MISSING_TOKEN_GUIDANCE = `
┌──────────────────────────────────────────────────────────────────────┐
│  GitLab MCP — no authentication configured                           │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Quick setup (interactive):                                          │
│    npx @structured-world/gitlab-mcp setup                            │
│                                                                      │
│  Manual setup:                                                       │
│    export GITLAB_TOKEN="glpat-xxxxxxxxxxxxxxxxxxxx"                   │
│    Required scopes: api,read_user (or read_api,read_user read-only)  │
│                                                                      │
│  For self-hosted GitLab, also set:                                    │
│    export GITLAB_API_URL="https://your-gitlab.example.com"            │
│                                                                      │
│  Docs: https://gitlab-mcp.sw.foundation/guide/quick-start            │
└──────────────────────────────────────────────────────────────────────┘
`;
function validateStaticConfig() {
    if (!process.env.GITLAB_TOKEN) {
        throw new ConfigurationError(MISSING_TOKEN_GUIDANCE);
    }
    (0, logger_1.logDebug)('Static token mode: GITLAB_TOKEN configured');
}
function isOAuthEnabled() {
    return loadOAuthConfig() !== null;
}
function resetOAuthConfigCache() {
    cachedOAuthConfig = undefined;
}
function getAuthModeDescription() {
    if (isOAuthEnabled()) {
        return 'OAuth mode (per-user authentication via GitLab Device Flow)';
    }
    if (process.env.GITLAB_TOKEN) {
        return 'Static token mode (shared GITLAB_TOKEN)';
    }
    return 'Unauthenticated mode (tools/list only, tool calls require GITLAB_TOKEN)';
}
function isStaticTokenConfigured() {
    return !!process.env.GITLAB_TOKEN;
}
function isAuthenticationConfigured() {
    return isOAuthEnabled() || isStaticTokenConfigured();
}
//# sourceMappingURL=config.js.map