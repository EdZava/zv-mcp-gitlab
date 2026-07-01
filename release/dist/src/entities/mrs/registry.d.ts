import { ToolRegistry, EnhancedToolDefinition } from '../../types';
export interface MergeBlockedResponse {
    error: true;
    message: string;
    detailed_merge_status: string;
    merge_status: string;
    has_conflicts: boolean;
    blocking_discussions_resolved: boolean;
    hint: string;
    is_retryable: boolean;
    can_auto_merge: boolean;
    suggested_action: string;
}
export declare const RETRYABLE_MERGE_STATUSES: readonly ["checking", "unchecked", "ci_still_running", "ci_must_pass", "approvals_syncing"];
export declare const AUTO_MERGE_ELIGIBLE_STATUSES: readonly ["ci_still_running", "ci_must_pass"];
export declare function getMergeStatusHint(status: string): string;
export declare function getSuggestedAction(isRetryable: boolean, canAutoMerge: boolean): string;
export declare function flattenPositionToFormFields(body: Record<string, unknown>, position: Record<string, unknown>): void;
export declare const mrsToolRegistry: ToolRegistry;
export declare function getMrsReadOnlyToolNames(): string[];
export declare function getMrsToolDefinitions(): EnhancedToolDefinition[];
export declare function getFilteredMrsTools(readOnlyMode?: boolean): EnhancedToolDefinition[];
