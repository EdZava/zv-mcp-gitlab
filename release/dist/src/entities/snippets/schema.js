"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManageSnippetSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
const flexibleVisibility = zod_1.z.preprocess((val) => {
    if (typeof val === 'string') {
        const normalized = val.toLowerCase().trim();
        if (['private', 'priv'].includes(normalized)) {
            return 'private';
        }
        if (['internal', 'intern'].includes(normalized)) {
            return 'internal';
        }
        if (['public', 'pub'].includes(normalized)) {
            return 'public';
        }
    }
    return val;
}, zod_1.z.enum(['private', 'internal', 'public']));
const SnippetFileSchema = zod_1.z.object({
    file_path: zod_1.z
        .string()
        .min(1)
        .describe("The path/name of the file within the snippet. Can include subdirectories (e.g., 'src/main.py'). Must be unique within the snippet"),
    content: zod_1.z
        .string()
        .optional()
        .describe("The content of the file. Required for 'create' and 'update' actions. Can be empty string for placeholder files"),
    action: zod_1.z
        .enum(['create', 'update', 'delete', 'move'])
        .optional()
        .describe("Action to perform on the file (only for update operations): 'create' adds a new file, 'update' modifies existing file, 'delete' removes file, 'move' renames file (requires previous_path)"),
    previous_path: zod_1.z
        .string()
        .optional()
        .describe("Original file path when using 'move' action to rename a file. Must match an existing file in the snippet"),
});
const projectIdField = zod_1.z
    .string()
    .optional()
    .describe('Project ID or URL-encoded path. Leave empty for personal snippets');
const CreateSnippetSchema = zod_1.z.object({
    action: zod_1.z.literal('create').describe('Create a new snippet with one or more files'),
    projectId: projectIdField.describe('Project ID or URL-encoded path to create a project snippet. Leave empty for personal snippet'),
    title: zod_1.z
        .string()
        .min(1)
        .max(255)
        .describe('The title of the snippet. Displayed in snippet list and as page title. Max 255 chars'),
    description: zod_1.z
        .string()
        .optional()
        .describe('Optional description explaining the snippet purpose. Supports markdown'),
    visibility: flexibleVisibility
        .optional()
        .default('private')
        .describe("Visibility: 'private' (author only), 'internal' (authenticated users), 'public' (everyone). Defaults to 'private'"),
    files: zod_1.z
        .array(zod_1.z.object({
        file_path: zod_1.z.string().min(1),
        content: zod_1.z.string(),
    }))
        .min(1)
        .describe('Array of files to include. At least one file required. Each needs file_path and content'),
});
const UpdateSnippetSchema = zod_1.z.object({
    action: zod_1.z.literal('update').describe('Update an existing snippet metadata or files'),
    id: utils_1.requiredId.describe('The ID of the snippet to update'),
    projectId: projectIdField.describe('Project ID or URL-encoded path. Required for project snippets, leave empty for personal'),
    title: zod_1.z.string().min(1).max(255).optional().describe('Update the snippet title. Max 255 chars'),
    description: zod_1.z.string().optional().describe('Update the snippet description. Supports markdown'),
    visibility: flexibleVisibility.optional().describe('Update the visibility level'),
    files: zod_1.z
        .array(SnippetFileSchema)
        .optional()
        .describe("Array of file operations. Each file must specify 'action': create/update/delete/move. Move requires previous_path"),
});
const DeleteSnippetSchema = zod_1.z.object({
    action: zod_1.z.literal('delete').describe('Permanently delete a snippet'),
    id: utils_1.requiredId.describe('The ID of the snippet to delete. This operation cannot be undone'),
    projectId: projectIdField.describe('Project ID or URL-encoded path. Required for project snippets, leave empty for personal'),
});
exports.ManageSnippetSchema = zod_1.z.discriminatedUnion('action', [
    CreateSnippetSchema,
    UpdateSnippetSchema,
    DeleteSnippetSchema,
]);
//# sourceMappingURL=schema.js.map