"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManageAccessTokenSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
const schema_readonly_1 = require("./schema-readonly");
const scopesField = zod_1.z
    .array(zod_1.z.string().trim().min(1, 'scope entries must be non-empty'))
    .min(1)
    .describe("Token scopes, e.g. ['api'], ['read_repository','write_repository']. At least one required.");
const accessLevelField = zod_1.z
    .union([zod_1.z.literal(10), zod_1.z.literal(20), zod_1.z.literal(30), zod_1.z.literal(40), zod_1.z.literal(50)])
    .optional()
    .describe('Access level: 10 Guest, 20 Reporter, 30 Developer, 40 Maintainer, 50 Owner.');
const expiresAtField = zod_1.z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'expires_at must be a YYYY-MM-DD date')
    .optional()
    .describe('Expiry date in YYYY-MM-DD format (e.g. "2026-12-31").');
const CreateProjectTokenSchema = zod_1.z.object({
    action: zod_1.z
        .literal('create_project')
        .describe('Create a project access token (returns the value once)'),
    project_id: schema_readonly_1.projectIdField,
    name: zod_1.z.string().describe('Human-readable token name.'),
    scopes: scopesField,
    access_level: accessLevelField,
    expires_at: expiresAtField,
});
const CreateGroupTokenSchema = zod_1.z.object({
    action: zod_1.z
        .literal('create_group')
        .describe('Create a group access token (returns the value once)'),
    group_id: schema_readonly_1.groupIdField,
    name: zod_1.z.string().describe('Human-readable token name.'),
    scopes: scopesField,
    access_level: accessLevelField,
    expires_at: expiresAtField,
});
const RotateTokenSchema = zod_1.z.object({
    action: zod_1.z
        .literal('rotate')
        .describe('Rotate a token: revoke the old one and return a new value. Pass project_id for a project token, group_id for a group token, or neither for a personal token.'),
    token_id: schema_readonly_1.tokenIdField,
    project_id: utils_1.requiredId.optional().describe('Set for a project access token.'),
    group_id: utils_1.requiredId.optional().describe('Set for a group access token.'),
    expires_at: expiresAtField,
});
const RevokeTokenSchema = zod_1.z.object({
    action: zod_1.z
        .literal('revoke')
        .describe('Revoke a token permanently. Pass project_id for a project token, group_id for a group token, or neither for a personal token.'),
    token_id: schema_readonly_1.tokenIdField,
    project_id: utils_1.requiredId.optional().describe('Set for a project access token.'),
    group_id: utils_1.requiredId.optional().describe('Set for a group access token.'),
});
exports.ManageAccessTokenSchema = zod_1.z
    .discriminatedUnion('action', [
    CreateProjectTokenSchema,
    CreateGroupTokenSchema,
    RotateTokenSchema,
    RevokeTokenSchema,
])
    .refine((data) => (data.action !== 'rotate' && data.action !== 'revoke') || !(data.project_id && data.group_id), {
    message: 'Pass at most one of project_id or group_id (a token belongs to a single scope)',
    path: ['project_id'],
});
//# sourceMappingURL=schema.js.map