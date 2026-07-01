"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowseMrDiscussionsSchema = exports.BrowseMergeRequestsSchema = exports.DIFF_EXCLUSION_PRESETS = exports.GENERATED_PATTERNS = exports.LOCKFILE_PATTERNS = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
exports.LOCKFILE_PATTERNS = [
    'yarn.lock',
    'package-lock.json',
    'pnpm-lock.yaml',
    'Gemfile.lock',
    'Cargo.lock',
    'poetry.lock',
    'composer.lock',
    'go.sum',
    'Pipfile.lock',
    'bun.lockb',
    'shrinkwrap.yaml',
];
exports.GENERATED_PATTERNS = [
    'dist/**',
    'build/**',
    '.next/**',
    '.nuxt/**',
    '.output/**',
    'coverage/**',
    '**/*.min.js',
    '**/*.min.css',
    '**/*.map',
    '**/*.js.map',
    '**/*.css.map',
];
exports.DIFF_EXCLUSION_PRESETS = {
    lockfiles: exports.LOCKFILE_PATTERNS,
    generated: exports.GENERATED_PATTERNS,
};
const projectIdField = utils_1.requiredId.describe('Project ID or URL-encoded path');
const mergeRequestIidField = utils_1.requiredId.describe('Internal MR ID unique to project');
const includeDivergedCommitsCountField = utils_1.flexibleBoolean
    .optional()
    .describe('Include count of commits the source branch is behind target');
const includeRebaseInProgressField = utils_1.flexibleBoolean
    .optional()
    .describe('Check if MR is currently being rebased');
const NotFilterSchema = zod_1.z
    .object({
    labels: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    milestone: zod_1.z.string().optional(),
    author_id: zod_1.z.number().optional(),
    author_username: zod_1.z.string().optional(),
    assignee_id: zod_1.z.number().optional(),
    assignee_username: zod_1.z.string().optional(),
    my_reaction_emoji: zod_1.z.string().optional(),
})
    .describe('Exclusion filters');
const ListMergeRequestsSchema = zod_1.z
    .object({
    action: zod_1.z.literal('list').describe('List merge requests with filtering'),
    project_id: zod_1.z.coerce
        .string()
        .optional()
        .describe('Project ID or URL-encoded path. Optional for cross-project search.'),
    state: zod_1.z
        .enum(['opened', 'closed', 'locked', 'merged', 'all'])
        .optional()
        .describe('MR state filter'),
    order_by: zod_1.z
        .enum(['created_at', 'updated_at', 'title', 'priority'])
        .optional()
        .describe('Sort field'),
    sort: zod_1.z.enum(['asc', 'desc']).optional().describe('Sort direction'),
    milestone: zod_1.z.string().optional().describe('Filter by milestone title. Use "None" or "Any".'),
    view: zod_1.z.enum(['simple', 'full']).optional().describe('Response detail level'),
    labels: zod_1.z
        .union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())])
        .optional()
        .describe('Filter by labels'),
    with_labels_details: utils_1.flexibleBoolean.optional().describe('Return full label objects'),
    with_merge_status_recheck: utils_1.flexibleBoolean
        .optional()
        .describe('Trigger async recheck of merge status'),
    created_after: zod_1.z.string().optional().describe('Filter MRs created after (ISO 8601)'),
    created_before: zod_1.z.string().optional().describe('Filter MRs created before (ISO 8601)'),
    updated_after: zod_1.z.string().optional().describe('Filter MRs modified after (ISO 8601)'),
    updated_before: zod_1.z.string().optional().describe('Filter MRs modified before (ISO 8601)'),
    scope: zod_1.z.enum(['created_by_me', 'assigned_to_me', 'all']).optional().describe('Filter scope'),
    author_id: zod_1.z.number().optional().describe("Filter by author's user ID"),
    author_username: zod_1.z.string().optional().describe("Filter by author's username"),
    assignee_id: zod_1.z.number().optional().describe("Filter by assignee's user ID"),
    assignee_username: zod_1.z.string().optional().describe("Filter by assignee's username"),
    my_reaction_emoji: zod_1.z.string().optional().describe("Filter MRs you've reacted to"),
    source_branch: zod_1.z.string().optional().describe('Filter by source branch'),
    target_branch: zod_1.z.string().optional().describe('Filter by target branch'),
    search: zod_1.z.string().optional().describe('Text search in title/description'),
    in: zod_1.z.enum(['title', 'description', 'title,description']).optional().describe('Search scope'),
    wip: zod_1.z.enum(['yes', 'no']).optional().describe('Draft/WIP filter'),
    not: NotFilterSchema.optional(),
    environment: zod_1.z.string().optional().describe('Filter by deployment environment'),
    deployed_before: zod_1.z.string().optional().describe('Filter MRs deployed before'),
    deployed_after: zod_1.z.string().optional().describe('Filter MRs deployed after'),
    approved_by_ids: zod_1.z.array(zod_1.z.string()).optional().describe('Filter MRs approved by user IDs'),
    approved_by_usernames: zod_1.z
        .array(zod_1.z.string())
        .optional()
        .describe('Filter MRs approved by usernames'),
    reviewer_id: zod_1.z.number().optional().describe('Filter by reviewer user ID'),
    reviewer_username: zod_1.z.string().optional().describe('Filter by reviewer username'),
    with_api_entity_associations: utils_1.flexibleBoolean
        .optional()
        .describe('Include extra API associations'),
    min_access_level: zod_1.z.number().optional().describe('Minimum access level filter (10-50)'),
    ...(0, utils_1.paginationFields)(),
})
    .passthrough();
const GetMergeRequestByIidSchema = zod_1.z
    .object({
    action: zod_1.z.literal('get').describe('Get single MR by IID or branch name'),
    project_id: projectIdField,
    merge_request_iid: mergeRequestIidField
        .optional()
        .describe('Internal MR ID. Required unless branch_name provided.'),
    branch_name: zod_1.z.string().optional().describe('Find MR by its source branch name'),
    include_diverged_commits_count: includeDivergedCommitsCountField,
    include_rebase_in_progress: includeRebaseInProgressField,
})
    .passthrough();
const DiffsMergeRequestSchema = zod_1.z
    .object({
    action: zod_1.z.literal('diffs').describe('Get file changes/diffs for an MR'),
    project_id: projectIdField,
    merge_request_iid: mergeRequestIidField,
    include_diverged_commits_count: includeDivergedCommitsCountField,
    include_rebase_in_progress: includeRebaseInProgressField,
    exclude_patterns: zod_1.z
        .array(zod_1.z.string())
        .optional()
        .describe("Custom glob patterns to exclude (e.g., ['vendor/**', '*.generated.ts'])"),
    exclude_lockfiles: utils_1.flexibleBoolean
        .optional()
        .describe('Exclude common lock files: yarn.lock, package-lock.json, Cargo.lock, etc. (default: false)'),
    exclude_generated: utils_1.flexibleBoolean
        .optional()
        .describe('Exclude build output and minified files: dist/**, **/*.min.js, **/*.map, etc. (default: false)'),
    ...(0, utils_1.paginationFields)(),
})
    .passthrough();
const CompareMergeRequestSchema = zod_1.z
    .object({
    action: zod_1.z.literal('compare').describe('Compare two branches or commits'),
    project_id: projectIdField,
    from: zod_1.z.string().describe('Source reference: branch name or commit SHA'),
    to: zod_1.z.string().describe('Target reference: branch name or commit SHA'),
    straight: utils_1.flexibleBoolean
        .optional()
        .describe('true=straight diff, false=three-way diff from common ancestor'),
})
    .passthrough();
const ListMergeRequestVersionsSchema = zod_1.z
    .object({
    action: zod_1.z
        .literal('versions')
        .describe('List all diff versions of an MR (each push creates a version)'),
    project_id: projectIdField,
    merge_request_iid: mergeRequestIidField,
    ...(0, utils_1.paginationFields)(),
})
    .passthrough();
const GetMergeRequestVersionSchema = zod_1.z
    .object({
    action: zod_1.z.literal('version').describe('Get specific MR diff version with file changes'),
    project_id: projectIdField,
    merge_request_iid: mergeRequestIidField,
    version_id: utils_1.requiredId.describe('Diff version ID from versions list'),
})
    .passthrough();
const BrowseMergeRequestsBaseSchema = zod_1.z.discriminatedUnion('action', [
    ListMergeRequestsSchema,
    GetMergeRequestByIidSchema,
    DiffsMergeRequestSchema,
    CompareMergeRequestSchema,
    ListMergeRequestVersionsSchema,
    GetMergeRequestVersionSchema,
]);
const listOnlyFields = [
    'state',
    'order_by',
    'sort',
    'milestone',
    'view',
    'labels',
    'with_labels_details',
    'with_merge_status_recheck',
    'created_after',
    'created_before',
    'updated_after',
    'updated_before',
    'scope',
    'author_id',
    'author_username',
    'assignee_id',
    'assignee_username',
    'my_reaction_emoji',
    'source_branch',
    'target_branch',
    'search',
    'in',
    'wip',
    'not',
    'environment',
    'deployed_before',
    'deployed_after',
    'approved_by_ids',
    'approved_by_usernames',
    'reviewer_id',
    'reviewer_username',
    'with_api_entity_associations',
    'min_access_level',
];
const compareOnlyFields = ['from', 'to', 'straight'];
const getOnlyFields = ['merge_request_iid', 'branch_name'];
const versionOnlyFields = ['version_id'];
const diffsOnlyFields = ['exclude_patterns', 'exclude_lockfiles', 'exclude_generated'];
const fieldsInvalidForVersionActions = [
    'branch_name',
    'include_diverged_commits_count',
    'include_rebase_in_progress',
];
exports.BrowseMergeRequestsSchema = BrowseMergeRequestsBaseSchema.refine((data) => {
    if (data.action === 'get') {
        return data.merge_request_iid !== undefined || data.branch_name !== undefined;
    }
    return true;
}, {
    message: "Either merge_request_iid or branch_name must be provided for 'get' action",
    path: ['merge_request_iid'],
}).superRefine((data, ctx) => {
    const input = data;
    if (data.action !== 'list') {
        for (const field of listOnlyFields) {
            if (field in input && input[field] !== undefined) {
                ctx.addIssue({
                    code: zod_1.z.ZodIssueCode.custom,
                    message: `'${field}' is only valid for 'list' action`,
                    path: [field],
                });
            }
        }
    }
    if (data.action !== 'compare') {
        for (const field of compareOnlyFields) {
            if (field in input && input[field] !== undefined) {
                ctx.addIssue({
                    code: zod_1.z.ZodIssueCode.custom,
                    message: `'${field}' is only valid for 'compare' action`,
                    path: [field],
                });
            }
        }
    }
    if (data.action === 'list') {
        for (const field of getOnlyFields) {
            if (field in input && input[field] !== undefined) {
                ctx.addIssue({
                    code: zod_1.z.ZodIssueCode.custom,
                    message: `'${field}' is only valid for 'get' action`,
                    path: [field],
                });
            }
        }
    }
    if (data.action !== 'version') {
        for (const field of versionOnlyFields) {
            if (field in input && input[field] !== undefined) {
                ctx.addIssue({
                    code: zod_1.z.ZodIssueCode.custom,
                    message: `'${field}' is only valid for 'version' action`,
                    path: [field],
                });
            }
        }
    }
    if (data.action !== 'diffs') {
        for (const field of diffsOnlyFields) {
            if (field in input && input[field] !== undefined) {
                ctx.addIssue({
                    code: zod_1.z.ZodIssueCode.custom,
                    message: `'${field}' is only valid for 'diffs' action`,
                    path: [field],
                });
            }
        }
    }
    if (data.action === 'versions' || data.action === 'version') {
        for (const field of fieldsInvalidForVersionActions) {
            if (field in input && input[field] !== undefined) {
                ctx.addIssue({
                    code: zod_1.z.ZodIssueCode.custom,
                    message: `'${field}' is not valid for '${data.action}' action`,
                    path: [field],
                });
            }
        }
    }
});
const ListMrDiscussionsSchema = zod_1.z.object({
    action: zod_1.z.literal('list').describe('List all discussion threads on an MR'),
    project_id: projectIdField,
    merge_request_iid: mergeRequestIidField,
    ...(0, utils_1.paginationFields)(),
});
const ListDraftNotesSchema = zod_1.z.object({
    action: zod_1.z.literal('drafts').describe('List unpublished draft notes on an MR'),
    project_id: projectIdField,
    merge_request_iid: mergeRequestIidField,
});
const GetDraftNoteSchema = zod_1.z.object({
    action: zod_1.z.literal('draft').describe('Get single draft note details'),
    project_id: projectIdField,
    merge_request_iid: mergeRequestIidField,
    draft_note_id: utils_1.requiredId.describe('Unique identifier of the draft note'),
});
exports.BrowseMrDiscussionsSchema = zod_1.z.discriminatedUnion('action', [
    ListMrDiscussionsSchema,
    ListDraftNotesSchema,
    GetDraftNoteSchema,
]);
//# sourceMappingURL=schema-readonly.js.map