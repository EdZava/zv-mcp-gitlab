"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoDiscover = autoDiscover;
exports.formatDiscoveryResult = formatDiscoveryResult;
const git_remote_1 = require("./git-remote");
const profile_matcher_1 = require("./profile-matcher");
const profiles_1 = require("../profiles");
const logger_1 = require("../logger");
const namespace_1 = require("../utils/namespace");
async function autoDiscover(options = {}) {
    const repoPath = options.repoPath ?? process.cwd();
    (0, logger_1.logInfo)('Starting auto-discovery', { path: repoPath });
    const remote = await (0, git_remote_1.parseGitRemote)({
        repoPath,
        remoteName: options.remoteName,
    });
    if (!remote) {
        (0, logger_1.logWarn)('Auto-discovery: No git remote found', { path: repoPath });
        return null;
    }
    (0, logger_1.logInfo)('Detected git remote', {
        host: remote.host,
        projectPath: remote.projectPath,
        remote: remote.remoteName,
    });
    const availableRemotes = await (0, git_remote_1.listGitRemotes)(repoPath);
    const matchedProfile = await (0, profile_matcher_1.findProfileByHost)(remote.host);
    if (matchedProfile) {
        (0, logger_1.logInfo)('Matched host to user profile', {
            profile: matchedProfile.profileName,
            matchType: matchedProfile.matchType,
        });
    }
    else {
        (0, logger_1.logDebug)('No matching user profile found', { host: remote.host });
    }
    let projectConfig = null;
    if (!options.noProjectConfig) {
        projectConfig = await (0, profiles_1.findProjectConfig)(repoPath);
        if (projectConfig) {
            (0, logger_1.logInfo)('Found project configuration', { path: projectConfig.configPath });
        }
    }
    const apiUrl = `https://${remote.host}`;
    const result = {
        host: remote.host,
        projectPath: remote.projectPath,
        remote,
        matchedProfile,
        projectConfig,
        apiUrl,
        profileApplied: false,
        projectConfigApplied: false,
        availableRemotes,
    };
    if (!options.dryRun) {
        if (matchedProfile) {
            try {
                await (0, profiles_1.loadAndApplyProfile)(matchedProfile.profileName);
                result.profileApplied = true;
                (0, logger_1.logInfo)('Applied matched profile', { profile: matchedProfile.profileName });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                (0, logger_1.logError)('Failed to apply matched profile', { error: message });
            }
        }
        else {
            if (!process.env.GITLAB_API_URL) {
                process.env.GITLAB_API_URL = apiUrl;
                (0, logger_1.logInfo)('Set GITLAB_API_URL from discovered host', { apiUrl });
            }
        }
        if (projectConfig) {
            result.projectConfigApplied = true;
            (0, logger_1.logDebug)('Project config loaded (enforcement pending)', { config: projectConfig });
        }
        setDefaultContext(remote.projectPath);
    }
    return result;
}
function setDefaultContext(projectPath) {
    if (!process.env.GITLAB_DEFAULT_PROJECT) {
        process.env.GITLAB_DEFAULT_PROJECT = projectPath;
        (0, logger_1.logDebug)('Set default project context', { project: projectPath });
    }
    if (!process.env.GITLAB_DEFAULT_NAMESPACE) {
        const namespace = (0, namespace_1.extractNamespaceFromPath)(projectPath);
        if (namespace) {
            process.env.GITLAB_DEFAULT_NAMESPACE = namespace;
            (0, logger_1.logDebug)('Set default namespace context', { namespace });
        }
    }
}
function formatDiscoveryResult(result) {
    const lines = [];
    lines.push('Auto-discovery Results');
    lines.push('======================');
    lines.push('');
    lines.push('Git Remote:');
    lines.push(`  Remote: ${result.remote.remoteName}`);
    lines.push(`  Host: ${result.host}`);
    lines.push(`  Project: ${result.projectPath}`);
    lines.push(`  Protocol: ${result.remote.protocol}`);
    lines.push(`  URL: ${result.remote.url}`);
    lines.push('');
    if (result.availableRemotes.length > 1) {
        lines.push('Available Remotes:');
        for (const remote of result.availableRemotes) {
            const selected = remote.remoteName === result.remote.remoteName ? ' (selected)' : '';
            lines.push(`  ${remote.remoteName}: ${remote.host}/${remote.projectPath}${selected}`);
        }
        lines.push('');
    }
    lines.push('Profile Match:');
    if (result.matchedProfile) {
        lines.push(`  Profile: ${result.matchedProfile.profileName}`);
        lines.push(`  Match Type: ${result.matchedProfile.matchType}`);
        if (result.matchedProfile.profile.authType) {
            lines.push(`  Auth: ${result.matchedProfile.profile.authType}`);
        }
        if (result.matchedProfile.profile.readOnly) {
            lines.push(`  Mode: read-only`);
        }
    }
    else {
        lines.push(`  No matching profile found`);
        lines.push(`  Will use: ${result.apiUrl} (from discovered host)`);
        lines.push(`  Auth: GITLAB_TOKEN environment variable required`);
    }
    lines.push('');
    lines.push('Project Configuration:');
    if (result.projectConfig) {
        lines.push(`  Path: ${result.projectConfig.configPath}`);
        if (result.projectConfig.preset) {
            lines.push(`  Preset: ${result.projectConfig.preset.description ?? 'custom restrictions'}`);
            if (result.projectConfig.preset.scope) {
                const scope = result.projectConfig.preset.scope;
                if (scope.project) {
                    lines.push(`    Scope: project "${scope.project}"`);
                }
                else if (scope.namespace) {
                    lines.push(`    Scope: namespace "${scope.namespace}/*"`);
                }
                else if (scope.projects) {
                    lines.push(`    Scope: ${scope.projects.length} projects`);
                }
            }
            if (result.projectConfig.preset.read_only) {
                lines.push(`    Mode: read-only`);
            }
        }
        if (result.projectConfig.profile) {
            lines.push(`  Profile: ${result.projectConfig.profile.description ?? 'custom tool selection'}`);
            if (result.projectConfig.profile.extends) {
                lines.push(`    Extends: ${result.projectConfig.profile.extends}`);
            }
        }
    }
    else {
        lines.push(`  No .gitlab-mcp/ directory found`);
    }
    lines.push('');
    lines.push('Default Context:');
    lines.push(`  Project: ${result.projectPath}`);
    const namespace = (0, namespace_1.extractNamespaceFromPath)(result.projectPath) ?? result.projectPath;
    lines.push(`  Namespace: ${namespace}`);
    return lines.join('\n');
}
//# sourceMappingURL=auto.js.map