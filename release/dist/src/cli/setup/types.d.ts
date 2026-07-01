import { InstallableClient, ClientDetectionResult } from '../install/types';
import { DockerStatusResult, GitLabInstance } from '../docker/types';
export type SetupMode = 'configure-existing' | 'local' | 'server';
export type TransportMode = 'stdio' | 'sse';
export type ToolConfigMode = 'preset' | 'manual' | 'advanced';
export type DockerDeploymentType = 'standalone' | 'external-db' | 'compose-bundle';
export interface DiscoveryResult {
    clients: {
        detected: ClientDetectionResult[];
        configured: ClientDetectionResult[];
        unconfigured: ClientDetectionResult[];
    };
    docker: DockerStatusResult;
    summary: {
        hasExistingSetup: boolean;
        clientCount: number;
        configuredCount: number;
        dockerRunning: boolean;
        containerExists: boolean;
    };
}
export interface ToolCategory {
    id: string;
    name: string;
    description: string;
    tools: string[];
    defaultEnabled: boolean;
}
export interface ToolConfig {
    mode: ToolConfigMode;
    preset?: string;
    enabledCategories?: string[];
    envOverrides?: Record<string, string>;
}
export interface SetupResult {
    success: boolean;
    mode?: SetupMode;
    configuredClients?: InstallableClient[];
    dockerConfig?: {
        port: number;
        deploymentType: DockerDeploymentType;
        instances: GitLabInstance[];
    };
    error?: string;
}
export interface PresetDefinition {
    id: string;
    name: string;
    description: string;
    enabledCategories: string[];
}
export interface AdvancedSettingsGroup {
    id: string;
    name: string;
    settings: AdvancedSetting[];
}
export interface AdvancedSetting {
    envVar: string;
    label: string;
    description: string;
    defaultValue: string;
    type: 'text' | 'boolean' | 'select' | 'password';
    options?: {
        value: string;
        label: string;
    }[];
    sensitive?: boolean;
}
