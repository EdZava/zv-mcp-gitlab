"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowseEnvironmentsSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
const projectIdField = utils_1.requiredId.describe("Project ID or URL-encoded path (e.g., 'my-group/my-project')");
const environmentIdField = zod_1.z.coerce
    .number()
    .int()
    .positive()
    .describe('Numeric ID of the environment');
const ListEnvironmentsSchema = zod_1.z.object({
    action: zod_1.z.literal('list').describe('List environments for a project'),
    project_id: projectIdField,
    name: zod_1.z.string().optional().describe('Return the environment with this exact name'),
    search: zod_1.z
        .string()
        .min(3)
        .optional()
        .describe('Return environments matching this search term (min 3 characters)'),
    states: zod_1.z
        .enum(['available', 'stopping', 'stopped'])
        .optional()
        .describe('Filter environments by state'),
    ...(0, utils_1.paginationFields)(),
});
const GetEnvironmentSchema = zod_1.z.object({
    action: zod_1.z
        .literal('get')
        .describe('Get a single environment by ID, including its last deployment'),
    project_id: projectIdField,
    environment_id: environmentIdField,
});
const ListDeploymentsSchema = zod_1.z.object({
    action: zod_1.z
        .literal('list_deployments')
        .describe('List deployments for a project, optionally filtered by environment'),
    project_id: projectIdField,
    environment: zod_1.z.string().optional().describe('Filter deployments by environment name'),
    status: zod_1.z
        .enum(['created', 'running', 'success', 'failed', 'canceled', 'skipped', 'blocked'])
        .optional()
        .describe('Filter deployments by status'),
    order_by: zod_1.z
        .enum(['id', 'iid', 'created_at', 'updated_at', 'finished_at', 'ref'])
        .optional()
        .describe('Order deployments by field (default: id)'),
    sort: zod_1.z.enum(['asc', 'desc']).optional().describe('Sort direction (default: asc)'),
    updated_after: zod_1.z
        .string()
        .optional()
        .describe('Return deployments updated after this ISO 8601 date'),
    updated_before: zod_1.z
        .string()
        .optional()
        .describe('Return deployments updated before this ISO 8601 date'),
    finished_after: zod_1.z
        .string()
        .optional()
        .describe('Return deployments finished after this ISO 8601 date (requires order_by=finished_at)'),
    finished_before: zod_1.z
        .string()
        .optional()
        .describe('Return deployments finished before this ISO 8601 date (requires order_by=finished_at)'),
    ...(0, utils_1.paginationFields)(),
});
exports.BrowseEnvironmentsSchema = zod_1.z.discriminatedUnion('action', [
    ListEnvironmentsSchema,
    GetEnvironmentSchema,
    ListDeploymentsSchema,
]);
//# sourceMappingURL=schema-readonly.js.map