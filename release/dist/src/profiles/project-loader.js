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
exports.PROJECT_PROFILE_FILE = exports.PROJECT_PRESET_FILE = exports.PROJECT_CONFIG_DIR = void 0;
exports.loadProjectConfig = loadProjectConfig;
exports.findProjectConfig = findProjectConfig;
exports.validateProjectPreset = validateProjectPreset;
exports.validateProjectProfile = validateProjectProfile;
exports.getProjectConfigSummary = getProjectConfigSummary;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const yaml = __importStar(require("yaml"));
const types_1 = require("./types");
const logger_1 = require("../logger");
exports.PROJECT_CONFIG_DIR = '.gitlab-mcp';
exports.PROJECT_PRESET_FILE = 'preset.yaml';
exports.PROJECT_PROFILE_FILE = 'profile.yaml';
async function loadProjectConfig(repoPath) {
    const configDir = path.join(repoPath, exports.PROJECT_CONFIG_DIR);
    try {
        const stat = await fs.stat(configDir);
        if (!stat.isDirectory()) {
            (0, logger_1.logWarn)('Project config path exists but is not a directory', { path: configDir });
            return null;
        }
    }
    catch {
        (0, logger_1.logDebug)('No project config directory found', { path: configDir });
        return null;
    }
    const config = {
        configPath: configDir,
    };
    const presetPath = path.join(configDir, exports.PROJECT_PRESET_FILE);
    try {
        const content = await fs.readFile(presetPath, 'utf8');
        const parsed = yaml.parse(content);
        config.preset = types_1.ProjectPresetSchema.parse(parsed);
        (0, logger_1.logDebug)('Loaded project preset', { path: presetPath });
    }
    catch (error) {
        if (error.code !== 'ENOENT') {
            const message = error instanceof Error ? error.message : String(error);
            (0, logger_1.logError)('Failed to parse project preset', { error: message, path: presetPath });
            throw new Error(`Invalid project preset at ${presetPath}: ${message}`, { cause: error });
        }
    }
    const profilePath = path.join(configDir, exports.PROJECT_PROFILE_FILE);
    try {
        const content = await fs.readFile(profilePath, 'utf8');
        const parsed = yaml.parse(content);
        config.profile = types_1.ProjectProfileSchema.parse(parsed);
        (0, logger_1.logDebug)('Loaded project profile', { path: profilePath });
    }
    catch (error) {
        if (error.code !== 'ENOENT') {
            const message = error instanceof Error ? error.message : String(error);
            (0, logger_1.logError)('Failed to parse project profile', { error: message, path: profilePath });
            throw new Error(`Invalid project profile at ${profilePath}: ${message}`, { cause: error });
        }
    }
    if (!config.preset && !config.profile) {
        (0, logger_1.logDebug)('Project config directory exists but contains no config files', { path: configDir });
        return null;
    }
    (0, logger_1.logInfo)('Loaded project configuration', {
        path: configDir,
        hasPreset: !!config.preset,
        hasProfile: !!config.profile,
    });
    return config;
}
async function findProjectConfig(startPath) {
    let currentPath = path.resolve(startPath);
    const root = path.parse(currentPath).root;
    while (currentPath !== root) {
        const configDir = path.join(currentPath, exports.PROJECT_CONFIG_DIR);
        try {
            await fs.access(configDir);
            return loadProjectConfig(currentPath);
        }
        catch {
        }
        const gitDir = path.join(currentPath, '.git');
        try {
            await fs.access(gitDir);
            (0, logger_1.logDebug)('Found .git without .gitlab-mcp, stopping search', { path: currentPath });
            return null;
        }
        catch {
        }
        currentPath = path.dirname(currentPath);
    }
    return null;
}
function validateProjectPreset(preset) {
    const errors = [];
    const warnings = [];
    if (preset.scope) {
        const { project, namespace, projects } = preset.scope;
        if (namespace && !project && !projects?.length) {
            warnings.push(`Scope restricts to namespace '${namespace}' - all projects in this group are allowed`);
        }
    }
    if (preset.denied_actions) {
        for (const action of preset.denied_actions) {
            const colonIndex = action.indexOf(':');
            if (colonIndex === -1) {
                errors.push(`Invalid denied_action format '${action}', expected 'tool:action'`);
            }
        }
    }
    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}
function validateProjectProfile(profile, availablePresets) {
    const errors = [];
    const warnings = [];
    if (profile.extends) {
        if (!availablePresets.includes(profile.extends)) {
            errors.push(`Unknown preset '${profile.extends}' in extends field`);
        }
    }
    if (profile.additional_tools && profile.denied_tools) {
        const overlap = profile.additional_tools.filter((t) => profile.denied_tools?.includes(t));
        if (overlap.length > 0) {
            warnings.push(`Tools appear in both additional_tools and denied_tools: ${overlap.join(', ')}`);
        }
    }
    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}
function getProjectConfigSummary(config) {
    let presetSummary = null;
    let profileSummary = null;
    if (config.preset) {
        const parts = [];
        if (config.preset.description) {
            parts.push(config.preset.description);
        }
        if (config.preset.scope?.project) {
            parts.push(`scope: ${config.preset.scope.project}`);
        }
        else if (config.preset.scope?.namespace) {
            parts.push(`scope: ${config.preset.scope.namespace}/*`);
        }
        else if (config.preset.scope?.projects) {
            parts.push(`scope: ${config.preset.scope.projects.length} projects`);
        }
        if (config.preset.read_only) {
            parts.push('read-only');
        }
        if (config.preset.denied_actions?.length) {
            parts.push(`${config.preset.denied_actions.length} denied actions`);
        }
        presetSummary = parts.join(', ') || 'custom restrictions';
    }
    if (config.profile) {
        const parts = [];
        if (config.profile.description) {
            parts.push(config.profile.description);
        }
        if (config.profile.extends) {
            parts.push(`extends: ${config.profile.extends}`);
        }
        if (config.profile.additional_tools?.length) {
            parts.push(`+${config.profile.additional_tools.length} tools`);
        }
        if (config.profile.denied_tools?.length) {
            parts.push(`-${config.profile.denied_tools.length} tools`);
        }
        profileSummary = parts.join(', ') || 'custom tool selection';
    }
    return { presetSummary, profileSummary };
}
//# sourceMappingURL=project-loader.js.map