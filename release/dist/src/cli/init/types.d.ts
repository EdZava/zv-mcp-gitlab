export type UserRole = 'developer' | 'senior-developer' | 'tech-lead' | 'devops' | 'reviewer' | 'readonly';
export type InstanceType = 'saas' | 'self-hosted';
export type McpClient = 'claude-desktop' | 'claude-code' | 'cursor' | 'vscode-copilot' | 'windsurf' | 'cline' | 'roo-code' | 'generic';
export interface WizardConfig {
    instanceUrl: string;
    token: string;
    role: UserRole;
    client: McpClient;
    readOnly: boolean;
    presetName?: string;
}
export interface ConnectionTestResult {
    success: boolean;
    username?: string;
    email?: string;
    isAdmin?: boolean;
    gitlabVersion?: string;
    error?: string;
}
export interface McpServerConfig {
    command: string;
    args: string[];
    env: Record<string, string>;
}
export declare const ROLE_PRESETS: Record<UserRole, string>;
export declare const ROLE_DESCRIPTIONS: Record<UserRole, string>;
export declare const MCP_CLIENT_INFO: Record<McpClient, {
    name: string;
    configPath: string;
    supportsCliInstall: boolean;
}>;
