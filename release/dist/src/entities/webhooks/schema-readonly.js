"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowseWebhooksSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
const scopeField = zod_1.z.enum(['project', 'group']).describe('Scope of webhook (project or group)');
const ListWebhooksSchema = zod_1.z.object({
    action: zod_1.z.literal('list').describe('List all webhooks for a project or group'),
    scope: scopeField,
    projectId: zod_1.z.string().optional().describe('Project ID or path (required if scope=project)'),
    groupId: zod_1.z.string().optional().describe('Group ID or path (required if scope=group)'),
    ...(0, utils_1.paginationFields)(),
});
const GetWebhookSchema = zod_1.z.object({
    action: zod_1.z.literal('get').describe('Get webhook details by ID'),
    scope: scopeField,
    projectId: zod_1.z.string().optional().describe('Project ID or path (required if scope=project)'),
    groupId: zod_1.z.string().optional().describe('Group ID or path (required if scope=group)'),
    hookId: utils_1.requiredId.describe('Webhook ID (required)'),
});
exports.BrowseWebhooksSchema = zod_1.z.discriminatedUnion('action', [
    ListWebhooksSchema,
    GetWebhookSchema,
]);
//# sourceMappingURL=schema-readonly.js.map