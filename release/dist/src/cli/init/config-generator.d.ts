import { McpServerConfig, WizardConfig } from './types';
export declare function generateServerConfig(config: WizardConfig): McpServerConfig;
export declare function generateMcpServersJson(config: WizardConfig, serverName?: string): string;
export declare function generateClaudeCodeCommand(config: WizardConfig, serverName?: string): string;
export declare function generateClientConfig(config: WizardConfig): {
    type: 'json' | 'cli' | 'instructions';
    content: string;
    configPath?: string;
    cliCommand?: string;
};
export declare function generateClaudeDeepLink(config: WizardConfig, serverName?: string): string;
