"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mrsToolRegistry = exports.AUTO_MERGE_ELIGIBLE_STATUSES = exports.RETRYABLE_MERGE_STATUSES = void 0;
exports.getMergeStatusHint = getMergeStatusHint;
exports.getSuggestedAction = getSuggestedAction;
exports.flattenPositionToFormFields = flattenPositionToFormFields;
exports.getMrsReadOnlyToolNames = getMrsReadOnlyToolNames;
exports.getMrsToolDefinitions = getMrsToolDefinitions;
exports.getFilteredMrsTools = getFilteredMrsTools;
const z = __importStar(require("zod"));
const picomatch_1 = __importDefault(require("picomatch"));
const schema_readonly_1 = require("./schema-readonly");
const schema_1 = require("./schema");
const gitlab_api_1 = require("../../utils/gitlab-api");
const projectIdentifier_1 = require("../../utils/projectIdentifier");
const utils_1 = require("../utils");
exports.RETRYABLE_MERGE_STATUSES = [
    'checking',
    'unchecked',
    'ci_still_running',
    'ci_must_pass',
    'approvals_syncing',
];
exports.AUTO_MERGE_ELIGIBLE_STATUSES = ['ci_still_running', 'ci_must_pass'];
function getMergeStatusHint(status) {
    const hints = {
        checking: 'Wait a moment and retry - GitLab is calculating mergeability',
        unchecked: 'Wait a moment and retry - GitLab has not checked mergeability yet',
        ci_must_pass: 'Pipeline must pass. Use merge_when_pipeline_succeeds: true for auto-merge, or wait for pipeline',
        ci_still_running: 'Pipeline is running. Use merge_when_pipeline_succeeds: true for auto-merge, or wait for completion',
        not_approved: 'MR requires approval before merging',
        approvals_syncing: 'Approvals are being synchronized - wait and retry',
        conflict: 'Resolve merge conflicts before merging',
        need_rebase: 'Rebase the source branch before merging',
        draft_status: "Remove draft status before merging by updating the title to remove any 'Draft:' or 'WIP:' prefix",
        discussions_not_resolved: 'Resolve all blocking discussions before merging',
        blocked_status: 'MR is blocked by another MR or issue',
        external_status_checks: 'External status checks are pending',
        jira_association_missing: 'Jira issue association is required',
        not_open: 'MR is not in open state - cannot merge closed or already merged MRs',
        mergeable: 'MR is ready to merge',
    };
    return hints[status] || `Check MR detailed status: ${status}`;
}
function getSuggestedAction(isRetryable, canAutoMerge) {
    if (canAutoMerge) {
        return 'Consider using merge_when_pipeline_succeeds: true to auto-merge when pipeline passes';
    }
    if (isRetryable) {
        return 'Wait a moment and retry the merge';
    }
    return 'Resolve the blocking condition before merging';
}
function flattenPositionToFormFields(body, position) {
    for (const [key, value] of Object.entries(position)) {
        if (value === undefined || value === null)
            continue;
        if (typeof value === 'object' && !Array.isArray(value)) {
            for (const [nestedKey, nestedValue] of Object.entries(value)) {
                if (nestedValue === undefined || nestedValue === null)
                    continue;
                if (typeof nestedValue === 'object' && !Array.isArray(nestedValue)) {
                    for (const [deepKey, deepValue] of Object.entries(nestedValue)) {
                        if (deepValue !== undefined && deepValue !== null) {
                            body[`position[${key}][${nestedKey}][${deepKey}]`] = deepValue;
                        }
                    }
                }
                else {
                    body[`position[${key}][${nestedKey}]`] = nestedValue;
                }
            }
        }
        else {
            body[`position[${key}]`] = value;
        }
    }
}
exports.mrsToolRegistry = new Map([
    [
        'browse_merge_requests',
        {
            name: 'browse_merge_requests',
            description: 'Find and inspect merge requests. Actions: list (filter by state/author/reviewer/labels/branch), get (MR details by IID or source branch), diffs (file-level changes with inline suggestions), compare (diff between any two refs), versions (list diff versions from pushes), version (get specific version with diffs). Related: manage_merge_request to create/update/merge.',
            inputSchema: z.toJSONSchema(schema_readonly_1.BrowseMergeRequestsSchema),
            requirements: {
                default: { tier: 'free', minVersion: '8.0' },
                actions: {
                    approvals: { tier: 'premium', minVersion: '10.6', notes: 'MR approvals' },
                },
            },
            gate: { envVar: 'USE_MRS', defaultValue: true },
            handler: async (args) => {
                const input = schema_readonly_1.BrowseMergeRequestsSchema.parse(args);
                (0, utils_1.assertActionAllowed)('browse_merge_requests', input.action);
                switch (input.action) {
                    case 'list': {
                        const { action: _action, project_id, ...rest } = input;
                        const query = (0, gitlab_api_1.toQuery)(rest, []);
                        const path = project_id
                            ? `projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}/merge_requests`
                            : `merge_requests`;
                        return gitlab_api_1.gitlab.get(path, { query });
                    }
                    case 'get': {
                        const { project_id, merge_request_iid, branch_name } = input;
                        const query = {};
                        if (input.include_diverged_commits_count !== undefined)
                            query.include_diverged_commits_count = input.include_diverged_commits_count;
                        if (input.include_rebase_in_progress !== undefined)
                            query.include_rebase_in_progress = input.include_rebase_in_progress;
                        if (merge_request_iid) {
                            return gitlab_api_1.gitlab.get(`projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}/merge_requests/${merge_request_iid}`, Object.keys(query).length > 0 ? { query } : undefined);
                        }
                        else if (branch_name) {
                            const result = await gitlab_api_1.gitlab.get(`projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}/merge_requests`, { query: { source_branch: branch_name, ...query } });
                            if (Array.isArray(result) && result.length > 0) {
                                return result[0];
                            }
                            throw new Error('No merge request found for branch');
                        }
                        throw new Error('Either merge_request_iid or branch_name must be provided');
                    }
                    case 'diffs': {
                        const { project_id, merge_request_iid, exclude_patterns, exclude_lockfiles, exclude_generated, } = input;
                        const query = {};
                        if (input.page !== undefined)
                            query.page = input.page;
                        if (input.per_page !== undefined)
                            query.per_page = input.per_page;
                        if (input.include_diverged_commits_count !== undefined)
                            query.include_diverged_commits_count = input.include_diverged_commits_count;
                        if (input.include_rebase_in_progress !== undefined)
                            query.include_rebase_in_progress = input.include_rebase_in_progress;
                        const response = await gitlab_api_1.gitlab.get(`projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}/merge_requests/${merge_request_iid}/changes`, { query });
                        const patterns = [];
                        if (exclude_patterns?.length) {
                            patterns.push(...exclude_patterns);
                        }
                        if (exclude_lockfiles) {
                            patterns.push(...schema_readonly_1.LOCKFILE_PATTERNS);
                        }
                        if (exclude_generated) {
                            patterns.push(...schema_readonly_1.GENERATED_PATTERNS);
                        }
                        if (patterns.length > 0 && Array.isArray(response.changes)) {
                            const originalCount = response.changes.length;
                            const matcher = (0, picomatch_1.default)(patterns);
                            response.changes = response.changes.filter((diff) => !matcher(diff.new_path) && !matcher(diff.old_path));
                            response._filtered = {
                                original_count: originalCount,
                                filtered_count: response.changes.length,
                                excluded_count: originalCount - response.changes.length,
                                patterns_applied: patterns,
                            };
                        }
                        return response;
                    }
                    case 'compare': {
                        const { project_id, from, to, straight } = input;
                        const query = {
                            from,
                            to,
                        };
                        if (straight !== undefined)
                            query.straight = straight;
                        return gitlab_api_1.gitlab.get(`projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}/repository/compare`, {
                            query,
                        });
                    }
                    case 'versions': {
                        const { action: _action, project_id, merge_request_iid, ...rest } = input;
                        const query = (0, gitlab_api_1.toQuery)(rest, []);
                        return gitlab_api_1.gitlab.get(`projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}/merge_requests/${merge_request_iid}/versions`, { query });
                    }
                    case 'version': {
                        const { project_id, merge_request_iid, version_id } = input;
                        return gitlab_api_1.gitlab.get(`projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}/merge_requests/${merge_request_iid}/versions/${version_id}`);
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
    [
        'browse_mr_discussions',
        {
            name: 'browse_mr_discussions',
            description: 'Read discussion threads and draft review notes on merge requests. Actions: list (all threads with resolution status), drafts (unpublished draft notes), draft (single draft details). Related: manage_mr_discussion to comment, manage_draft_notes to create drafts.',
            inputSchema: z.toJSONSchema(schema_readonly_1.BrowseMrDiscussionsSchema),
            requirements: { default: { tier: 'free', minVersion: '8.0' } },
            gate: { envVar: 'USE_MRS', defaultValue: true },
            handler: async (args) => {
                const input = schema_readonly_1.BrowseMrDiscussionsSchema.parse(args);
                (0, utils_1.assertActionAllowed)('browse_mr_discussions', input.action);
                switch (input.action) {
                    case 'list': {
                        const { action: _action, project_id, merge_request_iid, ...rest } = input;
                        const query = (0, gitlab_api_1.toQuery)(rest, []);
                        return gitlab_api_1.gitlab.get(`projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}/merge_requests/${merge_request_iid}/discussions`, { query });
                    }
                    case 'drafts': {
                        const { project_id, merge_request_iid } = input;
                        return gitlab_api_1.gitlab.get(`projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}/merge_requests/${merge_request_iid}/draft_notes`);
                    }
                    case 'draft': {
                        const { project_id, merge_request_iid, draft_note_id } = input;
                        return gitlab_api_1.gitlab.get(`projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}/merge_requests/${merge_request_iid}/draft_notes/${draft_note_id}`);
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
    [
        'manage_merge_request',
        {
            name: 'manage_merge_request',
            description: 'Create, update, merge, or approve merge requests. Actions: create (new MR from source to target), update (title/description/assignees/reviewers/labels), merge (into target branch), approve/unapprove (review approval), get_approval_state (current approvals). Related: browse_merge_requests for discovery.',
            inputSchema: z.toJSONSchema(schema_1.ManageMergeRequestSchema),
            requirements: {
                default: { tier: 'free', minVersion: '8.0' },
                actions: {
                    approve: { tier: 'premium', minVersion: '10.6', notes: 'MR approvals' },
                    unapprove: { tier: 'premium', minVersion: '10.6', notes: 'MR approvals' },
                    get_approval_state: { tier: 'premium', minVersion: '13.8', notes: 'MR approval state' },
                },
            },
            gate: { envVar: 'USE_MRS', defaultValue: true },
            handler: async (args) => {
                const input = schema_1.ManageMergeRequestSchema.parse(args);
                (0, utils_1.assertActionAllowed)('manage_merge_request', input.action);
                switch (input.action) {
                    case 'create': {
                        const { action: _action, project_id, ...body } = input;
                        const processedBody = {};
                        for (const [key, value] of Object.entries(body)) {
                            if (Array.isArray(value)) {
                                processedBody[key] = value.join(',');
                            }
                            else {
                                processedBody[key] = value;
                            }
                        }
                        return gitlab_api_1.gitlab.post(`projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}/merge_requests`, {
                            body: processedBody,
                            contentType: 'form',
                        });
                    }
                    case 'update': {
                        const { action: _action, project_id, merge_request_iid, ...body } = input;
                        const processedBody = {};
                        for (const [key, value] of Object.entries(body)) {
                            if (Array.isArray(value)) {
                                processedBody[key] = value.join(',');
                            }
                            else {
                                processedBody[key] = value;
                            }
                        }
                        return gitlab_api_1.gitlab.put(`projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}/merge_requests/${merge_request_iid}`, { body: processedBody, contentType: 'form' });
                    }
                    case 'merge': {
                        const { action: _action, project_id, merge_request_iid, merge_when_pipeline_succeeds, ...body } = input;
                        const projectPath = (0, projectIdentifier_1.normalizeProjectId)(project_id);
                        const mergeEndpoint = `projects/${projectPath}/merge_requests/${merge_request_iid}/merge`;
                        if (merge_when_pipeline_succeeds) {
                            return gitlab_api_1.gitlab.put(mergeEndpoint, {
                                body: { ...body, merge_when_pipeline_succeeds: true },
                                contentType: 'form',
                            });
                        }
                        const mrStatus = await gitlab_api_1.gitlab.get(`projects/${projectPath}/merge_requests/${merge_request_iid}`);
                        const detailedStatus = mrStatus.detailed_merge_status;
                        if (detailedStatus === 'mergeable') {
                            return gitlab_api_1.gitlab.put(mergeEndpoint, { body, contentType: 'form' });
                        }
                        const isRetryable = exports.RETRYABLE_MERGE_STATUSES.includes(detailedStatus);
                        const canAutoMerge = exports.AUTO_MERGE_ELIGIBLE_STATUSES.includes(detailedStatus);
                        const blockedResponse = {
                            error: true,
                            message: `MR cannot be merged: ${detailedStatus}`,
                            detailed_merge_status: detailedStatus,
                            merge_status: mrStatus.merge_status,
                            has_conflicts: mrStatus.has_conflicts,
                            blocking_discussions_resolved: mrStatus.blocking_discussions_resolved,
                            hint: getMergeStatusHint(detailedStatus),
                            is_retryable: isRetryable,
                            can_auto_merge: canAutoMerge,
                            suggested_action: getSuggestedAction(isRetryable, canAutoMerge),
                        };
                        return blockedResponse;
                    }
                    case 'approve': {
                        const { project_id, merge_request_iid, sha } = input;
                        const body = {};
                        if (sha)
                            body.sha = sha;
                        return gitlab_api_1.gitlab.post(`projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}/merge_requests/${merge_request_iid}/approve`, { body: Object.keys(body).length > 0 ? body : undefined, contentType: 'json' });
                    }
                    case 'unapprove': {
                        const { project_id, merge_request_iid } = input;
                        return gitlab_api_1.gitlab.post(`projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}/merge_requests/${merge_request_iid}/unapprove`);
                    }
                    case 'get_approval_state': {
                        const { project_id, merge_request_iid } = input;
                        return gitlab_api_1.gitlab.get(`projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}/merge_requests/${merge_request_iid}/approval_state`);
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
    [
        'manage_mr_discussion',
        {
            name: 'manage_mr_discussion',
            description: 'Post comments, start threads, and suggest code changes on merge requests. Actions: comment (simple note), thread (line-level discussion), reply (to existing thread), update (edit note text), resolve (toggle thread resolution), suggest (code suggestion block), apply_suggestion/apply_suggestions (accept code suggestions). Related: browse_mr_discussions to read threads.',
            inputSchema: z.toJSONSchema(schema_1.ManageMrDiscussionSchema),
            requirements: {
                default: { tier: 'free', minVersion: '8.0' },
                actions: {
                    thread: { tier: 'free', minVersion: '11.0' },
                    reply: { tier: 'free', minVersion: '11.0' },
                    apply_suggestion: { tier: 'free', minVersion: '13.0' },
                    apply_suggestions: { tier: 'free', minVersion: '13.0' },
                    resolve: { tier: 'free', minVersion: '10.0', notes: 'Resolve discussion threads' },
                    suggest: { tier: 'free', minVersion: '10.5', notes: 'Code suggestions' },
                },
            },
            gate: { envVar: 'USE_MRS', defaultValue: true },
            handler: async (args) => {
                const input = schema_1.ManageMrDiscussionSchema.parse(args);
                (0, utils_1.assertActionAllowed)('manage_mr_discussion', input.action);
                switch (input.action) {
                    case 'comment': {
                        const { project_id, noteable_type, noteable_id, body: noteBody, created_at, confidential, } = input;
                        const body = { body: noteBody };
                        if (created_at)
                            body.created_at = created_at;
                        if (confidential !== undefined)
                            body.confidential = confidential;
                        const resourceType = noteable_type === 'merge_request' ? 'merge_requests' : 'issues';
                        return gitlab_api_1.gitlab.post(`projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}/${resourceType}/${noteable_id}/notes`, { body, contentType: 'form' });
                    }
                    case 'thread': {
                        const { project_id, merge_request_iid, body: noteBody, position, commit_id } = input;
                        const body = { body: noteBody };
                        if (position)
                            flattenPositionToFormFields(body, position);
                        if (commit_id)
                            body.commit_id = commit_id;
                        return gitlab_api_1.gitlab.post(`projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}/merge_requests/${merge_request_iid}/discussions`, { body, contentType: 'form' });
                    }
                    case 'reply': {
                        const { project_id, merge_request_iid, discussion_id, body: noteBody, created_at, } = input;
                        const body = { body: noteBody };
                        if (created_at)
                            body.created_at = created_at;
                        return gitlab_api_1.gitlab.post(`projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}/merge_requests/${merge_request_iid}/discussions/${discussion_id}/notes`, { body, contentType: 'form' });
                    }
                    case 'update': {
                        const { project_id, merge_request_iid, note_id, body: noteBody } = input;
                        return gitlab_api_1.gitlab.put(`projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}/merge_requests/${merge_request_iid}/notes/${note_id}`, { body: { body: noteBody }, contentType: 'form' });
                    }
                    case 'apply_suggestion': {
                        const { suggestion_id, commit_message } = input;
                        const body = {};
                        if (commit_message) {
                            body.commit_message = commit_message;
                        }
                        return gitlab_api_1.gitlab.put(`suggestions/${suggestion_id}/apply`, {
                            body: Object.keys(body).length > 0 ? body : undefined,
                            contentType: 'json',
                        });
                    }
                    case 'apply_suggestions': {
                        const { suggestion_ids, commit_message } = input;
                        const body = {
                            ids: suggestion_ids,
                        };
                        if (commit_message) {
                            body.commit_message = commit_message;
                        }
                        return gitlab_api_1.gitlab.put(`suggestions/batch_apply`, { body, contentType: 'json' });
                    }
                    case 'resolve': {
                        const { project_id, merge_request_iid, discussion_id, resolved } = input;
                        return gitlab_api_1.gitlab.put(`projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}/merge_requests/${merge_request_iid}/discussions/${discussion_id}`, { body: { resolved }, contentType: 'form' });
                    }
                    case 'suggest': {
                        const { project_id, merge_request_iid, position, suggestion, comment, lines_above, lines_below, } = input;
                        const rangeSpec = lines_above || lines_below ? `:-${lines_above || 0}+${lines_below || 0}` : '';
                        const suggestionBlock = `\`\`\`suggestion${rangeSpec}\n${suggestion}\n\`\`\``;
                        const noteBody = comment ? `${comment}\n\n${suggestionBlock}` : suggestionBlock;
                        const body = {
                            body: noteBody,
                        };
                        flattenPositionToFormFields(body, position);
                        return gitlab_api_1.gitlab.post(`projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}/merge_requests/${merge_request_iid}/discussions`, { body, contentType: 'form' });
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
    [
        'manage_draft_notes',
        {
            name: 'manage_draft_notes',
            description: "Create and manage unpublished review comments on merge requests. Actions: create (new draft), update (modify text), publish (make single draft visible), publish_all (submit entire review), delete (discard draft). Related: browse_mr_discussions action 'drafts' to list existing drafts.",
            inputSchema: z.toJSONSchema(schema_1.ManageDraftNotesSchema),
            requirements: { default: { tier: 'free', minVersion: '13.2' } },
            gate: { envVar: 'USE_MRS', defaultValue: true },
            handler: async (args) => {
                const input = schema_1.ManageDraftNotesSchema.parse(args);
                (0, utils_1.assertActionAllowed)('manage_draft_notes', input.action);
                switch (input.action) {
                    case 'create': {
                        const { project_id, merge_request_iid, note, position, in_reply_to_discussion_id, commit_id, } = input;
                        const body = { note };
                        if (position)
                            flattenPositionToFormFields(body, position);
                        if (in_reply_to_discussion_id)
                            body.in_reply_to_discussion_id = in_reply_to_discussion_id;
                        if (commit_id)
                            body.commit_id = commit_id;
                        return gitlab_api_1.gitlab.post(`projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}/merge_requests/${merge_request_iid}/draft_notes`, { body, contentType: 'form' });
                    }
                    case 'update': {
                        const { project_id, merge_request_iid, draft_note_id, note, position } = input;
                        const body = { note };
                        if (position)
                            flattenPositionToFormFields(body, position);
                        return gitlab_api_1.gitlab.put(`projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}/merge_requests/${merge_request_iid}/draft_notes/${draft_note_id}`, { body, contentType: 'form' });
                    }
                    case 'publish': {
                        const { project_id, merge_request_iid, draft_note_id } = input;
                        const result = await gitlab_api_1.gitlab.put(`projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}/merge_requests/${merge_request_iid}/draft_notes/${draft_note_id}/publish`);
                        return result ?? { published: true };
                    }
                    case 'publish_all': {
                        const { project_id, merge_request_iid } = input;
                        const result = await gitlab_api_1.gitlab.post(`projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}/merge_requests/${merge_request_iid}/draft_notes/bulk_publish`);
                        return result ?? { published: true };
                    }
                    case 'delete': {
                        const { project_id, merge_request_iid, draft_note_id } = input;
                        await gitlab_api_1.gitlab.delete(`projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}/merge_requests/${merge_request_iid}/draft_notes/${draft_note_id}`);
                        return { success: true, message: 'Draft note deleted successfully' };
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
]);
function getMrsReadOnlyToolNames() {
    return ['browse_merge_requests', 'browse_mr_discussions'];
}
function getMrsToolDefinitions() {
    return Array.from(exports.mrsToolRegistry.values());
}
function getFilteredMrsTools(readOnlyMode = false) {
    if (readOnlyMode) {
        const readOnlyNames = getMrsReadOnlyToolNames();
        return Array.from(exports.mrsToolRegistry.values()).filter((tool) => readOnlyNames.includes(tool.name));
    }
    return getMrsToolDefinitions();
}
//# sourceMappingURL=registry.js.map