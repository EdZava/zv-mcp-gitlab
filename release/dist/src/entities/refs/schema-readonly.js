"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowseRefsSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
const projectIdField = utils_1.requiredId.describe("Project ID or URL-encoded path (e.g., 'my-group/my-project')");
const perPageField = zod_1.z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .describe('Number of items per page (max 100)');
const pageField = zod_1.z.number().int().min(1).optional().describe('Page number');
const ListBranchesSchema = zod_1.z.object({
    action: zod_1.z.literal('list_branches').describe('List all repository branches with optional search'),
    project_id: projectIdField,
    search: zod_1.z.string().optional().describe('Filter branches by name (supports wildcards)'),
    regex: zod_1.z.string().optional().describe('Filter branches by regex pattern'),
    per_page: perPageField,
    page: pageField,
});
const GetBranchSchema = zod_1.z.object({
    action: zod_1.z.literal('get_branch').describe('Get details of a specific branch'),
    project_id: projectIdField,
    branch: zod_1.z.string().describe('Branch name (URL-encoded if contains slashes)'),
});
const ListTagsSchema = zod_1.z.object({
    action: zod_1.z.literal('list_tags').describe('List all repository tags'),
    project_id: projectIdField,
    search: zod_1.z.string().optional().describe('Filter tags by name (supports wildcards)'),
    order_by: zod_1.z
        .enum(['name', 'updated', 'version'])
        .optional()
        .describe('Sort by field (default: updated)'),
    sort: zod_1.z.enum(['asc', 'desc']).optional().describe('Sort direction (default: desc)'),
    per_page: perPageField,
    page: pageField,
});
const GetTagSchema = zod_1.z.object({
    action: zod_1.z.literal('get_tag').describe('Get details of a specific tag'),
    project_id: projectIdField,
    tag_name: zod_1.z.string().describe('Tag name (URL-encoded if contains special characters)'),
});
const ListProtectedBranchesSchema = zod_1.z.object({
    action: zod_1.z
        .literal('list_protected_branches')
        .describe('List all protected branches with their protection rules'),
    project_id: projectIdField,
    search: zod_1.z.string().optional().describe('Filter protected branches by name'),
    per_page: perPageField,
    page: pageField,
});
const GetProtectedBranchSchema = zod_1.z.object({
    action: zod_1.z.literal('get_protected_branch').describe('Get protection rules for a specific branch'),
    project_id: projectIdField,
    name: zod_1.z.string().describe("Branch name or wildcard pattern (e.g., 'main', 'release-*')"),
});
const ListProtectedTagsSchema = zod_1.z.object({
    action: zod_1.z
        .literal('list_protected_tags')
        .describe('List all protected tags with their protection rules'),
    project_id: projectIdField,
    per_page: perPageField,
    page: pageField,
});
exports.BrowseRefsSchema = zod_1.z.discriminatedUnion('action', [
    ListBranchesSchema,
    GetBranchSchema,
    ListTagsSchema,
    GetTagSchema,
    ListProtectedBranchesSchema,
    GetProtectedBranchSchema,
    ListProtectedTagsSchema,
]);
//# sourceMappingURL=schema-readonly.js.map