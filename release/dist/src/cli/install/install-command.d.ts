import { InstallableClient, InstallResult } from './types';
import { McpServerConfig } from '../init/types';
export interface InstallFlags {
    claudeDesktop?: boolean;
    claudeCode?: boolean;
    cursor?: boolean;
    vscode?: boolean;
    cline?: boolean;
    rooCode?: boolean;
    windsurf?: boolean;
    all?: boolean;
    show?: boolean;
    force?: boolean;
}
export declare function parseInstallFlags(args: string[]): InstallFlags;
export declare function getClientsFromFlags(flags: InstallFlags): InstallableClient[];
export declare function runInstallWizard(serverConfig: McpServerConfig, flags?: InstallFlags): Promise<InstallResult[]>;
export declare function runInstallCommand(serverConfig: McpServerConfig, flags: InstallFlags): Promise<InstallResult[]>;
export declare function buildServerConfigFromEnv(): McpServerConfig;
