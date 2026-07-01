"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowseSearchSchema = exports.SearchScopeSchema = void 0;
const zod_1 = require("zod");
const shared_1 = require("../shared");
const utils_1 = require("../utils");
exports.SearchScopeSchema = zod_1.z
    .enum([
    'projects',
    'issues',
    'merge_requests',
    'milestones',
    'snippet_titles',
    'users',
    'groups',
    'blobs',
    'commits',
    'wiki_blobs',
    'notes',
])
    .describe('Search scope determining what type of resources to search');
const BaseSearchParams = zod_1.z.object({
    search: zod_1.z.string().min(1).describe('Search query string (minimum 1 character)'),
    state: zod_1.z
        .enum(['opened', 'closed', 'merged', 'all'])
        .optional()
        .describe('Filter by state (for issues and merge_requests scopes)'),
    confidential: zod_1.z
        .boolean()
        .optional()
        .describe('Filter by confidentiality (for issues scope, Premium only)'),
    order_by: zod_1.z.enum(['created_at', 'updated_at']).optional().describe('Sort results by field'),
    sort: zod_1.z.enum(['asc', 'desc']).optional().describe('Sort direction'),
});
const GlobalSearchSchema = zod_1.z
    .object({
    action: zod_1.z.literal('global').describe('Search across entire GitLab instance'),
    scope: exports.SearchScopeSchema,
})
    .merge(BaseSearchParams)
    .merge(shared_1.PaginationOptionsSchema);
const ProjectSearchSchema = zod_1.z
    .object({
    action: zod_1.z.literal('project').describe('Search within a specific project'),
    project_id: utils_1.requiredId.describe("Project ID or URL-encoded path (e.g., 'group/project' or '123')"),
    scope: exports.SearchScopeSchema,
    ref: zod_1.z.string().optional().describe('Branch/tag reference for code search (blobs, commits)'),
})
    .merge(BaseSearchParams)
    .merge(shared_1.PaginationOptionsSchema);
const GroupSearchSchema = zod_1.z
    .object({
    action: zod_1.z.literal('group').describe('Search within a specific group and its subgroups'),
    group_id: utils_1.requiredId.describe("Group ID or URL-encoded path (e.g., 'my-group' or '123')"),
    scope: exports.SearchScopeSchema,
})
    .merge(BaseSearchParams)
    .merge(shared_1.PaginationOptionsSchema);
exports.BrowseSearchSchema = zod_1.z.discriminatedUnion('action', [
    GlobalSearchSchema,
    ProjectSearchSchema,
    GroupSearchSchema,
]);
//# sourceMappingURL=schema-readonly.js.map