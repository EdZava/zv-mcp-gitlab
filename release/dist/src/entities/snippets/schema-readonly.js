"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowseSnippetsSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
const SnippetScopeSchema = zod_1.z
    .enum(['personal', 'project', 'public'])
    .describe('The scope of snippets');
const SnippetVisibilitySchema = zod_1.z
    .enum(['private', 'internal', 'public'])
    .describe('Visibility level of snippets');
const projectIdField = zod_1.z
    .string()
    .optional()
    .describe("Project ID or URL-encoded path (e.g., '123' or 'group/project')");
const ListSnippetsSchema = zod_1.z.object({
    action: zod_1.z.literal('list').describe('List snippets with filtering by scope and visibility'),
    scope: SnippetScopeSchema.describe('Scope of snippets: "personal" for current user, "project" for project-specific (requires projectId), "public" for all public snippets'),
    projectId: projectIdField.describe("Project ID or URL-encoded path. Required when scope is 'project'"),
    visibility: SnippetVisibilitySchema.optional().describe('Filter by visibility: private (author only), internal (authenticated users), public (everyone)'),
    created_after: zod_1.z
        .string()
        .optional()
        .describe("Return snippets created after this date (ISO 8601). Example: '2024-01-01T00:00:00Z'"),
    created_before: zod_1.z
        .string()
        .optional()
        .describe("Return snippets created before this date (ISO 8601). Example: '2024-12-31T23:59:59Z'"),
    ...(0, utils_1.paginationFields)(),
});
const GetSnippetSchema = zod_1.z.object({
    action: zod_1.z.literal('get').describe('Get single snippet details or raw content'),
    id: utils_1.requiredId.describe('The ID of the snippet to retrieve'),
    projectId: projectIdField.describe('Project ID or URL-encoded path. Required for project snippets, leave empty for personal snippets'),
    raw: zod_1.z
        .boolean()
        .optional()
        .default(false)
        .describe('Return raw content of snippet files instead of metadata'),
});
exports.BrowseSnippetsSchema = zod_1.z.discriminatedUnion('action', [
    ListSnippetsSchema,
    GetSnippetSchema,
]);
//# sourceMappingURL=schema-readonly.js.map