"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionStatusSchema = exports.InstancesConfigFileSchema = exports.InstanceDefaultsSchema = exports.GitLabInstanceConfigSchema = exports.InstanceRateLimitConfigSchema = exports.InstanceOAuthConfigSchema = void 0;
exports.parseInstanceUrlString = parseInstanceUrlString;
exports.validateInstancesConfig = validateInstancesConfig;
exports.applyInstanceDefaults = applyInstanceDefaults;
const zod_1 = require("zod");
const GitLabUrlSchema = zod_1.z
    .string()
    .url()
    .transform((url) => {
    const parsed = new URL(url);
    let path = parsed.pathname;
    if (path === '/') {
        path = '';
    }
    else {
        if (path.endsWith('/')) {
            path = path.slice(0, -1);
        }
        for (const apiSuffix of ['/api/v4', '/api/graphql']) {
            if (path.endsWith(apiSuffix)) {
                path = path.slice(0, -apiSuffix.length);
                if (path === '/') {
                    path = '';
                }
                break;
            }
        }
    }
    return `${parsed.origin}${path}`;
})
    .describe('GitLab instance URL (e.g., https://gitlab.com or https://example.com/gitlab)');
exports.InstanceOAuthConfigSchema = zod_1.z
    .object({
    clientId: zod_1.z.string().min(1).describe('OAuth Application ID'),
    clientSecret: zod_1.z.string().optional().describe('OAuth Secret (only for confidential apps)'),
    scopes: zod_1.z
        .string()
        .default('api read_user')
        .describe('OAuth scopes to request (space-separated)'),
})
    .describe('OAuth configuration for this GitLab instance');
exports.InstanceRateLimitConfigSchema = zod_1.z
    .object({
    maxConcurrent: zod_1.z
        .number()
        .int()
        .positive()
        .default(100)
        .describe('Maximum parallel requests to this instance'),
    queueSize: zod_1.z
        .number()
        .int()
        .positive()
        .default(500)
        .describe('Maximum requests to queue when at capacity'),
    queueTimeout: zod_1.z
        .number()
        .int()
        .positive()
        .default(60000)
        .describe('Queue wait timeout in milliseconds'),
})
    .describe('Rate limiting configuration for this instance');
exports.GitLabInstanceConfigSchema = zod_1.z
    .object({
    url: GitLabUrlSchema,
    label: zod_1.z.string().optional().describe('Human-readable name for UI display'),
    oauth: exports.InstanceOAuthConfigSchema.optional(),
    rateLimit: exports.InstanceRateLimitConfigSchema.optional(),
    insecureSkipVerify: zod_1.z
        .boolean()
        .default(false)
        .describe('Skip TLS certificate verification (development only!)'),
})
    .describe('Configuration for a single GitLab instance');
exports.InstanceDefaultsSchema = zod_1.z
    .object({
    rateLimit: exports.InstanceRateLimitConfigSchema.optional(),
    oauth: zod_1.z
        .object({
        scopes: zod_1.z.string().default('api read_user').describe('Default OAuth scopes'),
    })
        .optional(),
})
    .describe('Default configuration applied to all instances');
exports.InstancesConfigFileSchema = zod_1.z
    .object({
    instances: zod_1.z
        .array(exports.GitLabInstanceConfigSchema)
        .min(1)
        .describe('List of GitLab instances to connect to'),
    defaults: exports.InstanceDefaultsSchema.optional(),
})
    .describe('GitLab MCP instances configuration file');
exports.ConnectionStatusSchema = zod_1.z.enum(['healthy', 'degraded', 'offline']);
function parseInstanceUrlString(urlString) {
    const protocolSeparatorIndex = urlString.indexOf('://');
    if (protocolSeparatorIndex === -1) {
        throw new Error(`Invalid GitLab instance URL format: ${urlString}`);
    }
    const protocolEnd = protocolSeparatorIndex + 3;
    const isPortNumber = (str) => {
        if (!/^\d+$/.test(str))
            return false;
        const num = parseInt(str, 10);
        return num >= 1 && num <= 65535;
    };
    let baseUrlString;
    let clientId;
    let clientSecret;
    try {
        baseUrlString = GitLabUrlSchema.parse(urlString);
        clientId = undefined;
        clientSecret = undefined;
    }
    catch {
        baseUrlString = undefined;
    }
    if (!baseUrlString) {
        const lastColonIndex = urlString.lastIndexOf(':');
        if (lastColonIndex > protocolEnd) {
            const lastSegment = urlString.slice(lastColonIndex + 1);
            if (!lastSegment.includes('/') && !isPortNumber(lastSegment)) {
                const secondLastColonIndex = urlString.lastIndexOf(':', lastColonIndex - 1);
                if (secondLastColonIndex > protocolEnd) {
                    const potentialClientId = urlString.slice(secondLastColonIndex + 1, lastColonIndex);
                    if (!potentialClientId.includes('/') && !isPortNumber(potentialClientId)) {
                        const potentialBaseUrl = urlString.slice(0, secondLastColonIndex);
                        try {
                            baseUrlString = GitLabUrlSchema.parse(potentialBaseUrl);
                            clientId = potentialClientId;
                            clientSecret = lastSegment;
                        }
                        catch {
                        }
                    }
                }
            }
        }
    }
    if (!baseUrlString) {
        const singleLastColonIndex = urlString.lastIndexOf(':');
        if (singleLastColonIndex > protocolEnd) {
            const potentialClientId = urlString.slice(singleLastColonIndex + 1);
            if (!potentialClientId.includes('/') && !isPortNumber(potentialClientId)) {
                const potentialBaseUrl = urlString.slice(0, singleLastColonIndex);
                try {
                    baseUrlString = GitLabUrlSchema.parse(potentialBaseUrl);
                    clientId = potentialClientId;
                    clientSecret = undefined;
                }
                catch {
                }
            }
        }
    }
    if (!baseUrlString) {
        throw new Error(`Invalid GitLab instance URL format: ${urlString}`);
    }
    const config = {
        url: baseUrlString,
        insecureSkipVerify: false,
    };
    if (clientId) {
        config.oauth = {
            clientId,
            scopes: 'api read_user',
        };
        if (clientSecret) {
            config.oauth.clientSecret = clientSecret;
        }
    }
    return config;
}
function validateInstancesConfig(config) {
    return exports.InstancesConfigFileSchema.parse(config);
}
function applyInstanceDefaults(instance, defaults) {
    if (!defaults) {
        return instance;
    }
    const result = { ...instance };
    if (defaults.rateLimit && !result.rateLimit) {
        result.rateLimit = { ...defaults.rateLimit };
    }
    if (defaults.oauth?.scopes && result.oauth && !result.oauth.scopes) {
        result.oauth = {
            ...result.oauth,
            scopes: defaults.oauth.scopes,
        };
    }
    return result;
}
//# sourceMappingURL=instances-schema.js.map