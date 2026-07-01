"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManageRunnerSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
const groupPathField = utils_1.requiredId.describe("Group full path for a group runner (e.g., 'my-group')");
const projectPathField = utils_1.requiredId.describe("Project full path for a project runner (e.g., 'my-group/my-project')");
const runnerIdField = zod_1.z.coerce
    .number()
    .int()
    .positive()
    .describe('Numeric ID of the runner (from browse_runners); expanded to a global ID internally');
const accessLevelField = zod_1.z
    .enum(['NOT_PROTECTED', 'REF_PROTECTED'])
    .optional()
    .describe('Access level: NOT_PROTECTED or REF_PROTECTED (protected refs only)');
const tagListField = zod_1.z.array(zod_1.z.string()).optional().describe('Tags that determine which jobs run');
const descriptionField = zod_1.z.string().optional().describe('Runner description');
const maintenanceNoteField = zod_1.z
    .string()
    .optional()
    .describe('Free-form maintenance note (Markdown)');
const maximumTimeoutField = zod_1.z.coerce
    .number()
    .int()
    .optional()
    .describe('Maximum job timeout in seconds');
const runnerSettings = {
    description: descriptionField,
    paused: utils_1.flexibleBoolean.optional().describe('Whether the runner is paused (ignores new jobs)'),
    locked: utils_1.flexibleBoolean.optional().describe('Lock the runner to its current projects'),
    run_untagged: utils_1.flexibleBoolean.optional().describe('Allow running untagged jobs'),
    tag_list: tagListField,
    access_level: accessLevelField,
    maximum_timeout: maximumTimeoutField,
    maintenance_note: maintenanceNoteField,
};
const CreateRunnerSchema = zod_1.z.object({
    action: zod_1.z
        .literal('create_authentication_token')
        .describe('Create a new runner and return its one-time authentication token (GitLab 16+ flow). ' +
        'For GROUP_TYPE pass group_id; for PROJECT_TYPE pass project_id.'),
    runner_type: zod_1.z
        .enum(['INSTANCE_TYPE', 'GROUP_TYPE', 'PROJECT_TYPE'])
        .describe('Runner scope. INSTANCE_TYPE needs admin; GROUP_TYPE/PROJECT_TYPE need the namespace'),
    group_id: groupPathField.optional(),
    project_id: projectPathField.optional(),
    ...runnerSettings,
});
const UpdateRunnerSchema = zod_1.z.object({
    action: zod_1.z.literal('update').describe("Update a runner's settings"),
    runner_id: runnerIdField,
    ...runnerSettings,
});
const PauseRunnerSchema = zod_1.z.object({
    action: zod_1.z.literal('pause').describe('Pause a runner (stops it picking up new jobs)'),
    runner_id: runnerIdField,
});
const ResumeRunnerSchema = zod_1.z.object({
    action: zod_1.z.literal('resume').describe('Resume a paused runner'),
    runner_id: runnerIdField,
});
const DeleteRunnerSchema = zod_1.z.object({
    action: zod_1.z.literal('delete').describe('Delete a runner permanently'),
    runner_id: runnerIdField,
});
const ResetTokenSchema = zod_1.z.object({
    action: zod_1.z
        .literal('reset_authentication_token')
        .describe('Rotate the runner authentication token, returning the new value'),
    runner_id: runnerIdField,
});
exports.ManageRunnerSchema = zod_1.z.discriminatedUnion('action', [
    CreateRunnerSchema,
    UpdateRunnerSchema,
    PauseRunnerSchema,
    ResumeRunnerSchema,
    DeleteRunnerSchema,
    ResetTokenSchema,
]);
//# sourceMappingURL=schema.js.map