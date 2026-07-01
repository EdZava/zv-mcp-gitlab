import { ProjectConfig } from './profiles';
export interface CliArgs {
    profileName?: string;
    noProjectConfig: boolean;
    showProjectConfig: boolean;
    auto: boolean;
    cwd?: string;
    dryRun: boolean;
    remoteName?: string;
    setup: boolean;
    setupMode?: 'local' | 'server' | 'configure-existing';
    init: boolean;
    install: boolean;
    installArgs: string[];
    docker: boolean;
    dockerArgs: string[];
}
export declare function parseCliArgs(argv?: string[]): CliArgs;
export declare function displayProjectConfig(config: ProjectConfig | null, output?: (msg: string) => void): void;
