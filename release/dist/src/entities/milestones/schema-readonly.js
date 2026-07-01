"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowseMilestonesSchema = exports.GitLabMilestonesSchema = exports.GitLabMilestoneSchema = void 0;
const zod_1 = require("zod");
const shared_1 = require("../shared");
Object.defineProperty(exports, "GitLabMilestoneSchema", { enumerable: true, get: function () { return shared_1.GitLabMilestoneSchema; } });
const utils_1 = require("../utils");
exports.GitLabMilestonesSchema = zod_1.z.object({
    id: zod_1.z.coerce.string(),
    iid: zod_1.z.coerce.string(),
    project_id: zod_1.z.coerce.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string().nullable(),
    due_date: zod_1.z.string().nullable(),
    start_date: zod_1.z.string().nullable(),
    state: zod_1.z.string(),
    updated_at: zod_1.z.string(),
    created_at: zod_1.z.string(),
    expired: utils_1.flexibleBoolean,
    web_url: zod_1.z.string().optional(),
});
const namespaceField = zod_1.z.string().describe('Namespace path (group or project)');
const milestoneIdField = utils_1.requiredId.describe("The ID of a project or group milestone. Required for 'get', 'issues', 'merge_requests', 'burndown' action(s).");
const ListMilestonesSchema = zod_1.z.object({
    action: zod_1.z.literal('list').describe('List milestones with optional filtering'),
    namespace: namespaceField,
    iids: zod_1.z.array(zod_1.z.string()).optional().describe('Return only the milestones having the given iid'),
    state: zod_1.z
        .enum(['active', 'closed'])
        .optional()
        .describe('Return only active or closed milestones'),
    title: zod_1.z
        .string()
        .optional()
        .describe('Return only milestones with a title matching the provided string'),
    search: zod_1.z
        .string()
        .optional()
        .describe('Return only milestones with a title or description matching the provided string'),
    include_ancestors: utils_1.flexibleBoolean.optional().describe('Include ancestor groups'),
    updated_before: zod_1.z
        .string()
        .optional()
        .describe('Return milestones updated before the specified date (ISO 8601 format)'),
    updated_after: zod_1.z
        .string()
        .optional()
        .describe('Return milestones updated after the specified date (ISO 8601 format)'),
    ...(0, utils_1.paginationFields)(),
});
const GetMilestoneSchema = zod_1.z.object({
    action: zod_1.z.literal('get').describe('Get a single milestone by ID'),
    namespace: namespaceField,
    milestone_id: milestoneIdField,
});
const MilestoneIssuesSchema = zod_1.z.object({
    action: zod_1.z.literal('issues').describe('List issues assigned to a milestone'),
    namespace: namespaceField,
    milestone_id: milestoneIdField,
    ...(0, utils_1.paginationFields)(),
});
const MilestoneMergeRequestsSchema = zod_1.z.object({
    action: zod_1.z.literal('merge_requests').describe('List merge requests assigned to a milestone'),
    namespace: namespaceField,
    milestone_id: milestoneIdField,
    ...(0, utils_1.paginationFields)(),
});
const MilestoneBurndownSchema = zod_1.z.object({
    action: zod_1.z.literal('burndown').describe('Get burndown chart data for a milestone'),
    namespace: namespaceField,
    milestone_id: milestoneIdField,
    ...(0, utils_1.paginationFields)(),
});
exports.BrowseMilestonesSchema = zod_1.z.discriminatedUnion('action', [
    ListMilestonesSchema,
    GetMilestoneSchema,
    MilestoneIssuesSchema,
    MilestoneMergeRequestsSchema,
    MilestoneBurndownSchema,
]);
//# sourceMappingURL=schema-readonly.js.map