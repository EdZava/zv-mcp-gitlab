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
exports.jobTokenScopeToolRegistry = void 0;
exports.getJobTokenScopeReadOnlyToolNames = getJobTokenScopeReadOnlyToolNames;
exports.getJobTokenScopeToolDefinitions = getJobTokenScopeToolDefinitions;
exports.getFilteredJobTokenScopeTools = getFilteredJobTokenScopeTools;
const z = __importStar(require("zod"));
const schema_readonly_1 = require("./schema-readonly");
const schema_1 = require("./schema");
const gitlab_api_1 = require("../../utils/gitlab-api");
const utils_1 = require("../utils");
async function resolveProjectNumericId(projectId) {
    const trimmed = projectId.trim();
    if (/^\d+$/.test(trimmed)) {
        return Number(trimmed);
    }
    const project = await gitlab_api_1.gitlab.get(`projects/${encodeURIComponent(trimmed)}`);
    return project.id;
}
function scopeBase(projectId) {
    return `projects/${projectId}/job_token_scope`;
}
const SCOPE_REQ = { tier: 'free', minVersion: '15.9' };
const GROUP_REQ = { tier: 'free', minVersion: '16.0' };
exports.jobTokenScopeToolRegistry = new Map([
    [
        'browse_job_token_scope',
        {
            name: 'browse_job_token_scope',
            description: 'Inspect a project CI/CD job token inbound access scope. Actions: get (the inbound/outbound scope toggles), list_projects (projects allowed to reach this project via CI_JOB_TOKEN), list_groups (groups on the allowlist). Related: manage_job_token_scope to change the allowlist.',
            inputSchema: z.toJSONSchema(schema_readonly_1.BrowseJobTokenScopeSchema),
            requirements: { default: SCOPE_REQ, actions: { list_groups: GROUP_REQ } },
            gate: { envVar: 'USE_CI_TOKENS', defaultValue: true },
            handler: async (args) => {
                const input = schema_readonly_1.BrowseJobTokenScopeSchema.parse(args);
                (0, utils_1.assertActionAllowed)('browse_job_token_scope', input.action);
                const base = scopeBase(await resolveProjectNumericId(input.project_id));
                if (input.action === 'get') {
                    return gitlab_api_1.gitlab.get(base);
                }
                const suffix = input.action === 'list_projects' ? 'allowlist' : 'groups_allowlist';
                const { action: _action, project_id: _project_id, ...pagination } = input;
                return gitlab_api_1.gitlab.get(`${base}/${suffix}`, { query: (0, gitlab_api_1.toQuery)(pagination, []) });
            },
        },
    ],
    [
        'manage_job_token_scope',
        {
            name: 'manage_job_token_scope',
            description: 'Manage a project CI/CD job token inbound allowlist. Actions: set_enabled (turn allowlist enforcement on/off), add_project / remove_project (grant or revoke a project), add_group / remove_group (grant or revoke a group). Required to allow cross-project CI_JOB_TOKEN access once the legacy open-access mode is removed. Related: browse_job_token_scope to inspect.',
            inputSchema: z.toJSONSchema(schema_1.ManageJobTokenScopeSchema),
            requirements: {
                default: SCOPE_REQ,
                actions: { add_group: GROUP_REQ, remove_group: GROUP_REQ },
            },
            gate: { envVar: 'USE_CI_TOKENS', defaultValue: true },
            handler: async (args) => {
                const input = schema_1.ManageJobTokenScopeSchema.parse(args);
                (0, utils_1.assertActionAllowed)('manage_job_token_scope', input.action);
                const base = scopeBase(await resolveProjectNumericId(input.project_id));
                if (input.action === 'set_enabled') {
                    return gitlab_api_1.gitlab.patch(base, { body: { enabled: input.enabled }, contentType: 'json' });
                }
                const isProject = input.action === 'add_project' || input.action === 'remove_project';
                const suffix = isProject ? 'allowlist' : 'groups_allowlist';
                if (input.action === 'add_project' || input.action === 'add_group') {
                    const body = input.action === 'add_project'
                        ? { target_project_id: input.target_project_id }
                        : { target_group_id: input.target_group_id };
                    return gitlab_api_1.gitlab.post(`${base}/${suffix}`, { body, contentType: 'json' });
                }
                const targetId = input.action === 'remove_project' ? input.target_project_id : input.target_group_id;
                await gitlab_api_1.gitlab.delete(`${base}/${suffix}/${targetId}`);
                return isProject
                    ? { removed: true, target_project_id: targetId }
                    : { removed: true, target_group_id: targetId };
            },
        },
    ],
]);
function getJobTokenScopeReadOnlyToolNames() {
    return ['browse_job_token_scope'];
}
function getJobTokenScopeToolDefinitions() {
    return Array.from(exports.jobTokenScopeToolRegistry.values());
}
function getFilteredJobTokenScopeTools(readOnlyMode = false) {
    if (readOnlyMode) {
        const readOnlyNames = getJobTokenScopeReadOnlyToolNames();
        return Array.from(exports.jobTokenScopeToolRegistry.values()).filter((tool) => readOnlyNames.includes(tool.name));
    }
    return getJobTokenScopeToolDefinitions();
}
//# sourceMappingURL=registry.js.map