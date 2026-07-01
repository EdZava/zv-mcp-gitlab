"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RECONNECT_MAX_DELAY_MS = exports.RECONNECT_BASE_DELAY_MS = exports.INIT_TIMEOUT_MS = exports.HANDLER_TIMEOUT_MS = exports.BODY_TIMEOUT_MS = exports.HEADERS_TIMEOUT_MS = exports.CONNECT_TIMEOUT_MS = exports.HTTP_KEEPALIVE_TIMEOUT_MS = exports.SSE_HEARTBEAT_MS = exports.MAX_SAFE_TIMEOUT_MS = exports.TRUST_PROXY = exports.SSL_PASSPHRASE = exports.SSL_CA_PATH = exports.SSL_KEY_PATH = exports.SSL_CERT_PATH = exports.PORT = exports.HOST = exports.USE_VULNERABILITIES = exports.USE_AUDIT_EVENTS = exports.USE_ACCESS_TOKENS = exports.USE_REGISTRY = exports.USE_RUNNERS = exports.USE_ENVIRONMENTS = exports.USE_CI_TOKENS = exports.USE_ITERATIONS = exports.USE_SEARCH = exports.USE_MEMBERS = exports.USE_REFS = exports.USE_RELEASES = exports.USE_INTEGRATIONS = exports.USE_WEBHOOKS = exports.USE_SNIPPETS = exports.USE_VARIABLES = exports.USE_FILES = exports.USE_MRS = exports.USE_LABELS = exports.USE_WORKITEMS = exports.USE_PIPELINE = exports.USE_MILESTONE = exports.USE_GITLAB_WIKI = exports.GITLAB_SCHEMA_MODE = exports.LOG_FILTER = exports.LOG_FORMAT = exports.GITLAB_DENIED_ACTIONS = exports.GITLAB_DENIED_TOOLS_REGEX = exports.GITLAB_CROSS_REFS = exports.GITLAB_READ_ONLY_MODE = exports.IS_OLD = exports.GITLAB_AUTH_COOKIE_PATH = exports.GITLAB_TOKEN = void 0;
exports.packageVersion = exports.packageName = exports.GITLAB_ALLOWED_PROJECT_IDS = exports.GITLAB_PROJECT_ID = exports.GITLAB_API_URL = exports.GITLAB_BASE_URL = exports.GITLAB_CA_CERT_PATH = exports.NODE_TLS_REJECT_UNAUTHORIZED = exports.HTTPS_PROXY = exports.HTTP_PROXY = exports.DASHBOARD_ENABLED = exports.SKIP_TLS_VERIFY = exports.RATE_LIMIT_SESSION_MAX_REQUESTS = exports.RATE_LIMIT_SESSION_WINDOW_MS = exports.RATE_LIMIT_SESSION_ENABLED = exports.RATE_LIMIT_IP_MAX_REQUESTS = exports.RATE_LIMIT_IP_WINDOW_MS = exports.RATE_LIMIT_IP_ENABLED = exports.RESPONSE_WRITE_TIMEOUT_MS = exports.API_RETRY_MAX_DELAY_MS = exports.API_RETRY_BASE_DELAY_MS = exports.API_RETRY_MAX_ATTEMPTS = exports.API_RETRY_ENABLED = exports.POOL_MAX_CONNECTIONS = exports.GITLAB_INSTANCE_TTL_MS = exports.GITLAB_INSTANCE_CACHE_MAX = exports.FAILURE_THRESHOLD = exports.HEALTH_CHECK_INTERVAL_MS = void 0;
exports.shouldSkipAccessLog = shouldSkipAccessLog;
exports.shouldSkipAccessLogRequest = shouldSkipAccessLogRequest;
exports.detectSchemaMode = detectSchemaMode;
exports.getEffectiveProjectId = getEffectiveProjectId;
exports.getToolDescriptionOverrides = getToolDescriptionOverrides;
exports.getActionDescriptionOverrides = getActionDescriptionOverrides;
exports.getParamDescriptionOverrides = getParamDescriptionOverrides;
exports.isActionDenied = isActionDenied;
exports.getAllowedActions = getAllowedActions;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const zod_1 = require("zod");
const packageJsonPath = path.resolve(process.cwd(), 'package.json');
exports.GITLAB_TOKEN = process.env.GITLAB_TOKEN;
exports.GITLAB_AUTH_COOKIE_PATH = process.env.GITLAB_AUTH_COOKIE_PATH;
exports.IS_OLD = process.env.GITLAB_IS_OLD === 'true';
exports.GITLAB_READ_ONLY_MODE = process.env.GITLAB_READ_ONLY_MODE === 'true';
exports.GITLAB_CROSS_REFS = process.env.GITLAB_CROSS_REFS !== 'false';
exports.GITLAB_DENIED_TOOLS_REGEX = process.env.GITLAB_DENIED_TOOLS_REGEX
    ? new RegExp(process.env.GITLAB_DENIED_TOOLS_REGEX)
    : undefined;
function parseDeniedActions(envValue) {
    const deniedActions = new Map();
    if (!envValue) {
        return deniedActions;
    }
    const pairs = envValue
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    for (const pair of pairs) {
        const colonIndex = pair.indexOf(':');
        if (colonIndex === -1) {
            continue;
        }
        const toolName = pair.substring(0, colonIndex).toLowerCase();
        const actionName = pair.substring(colonIndex + 1).toLowerCase();
        if (!toolName || !actionName) {
            continue;
        }
        let actionSet = deniedActions.get(toolName);
        if (!actionSet) {
            actionSet = new Set();
            deniedActions.set(toolName, actionSet);
        }
        actionSet.add(actionName);
    }
    return deniedActions;
}
exports.GITLAB_DENIED_ACTIONS = parseDeniedActions(process.env.GITLAB_DENIED_ACTIONS);
function parseLogFormat(value) {
    const format = value?.toLowerCase();
    if (format === 'verbose') {
        return 'verbose';
    }
    return 'condensed';
}
exports.LOG_FORMAT = parseLogFormat(process.env.LOG_FORMAT);
const LogFilterRuleSchema = zod_1.z
    .object({
    method: zod_1.z
        .string()
        .optional()
        .describe('HTTP method to match (exact, case-insensitive). If omitted, matches any method.'),
    path: zod_1.z
        .string()
        .optional()
        .describe("Request path to match. Exact match, or prefix match if ends with '*'. If omitted, matches any path."),
    userAgent: zod_1.z
        .string()
        .optional()
        .describe('Substring to match in User-Agent header (case-insensitive). If omitted, matches any User-Agent.'),
})
    .describe('Filter rule for skipping access log entries. All specified conditions must match.');
const LogFilterSchema = zod_1.z.array(LogFilterRuleSchema).describe('Array of log filter rules');
function parseLogFilter(envValue) {
    if (!envValue || envValue.trim() === '') {
        return [];
    }
    try {
        const parsed = JSON.parse(envValue);
        const validated = LogFilterSchema.parse(parsed);
        return validated.map((rule) => {
            const result = {};
            if (rule.method) {
                result.method = rule.method.toLowerCase();
            }
            if (rule.path) {
                if (rule.path.endsWith('*')) {
                    result.path = rule.path.slice(0, -1);
                    result.pathIsPrefix = true;
                }
                else {
                    result.path = rule.path;
                    result.pathIsPrefix = false;
                }
            }
            if (rule.userAgent) {
                result.userAgent = rule.userAgent.toLowerCase();
            }
            return result;
        });
    }
    catch (error) {
        console.warn(`[gitlab-mcp] Invalid LOG_FILTER format, logging all requests. Error: ${error instanceof Error ? error.message : String(error)}`);
        return [];
    }
}
const DEFAULT_LOG_FILTER = [
    { method: 'get', path: '/', pathIsPrefix: false, userAgent: 'claude-code' },
];
exports.LOG_FILTER = process.env.LOG_FILTER?.trim()
    ? parseLogFilter(process.env.LOG_FILTER)
    : DEFAULT_LOG_FILTER;
function shouldSkipAccessLog(method, path, userAgent) {
    if (exports.LOG_FILTER.length === 0) {
        return false;
    }
    const methodLower = method.toLowerCase();
    const userAgentLower = userAgent?.toLowerCase() ?? '';
    return exports.LOG_FILTER.some((rule) => {
        if (rule.method && rule.method !== methodLower) {
            return false;
        }
        if (rule.path !== undefined) {
            if (rule.pathIsPrefix) {
                if (!path.startsWith(rule.path)) {
                    return false;
                }
            }
            else {
                if (path !== rule.path) {
                    return false;
                }
            }
        }
        if (rule.userAgent && !userAgentLower.includes(rule.userAgent)) {
            return false;
        }
        return true;
    });
}
function shouldSkipAccessLogRequest(req) {
    return shouldSkipAccessLog(req.method, req.path, req.headers['user-agent']);
}
function parseSchemaMode(value) {
    const mode = value?.toLowerCase();
    if (mode === 'discriminated') {
        return 'discriminated';
    }
    if (mode === 'auto') {
        return 'auto';
    }
    return 'flat';
}
exports.GITLAB_SCHEMA_MODE = parseSchemaMode(process.env.GITLAB_SCHEMA_MODE);
function detectSchemaMode(clientName) {
    const name = clientName?.toLowerCase() ?? '';
    if (name === 'claude' ||
        name.startsWith('claude-') ||
        name === 'cursor' ||
        name.startsWith('cursor-')) {
        return 'flat';
    }
    if (name === 'inspector' ||
        name.startsWith('inspector-') ||
        name === 'mcp-inspector' ||
        name.startsWith('mcp-inspector-')) {
        return 'discriminated';
    }
    return 'flat';
}
exports.USE_GITLAB_WIKI = process.env.USE_GITLAB_WIKI !== 'false';
exports.USE_MILESTONE = process.env.USE_MILESTONE !== 'false';
exports.USE_PIPELINE = process.env.USE_PIPELINE !== 'false';
exports.USE_WORKITEMS = process.env.USE_WORKITEMS !== 'false';
exports.USE_LABELS = process.env.USE_LABELS !== 'false';
exports.USE_MRS = process.env.USE_MRS !== 'false';
exports.USE_FILES = process.env.USE_FILES !== 'false';
exports.USE_VARIABLES = process.env.USE_VARIABLES !== 'false';
exports.USE_SNIPPETS = process.env.USE_SNIPPETS !== 'false';
exports.USE_WEBHOOKS = process.env.USE_WEBHOOKS !== 'false';
exports.USE_INTEGRATIONS = process.env.USE_INTEGRATIONS !== 'false';
exports.USE_RELEASES = process.env.USE_RELEASES !== 'false';
exports.USE_REFS = process.env.USE_REFS !== 'false';
exports.USE_MEMBERS = process.env.USE_MEMBERS !== 'false';
exports.USE_SEARCH = process.env.USE_SEARCH !== 'false';
exports.USE_ITERATIONS = process.env.USE_ITERATIONS !== 'false';
exports.USE_CI_TOKENS = process.env.USE_CI_TOKENS !== 'false';
exports.USE_ENVIRONMENTS = process.env.USE_ENVIRONMENTS !== 'false';
exports.USE_RUNNERS = process.env.USE_RUNNERS !== 'false';
exports.USE_REGISTRY = process.env.USE_REGISTRY !== 'false';
exports.USE_ACCESS_TOKENS = process.env.USE_ACCESS_TOKENS !== 'false';
exports.USE_AUDIT_EVENTS = process.env.USE_AUDIT_EVENTS !== 'false';
exports.USE_VULNERABILITIES = process.env.USE_VULNERABILITIES !== 'false';
exports.HOST = process.env.HOST ?? '127.0.0.1';
exports.PORT = process.env.PORT ?? 3002;
exports.SSL_CERT_PATH = process.env.SSL_CERT_PATH;
exports.SSL_KEY_PATH = process.env.SSL_KEY_PATH;
exports.SSL_CA_PATH = process.env.SSL_CA_PATH;
exports.SSL_PASSPHRASE = process.env.SSL_PASSPHRASE;
exports.TRUST_PROXY = process.env.TRUST_PROXY;
exports.MAX_SAFE_TIMEOUT_MS = 2_147_483_647;
function parseStrictInt(envValue, fallback, allowZero = false) {
    const raw = envValue?.trim() ?? String(fallback);
    if (!/^\d+$/.test(raw))
        return fallback;
    const parsed = Number(raw);
    if (!Number.isSafeInteger(parsed))
        return fallback;
    const minValue = allowZero ? 0 : 1;
    return parsed >= minValue ? parsed : fallback;
}
function parseTimerMs(envValue, fallback, allowZero = false) {
    const parsed = parseStrictInt(envValue, fallback, allowZero);
    return Math.min(parsed, exports.MAX_SAFE_TIMEOUT_MS);
}
exports.SSE_HEARTBEAT_MS = parseTimerMs(process.env.GITLAB_SSE_HEARTBEAT_MS, 30000);
exports.HTTP_KEEPALIVE_TIMEOUT_MS = parseTimerMs(process.env.GITLAB_HTTP_KEEPALIVE_TIMEOUT_MS, 620000);
exports.CONNECT_TIMEOUT_MS = parseTimerMs(process.env.GITLAB_API_CONNECT_TIMEOUT_MS, 2000);
exports.HEADERS_TIMEOUT_MS = parseTimerMs(process.env.GITLAB_API_HEADERS_TIMEOUT_MS, 10000);
exports.BODY_TIMEOUT_MS = parseTimerMs(process.env.GITLAB_API_BODY_TIMEOUT_MS, 30000);
exports.HANDLER_TIMEOUT_MS = parseTimerMs(process.env.GITLAB_TOOL_TIMEOUT_MS, 120000);
exports.INIT_TIMEOUT_MS = parseTimerMs(process.env.GITLAB_INIT_TIMEOUT_MS, 5000);
exports.RECONNECT_BASE_DELAY_MS = parseTimerMs(process.env.GITLAB_RECONNECT_BASE_DELAY_MS, 5000);
exports.RECONNECT_MAX_DELAY_MS = parseTimerMs(process.env.GITLAB_RECONNECT_MAX_DELAY_MS, 60000);
exports.HEALTH_CHECK_INTERVAL_MS = parseTimerMs(process.env.GITLAB_HEALTH_CHECK_INTERVAL_MS, 60000);
exports.FAILURE_THRESHOLD = parseStrictInt(process.env.GITLAB_FAILURE_THRESHOLD, 3);
exports.GITLAB_INSTANCE_CACHE_MAX = parseStrictInt(process.env.GITLAB_INSTANCE_CACHE_MAX, 100);
exports.GITLAB_INSTANCE_TTL_MS = parseTimerMs(process.env.GITLAB_INSTANCE_TTL_MS, 60 * 60 * 1000);
exports.POOL_MAX_CONNECTIONS = parseStrictInt(process.env.GITLAB_POOL_MAX_CONNECTIONS, 25);
exports.API_RETRY_ENABLED = process.env.GITLAB_API_RETRY_ENABLED !== 'false';
exports.API_RETRY_MAX_ATTEMPTS = parseStrictInt(process.env.GITLAB_API_RETRY_MAX_ATTEMPTS, 3, true);
exports.API_RETRY_BASE_DELAY_MS = parseTimerMs(process.env.GITLAB_API_RETRY_BASE_DELAY_MS, 1000);
exports.API_RETRY_MAX_DELAY_MS = parseTimerMs(process.env.GITLAB_API_RETRY_MAX_DELAY_MS, 4000);
exports.RESPONSE_WRITE_TIMEOUT_MS = parseTimerMs(process.env.GITLAB_RESPONSE_WRITE_TIMEOUT_MS, 10000, true);
exports.RATE_LIMIT_IP_ENABLED = process.env.RATE_LIMIT_IP_ENABLED !== 'false';
exports.RATE_LIMIT_IP_WINDOW_MS = parseTimerMs(process.env.RATE_LIMIT_IP_WINDOW_MS, 60000);
exports.RATE_LIMIT_IP_MAX_REQUESTS = parseStrictInt(process.env.RATE_LIMIT_IP_MAX_REQUESTS, 100);
exports.RATE_LIMIT_SESSION_ENABLED = process.env.RATE_LIMIT_SESSION_ENABLED === 'true';
exports.RATE_LIMIT_SESSION_WINDOW_MS = parseTimerMs(process.env.RATE_LIMIT_SESSION_WINDOW_MS, 60000);
exports.RATE_LIMIT_SESSION_MAX_REQUESTS = parseStrictInt(process.env.RATE_LIMIT_SESSION_MAX_REQUESTS, 300);
exports.SKIP_TLS_VERIFY = process.env.SKIP_TLS_VERIFY === 'true';
exports.DASHBOARD_ENABLED = process.env.DASHBOARD_ENABLED !== 'false';
exports.HTTP_PROXY = process.env.HTTP_PROXY;
exports.HTTPS_PROXY = process.env.HTTPS_PROXY;
exports.NODE_TLS_REJECT_UNAUTHORIZED = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
exports.GITLAB_CA_CERT_PATH = process.env.GITLAB_CA_CERT_PATH;
function normalizeGitLabBaseUrl(url) {
    if (!url) {
        return 'https://gitlab.com';
    }
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    if (url.endsWith('/api/v4')) {
        url = url.slice(0, -7);
    }
    return url;
}
exports.GITLAB_BASE_URL = normalizeGitLabBaseUrl(process.env.GITLAB_API_URL ?? '');
exports.GITLAB_API_URL = `${exports.GITLAB_BASE_URL}/api/v4`;
exports.GITLAB_PROJECT_ID = process.env.GITLAB_PROJECT_ID;
exports.GITLAB_ALLOWED_PROJECT_IDS = process.env.GITLAB_ALLOWED_PROJECT_IDS?.split(',').map((id) => id.trim()) ?? [];
function getEffectiveProjectId(projectId) {
    if (exports.GITLAB_PROJECT_ID) {
        return exports.GITLAB_PROJECT_ID;
    }
    if (exports.GITLAB_ALLOWED_PROJECT_IDS.length > 0) {
        if (!exports.GITLAB_ALLOWED_PROJECT_IDS.includes(projectId)) {
            throw new Error(`Project ID ${projectId} is not allowed. Allowed project IDs: ${exports.GITLAB_ALLOWED_PROJECT_IDS.join(', ')}`);
        }
    }
    return projectId;
}
let packageName = 'gitlab-mcp';
exports.packageName = packageName;
let packageVersion = 'unknown';
exports.packageVersion = packageVersion;
try {
    const packageInfo = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    exports.packageName = packageName = packageInfo.name ?? packageName;
    exports.packageVersion = packageVersion = packageInfo.version ?? packageVersion;
}
catch {
}
function getToolDescriptionOverrides() {
    const overrides = new Map();
    const prefix = 'GITLAB_TOOL_';
    for (const [key, value] of Object.entries(process.env)) {
        if (key.startsWith(prefix) && value) {
            const toolName = key.substring(prefix.length).toLowerCase();
            overrides.set(toolName, value);
        }
    }
    return overrides;
}
function getActionDescriptionOverrides() {
    const overrides = new Map();
    const prefix = 'GITLAB_ACTION_';
    for (const [key, value] of Object.entries(process.env)) {
        if (key.startsWith(prefix) && value) {
            const rest = key.substring(prefix.length).toLowerCase();
            const lastUnderscoreIndex = rest.lastIndexOf('_');
            if (lastUnderscoreIndex === -1) {
                continue;
            }
            const toolName = rest.substring(0, lastUnderscoreIndex);
            const actionName = rest.substring(lastUnderscoreIndex + 1);
            if (!toolName || !actionName) {
                continue;
            }
            overrides.set(`${toolName}:${actionName}`, value);
        }
    }
    return overrides;
}
function getParamDescriptionOverrides() {
    const overrides = new Map();
    const prefix = 'GITLAB_PARAM_';
    for (const [key, value] of Object.entries(process.env)) {
        if (key.startsWith(prefix) && value) {
            const rest = key.substring(prefix.length).toLowerCase();
            const lastUnderscoreIndex = rest.lastIndexOf('_');
            if (lastUnderscoreIndex === -1) {
                continue;
            }
            const toolName = rest.substring(0, lastUnderscoreIndex);
            const paramName = rest.substring(lastUnderscoreIndex + 1);
            if (!toolName || !paramName) {
                continue;
            }
            overrides.set(`${toolName}:${paramName}`, value);
        }
    }
    return overrides;
}
function isActionDenied(toolName, actionName) {
    const deniedActions = exports.GITLAB_DENIED_ACTIONS.get(toolName.toLowerCase());
    if (!deniedActions) {
        return false;
    }
    return deniedActions.has(actionName.toLowerCase());
}
function getAllowedActions(toolName, allActions) {
    const deniedActions = exports.GITLAB_DENIED_ACTIONS.get(toolName.toLowerCase());
    if (!deniedActions || deniedActions.size === 0) {
        return allActions;
    }
    return allActions.filter((action) => !deniedActions.has(action.toLowerCase()));
}
//# sourceMappingURL=config.js.map