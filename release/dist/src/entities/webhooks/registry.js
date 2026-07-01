"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhooksToolRegistry = void 0;
exports.getWebhooksReadOnlyToolNames = getWebhooksReadOnlyToolNames;
exports.getWebhooksToolDefinitions = getWebhooksToolDefinitions;
exports.getFilteredWebhooksTools = getFilteredWebhooksTools;
const z = __importStar(require("zod"));
const schema_readonly_1 = require("./schema-readonly");
const schema_1 = require("./schema");
const gitlab_api_1 = require("../../utils/gitlab-api");
const utils_1 = require("../utils");
exports.webhooksToolRegistry = new Map([
    [
        'browse_webhooks',
        {
            name: 'browse_webhooks',
            description: 'List and inspect webhook configurations for projects or groups. Actions: list (all webhooks with event types and status), get (webhook details by ID). Related: manage_webhook to create/update/delete/test.',
            inputSchema: z.toJSONSchema(schema_readonly_1.BrowseWebhooksSchema),
            requirements: { default: { tier: 'free', minVersion: '8.0', notes: 'Project webhooks' } },
            gate: { envVar: 'USE_WEBHOOKS', defaultValue: true },
            handler: async (args) => {
                const input = schema_readonly_1.BrowseWebhooksSchema.parse(args);
                (0, utils_1.assertActionAllowed)('browse_webhooks', input.action);
                const getBasePath = (scope, projectId, groupId) => {
                    if (scope === 'project' && projectId) {
                        return `projects/${encodeURIComponent(projectId)}/hooks`;
                    }
                    else if (scope === 'group' && groupId) {
                        return `groups/${encodeURIComponent(groupId)}/hooks`;
                    }
                    throw new Error('Invalid scope or missing project/group ID');
                };
                switch (input.action) {
                    case 'list': {
                        const basePath = getBasePath(input.scope, input.projectId, input.groupId);
                        const { action: _action, scope: _scope, projectId: _pid, groupId: _gid, ...queryParams } = input;
                        return gitlab_api_1.gitlab.get(basePath, {
                            query: (0, gitlab_api_1.toQuery)(queryParams, []),
                        });
                    }
                    case 'get': {
                        const basePath = getBasePath(input.scope, input.projectId, input.groupId);
                        return gitlab_api_1.gitlab.get(`${basePath}/${input.hookId}`);
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
    [
        'manage_webhook',
        {
            name: 'manage_webhook',
            description: 'Create, update, delete, or test webhooks for event-driven automation. Actions: create (URL + event types + optional secret), update (modify settings), delete (remove), test (trigger delivery for specific event). Related: browse_webhooks for inspection.',
            inputSchema: z.toJSONSchema(schema_1.ManageWebhookSchema),
            requirements: {
                default: { tier: 'free', minVersion: '8.0', notes: 'Project webhooks' },
                actions: {
                    create_group: { tier: 'premium', minVersion: '10.4', notes: 'Group webhooks' },
                    update_group: { tier: 'premium', minVersion: '10.4', notes: 'Group webhooks' },
                    delete_group: { tier: 'premium', minVersion: '10.4', notes: 'Group webhooks' },
                },
            },
            gate: { envVar: 'USE_WEBHOOKS', defaultValue: true },
            handler: async (args) => {
                const input = schema_1.ManageWebhookSchema.parse(args);
                (0, utils_1.assertActionAllowed)('manage_webhook', input.action);
                const getBasePath = (scope, projectId, groupId) => {
                    if (scope === 'project' && projectId) {
                        return `projects/${encodeURIComponent(projectId)}/hooks`;
                    }
                    else if (scope === 'group' && groupId) {
                        return `groups/${encodeURIComponent(groupId)}/hooks`;
                    }
                    throw new Error('Invalid scope or missing project/group ID');
                };
                const buildRequestBody = (data) => {
                    const body = {};
                    for (const [key, value] of Object.entries(data)) {
                        if (value !== undefined &&
                            !['action', 'scope', 'projectId', 'groupId', 'hookId', 'trigger'].includes(key)) {
                            body[key] = value;
                        }
                    }
                    return body;
                };
                switch (input.action) {
                    case 'create': {
                        const basePath = getBasePath(input.scope, input.projectId, input.groupId);
                        return gitlab_api_1.gitlab.post(basePath, {
                            body: buildRequestBody(input),
                            contentType: 'json',
                        });
                    }
                    case 'update': {
                        const basePath = getBasePath(input.scope, input.projectId, input.groupId);
                        return gitlab_api_1.gitlab.put(`${basePath}/${input.hookId}`, {
                            body: buildRequestBody(input),
                            contentType: 'json',
                        });
                    }
                    case 'delete': {
                        const basePath = getBasePath(input.scope, input.projectId, input.groupId);
                        await gitlab_api_1.gitlab.delete(`${basePath}/${input.hookId}`);
                        return { success: true, message: 'Webhook deleted successfully' };
                    }
                    case 'test': {
                        const basePath = getBasePath(input.scope, input.projectId, input.groupId);
                        return gitlab_api_1.gitlab.post(`${basePath}/${input.hookId}/test/${input.trigger}`, {
                            contentType: 'json',
                        });
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
]);
function getWebhooksReadOnlyToolNames() {
    return ['browse_webhooks'];
}
function getWebhooksToolDefinitions() {
    return Array.from(exports.webhooksToolRegistry.values());
}
function getFilteredWebhooksTools(readOnlyMode = false) {
    if (readOnlyMode) {
        const readOnlyNames = getWebhooksReadOnlyToolNames();
        return Array.from(exports.webhooksToolRegistry.values()).filter((tool) => readOnlyNames.includes(tool.name));
    }
    return getWebhooksToolDefinitions();
}
//# sourceMappingURL=registry.js.map