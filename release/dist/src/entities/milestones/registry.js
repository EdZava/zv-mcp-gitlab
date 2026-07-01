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
exports.milestonesToolRegistry = void 0;
exports.getMilestonesReadOnlyToolNames = getMilestonesReadOnlyToolNames;
exports.getMilestonesToolDefinitions = getMilestonesToolDefinitions;
exports.getFilteredMilestonesTools = getFilteredMilestonesTools;
const z = __importStar(require("zod"));
const schema_readonly_1 = require("./schema-readonly");
const schema_1 = require("./schema");
const gitlab_api_1 = require("../../utils/gitlab-api");
const namespace_1 = require("../../utils/namespace");
const utils_1 = require("../utils");
exports.milestonesToolRegistry = new Map([
    [
        'browse_milestones',
        {
            name: 'browse_milestones',
            description: 'Track milestone progress with associated issues and MRs. Actions: list (filter by state/title/search), get (milestone details), issues (items in milestone), merge_requests (MRs targeting milestone), burndown (chart data for sprint tracking). Related: manage_milestone to create/update.',
            inputSchema: z.toJSONSchema(schema_readonly_1.BrowseMilestonesSchema),
            requirements: {
                default: { tier: 'free', minVersion: '8.0' },
                actions: {
                    burndown: { tier: 'premium', minVersion: '12.0', notes: 'Burndown charts' },
                },
            },
            gate: { envVar: 'USE_MILESTONE', defaultValue: true },
            handler: async (args) => {
                const input = schema_readonly_1.BrowseMilestonesSchema.parse(args);
                (0, utils_1.assertActionAllowed)('browse_milestones', input.action);
                const { entityType, encodedPath } = await (0, namespace_1.resolveNamespaceForAPI)(input.namespace);
                switch (input.action) {
                    case 'list': {
                        const { action: _action, namespace: _namespace, ...rest } = input;
                        const query = (0, gitlab_api_1.toQuery)(rest, []);
                        return gitlab_api_1.gitlab.get(`${entityType}/${encodedPath}/milestones`, { query });
                    }
                    case 'get': {
                        return gitlab_api_1.gitlab.get(`${entityType}/${encodedPath}/milestones/${input.milestone_id}`);
                    }
                    case 'issues': {
                        const { action: _action, namespace: _namespace, milestone_id, ...rest } = input;
                        const query = (0, gitlab_api_1.toQuery)(rest, []);
                        return gitlab_api_1.gitlab.get(`${entityType}/${encodedPath}/milestones/${milestone_id}/issues`, {
                            query,
                        });
                    }
                    case 'merge_requests': {
                        const { action: _action, namespace: _namespace, milestone_id, ...rest } = input;
                        const query = (0, gitlab_api_1.toQuery)(rest, []);
                        return gitlab_api_1.gitlab.get(`${entityType}/${encodedPath}/milestones/${milestone_id}/merge_requests`, { query });
                    }
                    case 'burndown': {
                        const { action: _action, namespace: _namespace, milestone_id, ...rest } = input;
                        const query = (0, gitlab_api_1.toQuery)(rest, []);
                        return gitlab_api_1.gitlab.get(`${entityType}/${encodedPath}/milestones/${milestone_id}/burndown_events`, { query });
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
    [
        'manage_milestone',
        {
            name: 'manage_milestone',
            description: 'Create, update, or delete project/group milestones. Actions: create (title + optional dates/description), update (modify properties or close/activate), delete (remove permanently), promote (elevate project milestone to group). Related: browse_milestones for progress tracking.',
            inputSchema: z.toJSONSchema(schema_1.ManageMilestoneSchema),
            requirements: { default: { tier: 'free', minVersion: '8.0' } },
            gate: { envVar: 'USE_MILESTONE', defaultValue: true },
            handler: async (args) => {
                const input = schema_1.ManageMilestoneSchema.parse(args);
                (0, utils_1.assertActionAllowed)('manage_milestone', input.action);
                const { entityType, encodedPath } = await (0, namespace_1.resolveNamespaceForAPI)(input.namespace);
                switch (input.action) {
                    case 'create': {
                        const { action: _action, namespace: _namespace, ...body } = input;
                        return gitlab_api_1.gitlab.post(`${entityType}/${encodedPath}/milestones`, {
                            body,
                            contentType: 'json',
                        });
                    }
                    case 'update': {
                        const { action: _action, namespace: _namespace, milestone_id, ...body } = input;
                        return gitlab_api_1.gitlab.put(`${entityType}/${encodedPath}/milestones/${milestone_id}`, {
                            body,
                            contentType: 'json',
                        });
                    }
                    case 'delete': {
                        await gitlab_api_1.gitlab.delete(`${entityType}/${encodedPath}/milestones/${input.milestone_id}`);
                        return { deleted: true };
                    }
                    case 'promote': {
                        if (entityType !== 'projects') {
                            throw new Error('Milestone promotion is only available for projects, not groups');
                        }
                        return gitlab_api_1.gitlab.post(`projects/${encodedPath}/milestones/${input.milestone_id}/promote`);
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
]);
function getMilestonesReadOnlyToolNames() {
    return ['browse_milestones'];
}
function getMilestonesToolDefinitions() {
    return Array.from(exports.milestonesToolRegistry.values());
}
function getFilteredMilestonesTools(readOnlyMode = false) {
    if (readOnlyMode) {
        const readOnlyNames = getMilestonesReadOnlyToolNames();
        return Array.from(exports.milestonesToolRegistry.values()).filter((tool) => readOnlyNames.includes(tool.name));
    }
    return getMilestonesToolDefinitions();
}
//# sourceMappingURL=registry.js.map