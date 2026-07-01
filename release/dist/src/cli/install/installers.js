"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installClaudeDesktop = installClaudeDesktop;
exports.installClaudeCode = installClaudeCode;
exports.installCursor = installCursor;
exports.installVSCodeCopilot = installVSCodeCopilot;
exports.installWindsurf = installWindsurf;
exports.installCline = installCline;
exports.installRooCode = installRooCode;
exports.installToClient = installToClient;
exports.installToClients = installToClients;
exports.generateConfigPreview = generateConfigPreview;
const fs_1 = require("fs");
const path_1 = require("path");
const child_process_1 = require("child_process");
const types_1 = require("./types");
const detector_1 = require("./detector");
const backup_1 = require("./backup");
function buildServerEntry(serverConfig) {
    const entry = {
        command: serverConfig.command,
        args: serverConfig.args,
    };
    if (Object.keys(serverConfig.env).length > 0) {
        entry.env = serverConfig.env;
    }
    return entry;
}
function readJsonConfig(configPath) {
    try {
        if ((0, fs_1.existsSync)(configPath)) {
            const content = (0, fs_1.readFileSync)(configPath, 'utf8');
            return JSON.parse(content);
        }
    }
    catch {
    }
    return {};
}
function writeJsonConfig(configPath, config) {
    const dir = (0, path_1.dirname)(configPath);
    if (!(0, fs_1.existsSync)(dir)) {
        (0, fs_1.mkdirSync)(dir, { recursive: true });
    }
    (0, fs_1.writeFileSync)(configPath, JSON.stringify(config, null, 2) + '\n', 'utf8');
}
function installJsonConfigClient(client, serverConfig, force, unavailableError) {
    const configPath = (0, detector_1.getConfigPath)(client);
    if (!configPath) {
        return {
            client,
            success: false,
            error: unavailableError,
        };
    }
    const expandedPath = (0, detector_1.expandPath)(configPath);
    try {
        let backupPath;
        if ((0, fs_1.existsSync)(expandedPath)) {
            const backupResult = (0, backup_1.createBackup)({ configPath: expandedPath });
            if (backupResult.created) {
                backupPath = backupResult.backupPath;
            }
        }
        const config = readJsonConfig(expandedPath);
        const wasAlreadyConfigured = config.mcpServers?.gitlab !== undefined || config.mcpServers?.['gitlab-mcp'] !== undefined;
        if (wasAlreadyConfigured && !force) {
            return {
                client,
                success: false,
                error: 'gitlab-mcp is already configured. Use --force to overwrite.',
                wasAlreadyConfigured: true,
                configPath: expandedPath,
            };
        }
        config.mcpServers ??= {};
        config.mcpServers.gitlab = buildServerEntry(serverConfig);
        delete config.mcpServers['gitlab-mcp'];
        writeJsonConfig(expandedPath, config);
        return {
            client,
            success: true,
            backupPath,
            configPath: expandedPath,
            wasAlreadyConfigured,
        };
    }
    catch (error) {
        return {
            client,
            success: false,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}
function installClaudeDesktop(serverConfig, force = false) {
    return installJsonConfigClient('claude-desktop', serverConfig, force, 'Claude Desktop config path not available for this platform');
}
function installClaudeCode(serverConfig, force = false) {
    const client = 'claude-code';
    const metadata = types_1.CLIENT_METADATA[client];
    if (!metadata.cliCommand) {
        return {
            client,
            success: false,
            error: 'Claude Code CLI command not configured',
        };
    }
    try {
        const args = ['mcp', 'add', 'gitlab', serverConfig.command, ...serverConfig.args];
        for (const [key, value] of Object.entries(serverConfig.env)) {
            args.push('--env', `${key}=${value}`);
        }
        if (force) {
            const listResult = (0, child_process_1.spawnSync)(metadata.cliCommand, ['mcp', 'list'], {
                stdio: 'pipe',
                encoding: 'utf8',
            });
            if (listResult.status === 0 && listResult.stdout.includes('gitlab')) {
                const removeResult = (0, child_process_1.spawnSync)(metadata.cliCommand, ['mcp', 'remove', 'gitlab'], {
                    stdio: 'pipe',
                    encoding: 'utf8',
                });
                if (removeResult.status !== 0) {
                    return {
                        client,
                        success: false,
                        error: `Failed to remove existing gitlab config: ${removeResult.stderr || removeResult.stdout || 'Unknown error'}`,
                    };
                }
            }
        }
        const result = (0, child_process_1.spawnSync)(metadata.cliCommand, args, {
            stdio: 'pipe',
            encoding: 'utf8',
        });
        if (result.status === 0) {
            return {
                client,
                success: true,
            };
        }
        else {
            const errorOutput = result.stderr || result.stdout || 'Unknown error';
            if (errorOutput.includes('already exists') || errorOutput.includes('already configured')) {
                return {
                    client,
                    success: false,
                    error: 'gitlab-mcp is already configured. Use --force to overwrite.',
                    wasAlreadyConfigured: true,
                };
            }
            return {
                client,
                success: false,
                error: errorOutput,
            };
        }
    }
    catch (error) {
        return {
            client,
            success: false,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}
function installCursor(serverConfig, force = false) {
    return installJsonConfigClient('cursor', serverConfig, force, 'Cursor config path not available for this platform');
}
function installVSCodeCopilot(serverConfig, force = false) {
    const client = 'vscode-copilot';
    const configPath = (0, detector_1.getConfigPath)(client);
    if (!configPath) {
        return {
            client,
            success: false,
            error: 'VS Code config path not available',
        };
    }
    const expandedPath = configPath;
    try {
        let backupPath;
        if ((0, fs_1.existsSync)(expandedPath)) {
            const backupResult = (0, backup_1.createBackup)({ configPath: expandedPath });
            if (backupResult.created) {
                backupPath = backupResult.backupPath;
            }
        }
        const config = readJsonConfig(expandedPath);
        const wasAlreadyConfigured = config.servers?.gitlab !== undefined || config.servers?.['gitlab-mcp'] !== undefined;
        if (wasAlreadyConfigured && !force) {
            return {
                client,
                success: false,
                error: 'gitlab-mcp is already configured. Use --force to overwrite.',
                wasAlreadyConfigured: true,
                configPath: expandedPath,
            };
        }
        config.servers ??= {};
        config.servers.gitlab = buildServerEntry(serverConfig);
        delete config.servers['gitlab-mcp'];
        writeJsonConfig(expandedPath, config);
        return {
            client,
            success: true,
            backupPath,
            configPath: expandedPath,
            wasAlreadyConfigured,
        };
    }
    catch (error) {
        return {
            client,
            success: false,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}
function installWindsurf(serverConfig, force = false) {
    return installJsonConfigClient('windsurf', serverConfig, force, 'Windsurf config path not available for this platform');
}
function installCline(serverConfig, force = false) {
    return installJsonConfigClient('cline', serverConfig, force, 'Cline config path not available for this platform');
}
function installRooCode(serverConfig, force = false) {
    return installJsonConfigClient('roo-code', serverConfig, force, 'Roo Code config path not available for this platform');
}
const INSTALLERS = {
    'claude-desktop': installClaudeDesktop,
    'claude-code': installClaudeCode,
    cursor: installCursor,
    'vscode-copilot': installVSCodeCopilot,
    windsurf: installWindsurf,
    cline: installCline,
    'roo-code': installRooCode,
};
function installToClient(client, serverConfig, force = false) {
    const installer = INSTALLERS[client];
    return installer(serverConfig, force);
}
function installToClients(clients, serverConfig, force = false) {
    return clients.map((client) => installToClient(client, serverConfig, force));
}
function generateConfigPreview(client, serverConfig) {
    const entry = buildServerEntry(serverConfig);
    if (client === 'vscode-copilot') {
        return JSON.stringify({ servers: { gitlab: entry } }, null, 2);
    }
    return JSON.stringify({ mcpServers: { gitlab: entry } }, null, 2);
}
//# sourceMappingURL=installers.js.map