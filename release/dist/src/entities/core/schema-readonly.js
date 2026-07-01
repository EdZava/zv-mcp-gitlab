"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowseTodosSchema = exports.BrowseUsersSchema = exports.BrowseEventsSchema = exports.BrowseCommitsSchema = exports.BrowseNamespacesSchema = exports.BrowseProjectsSchema = exports.GitLabCompareResultSchema = exports.GitLabReferenceSchema = exports.GitLabSearchResponseSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
exports.GitLabSearchResponseSchema = zod_1.z.object({
    data: zod_1.z.array(zod_1.z.unknown()),
    total_count: zod_1.z.number(),
});
exports.GitLabReferenceSchema = zod_1.z.object({
    type: zod_1.z.string(),
    name: zod_1.z.string(),
    path: zod_1.z.string(),
    location: zod_1.z.string(),
});
exports.GitLabCompareResultSchema = zod_1.z.object({
    commit: zod_1.z.object({
        id: zod_1.z.string(),
        short_id: zod_1.z.string(),
        title: zod_1.z.string(),
        author_name: zod_1.z.string(),
        author_email: zod_1.z.string(),
        authored_date: zod_1.z.string(),
        committer_name: zod_1.z.string(),
        committer_email: zod_1.z.string(),
        committed_date: zod_1.z.string(),
        message: zod_1.z.string(),
    }),
    commits: zod_1.z.array(zod_1.z.unknown()),
    diffs: zod_1.z.array(zod_1.z.unknown()),
});
const projectVisibilityField = zod_1.z
    .enum(['public', 'internal', 'private'])
    .optional()
    .describe('Filter by visibility: public, internal, or private.');
const projectArchivedField = utils_1.flexibleBoolean
    .optional()
    .describe('Filter by archive status. true=archived only, false=active only.');
const projectOrderByField = zod_1.z
    .enum(['id', 'name', 'path', 'created_at', 'updated_at', 'last_activity_at', 'similarity'])
    .optional()
    .describe('Sort field for results.');
const projectSortField = zod_1.z
    .enum(['asc', 'desc'])
    .optional()
    .describe('Sort direction: asc or desc.');
const projectProgrammingLangField = zod_1.z
    .string()
    .optional()
    .describe('Filter by programming language (e.g., "javascript", "python").');
const SearchProjectsSchema = zod_1.z.object({
    action: zod_1.z.literal('search').describe('Find projects by criteria using global search API'),
    q: zod_1.z
        .string()
        .optional()
        .describe('Global search query. Searches project names, paths, descriptions.'),
    visibility: projectVisibilityField,
    archived: projectArchivedField,
    order_by: projectOrderByField,
    sort: projectSortField,
    with_programming_language: projectProgrammingLangField,
    ...(0, utils_1.paginationFields)(),
});
const ListProjectsSchema = zod_1.z.object({
    action: zod_1.z.literal('list').describe('Browse accessible projects with optional group scope'),
    group_id: zod_1.z.coerce
        .string()
        .optional()
        .describe('Group ID to list projects within. If omitted, lists YOUR accessible projects.'),
    search: zod_1.z
        .string()
        .optional()
        .describe('Text filter for list action (filters results by name/description).'),
    owned: utils_1.flexibleBoolean.optional().describe('Show only projects you own (not just member of).'),
    starred: utils_1.flexibleBoolean.optional().describe('Show only starred/favorited projects.'),
    membership: utils_1.flexibleBoolean.optional().describe('Show only projects where you have membership.'),
    simple: utils_1.flexibleBoolean
        .optional()
        .default(true)
        .describe('Return minimal fields for faster response. Default: true.'),
    include_subgroups: utils_1.flexibleBoolean
        .optional()
        .describe('Include projects from subgroups (requires group_id).'),
    with_shared: utils_1.flexibleBoolean.optional().describe('Include shared projects (requires group_id).'),
    include_deleted: utils_1.flexibleBoolean
        .optional()
        .describe('Include projects pending deletion (soft-deleted, within the cooldown window). Admin only: ' +
        'lists projects scheduled for purge so they can be reviewed or restored. Ignored for group_id scope.'),
    marked_for_deletion_on: zod_1.z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be an ISO date (YYYY-MM-DD)')
        .optional()
        .describe('Filter projects scheduled for deletion on this exact date (YYYY-MM-DD). Premium/Ultimate ' +
        'only. Combine with include_deleted to review projects purging on a given day. Ignored for group_id scope.'),
    active: utils_1.flexibleBoolean
        .optional()
        .describe('Filter by active status. true = exclude archived AND pending-deletion projects; ' +
        'false = only archived/pending-deletion. Uses the native GitLab 18.5+ filter; on older ' +
        'instances it falls back to the archived filter (pending-deletion projects are already ' +
        'hidden from default listings). When omitted, active projects are listed as before.'),
    visibility: projectVisibilityField,
    archived: projectArchivedField,
    order_by: projectOrderByField,
    sort: projectSortField,
    with_programming_language: projectProgrammingLangField,
    ...(0, utils_1.paginationFields)(),
});
const GetProjectSchema = zod_1.z.object({
    action: zod_1.z.literal('get').describe('Retrieve specific project details'),
    project_id: utils_1.requiredId.describe('Project identifier. Numeric ID or URL-encoded path (e.g., "42" or "gitlab-org%2Fgitlab").'),
    statistics: utils_1.flexibleBoolean.optional().describe('Include repository statistics.'),
    license: utils_1.flexibleBoolean.optional().describe('Include license information.'),
});
exports.BrowseProjectsSchema = zod_1.z.discriminatedUnion('action', [
    SearchProjectsSchema,
    ListProjectsSchema,
    GetProjectSchema,
]);
const namespaceIdField = utils_1.requiredId.describe('Namespace ID or path.');
const ListNamespacesSchema = zod_1.z.object({
    action: zod_1.z.literal('list').describe('Browse namespaces with optional filtering'),
    search: zod_1.z.string().optional().describe('Search namespaces by name/path.'),
    owned_only: utils_1.flexibleBoolean.optional().describe('Show only namespaces you own.'),
    top_level_only: utils_1.flexibleBoolean.optional().describe('Show only root-level namespaces.'),
    with_statistics: utils_1.flexibleBoolean.optional().describe('Include storage/count statistics.'),
    min_access_level: zod_1.z
        .number()
        .optional()
        .describe('Minimum access level: 10=Guest, 20=Reporter, 30=Developer, 40=Maintainer, 50=Owner.'),
    ...(0, utils_1.paginationFields)(),
});
const GetNamespaceSchema = zod_1.z.object({
    action: zod_1.z.literal('get').describe('Retrieve namespace details'),
    namespace_id: namespaceIdField,
});
const VerifyNamespaceSchema = zod_1.z.object({
    action: zod_1.z.literal('verify').describe('Check if namespace exists'),
    namespace_id: namespaceIdField,
});
exports.BrowseNamespacesSchema = zod_1.z.discriminatedUnion('action', [
    ListNamespacesSchema,
    GetNamespaceSchema,
    VerifyNamespaceSchema,
]);
const commitProjectIdField = utils_1.requiredId.describe('Project ID or URL-encoded path.');
const commitShaField = utils_1.requiredId.describe('Commit SHA. Can be full SHA, short hash, or ref name.');
const ListCommitsSchema = zod_1.z.object({
    action: zod_1.z.literal('list').describe('Browse commit history'),
    project_id: commitProjectIdField,
    ref_name: zod_1.z.string().optional().describe('Branch/tag name. Defaults to default branch.'),
    since: zod_1.z.string().optional().describe('Start date filter (ISO 8601 format).'),
    until: zod_1.z.string().optional().describe('End date filter (ISO 8601 format).'),
    path: zod_1.z.string().optional().describe('Filter commits affecting this file/directory path.'),
    author: zod_1.z.string().optional().describe('Filter by author name or email.'),
    all: utils_1.flexibleBoolean.optional().describe('Include commits from all branches.'),
    first_parent: utils_1.flexibleBoolean.optional().describe('Follow only first parent (linear history).'),
    order: zod_1.z.enum(['default', 'topo']).optional().describe('Commit ordering: default or topo.'),
    with_stats: utils_1.flexibleBoolean.optional().describe('Include stats for each commit.'),
    trailers: utils_1.flexibleBoolean.optional().describe('Include Git trailers (Signed-off-by, etc.).'),
    ...(0, utils_1.paginationFields)(),
});
const GetCommitSchema = zod_1.z.object({
    action: zod_1.z.literal('get').describe('Retrieve commit details'),
    project_id: commitProjectIdField,
    sha: commitShaField,
    stats: utils_1.flexibleBoolean.optional().describe('Include file change statistics.'),
});
const GetCommitDiffSchema = zod_1.z.object({
    action: zod_1.z.literal('diff').describe('Get code changes in a commit'),
    project_id: commitProjectIdField,
    sha: commitShaField,
    unidiff: utils_1.flexibleBoolean.optional().describe('Return unified diff format.'),
    ...(0, utils_1.paginationFields)(),
});
exports.BrowseCommitsSchema = zod_1.z.discriminatedUnion('action', [
    ListCommitsSchema,
    GetCommitSchema,
    GetCommitDiffSchema,
]);
const eventTargetTypeField = zod_1.z
    .enum(['issue', 'milestone', 'merge_request', 'note', 'project', 'snippet', 'user'])
    .optional()
    .describe('Filter by target type.');
const eventActionField = zod_1.z
    .enum([
    'created',
    'updated',
    'closed',
    'reopened',
    'pushed',
    'commented',
    'merged',
    'joined',
    'left',
    'destroyed',
    'expired',
])
    .optional()
    .describe('Filter by event action.');
const eventBeforeField = zod_1.z
    .string()
    .optional()
    .describe('Show events before this date (YYYY-MM-DD).');
const eventAfterField = zod_1.z.string().optional().describe('Show events after this date (YYYY-MM-DD).');
const eventSortField = zod_1.z
    .enum(['asc', 'desc'])
    .optional()
    .describe('Sort order: asc=oldest first, desc=newest first.');
const UserEventsSchema = zod_1.z.object({
    action: zod_1.z.literal('user').describe('Show your activity across all projects'),
    target_type: eventTargetTypeField,
    event_action: eventActionField,
    before: eventBeforeField,
    after: eventAfterField,
    sort: eventSortField,
    ...(0, utils_1.paginationFields)(),
});
const ProjectEventsSchema = zod_1.z.object({
    action: zod_1.z.literal('project').describe('Show specific project activity'),
    project_id: utils_1.requiredId.describe('Project ID.'),
    target_type: eventTargetTypeField,
    event_action: eventActionField,
    before: eventBeforeField,
    after: eventAfterField,
    sort: eventSortField,
    ...(0, utils_1.paginationFields)(),
});
exports.BrowseEventsSchema = zod_1.z.discriminatedUnion('action', [
    UserEventsSchema,
    ProjectEventsSchema,
]);
const userSearchFields = {
    active: utils_1.flexibleBoolean
        .optional()
        .describe('Filter for active (true) or inactive (false) users.'),
    external: utils_1.flexibleBoolean.optional().describe('Filter for external users with limited access.'),
    blocked: utils_1.flexibleBoolean.optional().describe('Filter for blocked users.'),
    humans: utils_1.flexibleBoolean.optional().describe('Filter for human users only (exclude bots).'),
    created_after: zod_1.z.string().optional().describe('Filter users created after this date (ISO 8601).'),
    created_before: zod_1.z
        .string()
        .optional()
        .describe('Filter users created before this date (ISO 8601).'),
    exclude_active: utils_1.flexibleBoolean.optional().describe('Exclude active users.'),
    exclude_external: utils_1.flexibleBoolean.optional().describe('Exclude external users.'),
    exclude_humans: utils_1.flexibleBoolean.optional().describe('Exclude human users.'),
    exclude_internal: utils_1.flexibleBoolean.optional().describe('Exclude internal system users.'),
    without_project_bots: utils_1.flexibleBoolean.optional().describe('Exclude project bot users.'),
};
const SearchUsersSchema = zod_1.z.object({
    action: zod_1.z.literal('search').describe('Search users with smart pattern detection'),
    username: zod_1.z.string().optional().describe('Exact username to search for. Case-sensitive.'),
    public_email: zod_1.z.string().optional().describe('Find user by exact public email address.'),
    search: zod_1.z.string().optional().describe('Partial text search across name, username, and email.'),
    smart_search: utils_1.flexibleBoolean
        .optional()
        .describe('Enable smart search with auto-detection and transliteration. Auto-enabled for search parameter.'),
    ...userSearchFields,
    ...(0, utils_1.paginationFields)(),
});
const GetUserSchema = zod_1.z.object({
    action: zod_1.z.literal('get').describe('Get a specific user by ID'),
    user_id: utils_1.requiredId.describe('User ID to retrieve.'),
});
exports.BrowseUsersSchema = zod_1.z.discriminatedUnion('action', [SearchUsersSchema, GetUserSchema]);
const ListTodosActionSchema = zod_1.z.object({
    action: zod_1.z.literal('list').describe('List your pending and completed todos'),
    state: zod_1.z
        .enum(['pending', 'done'])
        .optional()
        .describe('Filter todos by state: pending=active, done=completed.'),
    todo_action: zod_1.z
        .enum([
        'assigned',
        'mentioned',
        'build_failed',
        'marked',
        'approval_required',
        'unmergeable',
        'directly_addressed',
        'merge_train_removed',
        'review_requested',
        'member_access_requested',
        'review_submitted',
    ])
        .optional()
        .describe('Filter by action type.'),
    type: zod_1.z
        .enum([
        'Issue',
        'MergeRequest',
        'Commit',
        'Epic',
        'DesignManagement::Design',
        'AlertManagement::Alert',
    ])
        .optional()
        .describe('Filter by target type.'),
    project_id: zod_1.z.number().optional().describe('Filter by project ID.'),
    group_id: zod_1.z.number().optional().describe('Filter by group ID.'),
    author_id: zod_1.z.number().optional().describe('Filter by author ID.'),
    ...(0, utils_1.paginationFields)(),
});
exports.BrowseTodosSchema = zod_1.z.discriminatedUnion('action', [ListTodosActionSchema]);
//# sourceMappingURL=schema-readonly.js.map