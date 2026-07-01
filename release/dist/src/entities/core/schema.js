"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManageTodosSchema = exports.ManageNamespaceSchema = exports.ManageProjectSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
const repoNamespaceField = zod_1.z
    .string()
    .optional()
    .describe('Target namespace path. Omit for current user namespace.');
const repoIssuesEnabledField = utils_1.flexibleBoolean.optional().describe('Enable issue tracking.');
const repoMrEnabledField = utils_1.flexibleBoolean.optional().describe('Enable merge requests.');
const repoJobsEnabledField = utils_1.flexibleBoolean.optional().describe('Enable CI/CD jobs.');
const repoWikiEnabledField = utils_1.flexibleBoolean.optional().describe('Enable project wiki.');
const repoSnippetsEnabledField = utils_1.flexibleBoolean.optional().describe('Enable code snippets.');
const repoLfsEnabledField = utils_1.flexibleBoolean.optional().describe('Enable Git LFS.');
const repoRequestAccessEnabledField = utils_1.flexibleBoolean.optional().describe('Allow access requests.');
const repoPipelineMergeField = utils_1.flexibleBoolean
    .optional()
    .describe('Require passing pipelines for merge.');
const repoDiscussionMergeField = utils_1.flexibleBoolean
    .optional()
    .describe('Require resolved discussions for merge.');
const CreateProjectSchema = zod_1.z.object({
    action: zod_1.z.literal('create').describe('Create a new project'),
    name: utils_1.requiredId.describe('Project name.'),
    namespace: repoNamespaceField,
    description: zod_1.z.string().optional().describe('Project description.'),
    visibility: zod_1.z
        .enum(['private', 'internal', 'public'])
        .optional()
        .describe('Project visibility level.'),
    initialize_with_readme: utils_1.flexibleBoolean.optional().describe('Create initial README.md file.'),
    issues_enabled: repoIssuesEnabledField,
    merge_requests_enabled: repoMrEnabledField,
    jobs_enabled: repoJobsEnabledField,
    wiki_enabled: repoWikiEnabledField,
    snippets_enabled: repoSnippetsEnabledField,
    lfs_enabled: repoLfsEnabledField,
    request_access_enabled: repoRequestAccessEnabledField,
    only_allow_merge_if_pipeline_succeeds: repoPipelineMergeField,
    only_allow_merge_if_all_discussions_are_resolved: repoDiscussionMergeField,
});
const ForkProjectSchema = zod_1.z.object({
    action: zod_1.z.literal('fork').describe('Fork an existing project'),
    project_id: utils_1.requiredId.describe('Source project to fork. Numeric ID or URL-encoded path.'),
    namespace: repoNamespaceField,
    namespace_path: zod_1.z.string().optional().describe('Target namespace path for fork.'),
    fork_name: zod_1.z
        .string()
        .optional()
        .describe("New name for forked project (maps to API 'name' parameter)."),
    fork_path: zod_1.z
        .string()
        .optional()
        .describe("New path for forked project (maps to API 'path' parameter)."),
    issues_enabled: repoIssuesEnabledField,
    merge_requests_enabled: repoMrEnabledField,
    jobs_enabled: repoJobsEnabledField,
    wiki_enabled: repoWikiEnabledField,
    snippets_enabled: repoSnippetsEnabledField,
    lfs_enabled: repoLfsEnabledField,
    request_access_enabled: repoRequestAccessEnabledField,
    only_allow_merge_if_pipeline_succeeds: repoPipelineMergeField,
    only_allow_merge_if_all_discussions_are_resolved: repoDiscussionMergeField,
});
const UpdateProjectSchema = zod_1.z.object({
    action: zod_1.z.literal('update').describe('Update project settings'),
    project_id: utils_1.requiredId.describe('Project ID or URL-encoded path.'),
    name: zod_1.z.string().optional().describe('New project name.'),
    description: zod_1.z.string().optional().describe('New project description.'),
    visibility: zod_1.z
        .enum(['private', 'internal', 'public'])
        .optional()
        .describe('New visibility level.'),
    default_branch: zod_1.z.string().optional().describe('Set default branch name.'),
    issues_enabled: repoIssuesEnabledField,
    merge_requests_enabled: repoMrEnabledField,
    jobs_enabled: repoJobsEnabledField,
    wiki_enabled: repoWikiEnabledField,
    snippets_enabled: repoSnippetsEnabledField,
    lfs_enabled: repoLfsEnabledField,
    request_access_enabled: repoRequestAccessEnabledField,
    only_allow_merge_if_pipeline_succeeds: repoPipelineMergeField,
    only_allow_merge_if_all_discussions_are_resolved: repoDiscussionMergeField,
    issues_template: zod_1.z
        .string()
        .optional()
        .describe('Premium+: default description template for new issues.'),
    merge_requests_template: zod_1.z
        .string()
        .optional()
        .describe('Premium+: default description template for new merge requests.'),
    merge_pipelines_enabled: utils_1.flexibleBoolean
        .optional()
        .describe('Premium+: enable merged results pipelines.'),
    merge_trains_enabled: utils_1.flexibleBoolean
        .optional()
        .describe('Premium+: enable merge trains (requires merge_pipelines_enabled).'),
    only_allow_merge_if_all_status_checks_passed: utils_1.flexibleBoolean
        .optional()
        .describe('Ultimate: block merge until all external status checks pass.'),
    requirements_access_level: zod_1.z
        .enum(['disabled', 'private', 'enabled'])
        .optional()
        .describe('Ultimate: requirements management access level.'),
});
const DeleteProjectSchema = zod_1.z.object({
    action: zod_1.z.literal('delete').describe('Delete a project permanently'),
    project_id: utils_1.requiredId.describe('Project ID or URL-encoded path.'),
});
const ArchiveProjectSchema = zod_1.z.object({
    action: zod_1.z.literal('archive').describe('Archive a project (read-only mode)'),
    project_id: utils_1.requiredId.describe('Project ID or URL-encoded path.'),
});
const UnarchiveProjectSchema = zod_1.z.object({
    action: zod_1.z.literal('unarchive').describe('Unarchive a project (restore from archive)'),
    project_id: utils_1.requiredId.describe('Project ID or URL-encoded path.'),
});
const TransferProjectSchema = zod_1.z.object({
    action: zod_1.z.literal('transfer').describe('Transfer project to a different namespace'),
    project_id: utils_1.requiredId.describe('Project ID or URL-encoded path.'),
    namespace: zod_1.z.string().describe('Target namespace ID or path to transfer to.'),
});
const RestoreProjectSchema = zod_1.z.object({
    action: zod_1.z
        .literal('restore')
        .describe('Restore a soft-deleted project within its deletion cooldown window (default 7 days). Fails once the project has been purged. Requires project Owner or instance Administrator.'),
    project_id: utils_1.requiredId.describe('Project ID or URL-encoded path of the project to restore.'),
});
exports.ManageProjectSchema = zod_1.z.discriminatedUnion('action', [
    CreateProjectSchema,
    ForkProjectSchema,
    UpdateProjectSchema,
    DeleteProjectSchema,
    ArchiveProjectSchema,
    UnarchiveProjectSchema,
    TransferProjectSchema,
    RestoreProjectSchema,
]);
const CreateNamespaceSchema = zod_1.z.object({
    action: zod_1.z.literal('create').describe('Create a new group/namespace'),
    name: zod_1.z.string().describe('Group display name.'),
    path: zod_1.z.string().describe('Group path for URLs (URL-safe).'),
    description: zod_1.z.string().optional().describe('Group description.'),
    visibility: zod_1.z
        .enum(['private', 'internal', 'public'])
        .optional()
        .default('private')
        .describe('Group visibility level.'),
    parent_id: zod_1.z.number().optional().describe('Parent group ID for subgroup.'),
    lfs_enabled: zod_1.z.boolean().optional().describe('Enable Git LFS.'),
    request_access_enabled: zod_1.z.boolean().optional().describe('Allow access requests.'),
    default_branch_protection: zod_1.z
        .number()
        .optional()
        .describe('Branch protection level: 0=none, 1=partial, 2=full.'),
    avatar: zod_1.z.string().optional().describe('Group avatar URL.'),
    membership_lock: zod_1.z
        .boolean()
        .optional()
        .describe('Premium+: prevent members from being added directly to projects in this group.'),
    wiki_access_level: zod_1.z
        .enum(['disabled', 'private', 'enabled'])
        .optional()
        .describe('Premium+: group wiki access level.'),
});
const UpdateNamespaceSchema = zod_1.z.object({
    action: zod_1.z.literal('update').describe('Update group settings'),
    group_id: utils_1.requiredId.describe('Group ID or URL-encoded path.'),
    name: zod_1.z.string().optional().describe('New group name.'),
    path: zod_1.z.string().optional().describe('New group path (URL-safe).'),
    description: zod_1.z.string().optional().describe('New group description.'),
    visibility: zod_1.z
        .enum(['private', 'internal', 'public'])
        .optional()
        .describe('New visibility level.'),
    lfs_enabled: zod_1.z.boolean().optional().describe('Enable Git LFS.'),
    request_access_enabled: zod_1.z.boolean().optional().describe('Allow access requests.'),
    default_branch_protection: zod_1.z
        .number()
        .optional()
        .describe('Branch protection level: 0=none, 1=partial, 2=full.'),
    membership_lock: zod_1.z
        .boolean()
        .optional()
        .describe('Premium+: prevent members from being added directly to projects in this group.'),
    wiki_access_level: zod_1.z
        .enum(['disabled', 'private', 'enabled'])
        .optional()
        .describe('Premium+: group wiki access level.'),
    ip_restriction_ranges: zod_1.z
        .string()
        .optional()
        .describe('Premium+: comma-separated CIDR ranges that may access the group.'),
    allowed_email_domains_list: zod_1.z
        .string()
        .optional()
        .describe('Premium+: comma-separated email domains allowed for group membership.'),
    unique_project_download_limit: zod_1.z
        .number()
        .optional()
        .describe('Ultimate: max unique project downloads per user before action is taken.'),
});
const DeleteNamespaceSchema = zod_1.z.object({
    action: zod_1.z.literal('delete').describe('Delete a group permanently'),
    group_id: utils_1.requiredId.describe('Group ID or URL-encoded path.'),
});
const RestoreNamespaceSchema = zod_1.z.object({
    action: zod_1.z
        .literal('restore')
        .describe('Restore a soft-deleted group within its deletion cooldown window. Requires GitLab 18.0+ ' +
        '(group restore GA in 18.9) and group Owner or instance Administrator.'),
    group_id: utils_1.requiredId.describe('Group ID or URL-encoded path of the group to restore.'),
});
exports.ManageNamespaceSchema = zod_1.z.discriminatedUnion('action', [
    CreateNamespaceSchema,
    UpdateNamespaceSchema,
    DeleteNamespaceSchema,
    RestoreNamespaceSchema,
]);
const MarkDoneTodoSchema = zod_1.z.object({
    action: zod_1.z.literal('mark_done').describe('Mark a single todo as done'),
    id: zod_1.z.number().int().positive().describe('Todo ID to mark as done'),
});
const MarkAllDoneTodosSchema = zod_1.z.object({
    action: zod_1.z.literal('mark_all_done').describe('Mark all todos as done (clears entire queue)'),
});
const RestoreTodoSchema = zod_1.z.object({
    action: zod_1.z.literal('restore').describe('Restore a completed todo to pending state'),
    id: zod_1.z.number().int().positive().describe('Todo ID to restore'),
});
exports.ManageTodosSchema = zod_1.z.discriminatedUnion('action', [
    MarkDoneTodoSchema,
    MarkAllDoneTodosSchema,
    RestoreTodoSchema,
]);
//# sourceMappingURL=schema.js.map