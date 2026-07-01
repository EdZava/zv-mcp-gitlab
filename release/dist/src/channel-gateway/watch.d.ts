export type CiResourceKind = 'pipeline' | 'job' | 'deployment';
export declare const NON_FINAL: ReadonlySet<string>;
export declare const TERMINAL: Record<CiResourceKind, ReadonlySet<string>>;
export interface WatchTarget {
    kind: CiResourceKind;
    projectId: string;
    id: number;
}
export interface JobState {
    id: number;
    name: string;
    stage: string;
    status: string;
}
export interface JobTransition {
    name: string;
    from: string | null;
    to: string;
}
export interface WatchEvent {
    target: WatchTarget;
    pipelineState: string;
    jobs: JobState[];
    transitions: JobTransition[];
    terminal: boolean;
}
export declare function aggregateState(jobs: readonly JobState[]): string;
export declare function isTerminal(pipelineState: string): boolean;
export declare function diffJobs(prev: ReadonlyMap<string, string>, jobs: readonly JobState[]): JobTransition[];
export declare function snapshot(jobs: readonly JobState[]): Map<string, string>;
export declare function detectWatchable(projectId: string, result: unknown): WatchTarget | null;
export interface WatchDeps {
    pollJobs: (target: WatchTarget) => Promise<JobState[]>;
    emit: (event: WatchEvent) => void;
    onError?: (target: WatchTarget, error: unknown) => void;
    sleep?: (ms: number) => Promise<void>;
    now?: () => number;
}
export interface WatchOptions {
    pollMs?: number;
    maxDurationMs?: number;
}
export declare class WatchManager {
    private readonly active;
    private readonly deps;
    constructor(deps: WatchDeps);
    static key(t: WatchTarget): string;
    get size(): number;
    has(target: WatchTarget): boolean;
    watch(target: WatchTarget, opts?: WatchOptions): Promise<void>;
    cancel(target: WatchTarget): void;
    cancelAll(): void;
    private run;
}
