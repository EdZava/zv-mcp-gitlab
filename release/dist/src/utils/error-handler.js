"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructuredToolError = void 0;
exports.normalizeTier = normalizeTier;
exports.handleGitLabError = handleGitLabError;
exports.createMissingFieldsError = createMissingFieldsError;
exports.createInvalidActionError = createInvalidActionError;
exports.createTypeMismatchError = createTypeMismatchError;
exports.createValidationError = createValidationError;
exports.createTimeoutError = createTimeoutError;
exports.createVersionRestrictedError = createVersionRestrictedError;
exports.parseGitLabApiError = parseGitLabApiError;
exports.parseTimeoutError = parseTimeoutError;
exports.isStructuredToolError = isStructuredToolError;
exports.classifyError = classifyError;
exports.createConnectionFailedError = createConnectionFailedError;
const ConnectionManager_js_1 = require("../services/ConnectionManager.js");
const version_js_1 = require("./version.js");
const FEATURE_METADATA = {
    workItems: {
        name: 'Work Items',
        requiredTier: 'Free',
        docsUrl: 'https://docs.gitlab.com/ee/user/project/work_items/',
        alternatives: [],
    },
    epics: {
        name: 'Epics',
        requiredTier: 'Premium',
        docsUrl: 'https://docs.gitlab.com/ee/user/group/epics/',
        alternatives: [
            {
                action: 'Use issues for tracking',
                description: 'Create issues with labels to organize work instead of epics',
                available_on: 'Free',
            },
            {
                action: 'Use milestones',
                description: 'Group related issues under milestones for release planning',
                available_on: 'Free',
            },
        ],
    },
    iterations: {
        name: 'Iterations',
        requiredTier: 'Premium',
        docsUrl: 'https://docs.gitlab.com/ee/user/group/iterations/',
        alternatives: [
            {
                action: 'Use milestones',
                description: 'Use milestones to track time-boxed work periods',
                available_on: 'Free',
            },
        ],
    },
    roadmaps: {
        name: 'Roadmaps',
        requiredTier: 'Premium',
        docsUrl: 'https://docs.gitlab.com/ee/user/group/roadmap/',
        alternatives: [
            {
                action: 'Use milestone views',
                description: 'View milestones timeline for basic roadmap functionality',
                available_on: 'Free',
            },
        ],
    },
    portfolioManagement: {
        name: 'Portfolio Management',
        requiredTier: 'Ultimate',
        docsUrl: 'https://docs.gitlab.com/ee/user/group/planning_hierarchy/',
        alternatives: [
            {
                action: 'Use group-level milestones',
                description: 'Track progress across projects using group milestones',
                available_on: 'Free',
            },
        ],
    },
    advancedSearch: {
        name: 'Advanced Search',
        requiredTier: 'Premium',
        docsUrl: 'https://docs.gitlab.com/ee/user/search/advanced_search.html',
        alternatives: [
            {
                action: 'Use basic search',
                description: 'Use standard GitLab search functionality',
                available_on: 'Free',
            },
        ],
    },
    codeReview: {
        name: 'Code Review Analytics',
        requiredTier: 'Premium',
        docsUrl: 'https://docs.gitlab.com/ee/user/analytics/code_review_analytics.html',
        alternatives: [],
    },
    securityDashboard: {
        name: 'Security Dashboard',
        requiredTier: 'Ultimate',
        docsUrl: 'https://docs.gitlab.com/ee/user/application_security/security_dashboard/',
        alternatives: [],
    },
    complianceFramework: {
        name: 'Compliance Framework',
        requiredTier: 'Ultimate',
        docsUrl: 'https://docs.gitlab.com/ee/user/project/settings/compliance_frameworks.html',
        alternatives: [],
    },
    valueStreamAnalytics: {
        name: 'Value Stream Analytics',
        requiredTier: 'Premium',
        docsUrl: 'https://docs.gitlab.com/ee/user/group/value_stream_analytics/',
        alternatives: [],
    },
    customFields: {
        name: 'Custom Fields',
        requiredTier: 'Ultimate',
        docsUrl: 'https://docs.gitlab.com/ee/user/project/working_with_projects.html',
        alternatives: [
            {
                action: 'Use labels',
                description: 'Use labels to categorize and tag work items',
                available_on: 'Free',
            },
        ],
    },
    okrs: {
        name: 'OKRs (Objectives and Key Results)',
        requiredTier: 'Ultimate',
        docsUrl: 'https://docs.gitlab.com/ee/user/okrs/',
        alternatives: [
            {
                action: 'Use issues with labels',
                description: 'Track objectives as issues with specific labels',
                available_on: 'Free',
            },
        ],
    },
    healthStatus: {
        name: 'Health Status',
        requiredTier: 'Ultimate',
        docsUrl: 'https://docs.gitlab.com/ee/user/project/issues/managing_issues.html#health-status',
        alternatives: [
            {
                action: 'Use labels for status',
                description: "Create labels like 'on-track', 'at-risk', 'needs-attention'",
                available_on: 'Free',
            },
        ],
    },
    weight: {
        name: 'Issue Weight',
        requiredTier: 'Premium',
        docsUrl: 'https://docs.gitlab.com/ee/user/project/issues/issue_weight.html',
        alternatives: [
            {
                action: 'Use labels for estimation',
                description: "Create labels like 'size::S', 'size::M', 'size::L' for estimation",
                available_on: 'Free',
            },
        ],
    },
    multiLevelEpics: {
        name: 'Multi-level Epics',
        requiredTier: 'Ultimate',
        docsUrl: 'https://docs.gitlab.com/ee/user/group/epics/manage_epics.html#multi-level-child-epics',
        alternatives: [
            {
                action: 'Use flat epics',
                description: 'Organize work with single-level epics (Premium)',
                available_on: 'Premium',
            },
        ],
    },
    serviceDesk: {
        name: 'Service Desk',
        requiredTier: 'Premium',
        docsUrl: 'https://docs.gitlab.com/ee/user/project/service_desk/',
        alternatives: [],
    },
    requirements: {
        name: 'Requirements Management',
        requiredTier: 'Ultimate',
        docsUrl: 'https://docs.gitlab.com/ee/user/project/requirements/',
        alternatives: [
            {
                action: 'Use issues',
                description: 'Track requirements as issues with a dedicated label',
                available_on: 'Free',
            },
        ],
    },
    qualityManagement: {
        name: 'Quality Management',
        requiredTier: 'Ultimate',
        docsUrl: 'https://docs.gitlab.com/ee/ci/testing/',
        alternatives: [],
    },
    timeTracking: {
        name: 'Time Tracking',
        requiredTier: 'Premium',
        docsUrl: 'https://docs.gitlab.com/ee/user/project/time_tracking.html',
        alternatives: [],
    },
    crmContacts: {
        name: 'CRM Contacts',
        requiredTier: 'Ultimate',
        docsUrl: 'https://docs.gitlab.com/ee/user/crm/',
        alternatives: [],
    },
    vulnerabilities: {
        name: 'Vulnerability Management',
        requiredTier: 'Ultimate',
        docsUrl: 'https://docs.gitlab.com/ee/user/application_security/vulnerabilities/',
        alternatives: [],
    },
    errorTracking: {
        name: 'Error Tracking',
        requiredTier: 'Ultimate',
        docsUrl: 'https://docs.gitlab.com/ee/operations/error_tracking.html',
        alternatives: [],
    },
    designManagement: {
        name: 'Design Management',
        requiredTier: 'Premium',
        docsUrl: 'https://docs.gitlab.com/ee/user/project/issues/design_management.html',
        alternatives: [],
    },
    linkedResources: {
        name: 'Linked Resources',
        requiredTier: 'Premium',
        docsUrl: 'https://docs.gitlab.com/ee/user/project/issues/related_issues.html',
        alternatives: [],
    },
    emailParticipants: {
        name: 'Email Participants',
        requiredTier: 'Premium',
        docsUrl: 'https://docs.gitlab.com/ee/user/project/issues/managing_issues.html#add-an-email-participant',
        alternatives: [],
    },
};
function detectTierRestriction(tool, action, toolArgs) {
    let connectionManager;
    try {
        connectionManager = ConnectionManager_js_1.ConnectionManager.getInstance();
    }
    catch {
        return null;
    }
    const currentTierRaw = connectionManager.getTier();
    const currentTier = normalizeTier(currentTierRaw);
    if (tool === 'browse_work_items' || tool === 'manage_work_item') {
        const restriction = checkWorkItemTypeRestriction(connectionManager, toolArgs, currentTier);
        if (restriction)
            return restriction;
    }
    if (tool === 'browse_iterations') {
        if (!connectionManager.isFeatureAvailable('iterations')) {
            return createRestrictionInfo('iterations', currentTier);
        }
    }
    if ((tool === 'browse_webhooks' || tool === 'manage_webhook') && toolArgs?.scope === 'group') {
        if (!connectionManager.isFeatureAvailable('serviceDesk')) {
            return {
                feature: 'serviceDesk',
                name: 'Group Webhooks',
                requiredTier: 'Premium',
                currentTier,
                alternatives: [
                    {
                        action: 'Use project-level webhooks',
                        description: 'Configure webhooks on individual projects instead',
                        available_on: 'Free',
                    },
                ],
                docsUrl: 'https://docs.gitlab.com/ee/user/project/integrations/webhooks.html',
            };
        }
    }
    return null;
}
function checkWorkItemTypeRestriction(connectionManager, toolArgs, currentTier) {
    if (!toolArgs)
        return null;
    const types = extractWorkItemTypes(toolArgs);
    if (types.includes('EPIC')) {
        if (!connectionManager.isFeatureAvailable('epics')) {
            return createRestrictionInfo('epics', currentTier);
        }
    }
    if (types.includes('OBJECTIVE') || types.includes('KEY_RESULT')) {
        if (!connectionManager.isFeatureAvailable('okrs')) {
            return createRestrictionInfo('okrs', currentTier);
        }
    }
    if (types.includes('REQUIREMENT')) {
        if (!connectionManager.isFeatureAvailable('requirements')) {
            return createRestrictionInfo('requirements', currentTier);
        }
    }
    return null;
}
function extractWorkItemTypes(toolArgs) {
    const types = [];
    if (Array.isArray(toolArgs.types)) {
        types.push(...toolArgs.types.map((t) => String(t).toUpperCase()));
    }
    if (typeof toolArgs.workItemType === 'string') {
        types.push(toolArgs.workItemType.toUpperCase());
    }
    if (typeof toolArgs.type === 'string') {
        types.push(toolArgs.type.toUpperCase());
    }
    return types;
}
function createRestrictionInfo(feature, currentTier) {
    const metadata = FEATURE_METADATA[feature];
    return {
        feature,
        name: metadata.name,
        requiredTier: metadata.requiredTier,
        currentTier,
        alternatives: metadata.alternatives,
        docsUrl: metadata.docsUrl,
    };
}
function normalizeTier(tier) {
    const lower = tier.toLowerCase();
    if (lower === 'ultimate' || lower === 'gold')
        return 'Ultimate';
    if (lower === 'premium' || lower === 'silver')
        return 'Premium';
    return 'Free';
}
function handleGitLabError(error, tool, action, toolArgs) {
    const { status, message, error: errorMsg, error_description } = error;
    const rawMessage = message ?? errorMsg ?? error_description ?? 'Unknown error';
    if (status === 403) {
        const tierRestriction = detectTierRestriction(tool, action, toolArgs);
        if (tierRestriction) {
            return createTierRestrictedError(tool, action, status, tierRestriction);
        }
        return createPermissionDeniedError(tool, action, status, rawMessage);
    }
    if (status === 404) {
        return createNotFoundError(tool, action, status, rawMessage);
    }
    if (status === 429) {
        return {
            error_code: 'RATE_LIMITED',
            tool,
            action,
            http_status: status,
            message: 'Rate limit exceeded. Please wait before retrying.',
            suggested_fix: 'Wait a few minutes and try again, or reduce request frequency',
            gitlab_error: rawMessage,
        };
    }
    if (status >= 500) {
        return {
            error_code: 'SERVER_ERROR',
            tool,
            action,
            http_status: status,
            message: 'GitLab server error. The service may be temporarily unavailable.',
            suggested_fix: 'Wait and retry. If the problem persists, check GitLab status page.',
            gitlab_error: rawMessage,
        };
    }
    return {
        error_code: 'API_ERROR',
        tool,
        action,
        http_status: status,
        message: rawMessage,
        suggested_fix: 'Check the GitLab API documentation for this endpoint',
        gitlab_error: rawMessage,
    };
}
function createTierRestrictedError(tool, action, status, restriction) {
    return {
        error_code: 'TIER_RESTRICTED',
        tool,
        action,
        http_status: status,
        tier_required: restriction.requiredTier,
        current_tier: restriction.currentTier,
        feature_name: restriction.name,
        message: `${restriction.name} requires GitLab ${restriction.requiredTier} or higher`,
        suggested_fix: restriction.alternatives.length > 0
            ? `Upgrade to GitLab ${restriction.requiredTier}, or use one of the alternatives`
            : `Upgrade to GitLab ${restriction.requiredTier} to access this feature`,
        alternatives: restriction.alternatives.length > 0 ? restriction.alternatives : undefined,
        docs_url: restriction.docsUrl,
        upgrade_url: 'https://about.gitlab.com/pricing/',
    };
}
function createPermissionDeniedError(tool, action, status, rawMessage) {
    const baseSuggestedFix = 'Check your access level for this project/group. Reporter access or higher may be required.';
    const suggestedFix = rawMessage && rawMessage !== 'Unknown error' && !rawMessage.includes('403')
        ? `${baseSuggestedFix} GitLab message: ${rawMessage}`
        : baseSuggestedFix;
    return {
        error_code: 'PERMISSION_DENIED',
        tool,
        action,
        http_status: status,
        message: "You don't have permission for this action",
        suggested_fix: suggestedFix,
        alternatives: [
            {
                action: 'Verify your access level',
                description: 'Check your role in the project settings or contact a project maintainer',
                available_on: 'Free',
            },
        ],
    };
}
function createNotFoundError(tool, action, status, rawMessage) {
    let resourceType;
    let resourceId;
    const lowerMessage = rawMessage.toLowerCase();
    if (lowerMessage.includes('project')) {
        resourceType = 'project';
    }
    else if (lowerMessage.includes('merge request') || lowerMessage.includes('mr')) {
        resourceType = 'merge_request';
    }
    else if (lowerMessage.includes('issue')) {
        resourceType = 'issue';
    }
    else if (lowerMessage.includes('pipeline')) {
        resourceType = 'pipeline';
    }
    else if (lowerMessage.includes('branch')) {
        resourceType = 'branch';
    }
    else if (lowerMessage.includes('user')) {
        resourceType = 'user';
    }
    const pathMatch = rawMessage.match(/['"]([a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)+)['"]/);
    if (pathMatch) {
        resourceId = pathMatch[1];
    }
    if (!resourceId) {
        const contextMatch = rawMessage.match(/(?:project|issue|merge.?request|mr|pipeline|branch|user|group)\s+#?(\d+)/i);
        if (contextMatch) {
            resourceId = contextMatch[1];
        }
        else {
            const longIdMatch = rawMessage.match(/\b(\d{4,})\b/);
            if (longIdMatch) {
                resourceId = longIdMatch[1];
            }
        }
    }
    return {
        error_code: 'NOT_FOUND',
        tool,
        action,
        http_status: status,
        message: "Resource not found or you don't have access to it",
        suggested_fix: 'Verify the ID/path is correct and you have at least Reporter access to the project',
        resource_type: resourceType,
        resource_id: resourceId,
    };
}
function createMissingFieldsError(tool, action, missingFields, actionRequiredFields) {
    return {
        error_code: 'MISSING_REQUIRED_FIELD',
        tool,
        action,
        message: `Missing required field(s): ${missingFields.join(', ')}`,
        missing_fields: missingFields,
        suggested_fix: `Add required fields: ${missingFields.join(', ')}`,
        action_required_fields: actionRequiredFields,
    };
}
function createInvalidActionError(tool, action, validActions) {
    return {
        error_code: 'INVALID_ACTION',
        tool,
        action,
        message: `Invalid action '${action}'. Valid actions are: ${validActions.join(', ')}`,
        suggested_fix: `Use one of the valid actions: ${validActions.join(', ')}`,
        valid_actions: validActions,
    };
}
function createTypeMismatchError(tool, action, field, expected, received) {
    return {
        error_code: 'TYPE_MISMATCH',
        tool,
        action,
        message: `Type mismatch for field '${field}': expected ${expected}, got ${received}`,
        invalid_fields: [{ field, expected, received }],
        suggested_fix: `Provide a ${expected} value for '${field}'`,
    };
}
function createValidationError(tool, action, zodMessage) {
    return {
        error_code: 'VALIDATION_ERROR',
        tool,
        action,
        message: zodMessage,
        suggested_fix: 'Check the tool documentation for correct parameter format',
    };
}
function createTimeoutError(tool, action, timeoutMs, retryable = false) {
    const retryHint = retryable
        ? ' This is a read-only operation - you can safely retry.'
        : ' This is a write operation - check if it completed before retrying.';
    return {
        error_code: 'TIMEOUT',
        tool,
        action,
        timeout_ms: timeoutMs,
        retryable,
        message: `Request timed out after ${timeoutMs}ms`,
        suggested_fix: `The GitLab server is slow to respond. Try again later or increase GITLAB_API_HEADERS_TIMEOUT_MS / GITLAB_API_BODY_TIMEOUT_MS / GITLAB_TOOL_TIMEOUT_MS.${retryHint}`,
    };
}
function createVersionRestrictedError(tool, action, widget, parameter, requiredVersion, detectedVersion, requiredTier, currentTier) {
    const tierHierarchy = { Free: 0, Premium: 1, Ultimate: 2 };
    const isTierInsufficient = requiredTier && currentTier && tierHierarchy[requiredTier] > tierHierarchy[currentTier];
    const isVersionSufficient = (0, version_js_1.parseVersion)(detectedVersion) >= (0, version_js_1.parseVersion)(requiredVersion);
    let suggestedFix;
    let message;
    if (isTierInsufficient && isVersionSufficient) {
        message = `Widget '${widget}' (parameter '${parameter}') requires GitLab ${requiredTier} tier (current: ${currentTier})`;
        suggestedFix = `Upgrade to GitLab ${requiredTier} tier to use the '${parameter}' parameter`;
    }
    else if (isTierInsufficient) {
        message = `Widget '${widget}' (parameter '${parameter}') requires GitLab >= ${requiredVersion} and ${requiredTier} tier (detected: ${detectedVersion}, tier: ${currentTier})`;
        suggestedFix = `Upgrade GitLab to version ${requiredVersion}+ and ${requiredTier} tier to use the '${parameter}' parameter`;
    }
    else {
        message = `Widget '${widget}' (parameter '${parameter}') requires GitLab >= ${requiredVersion} (detected: ${detectedVersion})`;
        suggestedFix = `Upgrade GitLab to version ${requiredVersion} or higher to use the '${parameter}' parameter`;
    }
    return {
        error_code: 'VERSION_RESTRICTED',
        tool,
        action,
        widget,
        parameter,
        required_version: requiredVersion,
        detected_version: detectedVersion,
        required_tier: isTierInsufficient ? requiredTier : undefined,
        current_tier: isTierInsufficient ? currentTier : undefined,
        message,
        suggested_fix: suggestedFix,
        docs_url: 'https://docs.gitlab.com/ee/user/project/work_items/',
    };
}
function parseGitLabApiError(errorMessage) {
    const match = errorMessage.match(/GitLab API error:\s*(\d+)(?:\s+(.+?))?(?:\s+-\s+(.*))?$/);
    if (!match)
        return null;
    const status = parseInt(match[1], 10);
    const statusText = match[2]?.trim() ?? '';
    const details = match[3]?.trim() ?? '';
    let message;
    if (statusText && details) {
        message = `${status} ${statusText} - ${details}`;
    }
    else if (statusText) {
        message = `${status} ${statusText}`;
    }
    else if (details) {
        message = `${status} - ${details}`;
    }
    else {
        message = `${status}`;
    }
    return { status, message };
}
function parseTimeoutError(errorMessage) {
    const match = errorMessage.match(/GitLab API timeout after (\d+)ms/);
    return match ? parseInt(match[1], 10) : null;
}
class StructuredToolError extends Error {
    structuredError;
    constructor(structuredError) {
        super(structuredError.message);
        this.name = 'StructuredToolError';
        this.structuredError = structuredError;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, StructuredToolError);
        }
    }
    toJSON() {
        return this.structuredError;
    }
}
exports.StructuredToolError = StructuredToolError;
function isStructuredToolError(error) {
    return error instanceof StructuredToolError;
}
const TRANSIENT_ERROR_CODES = new Set([
    'ECONNREFUSED',
    'ECONNRESET',
    'ECONNABORTED',
    'ETIMEDOUT',
    'ENETUNREACH',
    'EHOSTUNREACH',
    'EPIPE',
    'EAI_AGAIN',
    'UND_ERR_CONNECT_TIMEOUT',
    'UND_ERR_HEADERS_TIMEOUT',
    'UND_ERR_BODY_TIMEOUT',
    'UND_ERR_SOCKET',
]);
function classifyError(error) {
    if (!(error instanceof Error)) {
        return 'permanent';
    }
    const message = error.message.toLowerCase();
    const code = error.code;
    const causeCode = error.cause?.code;
    const effectiveCode = code ?? causeCode;
    if (effectiveCode && TRANSIENT_ERROR_CODES.has(effectiveCode)) {
        return 'transient';
    }
    const parsed = parseGitLabApiError(error.message);
    if (parsed) {
        const { status } = parsed;
        if (status === 401) {
            return 'auth';
        }
        if (status === 403) {
            return 'permanent';
        }
        if (status === 408 || status === 429 || status >= 500) {
            return 'transient';
        }
        return 'permanent';
    }
    if (message.includes('timed out') ||
        message.includes('request timeout') ||
        message.includes('connect timeout') ||
        message.includes('initialization timeout') ||
        message.includes('socket hang up') ||
        message.includes('network error') ||
        message.includes('health check failed') ||
        message.includes('econnrefused') ||
        message.includes('econnreset')) {
        return 'transient';
    }
    return 'permanent';
}
function createConnectionFailedError(toolName, action, instanceUrl, connectionState) {
    const reconnecting = connectionState === 'connecting';
    const autoRetryEnabled = connectionState !== 'failed';
    let message;
    if (connectionState === 'failed') {
        message =
            `GitLab instance ${instanceUrl} connection failed due to a permanent authentication, ` +
                `permission, or configuration error. Automatic reconnection is disabled.`;
    }
    else if (connectionState === 'connecting') {
        message = `GitLab instance ${instanceUrl} is not ready yet. A connection attempt is in progress.`;
    }
    else {
        message = `GitLab instance ${instanceUrl} is currently unreachable. Connection will be retried automatically.`;
    }
    const suggestedFix = connectionState === 'failed'
        ? 'Check authentication/authorization, permissions or tier access, and the configured GitLab instance URL. ' +
            "Use manage_context with action 'whoami' to check connection status."
        : 'Check network connectivity, VPN status, or GitLab instance availability. ' +
            "Use manage_context with action 'whoami' to check connection status.";
    return {
        error_code: 'CONNECTION_FAILED',
        tool: toolName,
        action,
        instance_url: instanceUrl,
        reconnecting,
        auto_retry_enabled: autoRetryEnabled,
        message,
        suggested_fix: suggestedFix,
    };
}
//# sourceMappingURL=error-handler.js.map