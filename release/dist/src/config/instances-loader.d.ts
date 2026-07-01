import { GitLabInstanceConfig } from './instances-schema.js';
export interface LoadedInstancesConfig {
    instances: GitLabInstanceConfig[];
    source: 'file' | 'env' | 'legacy' | 'none';
    sourceDetails: string;
}
export declare function loadInstancesConfig(): Promise<LoadedInstancesConfig>;
export declare function getInstanceByUrl(instances: GitLabInstanceConfig[], url: string): GitLabInstanceConfig | undefined;
export declare function isKnownInstance(instances: GitLabInstanceConfig[], url: string): boolean;
export declare function generateSampleConfig(format: 'yaml' | 'json'): string;
