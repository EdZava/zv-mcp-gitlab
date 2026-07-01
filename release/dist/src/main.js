#!/usr/bin/env node
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
const server_1 = require("./server");
const logger_1 = require("./logger");
const config_1 = require("./oauth/config");
const profiles_1 = require("./profiles");
const cli_utils_1 = require("./cli-utils");
const discovery_1 = require("./discovery");
const namespace_1 = require("./utils/namespace");
async function main() {
    const cliArgs = (0, cli_utils_1.parseCliArgs)();
    if (cliArgs.setup) {
        const { runSetupWizard } = await Promise.resolve().then(() => __importStar(require('./cli/setup')));
        const result = await runSetupWizard({ mode: cliArgs.setupMode });
        process.exit(result.success ? 0 : 1);
    }
    if (cliArgs.init) {
        const { runSetupWizard } = await Promise.resolve().then(() => __importStar(require('./cli/setup')));
        const result = await runSetupWizard({ mode: 'local' });
        process.exit(result.success ? 0 : 1);
    }
    if (cliArgs.install) {
        const { runInstallCommand, parseInstallFlags, buildServerConfigFromEnv } = await Promise.resolve().then(() => __importStar(require('./cli/install')));
        const flags = parseInstallFlags(cliArgs.installArgs);
        const serverConfig = buildServerConfigFromEnv();
        await runInstallCommand(serverConfig, flags);
        process.exit(0);
    }
    if (cliArgs.docker) {
        if (cliArgs.dockerArgs[0] === 'init') {
            const { runSetupWizard } = await Promise.resolve().then(() => __importStar(require('./cli/setup')));
            const result = await runSetupWizard({ mode: 'server' });
            process.exit(result.success ? 0 : 1);
            return;
        }
        const { runDockerCommand } = await Promise.resolve().then(() => __importStar(require('./cli/docker')));
        await runDockerCommand(cliArgs.dockerArgs);
        process.exit(0);
    }
    if (cliArgs.showProjectConfig) {
        try {
            const projectConfig = await (0, profiles_1.findProjectConfig)(process.cwd());
            (0, cli_utils_1.displayProjectConfig)(projectConfig);
            process.exit(0);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            (0, logger_1.logError)('Failed to load project config', { error: message });
            process.exit(1);
        }
    }
    let autoDiscoveryResult = null;
    if (cliArgs.auto) {
        try {
            autoDiscoveryResult = await (0, discovery_1.autoDiscover)({
                repoPath: cliArgs.cwd,
                remoteName: cliArgs.remoteName,
                noProjectConfig: true,
                dryRun: cliArgs.dryRun,
            });
            if (autoDiscoveryResult) {
                if (cliArgs.dryRun) {
                    console.log((0, discovery_1.formatDiscoveryResult)(autoDiscoveryResult));
                    process.exit(0);
                }
                (0, logger_1.logInfo)('Auto-discovery detected GitLab configuration', {
                    host: autoDiscoveryResult.host,
                    project: autoDiscoveryResult.projectPath,
                    profile: autoDiscoveryResult.matchedProfile?.profileName,
                });
            }
            else {
                (0, logger_1.logWarn)('Auto-discovery failed: not in a git repository or no remote found');
            }
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            (0, logger_1.logError)('Auto-discovery failed', { error: message });
            process.exit(1);
        }
    }
    if (cliArgs.profileName) {
        try {
            const result = await (0, profiles_1.tryApplyProfileFromEnv)(cliArgs.profileName);
            if (result) {
                if ('profileName' in result) {
                    (0, logger_1.logInfo)('Using CLI-specified profile', {
                        profile: result.profileName,
                        host: result.host,
                    });
                }
                else {
                    (0, logger_1.logInfo)('Using CLI-specified preset', { preset: result.presetName });
                }
                if (autoDiscoveryResult?.matchedProfile &&
                    autoDiscoveryResult.matchedProfile.profileName !== cliArgs.profileName) {
                    (0, logger_1.logWarn)('Auto-discovered profile ignored: --profile takes precedence', {
                        cliProfile: cliArgs.profileName,
                        autoProfile: autoDiscoveryResult.matchedProfile.profileName,
                    });
                }
            }
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            (0, logger_1.logError)('Failed to load profile', { error: message });
            process.exit(1);
        }
    }
    else if (autoDiscoveryResult?.matchedProfile) {
        try {
            const result = await (0, profiles_1.tryApplyProfileFromEnv)(autoDiscoveryResult.matchedProfile.profileName);
            if (result && 'profileName' in result) {
                (0, logger_1.logInfo)('Using auto-discovered profile', {
                    profile: result.profileName,
                    host: result.host,
                });
            }
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            (0, logger_1.logWarn)('Failed to apply auto-discovered profile', { error: message });
        }
    }
    else {
        try {
            const result = await (0, profiles_1.tryApplyProfileFromEnv)();
            if (result) {
                if ('profileName' in result) {
                    (0, logger_1.logInfo)('Using configuration profile', {
                        profile: result.profileName,
                        host: result.host,
                    });
                }
                else {
                    (0, logger_1.logInfo)('Using configuration preset', { preset: result.presetName });
                }
            }
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            (0, logger_1.logError)('Failed to load profile', { error: message });
            process.exit(1);
        }
    }
    if (!cliArgs.noProjectConfig) {
        try {
            const projectConfig = await (0, profiles_1.findProjectConfig)(process.cwd());
            if (projectConfig) {
                const summary = (0, profiles_1.getProjectConfigSummary)(projectConfig);
                (0, logger_1.logInfo)('Loaded project configuration (restrictions applied)', {
                    path: projectConfig.configPath,
                    preset: summary.presetSummary,
                    profile: summary.profileSummary,
                });
            }
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            (0, logger_1.logWarn)('Failed to load project config, continuing without it', { error: message });
        }
    }
    if (autoDiscoveryResult) {
        process.env.GITLAB_DEFAULT_PROJECT ??= autoDiscoveryResult.projectPath;
        const namespace = (0, namespace_1.extractNamespaceFromPath)(autoDiscoveryResult.projectPath);
        if (namespace) {
            process.env.GITLAB_DEFAULT_NAMESPACE ??= namespace;
        }
        (0, logger_1.logDebug)('Default context set from auto-discovery', {
            defaultProject: process.env.GITLAB_DEFAULT_PROJECT,
            defaultNamespace: process.env.GITLAB_DEFAULT_NAMESPACE,
        });
    }
    await (0, server_1.startServer)();
}
main().catch((error) => {
    if (error instanceof config_1.ConfigurationError) {
        console.error(error.guidance);
    }
    else {
        (0, logger_1.logError)('Failed to start GitLab MCP Server', { error: String(error) });
    }
    process.exit(1);
});
//# sourceMappingURL=main.js.map