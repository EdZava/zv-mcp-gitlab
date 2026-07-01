"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitLabWikiPageSchema = exports.BrowseWikiSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
const namespaceField = zod_1.z.string().describe('Namespace path (group or project)');
const ListWikiSchema = zod_1.z.object({
    action: zod_1.z.literal('list').describe('List all wiki pages'),
    namespace: namespaceField,
    with_content: utils_1.flexibleBoolean.optional().describe('Include content of the wiki pages'),
    ...(0, utils_1.paginationFields)(),
});
const GetWikiSchema = zod_1.z.object({
    action: zod_1.z.literal('get').describe('Get a single wiki page by slug'),
    namespace: namespaceField,
    slug: zod_1.z.string().describe('URL-encoded slug of the wiki page'),
});
exports.BrowseWikiSchema = zod_1.z.discriminatedUnion('action', [ListWikiSchema, GetWikiSchema]);
exports.GitLabWikiPageSchema = zod_1.z.object({
    title: zod_1.z.string(),
    slug: zod_1.z.string(),
    format: zod_1.z.string(),
    content: zod_1.z.string().optional(),
    created_at: zod_1.z.string().optional(),
    updated_at: zod_1.z.string().optional(),
});
//# sourceMappingURL=schema-readonly.js.map