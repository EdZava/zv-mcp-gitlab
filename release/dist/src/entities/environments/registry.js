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
exports.environmentsToolRegistry = void 0;
exports.getEnvironmentsReadOnlyToolNames = getEnvironmentsReadOnlyToolNames;
const z = __importStar(require("zod"));
const schema_readonly_1 = require("./schema-readonly");
const schema_1 = require("./schema");
const gitlab_api_1 = require("../../utils/gitlab-api");
const utils_1 = require("../utils");
exports.environmentsToolRegistry = new Map([
    [
        'browse_environments',
        {
            name: 'browse_environments',
            description: 'Inspect project environments and their deployments. Actions: list (environments filtered by state/name), get (single environment with its last deployment), list_deployments (deployment history, filterable by environment and status). Related: manage_environment to create, update, stop, or delete environments and update deployment status.',
            inputSchema: z.toJSONSchema(schema_readonly_1.BrowseEnvironmentsSchema),
            requirements: { default: { tier: 'free', minVersion: '8.0' } },
            gate: { envVar: 'USE_ENVIRONMENTS', defaultValue: true },
            handler: async (args) => {
                const input = schema_readonly_1.BrowseEnvironmentsSchema.parse(args);
                (0, utils_1.assertActionAllowed)('browse_environments', input.action);
                const encodedProjectId = encodeURIComponent(input.project_id);
                switch (input.action) {
                    case 'list': {
                        const { action: _action, project_id: _projectId, ...queryOptions } = input;
                        return gitlab_api_1.gitlab.get(`projects/${encodedProjectId}/environments`, {
                            query: (0, gitlab_api_1.toQuery)(queryOptions, []),
                        });
                    }
                    case 'get': {
                        return gitlab_api_1.gitlab.get(`projects/${encodedProjectId}/environments/${input.environment_id}`);
                    }
                    case 'list_deployments': {
                        const { action: _action, project_id: _projectId, ...queryOptions } = input;
                        return gitlab_api_1.gitlab.get(`projects/${encodedProjectId}/deployments`, {
                            query: (0, gitlab_api_1.toQuery)(queryOptions, []),
                        });
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
    [
        'manage_environment',
        {
            name: 'manage_environment',
            description: 'Create and control project environments and deployment status. Actions: create (new environment), update (external_url/tier/description), stop (required before delete), delete (stopped environment), update_deployment_status (set a non-pipeline deployment to running/success/failed/canceled). Related: browse_environments to list and inspect.',
            inputSchema: z.toJSONSchema(schema_1.ManageEnvironmentSchema),
            requirements: { default: { tier: 'free', minVersion: '8.0' } },
            gate: { envVar: 'USE_ENVIRONMENTS', defaultValue: true },
            handler: async (args) => {
                const input = schema_1.ManageEnvironmentSchema.parse(args);
                (0, utils_1.assertActionAllowed)('manage_environment', input.action);
                const encodedProjectId = encodeURIComponent(input.project_id);
                switch (input.action) {
                    case 'create': {
                        const { name, external_url, tier, description } = input;
                        const body = { name };
                        if (external_url !== undefined)
                            body.external_url = external_url;
                        if (tier !== undefined)
                            body.tier = tier;
                        if (description !== undefined)
                            body.description = description;
                        return gitlab_api_1.gitlab.post(`projects/${encodedProjectId}/environments`, {
                            body,
                            contentType: 'json',
                        });
                    }
                    case 'update': {
                        const { environment_id, external_url, tier, description } = input;
                        const body = {};
                        if (external_url !== undefined)
                            body.external_url = external_url;
                        if (tier !== undefined)
                            body.tier = tier;
                        if (description !== undefined)
                            body.description = description;
                        return gitlab_api_1.gitlab.put(`projects/${encodedProjectId}/environments/${environment_id}`, {
                            body,
                            contentType: 'json',
                        });
                    }
                    case 'stop': {
                        const { environment_id, force } = input;
                        const body = {};
                        if (force !== undefined)
                            body.force = force;
                        return gitlab_api_1.gitlab.post(`projects/${encodedProjectId}/environments/${environment_id}/stop`, {
                            body,
                            contentType: 'json',
                        });
                    }
                    case 'delete': {
                        const { environment_id } = input;
                        await gitlab_api_1.gitlab.delete(`projects/${encodedProjectId}/environments/${environment_id}`);
                        return { deleted: true, environment_id };
                    }
                    case 'update_deployment_status': {
                        const { deployment_id, status } = input;
                        return gitlab_api_1.gitlab.put(`projects/${encodedProjectId}/deployments/${deployment_id}`, {
                            body: { status },
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
function getEnvironmentsReadOnlyToolNames() {
    return ['browse_environments'];
}
//# sourceMappingURL=registry.js.map