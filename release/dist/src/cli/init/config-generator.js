"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateServerConfig = generateServerConfig;
exports.generateMcpServersJson = generateMcpServersJson;
exports.generateClaudeCodeCommand = generateClaudeCodeCommand;
exports.generateClientConfig = generateClientConfig;
exports.generateClaudeDeepLink = generateClaudeDeepLink;
const types_1 = require("./types");
function shellEscape(value) {
    return value
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\$/g, '\\$')
        .replace(/`/g, '\\`')
        .replace(/\n/g, '\\n');
}
function generateServerConfig(config) {
    const normalizedUrl = config.instanceUrl.replace(/\/+$/, '').replace(/\/api\/v4$/i, '');
    const env = {
        GITLAB_API_URL: normalizedUrl,
        GITLAB_TOKEN: config.token,
    };
    const presetName = types_1.ROLE_PRESETS[config.role];
    if (presetName) {
        env.GITLAB_MCP_PRESET = presetName;
    }
    if (config.readOnly) {
        env.GITLAB_READ_ONLY_MODE = 'true';
    }
    return {
        command: 'npx',
        args: ['-y', '@structured-world/gitlab-mcp@latest'],
        env,
    };
}
function generateMcpServersJson(config, serverName = 'gitlab') {
    const serverConfig = generateServerConfig(config);
    const mcpServers = {
        mcpServers: {
            [serverName]: serverConfig,
        },
    };
    return JSON.stringify(mcpServers, null, 2);
}
function generateClaudeCodeCommand(config, serverName = 'gitlab') {
    const serverConfig = generateServerConfig(config);
    const envFlags = Object.entries(serverConfig.env)
        .map(([key, value]) => `--env ${key}="${shellEscape(value)}"`)
        .join(' ');
    return `claude mcp add ${serverName} ${serverConfig.command} ${serverConfig.args.join(' ')} ${envFlags}`;
}
function generateClientConfig(config) {
    const clientInfo = types_1.MCP_CLIENT_INFO[config.client];
    if (config.client === 'claude-code') {
        return {
            type: 'cli',
            content: generateMcpServersJson(config),
            cliCommand: generateClaudeCodeCommand(config),
            configPath: clientInfo.configPath,
        };
    }
    if (config.client !== 'generic') {
        return {
            type: 'json',
            content: generateMcpServersJson(config),
            configPath: clientInfo.configPath,
        };
    }
    return {
        type: 'instructions',
        content: generateMcpServersJson(config),
    };
}
function generateClaudeDeepLink(config, serverName = 'gitlab') {
    const serverConfig = generateServerConfig(config);
    const configObject = {
        name: serverName,
        ...serverConfig,
    };
    const base64Config = Buffer.from(JSON.stringify(configObject))
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    return `claude://settings/mcp/add?config=${base64Config}`;
}
//# sourceMappingURL=config-generator.js.map