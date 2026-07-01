"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManageWikiSchema = void 0;
const zod_1 = require("zod");
const namespaceField = zod_1.z.string().describe('Namespace path (group or project)');
const slugField = zod_1.z.string().describe('URL-encoded slug of the wiki page');
const titleField = zod_1.z.string().describe('Title of the wiki page');
const contentField = zod_1.z.string().describe('Content of the wiki page');
const formatField = zod_1.z
    .enum(['markdown', 'rdoc', 'asciidoc', 'org'])
    .optional()
    .describe('Content format (markdown, rdoc, asciidoc, org). Defaults to markdown.');
const CreateWikiSchema = zod_1.z.object({
    action: zod_1.z.literal('create').describe('Create a new wiki page'),
    namespace: namespaceField,
    title: titleField,
    content: contentField,
    format: formatField,
});
const UpdateWikiSchema = zod_1.z.object({
    action: zod_1.z.literal('update').describe('Update an existing wiki page'),
    namespace: namespaceField,
    slug: slugField,
    title: zod_1.z.string().optional().describe('New title of the wiki page'),
    content: zod_1.z.string().optional().describe('New content of the wiki page'),
    format: formatField,
});
const DeleteWikiSchema = zod_1.z.object({
    action: zod_1.z.literal('delete').describe('Delete a wiki page'),
    namespace: namespaceField,
    slug: slugField,
});
exports.ManageWikiSchema = zod_1.z.discriminatedUnion('action', [
    CreateWikiSchema,
    UpdateWikiSchema,
    DeleteWikiSchema,
]);
//# sourceMappingURL=schema.js.map