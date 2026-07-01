"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManageMemberSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
const schema_readonly_1 = require("./schema-readonly");
const AddProjectMemberSchema = zod_1.z.object({
    action: zod_1.z.literal('add_to_project').describe('Add a user as member to a project'),
    project_id: utils_1.requiredId.describe('Project ID or URL-encoded path'),
    user_id: utils_1.requiredId.describe('User ID to add'),
    access_level: schema_readonly_1.AccessLevelSchema,
    expires_at: zod_1.z
        .string()
        .optional()
        .describe('Membership expiration date in ISO 8601 format (YYYY-MM-DD)'),
});
const AddGroupMemberSchema = zod_1.z.object({
    action: zod_1.z.literal('add_to_group').describe('Add a user as member to a group'),
    group_id: utils_1.requiredId.describe('Group ID or URL-encoded path'),
    user_id: utils_1.requiredId.describe('User ID to add'),
    access_level: schema_readonly_1.AccessLevelSchema,
    expires_at: zod_1.z
        .string()
        .optional()
        .describe('Membership expiration date in ISO 8601 format (YYYY-MM-DD)'),
});
const RemoveProjectMemberSchema = zod_1.z.object({
    action: zod_1.z.literal('remove_from_project').describe('Remove a member from a project'),
    project_id: utils_1.requiredId.describe('Project ID or URL-encoded path'),
    user_id: utils_1.requiredId.describe('User ID to remove'),
    skip_subresources: zod_1.z.boolean().optional().describe('Skip removing from subprojects and forks'),
    unassign_issuables: zod_1.z
        .boolean()
        .optional()
        .describe('Unassign member from issues and merge requests'),
});
const RemoveGroupMemberSchema = zod_1.z.object({
    action: zod_1.z.literal('remove_from_group').describe('Remove a member from a group'),
    group_id: utils_1.requiredId.describe('Group ID or URL-encoded path'),
    user_id: utils_1.requiredId.describe('User ID to remove'),
    skip_subresources: zod_1.z.boolean().optional().describe('Skip removing from subgroups and projects'),
    unassign_issuables: zod_1.z
        .boolean()
        .optional()
        .describe('Unassign member from issues and merge requests'),
});
const UpdateProjectMemberSchema = zod_1.z.object({
    action: zod_1.z.literal('update_project').describe('Update access level of a project member'),
    project_id: utils_1.requiredId.describe('Project ID or URL-encoded path'),
    user_id: utils_1.requiredId.describe('User ID to update'),
    access_level: schema_readonly_1.AccessLevelSchema,
    expires_at: zod_1.z
        .string()
        .optional()
        .describe('Membership expiration date in ISO 8601 format (YYYY-MM-DD)'),
});
const UpdateGroupMemberSchema = zod_1.z.object({
    action: zod_1.z.literal('update_group').describe('Update access level of a group member'),
    group_id: utils_1.requiredId.describe('Group ID or URL-encoded path'),
    user_id: utils_1.requiredId.describe('User ID to update'),
    access_level: schema_readonly_1.AccessLevelSchema,
    expires_at: zod_1.z
        .string()
        .optional()
        .describe('Membership expiration date in ISO 8601 format (YYYY-MM-DD)'),
    member_role_id: zod_1.z
        .number()
        .int()
        .optional()
        .describe('ID of a custom member role (Ultimate only)'),
});
exports.ManageMemberSchema = zod_1.z.discriminatedUnion('action', [
    AddProjectMemberSchema,
    AddGroupMemberSchema,
    RemoveProjectMemberSchema,
    RemoveGroupMemberSchema,
    UpdateProjectMemberSchema,
    UpdateGroupMemberSchema,
]);
//# sourceMappingURL=schema.js.map