"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManageJobTokenScopeSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
const projectIdField = utils_1.requiredId.describe("Project whose job token scope is modified. Numeric ID or URL-encoded path (e.g. 'group/project' or '123').");
const targetProjectIdField = zod_1.z.coerce
    .number()
    .int()
    .positive()
    .describe('Numeric ID of the project to add/remove from the inbound allowlist.');
const targetGroupIdField = zod_1.z.coerce
    .number()
    .int()
    .positive()
    .describe('Numeric ID of the group to add/remove from the inbound allowlist.');
const SetEnabledSchema = zod_1.z.object({
    action: zod_1.z
        .literal('set_enabled')
        .describe('Enable or disable inbound job token access restriction (allowlist enforcement)'),
    project_id: projectIdField,
    enabled: utils_1.flexibleBoolean.describe('When true, only allowlisted projects/groups may access this project via CI_JOB_TOKEN.'),
});
const AddProjectSchema = zod_1.z.object({
    action: zod_1.z.literal('add_project').describe('Add a project to the inbound job token allowlist'),
    project_id: projectIdField,
    target_project_id: targetProjectIdField,
});
const RemoveProjectSchema = zod_1.z.object({
    action: zod_1.z
        .literal('remove_project')
        .describe('Remove a project from the inbound job token allowlist'),
    project_id: projectIdField,
    target_project_id: targetProjectIdField,
});
const AddGroupSchema = zod_1.z.object({
    action: zod_1.z.literal('add_group').describe('Add a group to the inbound job token allowlist'),
    project_id: projectIdField,
    target_group_id: targetGroupIdField,
});
const RemoveGroupSchema = zod_1.z.object({
    action: zod_1.z.literal('remove_group').describe('Remove a group from the inbound job token allowlist'),
    project_id: projectIdField,
    target_group_id: targetGroupIdField,
});
exports.ManageJobTokenScopeSchema = zod_1.z.discriminatedUnion('action', [
    SetEnabledSchema,
    AddProjectSchema,
    RemoveProjectSchema,
    AddGroupSchema,
    RemoveGroupSchema,
]);
//# sourceMappingURL=schema.js.map