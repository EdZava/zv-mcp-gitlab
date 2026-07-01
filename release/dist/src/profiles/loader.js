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
exports.ProfileLoader = void 0;
exports.loadProfile = loadProfile;
exports.loadPreset = loadPreset;
exports.getProfileNameFromEnv = getProfileNameFromEnv;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const yaml = __importStar(require("yaml"));
const types_1 = require("./types");
const logger_1 = require("../logger");
const USER_CONFIG_DIR = path.join(os.homedir(), '.config', 'gitlab-mcp');
const USER_PROFILES_PATH = path.join(USER_CONFIG_DIR, 'profiles.yaml');
function getBuiltinDir() {
    const candidates = [
        path.join(__dirname, 'builtin'),
        path.join(process.cwd(), 'dist', 'src', 'profiles', 'builtin'),
        path.join(process.cwd(), 'src', 'profiles', 'builtin'),
    ];
    for (const dir of candidates) {
        if (fs.existsSync(dir)) {
            return dir;
        }
    }
    return candidates[0];
}
class ProfileLoader {
    userConfigPath;
    builtinDir;
    profileCache = new Map();
    presetCache = new Map();
    configCache = null;
    constructor(userConfigPath = USER_PROFILES_PATH, builtinDir) {
        this.userConfigPath = userConfigPath;
        this.builtinDir = builtinDir ?? getBuiltinDir();
    }
    async loadProfile(name) {
        const cached = this.profileCache.get(name);
        if (cached) {
            return cached;
        }
        const userProfile = await this.loadUserProfile(name);
        if (userProfile) {
            this.profileCache.set(name, userProfile);
            return userProfile;
        }
        throw new Error(`Profile '${name}' not found. Full profiles must be defined in user config. ` +
            `For built-in presets (settings only), use loadPreset('${name}').`);
    }
    async loadPreset(name) {
        const cached = this.presetCache.get(name);
        if (cached) {
            return cached;
        }
        const preset = await this.loadBuiltinPreset(name);
        if (preset) {
            this.presetCache.set(name, preset);
            return preset;
        }
        throw new Error(`Preset '${name}' not found in built-in presets`);
    }
    async loadAny(name) {
        try {
            const profile = await this.loadProfile(name);
            return { type: 'profile', data: profile };
        }
        catch {
        }
        const preset = await this.loadBuiltinPreset(name);
        if (preset) {
            return { type: 'preset', data: preset };
        }
        throw new Error(`'${name}' not found as user profile or built-in preset. ` +
            `Use 'yarn list-tools --profiles' to see available options.`);
    }
    async getDefaultProfileName() {
        const config = await this.loadUserConfig();
        return config?.default_profile;
    }
    async loadUserConfig() {
        if (this.configCache !== null) {
            return this.configCache;
        }
        if (!fs.existsSync(this.userConfigPath)) {
            (0, logger_1.logDebug)('User profiles config not found', { path: this.userConfigPath });
            return null;
        }
        try {
            const content = fs.readFileSync(this.userConfigPath, 'utf8');
            const parsed = yaml.parse(content);
            const validated = types_1.ProfilesConfigSchema.parse(parsed);
            this.configCache = validated;
            (0, logger_1.logDebug)('Loaded user profiles config', {
                path: this.userConfigPath,
                profiles: Object.keys(validated.profiles),
            });
            return validated;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            (0, logger_1.logError)('Failed to parse user profiles', { error: message, path: this.userConfigPath });
            throw new Error(`Invalid profiles config: ${message}`, { cause: error });
        }
    }
    async loadUserProfile(name) {
        const config = await this.loadUserConfig();
        return config?.profiles[name] ?? null;
    }
    async loadBuiltinPreset(name) {
        const presetPath = path.join(this.builtinDir, `${name}.yaml`);
        if (!fs.existsSync(presetPath)) {
            (0, logger_1.logDebug)('Built-in preset not found', { name, path: presetPath });
            return null;
        }
        try {
            const content = fs.readFileSync(presetPath, 'utf8');
            const parsed = yaml.parse(content);
            const validated = types_1.PresetSchema.parse(parsed);
            (0, logger_1.logDebug)('Loaded built-in preset', { name });
            return validated;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            (0, logger_1.logError)('Failed to parse built-in preset', { error: message, name });
            throw new Error(`Invalid built-in preset '${name}': ${message}`, { cause: error });
        }
    }
    async listProfiles() {
        const profiles = [];
        const userConfig = await this.loadUserConfig();
        if (userConfig) {
            for (const [name, profile] of Object.entries(userConfig.profiles)) {
                profiles.push({
                    name,
                    host: profile.host,
                    authType: profile.auth.type,
                    readOnly: profile.read_only ?? false,
                    isBuiltIn: false,
                    isPreset: false,
                });
            }
        }
        if (fs.existsSync(this.builtinDir)) {
            const files = fs.readdirSync(this.builtinDir).filter((f) => f.endsWith('.yaml'));
            for (const file of files) {
                const name = path.basename(file, '.yaml');
                try {
                    const preset = await this.loadBuiltinPreset(name);
                    if (preset) {
                        profiles.push({
                            name,
                            readOnly: preset.read_only ?? false,
                            isBuiltIn: true,
                            isPreset: true,
                            description: preset.description,
                        });
                    }
                }
                catch {
                    (0, logger_1.logWarn)('Skipping invalid built-in preset', { name });
                }
            }
        }
        return profiles.sort((a, b) => {
            if (a.isPreset !== b.isPreset) {
                return a.isPreset ? 1 : -1;
            }
            return a.name.localeCompare(b.name);
        });
    }
    validateDeniedActions(deniedActions, errors, warnings) {
        if (!deniedActions)
            return;
        for (const action of deniedActions) {
            const colonIndex = action.indexOf(':');
            if (colonIndex === -1) {
                errors.push(`Invalid denied_action format '${action}', expected 'tool:action'`);
            }
            else {
                const tool = action.slice(0, colonIndex).trim();
                const act = action.slice(colonIndex + 1).trim();
                if (!tool || !act) {
                    errors.push(`Invalid denied_action format '${action}', expected 'tool:action'`);
                }
                else if (action !== `${tool}:${act}`) {
                    warnings.push(`denied_action '${action}' has extra whitespace, normalized to '${tool}:${act}'`);
                }
            }
        }
    }
    async validateProfile(profile) {
        const errors = [];
        const warnings = [];
        if (profile.auth.type === 'pat' && profile.auth.token_env) {
            if (!process.env[profile.auth.token_env]) {
                warnings.push(`Environment variable '${profile.auth.token_env}' is not set`);
            }
        }
        if (profile.auth.type === 'oauth' && profile.auth.client_id_env) {
            if (!process.env[profile.auth.client_id_env]) {
                warnings.push(`Environment variable '${profile.auth.client_id_env}' is not set`);
            }
        }
        if (profile.auth.type === 'oauth' && profile.auth.client_secret_env) {
            if (!process.env[profile.auth.client_secret_env]) {
                warnings.push(`Environment variable '${profile.auth.client_secret_env}' is not set`);
            }
        }
        if (profile.auth.type === 'cookie' &&
            'cookie_path' in profile.auth &&
            profile.auth.cookie_path) {
            if (!fs.existsSync(profile.auth.cookie_path)) {
                errors.push(`Cookie file not found: ${profile.auth.cookie_path}`);
            }
        }
        if (profile.ssl_cert_path && !fs.existsSync(profile.ssl_cert_path)) {
            errors.push(`SSL certificate not found: ${profile.ssl_cert_path}`);
        }
        if (profile.ssl_key_path && !fs.existsSync(profile.ssl_key_path)) {
            errors.push(`SSL key not found: ${profile.ssl_key_path}`);
        }
        if (profile.ca_cert_path && !fs.existsSync(profile.ca_cert_path)) {
            errors.push(`CA certificate not found: ${profile.ca_cert_path}`);
        }
        if (profile.denied_tools_regex) {
            try {
                new RegExp(profile.denied_tools_regex);
            }
            catch {
                errors.push(`Invalid regex in denied_tools_regex: ${profile.denied_tools_regex}`);
            }
        }
        this.validateDeniedActions(profile.denied_actions, errors, warnings);
        return {
            valid: errors.length === 0,
            errors,
            warnings,
        };
    }
    async validatePreset(preset) {
        const errors = [];
        const warnings = [];
        if (preset.denied_tools_regex) {
            try {
                new RegExp(preset.denied_tools_regex);
            }
            catch {
                errors.push(`Invalid regex in denied_tools_regex: ${preset.denied_tools_regex}`);
            }
        }
        this.validateDeniedActions(preset.denied_actions, errors, warnings);
        return {
            valid: errors.length === 0,
            errors,
            warnings,
        };
    }
    static ensureConfigDir() {
        if (!fs.existsSync(USER_CONFIG_DIR)) {
            fs.mkdirSync(USER_CONFIG_DIR, { recursive: true });
            (0, logger_1.logInfo)('Created config directory', { path: USER_CONFIG_DIR });
        }
    }
    static getUserConfigPath() {
        return USER_PROFILES_PATH;
    }
    clearCache() {
        this.profileCache.clear();
        this.presetCache.clear();
        this.configCache = null;
    }
}
exports.ProfileLoader = ProfileLoader;
async function loadProfile(name) {
    const loader = new ProfileLoader();
    return loader.loadProfile(name);
}
async function loadPreset(name) {
    const loader = new ProfileLoader();
    return loader.loadPreset(name);
}
function getProfileNameFromEnv() {
    return process.env.GITLAB_PROFILE;
}
//# sourceMappingURL=loader.js.map