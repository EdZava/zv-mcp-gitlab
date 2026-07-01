"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowseReleasesSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
const projectIdField = utils_1.requiredId.describe("Project ID or URL-encoded path (e.g., 'my-group/my-project')");
const tagNameField = zod_1.z
    .string()
    .describe("The Git tag associated with the release (e.g., 'v1.0.0')");
const ListReleasesSchema = zod_1.z.object({
    action: zod_1.z.literal('list').describe('List all releases for a project, sorted by release date'),
    project_id: projectIdField,
    order_by: zod_1.z
        .enum(['released_at', 'created_at'])
        .optional()
        .describe('Sort releases by field (default: released_at)'),
    sort: zod_1.z.enum(['desc', 'asc']).optional().describe('Sort direction (default: desc)'),
    include_html_description: utils_1.flexibleBoolean
        .optional()
        .describe('Include HTML-rendered description in response'),
    per_page: zod_1.z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .describe('Number of items per page (max 100)'),
    page: zod_1.z.number().int().min(1).optional().describe('Page number'),
});
const GetReleaseSchema = zod_1.z.object({
    action: zod_1.z.literal('get').describe('Get a specific release by its tag name'),
    project_id: projectIdField,
    tag_name: tagNameField,
    include_html_description: utils_1.flexibleBoolean
        .optional()
        .describe('Include HTML-rendered description in response'),
});
const ListReleaseAssetsSchema = zod_1.z.object({
    action: zod_1.z.literal('assets').describe('List all asset links for a specific release'),
    project_id: projectIdField,
    tag_name: tagNameField,
    per_page: zod_1.z
        .number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .describe('Number of items per page (max 100)'),
    page: zod_1.z.number().int().min(1).optional().describe('Page number'),
});
exports.BrowseReleasesSchema = zod_1.z.discriminatedUnion('action', [
    ListReleasesSchema,
    GetReleaseSchema,
    ListReleaseAssetsSchema,
]);
//# sourceMappingURL=schema-readonly.js.map