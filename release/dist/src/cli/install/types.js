"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INSTALLABLE_CLIENTS = exports.CLIENT_METADATA = void 0;
exports.CLIENT_METADATA = {
    'claude-desktop': {
        name: 'Claude Desktop',
        configPaths: {
            darwin: '~/Library/Application Support/Claude/claude_desktop_config.json',
            win32: '%APPDATA%/Claude/claude_desktop_config.json',
            linux: '~/.config/claude/claude_desktop_config.json',
        },
        supportsCliInstall: false,
        detectionMethod: 'app-bundle',
        appBundleId: 'com.anthropic.claudefordesktop',
    },
    'claude-code': {
        name: 'Claude Code',
        configPaths: {
            darwin: '~/.claude.json',
            win32: '%USERPROFILE%/.claude.json',
            linux: '~/.claude.json',
        },
        supportsCliInstall: true,
        cliCommand: 'claude',
        detectionMethod: 'cli-command',
    },
    cursor: {
        name: 'Cursor',
        configPaths: {
            darwin: '~/.cursor/mcp.json',
            win32: '%USERPROFILE%/.cursor/mcp.json',
            linux: '~/.cursor/mcp.json',
        },
        supportsCliInstall: false,
        detectionMethod: 'config-file',
    },
    'vscode-copilot': {
        name: 'VS Code (GitHub Copilot)',
        configPaths: {
            darwin: '.vscode/mcp.json',
            win32: '.vscode/mcp.json',
            linux: '.vscode/mcp.json',
        },
        supportsCliInstall: false,
        detectionMethod: 'config-file',
    },
    windsurf: {
        name: 'Windsurf',
        configPaths: {
            darwin: '~/.codeium/windsurf/mcp_config.json',
            win32: '%USERPROFILE%/.codeium/windsurf/mcp_config.json',
            linux: '~/.codeium/windsurf/mcp_config.json',
        },
        supportsCliInstall: false,
        detectionMethod: 'config-file',
    },
    cline: {
        name: 'Cline',
        configPaths: {
            darwin: '~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json',
            win32: '%APPDATA%/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json',
            linux: '~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json',
        },
        supportsCliInstall: false,
        detectionMethod: 'config-file',
    },
    'roo-code': {
        name: 'Roo Code',
        configPaths: {
            darwin: '~/.roo/mcp.json',
            win32: '%USERPROFILE%/.roo/mcp.json',
            linux: '~/.roo/mcp.json',
        },
        supportsCliInstall: false,
        detectionMethod: 'config-file',
    },
};
exports.INSTALLABLE_CLIENTS = [
    'claude-desktop',
    'claude-code',
    'cursor',
    'vscode-copilot',
    'windsurf',
    'cline',
    'roo-code',
];
//# sourceMappingURL=types.js.map