import type { JobState, WatchEvent } from './watch';
export declare function parseToolResult(result: unknown): unknown;
export declare function parseJobs(result: unknown): JobState[];
export declare function parseDeployments(result: unknown): JobState[];
export declare function formatEvent(event: WatchEvent): {
    content: string;
    meta: Record<string, string>;
};
