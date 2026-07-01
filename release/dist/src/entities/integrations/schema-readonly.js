"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowseIntegrationsSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
const schema_1 = require("./schema");
const projectIdField = zod_1.z.string().describe('Project ID or URL-encoded path');
const ListIntegrationsSchema = zod_1.z.object({
    action: zod_1.z.literal('list').describe('List all active integrations for a project'),
    project_id: projectIdField,
    ...(0, utils_1.paginationFields)(),
});
const GetIntegrationSchema = zod_1.z.object({
    action: zod_1.z.literal('get').describe('Get integration settings (read-only)'),
    project_id: projectIdField,
    integration: schema_1.IntegrationTypeSchema.describe('Integration type slug (e.g., slack, jira, discord). Note: gitlab-slack-application cannot be created via API - it requires OAuth installation from GitLab UI.'),
});
exports.BrowseIntegrationsSchema = zod_1.z.discriminatedUnion('action', [
    ListIntegrationsSchema,
    GetIntegrationSchema,
]);
//# sourceMappingURL=schema-readonly.js.map