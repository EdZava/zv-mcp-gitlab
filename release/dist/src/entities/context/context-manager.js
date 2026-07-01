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
exports.ContextManager = void 0;
exports.getContextManager = getContextManager;
const config_1 = require("../../config");
const logger_1 = require("../../logger");
const loader_1 = require("../../profiles/loader");
const scope_enforcer_1 = require("../../profiles/scope-enforcer");
const server_1 = require("../../server");
const namespace_1 = require("../../utils/namespace");
function isOAuthMode() {
    return process.env.OAUTH_ENABLED === 'true';
}
function getHost() {
    try {
        const url = new URL(config_1.GITLAB_BASE_URL);
        return url.hostname;
    }
    catch {
        return config_1.GITLAB_BASE_URL;
    }
}
class ContextManager {
    static instance = null;
    profileLoader;
    currentPreset = null;
    currentPresetName = null;
    currentScope = null;
    currentScopeEnforcer = null;
    currentProfileName = null;
    initialContext = null;
    constructor() {
        this.profileLoader = new loader_1.ProfileLoader();
        this.captureInitialContext();
    }
    static getInstance() {
        ContextManager.instance ??= new ContextManager();
        return ContextManager.instance;
    }
    static resetInstance() {
        ContextManager.instance = null;
    }
    captureInitialContext() {
        this.initialContext = {
            host: getHost(),
            apiUrl: config_1.GITLAB_BASE_URL,
            readOnly: config_1.GITLAB_READ_ONLY_MODE,
            oauthMode: isOAuthMode(),
            presetName: this.currentPresetName ?? undefined,
            profileName: this.currentProfileName ?? undefined,
            scope: this.currentScope
                ? this.scopeConfigToRuntimeScope(this.currentScope, false)
                : undefined,
        };
        (0, logger_1.logDebug)('Captured initial context', { initialContext: this.initialContext });
    }
    scopeConfigToRuntimeScope(scope, detected) {
        if (scope.project) {
            return {
                type: 'project',
                path: scope.project,
                includeSubgroups: false,
                detected,
            };
        }
        if (scope.group) {
            return {
                type: 'group',
                path: scope.group,
                includeSubgroups: scope.includeSubgroups !== false,
                detected,
            };
        }
        if (scope.namespace) {
            return {
                type: 'group',
                path: scope.namespace,
                includeSubgroups: scope.includeSubgroups !== false,
                detected,
            };
        }
        if (scope.projects && scope.projects.length > 0) {
            return {
                type: 'project',
                path: scope.projects[0],
                additionalPaths: scope.projects.length > 1 ? scope.projects.slice(1) : undefined,
                includeSubgroups: false,
                detected,
            };
        }
        if (scope.groups && scope.groups.length > 0) {
            return {
                type: 'group',
                path: scope.groups[0],
                additionalPaths: scope.groups.length > 1 ? scope.groups.slice(1) : undefined,
                includeSubgroups: scope.includeSubgroups !== false,
                detected,
            };
        }
        (0, logger_1.logError)('Invalid scope configuration: no usable scope fields found', { scope });
        throw new Error('Invalid scope configuration: expected project, group, namespace, projects, or groups to be defined');
    }
    getContext() {
        const context = {
            host: getHost(),
            apiUrl: config_1.GITLAB_BASE_URL,
            readOnly: config_1.GITLAB_READ_ONLY_MODE,
            oauthMode: isOAuthMode(),
            presetName: this.currentPresetName ?? undefined,
            profileName: this.currentProfileName ?? undefined,
            scope: this.currentScope
                ? this.scopeConfigToRuntimeScope(this.currentScope, false)
                : undefined,
            initialContext: this.initialContext ?? undefined,
        };
        return context;
    }
    async listPresets() {
        const profiles = await this.profileLoader.listProfiles();
        const presets = profiles
            .filter((p) => p.isPreset)
            .map((p) => ({
            name: p.name,
            description: p.description,
            readOnly: p.readOnly,
            isBuiltIn: p.isBuiltIn,
        }));
        if (this.currentPresetName && this.currentPreset) {
            const exists = presets.some((p) => p.name === this.currentPresetName);
            if (!exists) {
                presets.unshift({
                    name: this.currentPresetName,
                    description: this.currentPreset.description,
                    readOnly: this.currentPreset.read_only ?? false,
                    isBuiltIn: false,
                });
            }
        }
        return presets;
    }
    async listProfiles() {
        if (!isOAuthMode()) {
            throw new Error('list_profiles is only available in OAuth mode');
        }
        const profiles = await this.profileLoader.listProfiles();
        return profiles.filter((p) => !p.isPreset);
    }
    async switchPreset(presetName) {
        const previousPreset = this.currentPresetName;
        try {
            const preset = await this.profileLoader.loadPreset(presetName);
            this.currentPreset = preset;
            this.currentPresetName = presetName;
            if (preset.scope) {
                this.currentScope = preset.scope;
                this.currentScopeEnforcer = new scope_enforcer_1.ScopeEnforcer(preset.scope);
            }
            else {
                this.currentScope = null;
                this.currentScopeEnforcer = null;
            }
            (0, logger_1.logInfo)('Switched preset', { previous: previousPreset, current: presetName });
            await (0, server_1.sendToolsListChangedNotification)();
            return {
                success: true,
                previous: previousPreset ?? undefined,
                current: presetName,
                message: `Switched to preset '${presetName}'`,
            };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            (0, logger_1.logError)('Failed to switch preset', { error: message, preset: presetName });
            throw new Error(`Failed to switch to preset '${presetName}': ${message}`, { cause: error });
        }
    }
    async getCurrentProfileUrl() {
        if (!this.currentProfileName)
            return null;
        const profile = await this.profileLoader.loadProfile(this.currentProfileName);
        return profile.api_url ?? `https://${profile.host}`;
    }
    async switchProfile(profileName) {
        if (!isOAuthMode()) {
            throw new Error('switch_profile is only available in OAuth mode');
        }
        const previousProfile = this.currentProfileName;
        try {
            await this.profileLoader.loadProfile(profileName);
            this.currentProfileName = profileName;
            (0, logger_1.logInfo)('Switched profile', { previous: previousProfile, current: profileName });
            return {
                success: true,
                previous: previousProfile ?? undefined,
                current: profileName,
                message: `Switched to profile '${profileName}'`,
            };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            (0, logger_1.logError)('Failed to switch profile', { error: message, profile: profileName });
            throw new Error(`Failed to switch to profile '${profileName}': ${message}`, { cause: error });
        }
    }
    async setScope(namespace, includeSubgroups = true) {
        try {
            const namespaceType = await (0, namespace_1.detectNamespaceType)(namespace);
            let scopeConfig;
            if (namespaceType === 'project') {
                scopeConfig = {
                    project: namespace,
                    includeSubgroups: false,
                };
            }
            else {
                scopeConfig = {
                    group: namespace,
                    includeSubgroups,
                };
            }
            this.currentScope = scopeConfig;
            this.currentScopeEnforcer = new scope_enforcer_1.ScopeEnforcer(scopeConfig);
            const runtimeScope = {
                type: namespaceType,
                path: namespace,
                includeSubgroups: namespaceType === 'group' ? includeSubgroups : false,
                detected: true,
            };
            (0, logger_1.logInfo)('Scope set with auto-detection', {
                namespace,
                type: namespaceType,
                includeSubgroups,
            });
            return {
                success: true,
                scope: runtimeScope,
                message: `Scope set to ${namespaceType} '${namespace}'${namespaceType === 'group' && includeSubgroups ? ' (including subgroups)' : ''}`,
            };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            (0, logger_1.logError)('Failed to set scope', { error: message, namespace });
            throw new Error(`Failed to set scope for '${namespace}': ${message}`, { cause: error });
        }
    }
    reset() {
        if (!this.initialContext) {
            throw new Error('No initial context captured - cannot reset');
        }
        this.currentPreset = null;
        this.currentPresetName = null;
        this.currentScope = null;
        this.currentScopeEnforcer = null;
        this.currentProfileName = null;
        this.captureInitialContext();
        (0, logger_1.logInfo)('Context reset to initial state');
        return {
            success: true,
            message: 'Context reset to initial state',
            context: this.getContext(),
        };
    }
    getScopeEnforcer() {
        return this.currentScopeEnforcer;
    }
    hasScope() {
        return this.currentScope !== null;
    }
    getCurrentPreset() {
        return this.currentPreset;
    }
    getCurrentPresetName() {
        return this.currentPresetName;
    }
    async switchInstance(instanceUrl) {
        if (isOAuthMode()) {
            throw new Error('Cannot switch instances in OAuth mode. ' +
                'Please re-authenticate with the desired GitLab instance.');
        }
        const { InstanceRegistry } = await Promise.resolve().then(() => __importStar(require('../../services/InstanceRegistry.js')));
        const { clearNamespaceTierCache } = await Promise.resolve().then(() => __importStar(require('../../services/NamespaceTierDetector.js')));
        const { ConnectionManager } = await Promise.resolve().then(() => __importStar(require('../../services/ConnectionManager.js')));
        const registry = InstanceRegistry.getInstance();
        if (!registry.isInitialized()) {
            await registry.initialize();
        }
        const instance = registry.get(instanceUrl);
        if (!instance) {
            throw new Error(`Instance not configured: ${instanceUrl}. ` +
                "Use 'instances list' to see configured instances.");
        }
        const connectionManager = ConnectionManager.getInstance();
        const previousUrl = connectionManager.getCurrentInstanceUrl() ?? config_1.GITLAB_BASE_URL;
        try {
            clearNamespaceTierCache();
            await connectionManager.reinitialize(instanceUrl);
            this.currentScope = null;
            this.currentScopeEnforcer = null;
            (0, logger_1.logInfo)('Switched GitLab instance', {
                previous: previousUrl,
                current: instanceUrl,
                label: instance.config.label,
            });
            await (0, server_1.sendToolsListChangedNotification)();
            return {
                success: true,
                previous: previousUrl,
                current: instanceUrl,
                message: `Switched to instance '${instance.config.label ?? instanceUrl}'`,
            };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            (0, logger_1.logError)('Failed to switch instance', { error: message, instanceUrl });
            throw new Error(`Failed to switch to instance '${instanceUrl}': ${message}`, {
                cause: error,
            });
        }
    }
}
exports.ContextManager = ContextManager;
function getContextManager() {
    return ContextManager.getInstance();
}
//# sourceMappingURL=context-manager.js.map