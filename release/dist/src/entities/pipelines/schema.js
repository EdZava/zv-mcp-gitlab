"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagePipelineSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
const PipelineVariableSchema = zod_1.z.object({
    key: zod_1.z.string().describe('Variable name'),
    value: zod_1.z.string().describe('Variable value'),
    variable_type: zod_1.z
        .enum(['env_var', 'file'])
        .optional()
        .describe('Variable type: env_var (default) or file'),
});
const PipelineInputValueSchema = zod_1.z
    .union([zod_1.z.string(), zod_1.z.number(), zod_1.z.boolean(), zod_1.z.array(zod_1.z.string())])
    .describe('Input value: string, number, boolean, or array of strings');
const projectIdField = utils_1.requiredId.describe('Project ID or URL-encoded path');
const pipelineIdField = utils_1.requiredId.describe('The ID of the pipeline');
const jobIdField = utils_1.requiredId.describe('The ID of the job');
const CreatePipelineSchema = zod_1.z.object({
    action: zod_1.z.literal('create').describe('Trigger a new pipeline on branch/tag'),
    project_id: projectIdField,
    ref: zod_1.z.string().describe('The branch or tag to run the pipeline on'),
    variables: zod_1.z
        .array(PipelineVariableSchema)
        .optional()
        .describe('Legacy variables to pass to the pipeline (key-value pairs with optional type)'),
    inputs: zod_1.z
        .record(zod_1.z.string(), PipelineInputValueSchema)
        .optional()
        .describe('Typed pipeline inputs defined in .gitlab-ci.yml spec (GitLab 15.5+). Keys must match input names in pipeline spec.'),
});
const RetryPipelineSchema = zod_1.z.object({
    action: zod_1.z.literal('retry').describe('Re-run a failed/canceled pipeline'),
    project_id: projectIdField,
    pipeline_id: pipelineIdField,
});
const CancelPipelineSchema = zod_1.z.object({
    action: zod_1.z.literal('cancel').describe('Stop a running pipeline'),
    project_id: projectIdField,
    pipeline_id: pipelineIdField,
});
const PlayJobSchema = zod_1.z.object({
    action: zod_1.z.literal('play_job').describe('Trigger a manual job'),
    project_id: projectIdField,
    job_id: jobIdField,
    job_variables_attributes: zod_1.z
        .array(PipelineVariableSchema)
        .optional()
        .describe('Variables to pass to the job'),
});
const RetryJobSchema = zod_1.z.object({
    action: zod_1.z.literal('retry_job').describe('Re-run a failed/canceled job'),
    project_id: projectIdField,
    job_id: jobIdField,
});
const CancelJobSchema = zod_1.z.object({
    action: zod_1.z.literal('cancel_job').describe('Stop a running job'),
    project_id: projectIdField,
    job_id: jobIdField,
    force: zod_1.z.boolean().optional().describe('Force cancellation of the job'),
});
exports.ManagePipelineSchema = zod_1.z.discriminatedUnion('action', [
    CreatePipelineSchema,
    RetryPipelineSchema,
    CancelPipelineSchema,
    PlayJobSchema,
    RetryJobSchema,
    CancelJobSchema,
]);
//# sourceMappingURL=schema.js.map