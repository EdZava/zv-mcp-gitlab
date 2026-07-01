export type ContainerRuntime = 'docker' | 'podman';
export interface ContainerRuntimeInfo {
    runtime: ContainerRuntime;
    runtimeCmd: string;
    runtimeAvailable: boolean;
    composeCmd: string[] | null;
    runtimeVersion?: string;
}
export type ContainerStatus = 'running' | 'stopped' | 'paused' | 'restarting' | 'created' | 'exited' | 'dead';
export interface ContainerInfo {
    id: string;
    name: string;
    image: string;
    status: ContainerStatus;
    ports: string[];
    created: string;
    uptime?: string;
}
export interface GitLabInstanceOAuth {
    clientId: string;
    clientSecretEnv: string;
}
export interface GitLabInstance {
    host: string;
    name: string;
    oauth?: GitLabInstanceOAuth;
    defaultPreset?: string;
}
export interface DockerConfig {
    port: number;
    deploymentType?: 'standalone' | 'external-db' | 'compose-bundle';
    oauthEnabled: boolean;
    oauthSessionSecret?: string;
    databaseUrl?: string;
    environment?: Record<string, string>;
    instances: GitLabInstance[];
    containerName: string;
    image: string;
}
export declare const DEFAULT_DOCKER_CONFIG: DockerConfig;
export interface DockerComposeService {
    image: string;
    container_name: string;
    ports: string[];
    environment: string[];
    volumes: string[];
    restart: string;
    depends_on?: string[];
}
export interface DockerComposeFile {
    version: string;
    services: Record<string, DockerComposeService>;
    volumes?: Record<string, object>;
}
export interface InstancesYaml {
    instances: Record<string, {
        name: string;
        oauth?: {
            client_id: string;
            client_secret_env: string;
        };
        default_preset?: string;
    }>;
}
export interface DockerCommandResult {
    success: boolean;
    output?: string;
    error?: string;
}
export interface DockerStatusResult {
    dockerInstalled: boolean;
    dockerRunning: boolean;
    composeInstalled: boolean;
    container?: ContainerInfo;
    instances: GitLabInstance[];
    runtime?: ContainerRuntimeInfo;
}
export declare const CONFIG_PATHS: {
    readonly darwin: "~/.config/gitlab-mcp";
    readonly win32: "%APPDATA%/gitlab-mcp";
    readonly linux: "~/.config/gitlab-mcp";
};
export declare function getConfigDir(): string;
