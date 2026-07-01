"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowseAccessTokensSchema = exports.tokenIdField = exports.groupIdField = exports.projectIdField = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
exports.projectIdField = utils_1.requiredId.describe("Project ID or URL-encoded path (e.g. 'group/project' or '123').");
exports.groupIdField = utils_1.requiredId.describe("Group ID or URL-encoded path (e.g. 'my-group' or '42').");
exports.tokenIdField = zod_1.z.coerce
    .number()
    .int()
    .positive()
    .describe('Numeric access-token ID (from a list action).');
const stateFilter = zod_1.z.enum(['active', 'inactive']).optional().describe('Filter by token state.');
const ListPersonalSchema = zod_1.z.object({
    action: zod_1.z
        .literal('list_personal')
        .describe('List personal access tokens for the current user (admins may filter by user_id)'),
    user_id: zod_1.z.coerce
        .number()
        .int()
        .positive()
        .optional()
        .describe('Admin only: list PATs belonging to this user ID.'),
    revoked: utils_1.flexibleBoolean.optional().describe('Filter by revoked state.'),
    state: stateFilter,
    search: zod_1.z.string().optional().describe('Filter by token name substring.'),
    ...(0, utils_1.paginationFields)(),
});
const ListProjectSchema = zod_1.z.object({
    action: zod_1.z.literal('list_project').describe('List a project access tokens'),
    project_id: exports.projectIdField,
    state: stateFilter,
    ...(0, utils_1.paginationFields)(),
});
const ListGroupSchema = zod_1.z.object({
    action: zod_1.z.literal('list_group').describe('List a group access tokens'),
    group_id: exports.groupIdField,
    state: stateFilter,
    ...(0, utils_1.paginationFields)(),
});
const GetTokenSchema = zod_1.z.object({
    action: zod_1.z
        .literal('get')
        .describe('Get a single access token by ID. Pass project_id for a project token, group_id for a group token, or neither for a personal token.'),
    token_id: exports.tokenIdField,
    project_id: utils_1.requiredId.optional().describe('Set for a project access token.'),
    group_id: utils_1.requiredId.optional().describe('Set for a group access token.'),
});
exports.BrowseAccessTokensSchema = zod_1.z
    .discriminatedUnion('action', [
    ListPersonalSchema,
    ListProjectSchema,
    ListGroupSchema,
    GetTokenSchema,
])
    .refine((data) => data.action !== 'get' || !(data.project_id && data.group_id), {
    message: 'Pass at most one of project_id or group_id (a token belongs to a single scope)',
    path: ['project_id'],
});
//# sourceMappingURL=schema-readonly.js.map