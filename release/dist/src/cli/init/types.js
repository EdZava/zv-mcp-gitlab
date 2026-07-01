"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCP_CLIENT_INFO = exports.ROLE_DESCRIPTIONS = exports.ROLE_PRESETS = void 0;
exports.ROLE_PRESETS = {
    developer: 'developer',
    'senior-developer': 'senior-dev',
    'tech-lead': 'full-access',
    devops: 'devops',
    reviewer: 'code-reviewer',
    readonly: 'readonly',
};
exports.ROLE_DESCRIPTIONS = {
    developer: 'Standard development workflow (issues, MRs, pipelines)',
    'senior-developer': 'Extended access with wiki, snippets, variables',
    'tech-lead': 'Full access to all features including admin tools',
    devops: 'CI/CD focused (pipelines, variables, deployments)',
    reviewer: 'Code review workflow (MRs, discussions, approvals)',
    readonly: 'Read-only access for monitoring and viewing',
};
exports.MCP_CLIENT_INFO = {
    'claude-desktop': {
        name: 'Claude Desktop',
        configPath: process.platform === 'darwin'
            ? '~/Library/Application Support/Claude/claude_desktop_config.json'
            : process.platform === 'win32'
                ? '%APPDATA%/Claude/claude_desktop_config.json'
                : '',
        supportsCliInstall: false,
    },
    'claude-code': {
        name: 'Claude Code',
        configPath: '~/.claude.json',
        supportsCliInstall: true,
    },
    cursor: {
        name: 'Cursor',
        configPath: '~/.cursor/mcp.json',
        supportsCliInstall: false,
    },
    'vscode-copilot': {
        name: 'VS Code (GitHub Copilot)',
        configPath: '.vscode/mcp.json',
        supportsCliInstall: false,
    },
    windsurf: {
        name: 'Windsurf',
        configPath: '~/.codeium/windsurf/mcp_config.json',
        supportsCliInstall: false,
    },
    cline: {
        name: 'Cline',
        configPath: '~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json',
        supportsCliInstall: false,
    },
    'roo-code': {
        name: 'Roo Code',
        configPath: '~/.roo/mcp.json',
        supportsCliInstall: false,
    },
    generic: {
        name: 'Other / Generic',
        configPath: '',
        supportsCliInstall: false,
    },
};
//# sourceMappingURL=types.js.map