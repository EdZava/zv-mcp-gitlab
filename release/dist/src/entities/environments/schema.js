"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManageEnvironmentSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
const projectIdField = utils_1.requiredId.describe("Project ID or URL-encoded path (e.g., 'my-group/my-project')");
const environmentIdField = zod_1.z.coerce
    .number()
    .int()
    .positive()
    .describe('Numeric ID of the environment');
const tierField = zod_1.z
    .enum(['production', 'staging', 'testing', 'development', 'other'])
    .describe('Deployment tier of the environment');
const externalUrlField = zod_1.z
    .string()
    .url()
    .describe('URL where the deployed environment can be reached (e.g., https://staging.example.com)');
const descriptionField = zod_1.z.string().describe('Description of the environment');
const CreateEnvironmentSchema = zod_1.z.object({
    action: zod_1.z.literal('create').describe('Create a new environment'),
    project_id: projectIdField,
    name: zod_1.z.string().describe('Name of the environment'),
    external_url: externalUrlField.optional(),
    tier: tierField.optional(),
    description: descriptionField.optional(),
});
const UpdateEnvironmentSchema = zod_1.z.object({
    action: zod_1.z
        .literal('update')
        .describe('Update an existing environment (name cannot be changed via the API)'),
    project_id: projectIdField,
    environment_id: environmentIdField,
    external_url: externalUrlField.optional(),
    tier: tierField.optional(),
    description: descriptionField.optional(),
});
const StopEnvironmentSchema = zod_1.z.object({
    action: zod_1.z.literal('stop').describe('Stop an environment (required before it can be deleted)'),
    project_id: projectIdField,
    environment_id: environmentIdField,
    force: utils_1.flexibleBoolean
        .optional()
        .describe('Force the stop, skipping the on_stop action if one is defined'),
});
const DeleteEnvironmentSchema = zod_1.z.object({
    action: zod_1.z.literal('delete').describe('Delete a stopped environment'),
    project_id: projectIdField,
    environment_id: environmentIdField,
});
const UpdateDeploymentStatusSchema = zod_1.z.object({
    action: zod_1.z
        .literal('update_deployment_status')
        .describe('Update the status of a deployment. Only deployments not tied to a pipeline job can be updated.'),
    project_id: projectIdField,
    deployment_id: zod_1.z.coerce
        .number()
        .int()
        .positive()
        .describe('Numeric ID of the deployment to update'),
    status: zod_1.z.enum(['running', 'success', 'failed', 'canceled']).describe('New deployment status'),
});
exports.ManageEnvironmentSchema = zod_1.z
    .discriminatedUnion('action', [
    CreateEnvironmentSchema,
    UpdateEnvironmentSchema,
    StopEnvironmentSchema,
    DeleteEnvironmentSchema,
    UpdateDeploymentStatusSchema,
])
    .refine((data) => data.action !== 'update' ||
    data.external_url !== undefined ||
    data.tier !== undefined ||
    data.description !== undefined, {
    message: 'update requires at least one of: external_url, tier, description',
    path: ['external_url'],
});
//# sourceMappingURL=schema.js.map