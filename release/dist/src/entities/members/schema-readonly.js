"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessLevelSchema = exports.BrowseMembersSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
const shared_1 = require("../shared");
const AccessLevelSchema = zod_1.z
    .number()
    .int()
    .refine((val) => [0, 5, 10, 20, 30, 40, 50].includes(val), {
    message: 'Access level must be 0 (No access), 5 (Minimal), 10 (Guest), 20 (Reporter), 30 (Developer), 40 (Maintainer), or 50 (Owner)',
})
    .describe('Access level: 0=No access, 5=Minimal, 10=Guest, 20=Reporter, 30=Developer, 40=Maintainer, 50=Owner');
exports.AccessLevelSchema = AccessLevelSchema;
const ListProjectMembersSchema = zod_1.z
    .object({
    action: zod_1.z.literal('list_project').describe('List all members of a project'),
    project_id: utils_1.requiredId.describe('Project ID or URL-encoded path'),
    query: zod_1.z.string().optional().describe('Search members by name or username'),
    user_ids: zod_1.z.array(zod_1.z.coerce.string()).optional().describe('Filter to specific user IDs'),
})
    .merge(shared_1.PaginationOptionsSchema);
const ListGroupMembersSchema = zod_1.z
    .object({
    action: zod_1.z.literal('list_group').describe('List all members of a group'),
    group_id: utils_1.requiredId.describe('Group ID or URL-encoded path'),
    query: zod_1.z.string().optional().describe('Search members by name or username'),
    user_ids: zod_1.z.array(zod_1.z.coerce.string()).optional().describe('Filter to specific user IDs'),
})
    .merge(shared_1.PaginationOptionsSchema);
const GetProjectMemberSchema = zod_1.z.object({
    action: zod_1.z.literal('get_project').describe('Get a specific member of a project'),
    project_id: utils_1.requiredId.describe('Project ID or URL-encoded path'),
    user_id: utils_1.requiredId.describe('User ID of the member'),
    include_inherited: zod_1.z
        .boolean()
        .optional()
        .describe('Include members inherited from parent groups'),
});
const GetGroupMemberSchema = zod_1.z.object({
    action: zod_1.z.literal('get_group').describe('Get a specific member of a group'),
    group_id: utils_1.requiredId.describe('Group ID or URL-encoded path'),
    user_id: utils_1.requiredId.describe('User ID of the member'),
    include_inherited: zod_1.z
        .boolean()
        .optional()
        .describe('Include members inherited from parent groups'),
});
const ListAllProjectMembersSchema = zod_1.z
    .object({
    action: zod_1.z
        .literal('list_all_project')
        .describe('List all project members including inherited from parent groups'),
    project_id: utils_1.requiredId.describe('Project ID or URL-encoded path'),
    query: zod_1.z.string().optional().describe('Search members by name or username'),
    user_ids: zod_1.z.array(zod_1.z.coerce.string()).optional().describe('Filter to specific user IDs'),
    state: zod_1.z.enum(['active', 'awaiting', 'blocked']).optional().describe('Filter by member state'),
})
    .merge(shared_1.PaginationOptionsSchema);
const ListAllGroupMembersSchema = zod_1.z
    .object({
    action: zod_1.z
        .literal('list_all_group')
        .describe('List all group members including inherited from parent groups'),
    group_id: utils_1.requiredId.describe('Group ID or URL-encoded path'),
    query: zod_1.z.string().optional().describe('Search members by name or username'),
    user_ids: zod_1.z.array(zod_1.z.coerce.string()).optional().describe('Filter to specific user IDs'),
    state: zod_1.z.enum(['active', 'awaiting', 'blocked']).optional().describe('Filter by member state'),
})
    .merge(shared_1.PaginationOptionsSchema);
exports.BrowseMembersSchema = zod_1.z.discriminatedUnion('action', [
    ListProjectMembersSchema,
    ListGroupMembersSchema,
    GetProjectMemberSchema,
    GetGroupMemberSchema,
    ListAllProjectMembersSchema,
    ListAllGroupMembersSchema,
]);
//# sourceMappingURL=schema-readonly.js.map