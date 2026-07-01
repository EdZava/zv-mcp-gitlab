"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowseRunnersSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
const projectPathField = utils_1.requiredId.describe("Project full path (e.g., 'my-group/my-project') - required by the GraphQL project lookup");
const groupPathField = utils_1.requiredId.describe("Group full path (e.g., 'my-group' or 'my-group/sub') - required by the GraphQL group lookup");
const runnerIdField = zod_1.z.coerce
    .number()
    .int()
    .positive()
    .describe('Numeric ID of the runner (from a list action); expanded to a global ID internally');
const runnerTypeFilter = zod_1.z
    .enum(['INSTANCE_TYPE', 'GROUP_TYPE', 'PROJECT_TYPE'])
    .optional()
    .describe('Filter by runner type');
const runnerStatusFilter = zod_1.z
    .enum(['ONLINE', 'OFFLINE', 'STALE', 'NEVER_CONTACTED'])
    .optional()
    .describe('Filter by runner status');
const pausedFilter = utils_1.flexibleBoolean.optional().describe('Filter by paused state');
const tagListFilter = zod_1.z
    .array(zod_1.z.string())
    .optional()
    .describe('Filter by runners that have ALL of these tags');
const searchFilter = zod_1.z.string().optional().describe('Filter by description/token substring');
const firstField = zod_1.z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .optional()
    .describe('Max items to return (cursor pagination, default 20, max 100)');
const afterField = zod_1.z.string().optional().describe('Cursor for the next page (endCursor)');
const listFilters = {
    type: runnerTypeFilter,
    status: runnerStatusFilter,
    paused: pausedFilter,
    tag_list: tagListFilter,
    search: searchFilter,
    first: firstField,
    after: afterField,
};
const ListAllRunnersSchema = zod_1.z.object({
    action: zod_1.z
        .literal('list_all')
        .describe('List all runners on the instance (requires admin / elevated access)'),
    ...listFilters,
});
const ListOwnedRunnersSchema = zod_1.z.object({
    action: zod_1.z.literal('list_owned').describe('List runners owned by the current user'),
    ...listFilters,
});
const ListProjectRunnersSchema = zod_1.z.object({
    action: zod_1.z.literal('list_project').describe('List runners available to a project'),
    project_id: projectPathField,
    ...listFilters,
});
const ListGroupRunnersSchema = zod_1.z.object({
    action: zod_1.z.literal('list_group').describe('List runners available to a group'),
    group_id: groupPathField,
    ...listFilters,
});
const GetRunnerSchema = zod_1.z.object({
    action: zod_1.z.literal('get').describe('Get a single runner by its numeric ID'),
    runner_id: runnerIdField,
});
const ListRunnerJobsSchema = zod_1.z.object({
    action: zod_1.z.literal('list_jobs').describe('List jobs that have run on a runner'),
    runner_id: runnerIdField,
    statuses: zod_1.z
        .array(zod_1.z.enum([
        'CREATED',
        'PENDING',
        'RUNNING',
        'FAILED',
        'SUCCESS',
        'CANCELED',
        'SKIPPED',
        'MANUAL',
        'SCHEDULED',
        'WAITING_FOR_RESOURCE',
        'PREPARING',
        'CANCELING',
    ]))
        .optional()
        .describe('Filter jobs by one or more statuses (e.g. ["FAILED", "CANCELED"])'),
    first: firstField,
    after: afterField,
});
exports.BrowseRunnersSchema = zod_1.z.discriminatedUnion('action', [
    ListAllRunnersSchema,
    ListOwnedRunnersSchema,
    ListProjectRunnersSchema,
    ListGroupRunnersSchema,
    GetRunnerSchema,
    ListRunnerJobsSchema,
]);
//# sourceMappingURL=schema-readonly.js.map