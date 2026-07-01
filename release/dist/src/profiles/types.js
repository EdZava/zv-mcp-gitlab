"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectProfileSchema = exports.ProjectPresetSchema = exports.ProfilesConfigSchema = exports.PresetSchema = exports.ScopeConfigSchema = exports.ProfileSchema = void 0;
const zod_1 = require("zod");
const PatAuthSchema = zod_1.z.object({
    type: zod_1.z.literal('pat'),
    token_env: zod_1.z.string().describe('Environment variable containing the PAT token'),
});
const OAuthAuthSchema = zod_1.z.object({
    type: zod_1.z.literal('oauth'),
    client_id_env: zod_1.z.string().describe('Environment variable containing OAuth client ID'),
    client_secret_env: zod_1.z
        .string()
        .optional()
        .describe('Environment variable containing OAuth client secret'),
});
const CookieAuthSchema = zod_1.z.object({
    type: zod_1.z.literal('cookie'),
    cookie_path: zod_1.z.string().describe('Path to cookie file for authentication'),
});
const AuthConfigSchema = zod_1.z.discriminatedUnion('type', [
    PatAuthSchema,
    OAuthAuthSchema,
    CookieAuthSchema,
]);
const FeatureFlagsSchema = zod_1.z
    .object({
    wiki: zod_1.z.boolean().optional(),
    milestones: zod_1.z.boolean().optional(),
    pipelines: zod_1.z.boolean().optional(),
    labels: zod_1.z.boolean().optional(),
    mrs: zod_1.z.boolean().optional(),
    files: zod_1.z.boolean().optional(),
    variables: zod_1.z.boolean().optional(),
    workitems: zod_1.z.boolean().optional(),
    webhooks: zod_1.z.boolean().optional(),
    snippets: zod_1.z.boolean().optional(),
    integrations: zod_1.z.boolean().optional(),
    releases: zod_1.z.boolean().optional(),
    refs: zod_1.z.boolean().optional(),
    members: zod_1.z.boolean().optional(),
    search: zod_1.z.boolean().optional(),
    ci_tokens: zod_1.z.boolean().optional(),
    environments: zod_1.z.boolean().optional(),
    runners: zod_1.z.boolean().optional(),
    registry: zod_1.z.boolean().optional(),
    access_tokens: zod_1.z.boolean().optional(),
    audit_events: zod_1.z.boolean().optional(),
    vulnerabilities: zod_1.z.boolean().optional(),
})
    .optional();
exports.ProfileSchema = zod_1.z.object({
    host: zod_1.z.string().describe('GitLab hostname (e.g., gitlab.company.com)'),
    api_url: zod_1.z.string().url().optional().describe('Override API URL (default: https://{host})'),
    auth: AuthConfigSchema,
    read_only: zod_1.z.boolean().optional().describe('Enable read-only mode'),
    allowed_projects: zod_1.z
        .array(zod_1.z.string())
        .optional()
        .describe('Project whitelist (empty = all allowed)'),
    allowed_groups: zod_1.z.array(zod_1.z.string()).optional().describe('Group whitelist (empty = all allowed)'),
    denied_tools_regex: zod_1.z.string().optional().describe('Regex pattern to exclude tools'),
    allowed_tools: zod_1.z
        .array(zod_1.z.string())
        .optional()
        .describe('Explicit tool whitelist (overrides denied_tools_regex)'),
    denied_actions: zod_1.z.array(zod_1.z.string()).optional().describe("Denied actions in format 'tool:action'"),
    features: FeatureFlagsSchema,
    timeout_ms: zod_1.z
        .number()
        .int()
        .positive()
        .optional()
        .describe('API headers timeout in milliseconds (maps to GITLAB_API_HEADERS_TIMEOUT_MS)'),
    default_project: zod_1.z.string().optional().describe('Auto-set project context'),
    default_namespace: zod_1.z.string().optional().describe('Auto-set namespace context'),
    skip_tls_verify: zod_1.z.boolean().optional().describe('Skip TLS certificate verification'),
    ssl_cert_path: zod_1.z.string().optional().describe('Path to SSL certificate'),
    ssl_key_path: zod_1.z.string().optional().describe('Path to SSL key'),
    ca_cert_path: zod_1.z.string().optional().describe('Path to CA certificate'),
});
exports.ScopeConfigSchema = zod_1.z
    .object({
    project: zod_1.z.string().optional().describe('Single project path (e.g., group/project)'),
    group: zod_1.z.string().optional().describe('Single group path (e.g., my-group or parent/child)'),
    namespace: zod_1.z.string().optional().describe('Namespace/group path'),
    projects: zod_1.z.array(zod_1.z.string()).optional().describe('List of allowed project paths'),
    groups: zod_1.z.array(zod_1.z.string()).optional().describe('List of allowed group paths'),
    includeSubgroups: zod_1.z
        .boolean()
        .optional()
        .describe('Include subgroups when group scope is set (default: true)'),
})
    .refine((data) => {
    const hasProject = data.project !== undefined;
    const hasGroup = data.group !== undefined;
    const hasNamespace = data.namespace !== undefined;
    const hasProjects = data.projects !== undefined && data.projects.length > 0;
    const hasGroups = data.groups !== undefined && data.groups.length > 0;
    return hasProject || hasGroup || hasNamespace || hasProjects || hasGroups;
}, {
    message: 'Scope must define at least one of: project, group, namespace, projects, or groups',
})
    .refine((data) => {
    if (data.project && data.projects && data.projects.length > 0) {
        return false;
    }
    return true;
}, { message: "Cannot combine 'project' with 'projects' - use one or the other" })
    .refine((data) => {
    if (data.group && data.groups && data.groups.length > 0) {
        return false;
    }
    return true;
}, { message: "Cannot combine 'group' with 'groups' - use one or the other" });
exports.PresetSchema = zod_1.z
    .object({
    description: zod_1.z.string().optional().describe('Human-readable description of the preset'),
    read_only: zod_1.z.boolean().optional().describe('Enable read-only mode'),
    denied_tools_regex: zod_1.z.string().optional().describe('Regex pattern to exclude tools'),
    allowed_tools: zod_1.z.array(zod_1.z.string()).optional().describe('Explicit tool whitelist'),
    denied_actions: zod_1.z
        .array(zod_1.z.string())
        .optional()
        .describe("Denied actions in format 'tool:action'"),
    scope: exports.ScopeConfigSchema.optional().describe('Runtime scope restrictions for projects/groups'),
    features: FeatureFlagsSchema,
    timeout_ms: zod_1.z
        .number()
        .int()
        .positive()
        .optional()
        .describe('API headers timeout in milliseconds (maps to GITLAB_API_HEADERS_TIMEOUT_MS)'),
})
    .strict();
exports.ProfilesConfigSchema = zod_1.z.object({
    profiles: zod_1.z.record(zod_1.z.string(), exports.ProfileSchema).describe('Named profiles'),
    default_profile: zod_1.z.string().optional().describe('Default profile when none specified'),
});
exports.ProjectPresetSchema = zod_1.z
    .object({
    description: zod_1.z.string().optional().describe('Description of project restrictions'),
    scope: exports.ScopeConfigSchema.optional().describe('Project/namespace scope restrictions'),
    features: FeatureFlagsSchema,
    denied_actions: zod_1.z
        .array(zod_1.z.string())
        .optional()
        .describe("Denied actions in format 'tool:action'"),
    denied_tools: zod_1.z.array(zod_1.z.string()).optional().describe('List of denied tool names'),
    read_only: zod_1.z.boolean().optional().describe('Enable read-only mode'),
})
    .strict();
exports.ProjectProfileSchema = zod_1.z
    .object({
    description: zod_1.z.string().optional().describe('Description of project configuration'),
    extends: zod_1.z.string().optional().describe('Built-in preset name to inherit from'),
    features: FeatureFlagsSchema,
    additional_tools: zod_1.z.array(zod_1.z.string()).optional().describe('Additional tools to enable'),
    denied_tools: zod_1.z.array(zod_1.z.string()).optional().describe('Tools to disable'),
})
    .strict();
//# sourceMappingURL=types.js.map