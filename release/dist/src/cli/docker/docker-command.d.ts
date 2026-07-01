export type DockerSubcommand = 'status' | 'init' | 'start' | 'stop' | 'restart' | 'upgrade' | 'logs' | 'add-instance' | 'remove-instance';
export declare function parseDockerSubcommand(args: string[]): {
    subcommand: DockerSubcommand | undefined;
    subArgs: string[];
};
export declare function showStatus(): void;
export declare function initDocker(): Promise<void>;
export declare function dockerStart(): void;
export declare function dockerStop(): void;
export declare function dockerRestart(): void;
export declare function dockerUpgrade(): void;
export declare function dockerLogs(follow?: boolean, lines?: number): void;
export declare function dockerAddInstance(host?: string): Promise<void>;
export declare function dockerRemoveInstance(host: string): void;
export declare function runDockerCommand(args: string[]): Promise<void>;
