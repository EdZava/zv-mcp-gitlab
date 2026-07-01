"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowseJobTokenScopeSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
const projectIdField = utils_1.requiredId.describe("Project whose job token scope is inspected. Numeric ID or URL-encoded path (e.g. 'group/project' or '123').");
const GetJobTokenScopeSchema = zod_1.z.object({
    action: zod_1.z
        .literal('get')
        .describe('Get the job token scope settings (inbound_enabled / outbound_enabled)'),
    project_id: projectIdField,
});
const ListProjectsSchema = zod_1.z.object({
    action: zod_1.z
        .literal('list_projects')
        .describe('List projects on the inbound job token allowlist for this project'),
    project_id: projectIdField,
    ...(0, utils_1.paginationFields)(),
});
const ListGroupsSchema = zod_1.z.object({
    action: zod_1.z
        .literal('list_groups')
        .describe('List groups on the inbound job token allowlist for this project'),
    project_id: projectIdField,
    ...(0, utils_1.paginationFields)(),
});
exports.BrowseJobTokenScopeSchema = zod_1.z.discriminatedUnion('action', [
    GetJobTokenScopeSchema,
    ListProjectsSchema,
    ListGroupsSchema,
]);
//# sourceMappingURL=schema-readonly.js.map