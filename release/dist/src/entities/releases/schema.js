"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManageReleaseSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
const projectIdField = utils_1.requiredId.describe("Project ID or URL-encoded path (e.g., 'my-group/my-project')");
const tagNameField = zod_1.z
    .string()
    .describe("The Git tag associated with the release (e.g., 'v1.0.0')");
const nameField = zod_1.z.string().optional().describe('The release title/name');
const descriptionField = zod_1.z.string().optional().describe('Release description (supports Markdown)');
const milestonesField = zod_1.z
    .array(zod_1.z.string())
    .optional()
    .describe('Array of milestone titles to associate with the release');
const releasedAtField = zod_1.z
    .string()
    .optional()
    .describe("Release date/time in ISO 8601 format (e.g., '2024-01-15T12:00:00Z')");
const linkTypeEnum = zod_1.z
    .enum(['other', 'runbook', 'image', 'package'])
    .optional()
    .describe('Type of asset link (default: other)');
const CreateReleaseSchema = zod_1.z.object({
    action: zod_1.z.literal('create').describe('Create a new release for an existing or new tag'),
    project_id: projectIdField,
    tag_name: tagNameField,
    name: nameField,
    description: descriptionField,
    ref: zod_1.z
        .string()
        .optional()
        .describe('Branch/commit SHA to create tag from (if tag does not exist)'),
    tag_message: zod_1.z
        .string()
        .optional()
        .describe('Annotation message for the tag (creates annotated tag)'),
    milestones: milestonesField,
    released_at: releasedAtField,
    assets: zod_1.z
        .object({
        links: zod_1.z
            .array(zod_1.z.object({
            name: zod_1.z.string().describe('Display name for the asset link'),
            url: zod_1.z.string().url().describe('URL of the asset'),
            direct_asset_path: zod_1.z
                .string()
                .optional()
                .describe('Path for direct asset download (creates permanent URL)'),
            link_type: linkTypeEnum,
        }))
            .optional()
            .describe('Asset links to create with the release'),
    })
        .optional()
        .describe('Release assets configuration'),
});
const UpdateReleaseSchema = zod_1.z.object({
    action: zod_1.z.literal('update').describe('Update an existing release'),
    project_id: projectIdField,
    tag_name: tagNameField,
    name: nameField,
    description: descriptionField,
    milestones: milestonesField,
    released_at: releasedAtField,
});
const DeleteReleaseSchema = zod_1.z.object({
    action: zod_1.z.literal('delete').describe('Delete a release (preserves the Git tag)'),
    project_id: projectIdField,
    tag_name: tagNameField,
});
const CreateReleaseLinkSchema = zod_1.z.object({
    action: zod_1.z.literal('create_link').describe('Add an asset link to an existing release'),
    project_id: projectIdField,
    tag_name: tagNameField,
    name: zod_1.z.string().describe('Display name for the asset link (must be unique per release)'),
    url: zod_1.z.string().url().describe('URL of the asset (must be unique per release)'),
    direct_asset_path: zod_1.z
        .string()
        .optional()
        .describe("Path for direct asset download (e.g., '/binaries/linux-amd64')"),
    link_type: linkTypeEnum,
});
const DeleteReleaseLinkSchema = zod_1.z.object({
    action: zod_1.z.literal('delete_link').describe('Remove an asset link from a release'),
    project_id: projectIdField,
    tag_name: tagNameField,
    link_id: utils_1.requiredId.describe('The ID of the asset link to delete'),
});
exports.ManageReleaseSchema = zod_1.z.discriminatedUnion('action', [
    CreateReleaseSchema,
    UpdateReleaseSchema,
    DeleteReleaseSchema,
    CreateReleaseLinkSchema,
    DeleteReleaseLinkSchema,
]);
//# sourceMappingURL=schema.js.map