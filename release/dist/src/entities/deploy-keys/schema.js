"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManageDeployKeySchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
const schema_readonly_1 = require("./schema-readonly");
const canPushField = utils_1.flexibleBoolean
    .optional()
    .describe('Whether the key may push to the repository (read/write). Default false (read-only).');
const AddDeployKeySchema = zod_1.z.object({
    action: zod_1.z.literal('add').describe('Add a deploy key to the project'),
    project_id: schema_readonly_1.projectIdField,
    title: zod_1.z.string().describe('Human-readable name for the deploy key.'),
    key: zod_1.z.string().describe('The SSH public key (e.g. "ssh-ed25519 AAAA... comment").'),
    can_push: canPushField,
    expires_at: zod_1.z
        .string()
        .optional()
        .describe('Optional expiry date in YYYY-MM-DD format (e.g. "2026-12-31").'),
});
const EnableDeployKeySchema = zod_1.z.object({
    action: zod_1.z
        .literal('enable')
        .describe('Enable an existing deploy key (from another project) on this project'),
    project_id: schema_readonly_1.projectIdField,
    key_id: schema_readonly_1.keyIdField,
});
const UpdateDeployKeySchema = zod_1.z.object({
    action: zod_1.z.literal('update').describe('Update a deploy key title or push permission'),
    project_id: schema_readonly_1.projectIdField,
    key_id: schema_readonly_1.keyIdField,
    title: zod_1.z.string().optional().describe('New title for the deploy key.'),
    can_push: canPushField,
});
const DeleteDeployKeySchema = zod_1.z.object({
    action: zod_1.z.literal('delete').describe('Remove a deploy key from the project'),
    project_id: schema_readonly_1.projectIdField,
    key_id: schema_readonly_1.keyIdField,
});
exports.ManageDeployKeySchema = zod_1.z
    .discriminatedUnion('action', [
    AddDeployKeySchema,
    EnableDeployKeySchema,
    UpdateDeployKeySchema,
    DeleteDeployKeySchema,
])
    .refine((data) => data.action !== 'update' || data.title !== undefined || data.can_push !== undefined, {
    message: 'update requires at least one of: title, can_push',
    path: ['title'],
});
//# sourceMappingURL=schema.js.map