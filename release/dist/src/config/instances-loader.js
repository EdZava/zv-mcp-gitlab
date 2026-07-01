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
exports.loadInstancesConfig = loadInstancesConfig;
exports.getInstanceByUrl = getInstanceByUrl;
exports.isKnownInstance = isKnownInstance;
exports.generateSampleConfig = generateSampleConfig;
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const logger_js_1 = require("../logger.js");
const instances_schema_js_1 = require("./instances-schema.js");
async function loadYamlFile(filePath) {
    try {
        const yaml = await Promise.resolve().then(() => __importStar(require('yaml')));
        const content = fs.readFileSync(filePath, 'utf-8');
        return yaml.parse(content);
    }
    catch (error) {
        const err = error;
        const code = err.code;
        const message = err.message;
        const isModuleNotFoundCode = code === 'MODULE_NOT_FOUND' || code === 'ERR_MODULE_NOT_FOUND';
        const isYamlNotFoundMessage = typeof message === 'string' &&
            (message.includes("Cannot find package 'yaml'") ||
                message.includes("Cannot find module 'yaml'"));
        if (isModuleNotFoundCode || isYamlNotFoundMessage) {
            throw new Error(`YAML configuration requires 'yaml' package. Install with: yarn add yaml`, {
                cause: error,
            });
        }
        throw error;
    }
}
function loadJsonFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
}
async function loadConfigFile(filePath) {
    const resolvedPath = filePath.startsWith('~')
        ? path.join(os.homedir(), filePath.slice(1))
        : filePath;
    if (!fs.existsSync(resolvedPath)) {
        throw new Error(`Configuration file not found: ${resolvedPath}`);
    }
    const ext = path.extname(resolvedPath).toLowerCase();
    let rawConfig;
    if (ext === '.yaml' || ext === '.yml') {
        rawConfig = await loadYamlFile(resolvedPath);
    }
    else if (ext === '.json') {
        rawConfig = loadJsonFile(resolvedPath);
    }
    else {
        const content = fs.readFileSync(resolvedPath, 'utf-8').trim();
        if (content.startsWith('{')) {
            rawConfig = JSON.parse(content);
        }
        else {
            rawConfig = await loadYamlFile(resolvedPath);
        }
    }
    return (0, instances_schema_js_1.validateInstancesConfig)(rawConfig);
}
function parseInstancesEnvVar(value) {
    const trimmed = value.trim();
    if (trimmed.startsWith('{')) {
        const parsed = JSON.parse(trimmed);
        const config = (0, instances_schema_js_1.validateInstancesConfig)(parsed);
        return config.instances;
    }
    if (trimmed.startsWith('[')) {
        const parsed = JSON.parse(trimmed);
        return parsed.map((url) => (0, instances_schema_js_1.parseInstanceUrlString)(url));
    }
    if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
        const inner = trimmed.slice(1, -1).trim();
        const urls = inner.match(/(?:[^\s"]+|"[^"]*")+/g) ?? [];
        return urls.map((url) => {
            const cleanUrl = url.startsWith('"') && url.endsWith('"') ? url.slice(1, -1) : url;
            return (0, instances_schema_js_1.parseInstanceUrlString)(cleanUrl);
        });
    }
    if (/\s/.test(trimmed)) {
        const urls = trimmed.split(/\s+/).filter((url) => url.length > 0);
        return urls.map((url) => (0, instances_schema_js_1.parseInstanceUrlString)(url));
    }
    return [(0, instances_schema_js_1.parseInstanceUrlString)(trimmed)];
}
async function loadInstancesConfig() {
    const instancesFile = process.env.GITLAB_INSTANCES_FILE;
    const instancesEnv = process.env.GITLAB_INSTANCES;
    const legacyBaseUrl = process.env.GITLAB_API_URL;
    if (instancesFile) {
        try {
            (0, logger_js_1.logDebug)('Loading instances from configuration file', { path: instancesFile });
            const config = await loadConfigFile(instancesFile);
            const instances = config.instances.map((inst) => (0, instances_schema_js_1.applyInstanceDefaults)(inst, config.defaults));
            (0, logger_js_1.logInfo)('Loaded GitLab instances from configuration file', {
                path: instancesFile,
                count: instances.length,
                instances: instances.map((i) => i.label ?? i.url),
            });
            return {
                instances,
                source: 'file',
                sourceDetails: instancesFile,
            };
        }
        catch (error) {
            (0, logger_js_1.logError)('Failed to load instances configuration file', {
                path: instancesFile,
                err: error instanceof Error ? error : new Error(String(error)),
            });
            throw error;
        }
    }
    if (instancesEnv) {
        try {
            (0, logger_js_1.logDebug)('Loading instances from GITLAB_INSTANCES env var');
            const instances = parseInstancesEnvVar(instancesEnv);
            (0, logger_js_1.logInfo)('Loaded GitLab instances from environment variable', {
                count: instances.length,
                instances: instances.map((i) => i.label ?? i.url),
            });
            return {
                instances,
                source: 'env',
                sourceDetails: 'GITLAB_INSTANCES',
            };
        }
        catch (error) {
            (0, logger_js_1.logError)('Failed to parse GITLAB_INSTANCES environment variable', {
                err: error instanceof Error ? error : new Error(String(error)),
            });
            throw error;
        }
    }
    if (legacyBaseUrl) {
        (0, logger_js_1.logDebug)('Using legacy GITLAB_API_URL configuration');
        let normalizedUrl = legacyBaseUrl;
        if (normalizedUrl.endsWith('/')) {
            normalizedUrl = normalizedUrl.slice(0, -1);
        }
        if (normalizedUrl.endsWith('/api/v4')) {
            normalizedUrl = normalizedUrl.slice(0, -7);
        }
        if (normalizedUrl.endsWith('/api/graphql')) {
            normalizedUrl = normalizedUrl.slice(0, -12);
        }
        const instance = {
            url: normalizedUrl,
            label: 'Default Instance',
            insecureSkipVerify: process.env.SKIP_TLS_VERIFY === 'true',
        };
        (0, logger_js_1.logInfo)('Using legacy single-instance configuration', {
            url: normalizedUrl,
        });
        return {
            instances: [instance],
            source: 'legacy',
            sourceDetails: 'GITLAB_API_URL',
        };
    }
    (0, logger_js_1.logWarn)('No GitLab instance configuration found, using gitlab.com as default');
    return {
        instances: [
            {
                url: 'https://gitlab.com',
                label: 'GitLab.com',
                insecureSkipVerify: false,
            },
        ],
        source: 'none',
        sourceDetails: 'default',
    };
}
function getInstanceByUrl(instances, url) {
    let normalizedSearch = url;
    if (normalizedSearch.endsWith('/')) {
        normalizedSearch = normalizedSearch.slice(0, -1);
    }
    if (normalizedSearch.endsWith('/api/v4')) {
        normalizedSearch = normalizedSearch.slice(0, -7);
    }
    if (normalizedSearch.endsWith('/api/graphql')) {
        normalizedSearch = normalizedSearch.slice(0, -12);
    }
    return instances.find((inst) => inst.url === normalizedSearch);
}
function isKnownInstance(instances, url) {
    return getInstanceByUrl(instances, url) !== undefined;
}
function generateSampleConfig(format) {
    const config = {
        instances: [
            {
                url: 'https://gitlab.com',
                label: 'GitLab.com',
                insecureSkipVerify: false,
            },
            {
                url: 'https://git.corp.io',
                label: 'Corporate GitLab',
                oauth: {
                    clientId: 'your_app_id',
                    clientSecret: 'your_secret',
                    scopes: 'api read_user',
                },
                rateLimit: {
                    maxConcurrent: 50,
                    queueSize: 200,
                    queueTimeout: 30000,
                },
                insecureSkipVerify: false,
            },
        ],
        defaults: {
            rateLimit: {
                maxConcurrent: 100,
                queueSize: 500,
                queueTimeout: 60000,
            },
            oauth: {
                scopes: 'api read_user',
            },
        },
    };
    if (format === 'json') {
        return JSON.stringify(config, null, 2);
    }
    return `# GitLab MCP Instances Configuration
# Documentation: https://gitlab-mcp.sw.foundation/advanced/multi-instance

instances:
  # Minimal configuration (OAuth disabled or uses global credentials)
  - url: https://gitlab.com
    label: "GitLab.com"

  # Full configuration with OAuth
  - url: https://git.corp.io
    label: "Corporate GitLab"
    oauth:
      clientId: "your_app_id"
      clientSecret: "your_secret"  # Only for confidential apps
      scopes: "api read_user"      # Optional, default: api read_user
    rateLimit:
      maxConcurrent: 50            # Max parallel requests
      queueSize: 200               # Max queued requests
      queueTimeout: 30000          # Queue wait timeout (ms)

# Global defaults (applied to all instances unless overridden)
defaults:
  rateLimit:
    maxConcurrent: 100
    queueSize: 500
    queueTimeout: 60000
  oauth:
    scopes: "api read_user"
`;
}
//# sourceMappingURL=instances-loader.js.map