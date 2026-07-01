import { GitLabTier as InternalTier } from '../services/GitLabVersionDetector.js';
export type GitLabTier = 'Free' | 'Premium' | 'Ultimate';
export interface StructuredError {
    error_code: string;
    tool: string;
    action: string;
    message: string;
    suggested_fix?: string;
}
export interface ActionValidationError extends StructuredError {
    error_code: 'MISSING_REQUIRED_FIELD' | 'INVALID_ACTION' | 'FIELD_NOT_ALLOWED' | 'TYPE_MISMATCH' | 'VALIDATION_ERROR';
    missing_fields?: string[];
    invalid_fields?: Array<{
        field: string;
        expected: string;
        received: string;
    }>;
    valid_actions?: string[];
    action_required_fields?: Record<string, string[]>;
}
export interface TierAlternative {
    action: string;
    description: string;
    available_on: GitLabTier;
}
export interface TierRestrictedError extends StructuredError {
    error_code: 'TIER_RESTRICTED';
    http_status: number;
    tier_required: GitLabTier;
    current_tier?: GitLabTier;
    feature_name: string;
    alternatives?: TierAlternative[];
    docs_url?: string;
    upgrade_url?: string;
}
export interface PermissionDeniedError extends StructuredError {
    error_code: 'PERMISSION_DENIED';
    http_status: number;
    required_access?: string;
    alternatives?: TierAlternative[];
}
export interface NotFoundError extends StructuredError {
    error_code: 'NOT_FOUND';
    http_status: number;
    resource_type?: string;
    resource_id?: string;
}
export interface ApiError extends StructuredError {
    error_code: 'API_ERROR' | 'RATE_LIMITED' | 'SERVER_ERROR';
    http_status: number;
    gitlab_error?: string;
}
export interface VersionRestrictedError extends StructuredError {
    error_code: 'VERSION_RESTRICTED';
    widget: string;
    parameter: string;
    required_version: string;
    detected_version: string;
    required_tier?: GitLabTier;
    current_tier?: GitLabTier;
    docs_url?: string;
}
export interface TimeoutError extends StructuredError {
    error_code: 'TIMEOUT';
    timeout_ms: number;
    retryable: boolean;
}
export type GitLabStructuredError = ActionValidationError | TierRestrictedError | VersionRestrictedError | PermissionDeniedError | NotFoundError | ApiError | TimeoutError | ConnectionFailedError;
export declare function normalizeTier(tier: string | InternalTier): GitLabTier;
export interface GitLabApiErrorResponse {
    status: number;
    message?: string;
    error?: string;
    error_description?: string;
}
export declare function handleGitLabError(error: GitLabApiErrorResponse, tool: string, action: string, toolArgs?: Record<string, unknown>): GitLabStructuredError;
export declare function createMissingFieldsError(tool: string, action: string, missingFields: string[], actionRequiredFields?: Record<string, string[]>): ActionValidationError;
export declare function createInvalidActionError(tool: string, action: string, validActions: string[]): ActionValidationError;
export declare function createTypeMismatchError(tool: string, action: string, field: string, expected: string, received: string): ActionValidationError;
export declare function createValidationError(tool: string, action: string, zodMessage: string): ActionValidationError;
export declare function createTimeoutError(tool: string, action: string, timeoutMs: number, retryable?: boolean): TimeoutError;
export declare function createVersionRestrictedError(tool: string, action: string, widget: string, parameter: string, requiredVersion: string, detectedVersion: string, requiredTier?: GitLabTier, currentTier?: GitLabTier): VersionRestrictedError;
export declare function parseGitLabApiError(errorMessage: string): {
    status: number;
    message: string;
} | null;
export declare function parseTimeoutError(errorMessage: string): number | null;
export declare class StructuredToolError extends Error {
    readonly structuredError: GitLabStructuredError;
    constructor(structuredError: GitLabStructuredError);
    toJSON(): GitLabStructuredError;
}
export declare function isStructuredToolError(error: unknown): error is StructuredToolError;
export type ErrorCategory = 'transient' | 'auth' | 'permanent';
export declare function classifyError(error: unknown): ErrorCategory;
export interface ConnectionFailedError extends StructuredError {
    error_code: 'CONNECTION_FAILED';
    instance_url: string;
    reconnecting: boolean;
    auto_retry_enabled: boolean;
}
export declare function createConnectionFailedError(toolName: string, action: string, instanceUrl: string, connectionState: 'connecting' | 'disconnected' | 'failed'): ConnectionFailedError;
