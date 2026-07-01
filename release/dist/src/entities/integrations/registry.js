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
exports.integrationsToolRegistry = void 0;
exports.getIntegrationsReadOnlyToolNames = getIntegrationsReadOnlyToolNames;
exports.getIntegrationsToolDefinitions = getIntegrationsToolDefinitions;
exports.getFilteredIntegrationsTools = getFilteredIntegrationsTools;
const z = __importStar(require("zod"));
const schema_readonly_1 = require("./schema-readonly");
const schema_1 = require("./schema");
const gitlab_api_1 = require("../../utils/gitlab-api");
const config_1 = require("../../config");
const utils_1 = require("../utils");
exports.integrationsToolRegistry = new Map([
    [
        'browse_integrations',
        {
            name: 'browse_integrations',
            description: 'Discover active project integrations and their configuration. Actions: list (all active: Slack, Jira, Discord, Teams, Jenkins, etc.), get (specific integration settings by slug). Related: manage_integration to configure/disable.',
            inputSchema: z.toJSONSchema(schema_readonly_1.BrowseIntegrationsSchema, {}),
            requirements: { default: { tier: 'free', minVersion: '8.0' } },
            gate: { envVar: 'USE_INTEGRATIONS', defaultValue: true },
            handler: async (args) => {
                const input = schema_readonly_1.BrowseIntegrationsSchema.parse(args);
                (0, utils_1.assertActionAllowed)('browse_integrations', input.action);
                const projectId = (0, config_1.getEffectiveProjectId)(input.project_id);
                switch (input.action) {
                    case 'list': {
                        const query = (0, gitlab_api_1.toQuery)({
                            per_page: input.per_page,
                            page: input.page,
                        }, []);
                        return gitlab_api_1.gitlab.get(`projects/${encodeURIComponent(projectId)}/integrations`, { query });
                    }
                    case 'get': {
                        return gitlab_api_1.gitlab.get(`projects/${encodeURIComponent(projectId)}/integrations/${input.integration}`);
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
    [
        'manage_integration',
        {
            name: 'manage_integration',
            description: 'Configure or disable project integrations (50+ supported). Actions: update (enable/modify with integration-specific config), disable (deactivate integration). Note: gitlab-slack-application requires OAuth install from GitLab UI. Related: browse_integrations for discovery.',
            inputSchema: z.toJSONSchema(schema_1.ManageIntegrationSchema, {}),
            requirements: { default: { tier: 'free', minVersion: '8.0' } },
            gate: { envVar: 'USE_INTEGRATIONS', defaultValue: true },
            handler: async (args) => {
                const input = schema_1.ManageIntegrationSchema.parse(args);
                (0, utils_1.assertActionAllowed)('manage_integration', input.action);
                const projectId = (0, config_1.getEffectiveProjectId)(input.project_id);
                const integrationSlug = input.integration;
                switch (input.action) {
                    case 'update': {
                        const { action: _action, project_id: _project_id, integration: _integration, ...body } = input;
                        let finalBody = { ...body };
                        if (body.config) {
                            const { config, ...rest } = body;
                            finalBody = { ...rest, ...config };
                        }
                        return gitlab_api_1.gitlab.put(`projects/${encodeURIComponent(projectId)}/integrations/${integrationSlug}`, {
                            body: finalBody,
                            contentType: 'json',
                        });
                    }
                    case 'disable': {
                        await gitlab_api_1.gitlab.delete(`projects/${encodeURIComponent(projectId)}/integrations/${integrationSlug}`);
                        return { deleted: true };
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
]);
function getIntegrationsReadOnlyToolNames() {
    return ['browse_integrations'];
}
function getIntegrationsToolDefinitions() {
    return Array.from(exports.integrationsToolRegistry.values());
}
function getFilteredIntegrationsTools(readOnlyMode = false) {
    if (readOnlyMode) {
        const readOnlyNames = getIntegrationsReadOnlyToolNames();
        return Array.from(exports.integrationsToolRegistry.values()).filter((tool) => readOnlyNames.includes(tool.name));
    }
    return getIntegrationsToolDefinitions();
}
//# sourceMappingURL=registry.js.map