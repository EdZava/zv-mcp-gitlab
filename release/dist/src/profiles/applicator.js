"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyProfile = applyProfile;
exports.applyPreset = applyPreset;
exports.loadAndApplyProfile = loadAndApplyProfile;
exports.loadAndApplyPreset = loadAndApplyPreset;
exports.tryApplyProfileFromEnv = tryApplyProfileFromEnv;
const loader_1 = require("./loader");
const logger_1 = require("../logger");
const FEATURE_ENV_MAP = {
    wiki: 'USE_GITLAB_WIKI',
    milestones: 'USE_MILESTONE',
    pipelines: 'USE_PIPELINE',
    labels: 'USE_LABELS',
    mrs: 'USE_MRS',
    files: 'USE_FILES',
    variables: 'USE_VARIABLES',
    workitems: 'USE_WORKITEMS',
    webhooks: 'USE_WEBHOOKS',
    snippets: 'USE_SNIPPETS',
    integrations: 'USE_INTEGRATIONS',
    releases: 'USE_RELEASES',
    refs: 'USE_REFS',
    members: 'USE_MEMBERS',
    search: 'USE_SEARCH',
    ci_tokens: 'USE_CI_TOKENS',
    environments: 'USE_ENVIRONMENTS',
    runners: 'USE_RUNNERS',
    registry: 'USE_REGISTRY',
    access_tokens: 'USE_ACCESS_TOKENS',
    audit_events: 'USE_AUDIT_EVENTS',
    vulnerabilities: 'USE_VULNERABILITIES',
};
async function applyProfile(profile, profileName) {
    const appliedSettings = [];
    const loader = new loader_1.ProfileLoader();
    const validation = await loader.validateProfile(profile);
    for (const warning of validation.warnings) {
        (0, logger_1.logWarn)(warning, { profile: profileName });
    }
    if (!validation.valid) {
        (0, logger_1.logError)('Profile validation failed', { profile: profileName, errors: validation.errors });
        return {
            success: false,
            profileName,
            host: profile.host,
            appliedSettings,
            validation,
        };
    }
    const apiUrl = profile.api_url ?? `https://${profile.host}`;
    process.env.GITLAB_API_URL = apiUrl;
    appliedSettings.push(`GITLAB_API_URL=${apiUrl}`);
    switch (profile.auth.type) {
        case 'pat':
            if (profile.auth.token_env) {
                const token = process.env[profile.auth.token_env];
                if (token) {
                    process.env.GITLAB_TOKEN = token;
                    appliedSettings.push(`GITLAB_TOKEN=<from ${profile.auth.token_env}>`);
                }
            }
            break;
        case 'oauth':
            if (profile.auth.client_id_env) {
                const clientId = process.env[profile.auth.client_id_env];
                if (clientId) {
                    process.env.OAUTH_CLIENT_ID = clientId;
                    appliedSettings.push(`OAUTH_CLIENT_ID=<from ${profile.auth.client_id_env}>`);
                }
            }
            if (profile.auth.client_secret_env) {
                const clientSecret = process.env[profile.auth.client_secret_env];
                if (clientSecret) {
                    process.env.OAUTH_CLIENT_SECRET = clientSecret;
                    appliedSettings.push(`OAUTH_CLIENT_SECRET=<from ${profile.auth.client_secret_env}>`);
                }
            }
            process.env.OAUTH_ENABLED = 'true';
            appliedSettings.push('OAUTH_ENABLED=true');
            break;
        case 'cookie':
            if (profile.auth.cookie_path) {
                process.env.GITLAB_AUTH_COOKIE_PATH = profile.auth.cookie_path;
                appliedSettings.push(`GITLAB_AUTH_COOKIE_PATH=${profile.auth.cookie_path}`);
            }
            break;
    }
    if (profile.read_only) {
        process.env.GITLAB_READ_ONLY_MODE = 'true';
        appliedSettings.push('GITLAB_READ_ONLY_MODE=true');
    }
    if (profile.allowed_projects && profile.allowed_projects.length > 0) {
        process.env.GITLAB_ALLOWED_PROJECT_IDS = profile.allowed_projects.join(',');
        appliedSettings.push(`GITLAB_ALLOWED_PROJECT_IDS=${profile.allowed_projects.join(',')}`);
    }
    if (profile.allowed_groups && profile.allowed_groups.length > 0) {
        process.env.GITLAB_ALLOWED_GROUP_IDS = profile.allowed_groups.join(',');
        appliedSettings.push(`GITLAB_ALLOWED_GROUP_IDS=${profile.allowed_groups.join(',')}`);
    }
    if (profile.allowed_tools && profile.allowed_tools.length > 0) {
        process.env.GITLAB_ALLOWED_TOOLS = profile.allowed_tools.join(',');
        appliedSettings.push(`GITLAB_ALLOWED_TOOLS=${profile.allowed_tools.join(',')}`);
    }
    if (profile.denied_tools_regex) {
        process.env.GITLAB_DENIED_TOOLS_REGEX = profile.denied_tools_regex;
        appliedSettings.push(`GITLAB_DENIED_TOOLS_REGEX=${profile.denied_tools_regex}`);
    }
    if (profile.denied_actions && profile.denied_actions.length > 0) {
        process.env.GITLAB_DENIED_ACTIONS = profile.denied_actions.join(',');
        appliedSettings.push(`GITLAB_DENIED_ACTIONS=${profile.denied_actions.join(',')}`);
    }
    if (profile.features) {
        for (const [feature, envVar] of Object.entries(FEATURE_ENV_MAP)) {
            const value = profile.features[feature];
            if (value !== undefined) {
                process.env[envVar] = value ? 'true' : 'false';
                appliedSettings.push(`${envVar}=${value}`);
            }
        }
    }
    if (profile.timeout_ms) {
        process.env.GITLAB_API_HEADERS_TIMEOUT_MS = String(profile.timeout_ms);
        appliedSettings.push(`GITLAB_API_HEADERS_TIMEOUT_MS=${profile.timeout_ms}`);
    }
    if (profile.skip_tls_verify) {
        process.env.SKIP_TLS_VERIFY = 'true';
        appliedSettings.push('SKIP_TLS_VERIFY=true');
    }
    if (profile.ssl_cert_path) {
        process.env.SSL_CERT_PATH = profile.ssl_cert_path;
        appliedSettings.push(`SSL_CERT_PATH=${profile.ssl_cert_path}`);
    }
    if (profile.ssl_key_path) {
        process.env.SSL_KEY_PATH = profile.ssl_key_path;
        appliedSettings.push(`SSL_KEY_PATH=${profile.ssl_key_path}`);
    }
    if (profile.ca_cert_path) {
        process.env.GITLAB_CA_CERT_PATH = profile.ca_cert_path;
        appliedSettings.push(`GITLAB_CA_CERT_PATH=${profile.ca_cert_path}`);
    }
    if (profile.default_project) {
        process.env.GITLAB_PROJECT_ID = profile.default_project;
        appliedSettings.push(`GITLAB_PROJECT_ID=${profile.default_project}`);
    }
    if (profile.default_namespace) {
        process.env.GITLAB_DEFAULT_NAMESPACE = profile.default_namespace;
        appliedSettings.push(`GITLAB_DEFAULT_NAMESPACE=${profile.default_namespace}`);
    }
    (0, logger_1.logInfo)('Profile applied successfully', {
        profile: profileName,
        host: profile.host,
        authType: profile.auth.type,
        readOnly: profile.read_only ?? false,
        settingsCount: appliedSettings.length,
    });
    return {
        success: true,
        profileName,
        host: profile.host,
        appliedSettings,
        validation,
    };
}
async function applyPreset(preset, presetName) {
    const appliedSettings = [];
    const loader = new loader_1.ProfileLoader();
    const validation = await loader.validatePreset(preset);
    for (const warning of validation.warnings) {
        (0, logger_1.logWarn)(warning, { preset: presetName });
    }
    if (!validation.valid) {
        (0, logger_1.logError)('Preset validation failed', { preset: presetName, errors: validation.errors });
        return {
            success: false,
            presetName,
            appliedSettings,
            validation,
        };
    }
    if (!process.env.GITLAB_API_URL && !process.env.GITLAB_TOKEN) {
        (0, logger_1.logWarn)('Preset applied but GITLAB_API_URL/GITLAB_TOKEN not set - connection may fail', {
            preset: presetName,
        });
    }
    if (preset.read_only) {
        process.env.GITLAB_READ_ONLY_MODE = 'true';
        appliedSettings.push('GITLAB_READ_ONLY_MODE=true');
    }
    if (preset.denied_tools_regex) {
        process.env.GITLAB_DENIED_TOOLS_REGEX = preset.denied_tools_regex;
        appliedSettings.push(`GITLAB_DENIED_TOOLS_REGEX=${preset.denied_tools_regex}`);
    }
    if (preset.denied_actions && preset.denied_actions.length > 0) {
        process.env.GITLAB_DENIED_ACTIONS = preset.denied_actions.join(',');
        appliedSettings.push(`GITLAB_DENIED_ACTIONS=${preset.denied_actions.join(',')}`);
    }
    if (preset.allowed_tools && preset.allowed_tools.length > 0) {
        process.env.GITLAB_ALLOWED_TOOLS = preset.allowed_tools.join(',');
        appliedSettings.push(`GITLAB_ALLOWED_TOOLS=${preset.allowed_tools.join(',')}`);
    }
    if (preset.features) {
        for (const [feature, envVar] of Object.entries(FEATURE_ENV_MAP)) {
            const value = preset.features[feature];
            if (value !== undefined) {
                process.env[envVar] = value ? 'true' : 'false';
                appliedSettings.push(`${envVar}=${value}`);
            }
        }
    }
    if (preset.timeout_ms) {
        process.env.GITLAB_API_HEADERS_TIMEOUT_MS = String(preset.timeout_ms);
        appliedSettings.push(`GITLAB_API_HEADERS_TIMEOUT_MS=${preset.timeout_ms}`);
    }
    (0, logger_1.logInfo)('Preset applied successfully', {
        preset: presetName,
        readOnly: preset.read_only ?? false,
        settingsCount: appliedSettings.length,
    });
    return {
        success: true,
        presetName,
        appliedSettings,
        validation,
    };
}
async function loadAndApplyProfile(profileName) {
    const loader = new loader_1.ProfileLoader();
    const profile = await loader.loadProfile(profileName);
    return applyProfile(profile, profileName);
}
async function loadAndApplyPreset(presetName) {
    const loader = new loader_1.ProfileLoader();
    const preset = await loader.loadPreset(presetName);
    return applyPreset(preset, presetName);
}
async function tryApplyProfileFromEnv(cliProfileName) {
    const name = cliProfileName ?? process.env.GITLAB_PROFILE ?? (await getDefaultProfileName());
    if (!name) {
        (0, logger_1.logDebug)('No profile specified, using environment variables directly');
        return undefined;
    }
    try {
        const loader = new loader_1.ProfileLoader();
        const loaded = await loader.loadAny(name);
        if (loaded.type === 'profile') {
            return await applyProfile(loaded.data, name);
        }
        else {
            return await applyPreset(loaded.data, name);
        }
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        (0, logger_1.logError)('Failed to apply profile/preset', { profile: name, error: message });
        throw error;
    }
}
async function getDefaultProfileName() {
    const loader = new loader_1.ProfileLoader();
    return loader.getDefaultProfileName();
}
//# sourceMappingURL=applicator.js.map