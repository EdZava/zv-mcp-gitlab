import { McpClient, McpServerConfig } from '../init/types';
export type InstallableClient = Exclude<McpClient, 'generic'>;
export interface ClientDetectionResult {
    client: InstallableClient;
    detected: boolean;
    configPath?: string;
    configExists?: boolean;
    alreadyConfigured?: boolean;
    method: 'config-file' | 'cli-command' | 'app-bundle';
}
export interface InstallOptions {
    clients?: InstallableClient[];
    all?: boolean;
    showOnly?: boolean;
    force?: boolean;
    serverConfig: McpServerConfig;
    instanceUrl: string;
    readOnly?: boolean;
    presetName?: string;
}
export interface InstallResult {
    client: InstallableClient;
    success: boolean;
    error?: string;
    backupPath?: string;
    configPath?: string;
    wasAlreadyConfigured?: boolean;
}
export interface BackupOptions {
    configPath: string;
    backupDir?: string;
}
export interface BackupResult {
    created: boolean;
    backupPath?: string;
    error?: string;
}
export interface ClientConfigPaths {
    darwin?: string;
    win32?: string;
    linux?: string;
}
export interface ClientMetadata {
    name: string;
    configPaths: ClientConfigPaths;
    supportsCliInstall: boolean;
    cliCommand?: string;
    detectionMethod: 'config-file' | 'cli-command' | 'app-bundle';
    appBundleId?: string;
}
export declare const CLIENT_METADATA: Record<InstallableClient, ClientMetadata>;
export declare const INSTALLABLE_CLIENTS: InstallableClient[];
