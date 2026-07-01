"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManageRegistrySchema = void 0;
const zod_1 = require("zod");
const isValidRegex = (pattern) => {
    try {
        new RegExp(pattern);
        return true;
    }
    catch {
        return false;
    }
};
const repositoryIdField = zod_1.z.coerce
    .number()
    .int()
    .positive()
    .describe('Numeric ID of the container repository (from browse_registry list_repositories)');
const tagNameField = zod_1.z.string().min(1).describe('Container image tag name to delete');
const DeleteRepositorySchema = zod_1.z.object({
    action: zod_1.z
        .literal('delete_repository')
        .describe('Delete a container repository (queued as a background operation)'),
    repository_id: repositoryIdField,
});
const DeleteTagSchema = zod_1.z.object({
    action: zod_1.z.literal('delete_tag').describe('Delete a single tag from a container repository'),
    repository_id: repositoryIdField,
    tag_name: tagNameField,
});
const DeleteTagsBulkSchema = zod_1.z.object({
    action: zod_1.z
        .literal('delete_tags_bulk')
        .describe('Bulk-delete tags by regex with optional retention rules. Destructive and irreversible. ' +
        'Tags are resolved client-side (regex match, keep the newest keep_n, drop only those older ' +
        'than older_than) and then deleted. Always pair name_regex_delete with keep_n and/or ' +
        'older_than to avoid deleting more than intended.'),
    repository_id: repositoryIdField,
    name_regex_delete: zod_1.z
        .string()
        .min(1)
        .refine(isValidRegex, 'Must be a valid regular expression')
        .describe('Regex for tag names to delete (e.g., ".*" for all, "^v.+" for version tags)'),
    name_regex_keep: zod_1.z
        .string()
        .refine(isValidRegex, 'Must be a valid regular expression')
        .optional()
        .describe('Regex for tag names to always keep (takes precedence over name_regex_delete)'),
    keep_n: zod_1.z.coerce
        .number()
        .int()
        .positive()
        .optional()
        .describe('Keep the N most recently created matching tags'),
    older_than: zod_1.z
        .string()
        .regex(/^\d+(s|m|h|d)$/, 'Duration like "30m", "2h", "7d" (seconds/minutes/hours/days)')
        .optional()
        .describe('Only delete tags created longer ago than this duration (e.g., "7d", "12h")'),
});
exports.ManageRegistrySchema = zod_1.z.discriminatedUnion('action', [
    DeleteRepositorySchema,
    DeleteTagSchema,
    DeleteTagsBulkSchema,
]);
//# sourceMappingURL=schema.js.map