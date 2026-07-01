"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectTokenScopes = detectTokenScopes;
exports.isToolAvailableForScopes = isToolAvailableForScopes;
exports.getToolsForScopes = getToolsForScopes;
exports.getToolScopeRequirements = getToolScopeRequirements;
exports.getTokenCreationUrl = getTokenCreationUrl;
exports.logTokenScopeInfo = logTokenScopeInfo;
const zod_1 = require("zod");
const logger_1 = require("../logger");
const config_1 = require("../config");
const fetch_1 = require("../utils/fetch");
const url_1 = require("../utils/url");
const GITLAB_SCOPES = [
    'api',
    'read_api',
    'read_user',
    'read_repository',
    'write_repository',
    'read_registry',
    'write_registry',
    'sudo',
    'admin_mode',
    'create_runner',
    'manage_runner',
    'ai_features',
    'k8s_proxy',
];
const GitLabScopeSchema = zod_1.z.enum(GITLAB_SCOPES);
const TokenSelfResponseSchema = zod_1.z.object({
    id: zod_1.z.number(),
    name: zod_1.z.string(),
    scopes: zod_1.z
        .array(zod_1.z.string())
        .transform((arr) => arr.filter((s) => GitLabScopeSchema.safeParse(s).success)),
    expires_at: zod_1.z.string().nullable(),
    active: zod_1.z.boolean(),
    revoked: zod_1.z.boolean(),
});
const TOOL_SCOPE_REQUIREMENTS = {
    browse_projects: ['api', 'read_api'],
    browse_namespaces: ['api', 'read_api'],
    browse_commits: ['api', 'read_api'],
    browse_events: ['api', 'read_api', 'read_user'],
    browse_users: ['api', 'read_api', 'read_user'],
    browse_todos: ['api', 'read_api'],
    manage_project: ['api'],
    manage_namespace: ['api'],
    manage_todos: ['api'],
    browse_labels: ['api', 'read_api'],
    manage_label: ['api'],
    browse_merge_requests: ['api', 'read_api'],
    browse_mr_discussions: ['api', 'read_api'],
    manage_merge_request: ['api'],
    manage_mr_discussion: ['api'],
    manage_draft_notes: ['api'],
    browse_files: ['api', 'read_api', 'read_repository'],
    manage_files: ['api', 'write_repository'],
    browse_milestones: ['api', 'read_api'],
    manage_milestone: ['api'],
    browse_pipelines: ['api', 'read_api'],
    manage_pipeline: ['api'],
    browse_variables: ['api', 'read_api'],
    manage_variable: ['api'],
    browse_job_token_scope: ['api', 'read_api'],
    manage_job_token_scope: ['api'],
    browse_deploy_keys: ['api', 'read_api'],
    manage_deploy_key: ['api'],
    browse_registry: ['api', 'read_api', 'read_registry'],
    manage_registry: ['api', 'write_registry'],
    browse_access_tokens: ['api', 'read_api'],
    manage_access_token: ['api'],
    browse_runners: ['api', 'read_api'],
    manage_runner: ['api', 'create_runner', 'manage_runner'],
    browse_audit_events: ['api', 'read_api'],
    browse_vulnerabilities: ['api', 'read_api'],
    manage_vulnerability: ['api'],
    browse_wiki: ['api', 'read_api'],
    manage_wiki: ['api'],
    browse_work_items: ['api', 'read_api'],
    manage_work_item: ['api'],
    browse_snippets: ['api', 'read_api'],
    manage_snippet: ['api'],
    browse_webhooks: ['api', 'read_api'],
    manage_webhook: ['api'],
    browse_integrations: ['api', 'read_api'],
    manage_integration: ['api'],
    browse_releases: ['api', 'read_api'],
    manage_release: ['api'],
    browse_refs: ['api', 'read_api'],
    manage_ref: ['api'],
    browse_members: ['api', 'read_api'],
    manage_member: ['api'],
    browse_search: ['api', 'read_api'],
    browse_iterations: ['api', 'read_api'],
};
function logTokenSelfIntrospectionError(status, url) {
    if (status === 404) {
        (0, logger_1.logDebug)('Token self-introspection endpoint not available (older GitLab version)', { url });
    }
    else if (status === 401) {
        (0, logger_1.logInfo)('Token is invalid or expired', { url });
    }
    else if (status === 403) {
        (0, logger_1.logDebug)('Token self-introspection not permitted for this token type', { url });
    }
    else {
        (0, logger_1.logDebug)('Unexpected response from token self-introspection', { status, url });
    }
}
function computeDaysUntilExpiry(expiresAt) {
    if (!expiresAt)
        return null;
    const [yearStr, monthStr, dayStr] = expiresAt.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);
    if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day))
        return null;
    if (month < 1 || month > 12 || day < 1 || day > 31)
        return null;
    const expiry = new Date(Date.UTC(year, month - 1, day));
    if (expiry.getUTCFullYear() !== year ||
        expiry.getUTCMonth() !== month - 1 ||
        expiry.getUTCDate() !== day) {
        return null;
    }
    const expiryUtcMs = expiry.getTime();
    const now = new Date();
    const todayUtcMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    return Math.ceil((expiryUtcMs - todayUtcMs) / (1000 * 60 * 60 * 24));
}
async function detectTokenScopes(baseUrl) {
    const url = (0, url_1.normalizeInstanceUrl)(baseUrl ?? config_1.GITLAB_BASE_URL);
    if (!url || !config_1.GITLAB_TOKEN) {
        return null;
    }
    try {
        const response = await (0, fetch_1.enhancedFetch)(`${url}/api/v4/personal_access_tokens/self`, {
            headers: {
                'PRIVATE-TOKEN': config_1.GITLAB_TOKEN,
                Accept: 'application/json',
            },
            retry: false,
        });
        if (!response.ok) {
            logTokenSelfIntrospectionError(response.status, url);
            return null;
        }
        const raw = await response.json();
        const parsed = TokenSelfResponseSchema.safeParse(raw);
        if (!parsed.success) {
            (0, logger_1.logDebug)('Token self-introspection response validation failed', {
                url,
                error: parsed.error.message,
            });
            return null;
        }
        const data = parsed.data;
        const scopes = data.scopes;
        const hasGraphQLAccess = scopes.some((s) => s === 'api' || s === 'read_api');
        const hasWriteAccess = scopes.includes('api');
        return {
            name: data.name,
            scopes,
            expiresAt: data.expires_at,
            active: data.active && !data.revoked,
            tokenType: 'unknown',
            hasGraphQLAccess,
            hasWriteAccess,
            daysUntilExpiry: computeDaysUntilExpiry(data.expires_at),
        };
    }
    catch (error) {
        (0, logger_1.logDebug)('Token scope detection failed (network error)', {
            url,
            error: error instanceof Error ? error.message : String(error),
        });
        return null;
    }
}
function isToolAvailableForScopes(toolName, scopes) {
    const requiredScopes = TOOL_SCOPE_REQUIREMENTS[toolName];
    if (!requiredScopes) {
        return true;
    }
    return requiredScopes.some((required) => scopes.includes(required));
}
function getToolsForScopes(scopes) {
    return Object.keys(TOOL_SCOPE_REQUIREMENTS).filter((toolName) => isToolAvailableForScopes(toolName, scopes));
}
function getToolScopeRequirements() {
    return Object.fromEntries(Object.entries(TOOL_SCOPE_REQUIREMENTS).map(([toolName, scopes]) => [toolName, [...scopes]]));
}
function getTokenCreationUrl(baseUrl, scopes = ['api', 'read_user']) {
    try {
        const url = new URL(baseUrl);
        const basePath = url.pathname === '/' ? '' : url.pathname.replace(/\/$/, '');
        url.pathname = `${basePath}/-/user_settings/personal_access_tokens`;
        url.searchParams.set('name', 'gitlab-mcp');
        url.searchParams.set('scopes', scopes.join(','));
        return url.toString();
    }
    catch {
        const base = baseUrl.replace(/\/$/, '');
        const params = new URLSearchParams({
            name: 'gitlab-mcp',
            scopes: scopes.join(','),
        });
        return `${base}/-/user_settings/personal_access_tokens?${params.toString()}`;
    }
}
function logTokenScopeInfo(info, totalTools, baseUrl = config_1.GITLAB_BASE_URL) {
    const url = (0, url_1.normalizeInstanceUrl)(baseUrl);
    const availableTools = getToolsForScopes(info.scopes);
    const scopeList = info.scopes.join(', ');
    if (info.daysUntilExpiry !== null && info.daysUntilExpiry <= 7) {
        if (info.daysUntilExpiry < 0) {
            (0, logger_1.logWarn)(`Token "${info.name}" has expired! Please create a new token.`, {
                url,
                tokenName: info.name,
                expiresAt: info.expiresAt,
            });
        }
        else if (info.daysUntilExpiry === 0) {
            (0, logger_1.logWarn)(`Token "${info.name}" expires today!`, {
                url,
                tokenName: info.name,
                expiresAt: info.expiresAt,
            });
        }
        else {
            (0, logger_1.logWarn)(`Token "${info.name}" expires in ${info.daysUntilExpiry} day(s)`, {
                url,
                tokenName: info.name,
                daysUntilExpiry: info.daysUntilExpiry,
                expiresAt: info.expiresAt,
            });
        }
    }
    if (info.hasWriteAccess) {
        (0, logger_1.logInfo)(`Token "${info.name}" detected`, {
            url,
            tokenName: info.name,
            scopes: scopeList,
            expiresAt: info.expiresAt ?? 'never',
        });
    }
    else {
        (0, logger_1.logInfo)(`Token "${info.name}" has limited scopes - ${availableTools.length} of ${totalTools} scope-gated tools available`, {
            url,
            tokenName: info.name,
            scopes: scopeList,
            availableTools: availableTools.length,
            totalTools,
        });
        if (!info.hasGraphQLAccess) {
            (0, logger_1.logInfo)("GraphQL introspection skipped (requires 'api' or 'read_api' scope)", { url });
        }
        const fixUrl = getTokenCreationUrl(url);
        (0, logger_1.logInfo)(`For full functionality, create a token with 'api' scope: ${fixUrl}`, {
            url,
            fixUrl,
        });
    }
}
//# sourceMappingURL=TokenScopeDetector.js.map