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
exports.parseInstallFlags = parseInstallFlags;
exports.getClientsFromFlags = getClientsFromFlags;
exports.runInstallWizard = runInstallWizard;
exports.runInstallCommand = runInstallCommand;
exports.buildServerConfigFromEnv = buildServerConfigFromEnv;
const p = __importStar(require("@clack/prompts"));
const types_1 = require("./types");
const detector_1 = require("./detector");
const installers_1 = require("./installers");
function parseInstallFlags(args) {
    const flags = {};
    for (const arg of args) {
        switch (arg) {
            case '--claude-desktop':
                flags.claudeDesktop = true;
                break;
            case '--claude-code':
                flags.claudeCode = true;
                break;
            case '--cursor':
                flags.cursor = true;
                break;
            case '--vscode':
                flags.vscode = true;
                break;
            case '--cline':
                flags.cline = true;
                break;
            case '--roo-code':
                flags.rooCode = true;
                break;
            case '--windsurf':
                flags.windsurf = true;
                break;
            case '--all':
                flags.all = true;
                break;
            case '--show':
                flags.show = true;
                break;
            case '--force':
                flags.force = true;
                break;
        }
    }
    return flags;
}
function getClientsFromFlags(flags) {
    const clients = [];
    if (flags.claudeDesktop)
        clients.push('claude-desktop');
    if (flags.claudeCode)
        clients.push('claude-code');
    if (flags.cursor)
        clients.push('cursor');
    if (flags.vscode)
        clients.push('vscode-copilot');
    if (flags.cline)
        clients.push('cline');
    if (flags.rooCode)
        clients.push('roo-code');
    if (flags.windsurf)
        clients.push('windsurf');
    return clients;
}
function formatDetectionResult(result) {
    const metadata = types_1.CLIENT_METADATA[result.client];
    let status = result.detected ? '✓' : '✗';
    if (result.alreadyConfigured) {
        status = '⚙';
    }
    let hint = '';
    if (result.alreadyConfigured) {
        hint = ' (already configured)';
    }
    else if (result.detected && result.configExists) {
        hint = ' (config exists)';
    }
    else if (result.detected) {
        hint = ' (detected)';
    }
    return `${status} ${metadata.name}${hint}`;
}
async function runInstallWizard(serverConfig, flags = {}) {
    if (flags.show) {
        p.intro('GitLab MCP Configuration Preview');
        const specifiedClients = getClientsFromFlags(flags);
        const targetClient = specifiedClients[0] ?? 'claude-desktop';
        const preview = (0, installers_1.generateConfigPreview)(targetClient, serverConfig);
        p.note(preview, `Configuration for ${types_1.CLIENT_METADATA[targetClient].name}`);
        p.outro('Use these settings to configure your MCP client manually.');
        return [];
    }
    p.intro('Install GitLab MCP to your AI coding assistants');
    const spinner = p.spinner();
    spinner.start('Detecting installed MCP clients...');
    const detectionResults = (0, detector_1.detectAllClients)();
    const detectedClients = detectionResults.filter((r) => r.detected);
    spinner.stop(`Found ${detectedClients.length} MCP clients`);
    if (detectedClients.length === 0) {
        p.log.warn('No MCP clients detected on this system.');
        p.note('Supported clients:\n' +
            types_1.INSTALLABLE_CLIENTS.map((c) => `  - ${types_1.CLIENT_METADATA[c].name}`).join('\n'), 'Install one of these clients first:');
        p.outro('Setup cancelled.');
        return [];
    }
    p.log.info('Detected clients:');
    for (const result of detectionResults) {
        if (result.detected) {
            console.log(`  ${formatDetectionResult(result)}`);
        }
    }
    let targetClients;
    const specifiedClients = getClientsFromFlags(flags);
    if (flags.all) {
        targetClients = detectedClients.map((r) => r.client);
    }
    else if (specifiedClients.length > 0) {
        targetClients = specifiedClients.filter((c) => detectedClients.some((d) => d.client === c));
        const undetected = specifiedClients.filter((c) => !detectedClients.some((d) => d.client === c));
        if (undetected.length > 0) {
            p.log.warn(`Skipping undetected clients: ${undetected.map((c) => types_1.CLIENT_METADATA[c].name).join(', ')}`);
        }
    }
    else {
        const selectedClients = await p.multiselect({
            message: 'Select clients to install to:',
            options: detectedClients.map((result) => ({
                value: result.client,
                label: types_1.CLIENT_METADATA[result.client].name,
                hint: result.alreadyConfigured ? 'already configured' : undefined,
            })),
            required: true,
        });
        if (p.isCancel(selectedClients)) {
            p.cancel('Installation cancelled');
            return [];
        }
        const isInstallableClient = (value) => typeof value === 'string' && types_1.INSTALLABLE_CLIENTS.includes(value);
        const validatedClients = selectedClients.filter(isInstallableClient);
        if (validatedClients.length !== selectedClients.length) {
            p.log.error('Invalid client selection received.');
            p.cancel('Installation cancelled');
            return [];
        }
        targetClients = validatedClients;
    }
    if (targetClients.length === 0) {
        p.log.warn('No clients selected for installation.');
        p.outro('Setup cancelled.');
        return [];
    }
    const alreadyConfigured = targetClients.filter((c) => detectionResults.find((r) => r.client === c)?.alreadyConfigured);
    let userConfirmedOverwrite = false;
    if (alreadyConfigured.length > 0 && !flags.force) {
        p.log.warn(`Some clients already have gitlab-mcp configured: ${alreadyConfigured.map((c) => types_1.CLIENT_METADATA[c].name).join(', ')}`);
        const overwrite = await p.confirm({
            message: 'Overwrite existing configurations?',
            initialValue: false,
        });
        if (p.isCancel(overwrite)) {
            p.cancel('Installation cancelled');
            return [];
        }
        if (overwrite) {
            userConfirmedOverwrite = true;
        }
        else {
            targetClients = targetClients.filter((c) => !alreadyConfigured.includes(c));
            if (targetClients.length === 0) {
                p.log.info('No new clients to configure.');
                p.outro('Configuration unchanged.');
                return [];
            }
        }
    }
    spinner.start('Installing configuration...');
    const forceInstall = flags.force === true || userConfirmedOverwrite;
    const results = (0, installers_1.installToClients)(targetClients, serverConfig, forceInstall);
    spinner.stop('Installation complete!');
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);
    if (successful.length > 0) {
        p.log.success(`Installed to ${successful.length} clients:`);
        for (const result of successful) {
            const metadata = types_1.CLIENT_METADATA[result.client];
            let info = `  ✓ ${metadata.name}`;
            if (result.configPath) {
                info += ` (${result.configPath})`;
            }
            if (result.backupPath) {
                info += `\n    Backup: ${result.backupPath}`;
            }
            console.log(info);
        }
    }
    if (failed.length > 0) {
        p.log.error(`Failed for ${failed.length} clients:`);
        for (const result of failed) {
            const metadata = types_1.CLIENT_METADATA[result.client];
            console.log(`  ✗ ${metadata.name}: ${result.error}`);
        }
    }
    p.outro(successful.length > 0
        ? 'Installation complete! Restart your MCP clients to apply changes.'
        : 'Installation failed.');
    return results;
}
async function runInstallCommand(serverConfig, flags) {
    const specifiedClients = getClientsFromFlags(flags);
    if (flags.show) {
        const targetClient = specifiedClients[0] ?? 'claude-desktop';
        const preview = (0, installers_1.generateConfigPreview)(targetClient, serverConfig);
        console.log(`Configuration for ${types_1.CLIENT_METADATA[targetClient].name}:\n`);
        console.log(preview);
        return [];
    }
    if (specifiedClients.length > 0 || flags.all) {
        const detected = (0, detector_1.getDetectedClients)();
        let targetClients;
        if (flags.all) {
            targetClients = detected.map((r) => r.client);
        }
        else {
            targetClients = specifiedClients.filter((c) => detected.some((d) => d.client === c));
        }
        if (targetClients.length === 0) {
            console.error('No supported MCP clients detected.');
            return [];
        }
        const results = (0, installers_1.installToClients)(targetClients, serverConfig, flags.force ?? false);
        for (const result of results) {
            const metadata = types_1.CLIENT_METADATA[result.client];
            if (result.success) {
                console.log(`✓ Installed to ${metadata.name}`);
                if (result.backupPath) {
                    console.log(`  Backup created: ${result.backupPath}`);
                }
            }
            else {
                console.error(`✗ Failed for ${metadata.name}: ${result.error}`);
            }
        }
        return results;
    }
    return runInstallWizard(serverConfig, flags);
}
function buildServerConfigFromEnv() {
    const instanceUrl = process.env.GITLAB_URL ?? 'https://gitlab.com';
    const token = process.env.GITLAB_TOKEN ?? '';
    const preset = process.env.GITLAB_MCP_PRESET;
    const env = {
        GITLAB_URL: instanceUrl,
        GITLAB_TOKEN: token,
    };
    if (preset) {
        env.GITLAB_MCP_PRESET = preset;
    }
    return {
        command: 'npx',
        args: ['-y', '@structured-world/gitlab-mcp'],
        env,
    };
}
//# sourceMappingURL=install-command.js.map