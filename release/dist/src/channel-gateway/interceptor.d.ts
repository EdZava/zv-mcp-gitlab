import { type WatchEvent } from './watch';
export interface InterceptorDeps {
    forward: (name: string, args: unknown) => Promise<unknown>;
    emit: (event: WatchEvent) => void;
    pollMs?: number;
    maxDurationMs?: number;
}
export declare function extractProjectId(args: unknown): string;
export declare class Interceptor {
    private readonly deps;
    private readonly watches;
    private readonly pollMs;
    private readonly maxDurationMs;
    constructor(deps: InterceptorDeps);
    get activeWatches(): number;
    private pollJobs;
    handleCall(name: string, args: unknown): Promise<unknown>;
    shutdown(): void;
}
