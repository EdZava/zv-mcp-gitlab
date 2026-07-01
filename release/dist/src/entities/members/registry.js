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
exports.membersToolRegistry = void 0;
exports.getMembersReadOnlyToolNames = getMembersReadOnlyToolNames;
exports.getMembersToolDefinitions = getMembersToolDefinitions;
exports.getFilteredMembersTools = getFilteredMembersTools;
const z = __importStar(require("zod"));
const schema_readonly_1 = require("./schema-readonly");
const schema_1 = require("./schema");
const gitlab_api_1 = require("../../utils/gitlab-api");
const utils_1 = require("../utils");
exports.membersToolRegistry = new Map([
    [
        'browse_members',
        {
            name: 'browse_members',
            description: 'View team members and access levels in projects or groups. Actions: list_project, list_group, get_project, get_group (direct members), list_all_project, list_all_group (includes inherited). Levels: Guest(10), Reporter(20), Developer(30), Maintainer(40), Owner(50). Related: manage_member to add/remove, browse_users to find users by name.',
            inputSchema: z.toJSONSchema(schema_readonly_1.BrowseMembersSchema),
            requirements: {
                default: { tier: 'free', minVersion: '8.0' },
                actions: {
                    list_all_project: {
                        tier: 'free',
                        minVersion: '12.4',
                        notes: 'Includes inherited members',
                    },
                    list_all_group: { tier: 'free', minVersion: '12.4', notes: 'Includes inherited members' },
                },
            },
            handler: async (args) => {
                const input = schema_readonly_1.BrowseMembersSchema.parse(args);
                (0, utils_1.assertActionAllowed)('browse_members', input.action);
                switch (input.action) {
                    case 'list_project': {
                        const { action: _action, project_id, ...queryOptions } = input;
                        const encodedProjectId = encodeURIComponent(project_id);
                        return gitlab_api_1.gitlab.get(`projects/${encodedProjectId}/members`, {
                            query: (0, gitlab_api_1.toQuery)(queryOptions, []),
                        });
                    }
                    case 'list_group': {
                        const { action: _action, group_id, ...queryOptions } = input;
                        const encodedGroupId = encodeURIComponent(group_id);
                        return gitlab_api_1.gitlab.get(`groups/${encodedGroupId}/members`, {
                            query: (0, gitlab_api_1.toQuery)(queryOptions, []),
                        });
                    }
                    case 'get_project': {
                        const { project_id, user_id, include_inherited } = input;
                        const encodedProjectId = encodeURIComponent(project_id);
                        const encodedUserId = encodeURIComponent(user_id);
                        const endpoint = include_inherited
                            ? `projects/${encodedProjectId}/members/all/${encodedUserId}`
                            : `projects/${encodedProjectId}/members/${encodedUserId}`;
                        return gitlab_api_1.gitlab.get(endpoint);
                    }
                    case 'get_group': {
                        const { group_id, user_id, include_inherited } = input;
                        const encodedGroupId = encodeURIComponent(group_id);
                        const encodedUserId = encodeURIComponent(user_id);
                        const endpoint = include_inherited
                            ? `groups/${encodedGroupId}/members/all/${encodedUserId}`
                            : `groups/${encodedGroupId}/members/${encodedUserId}`;
                        return gitlab_api_1.gitlab.get(endpoint);
                    }
                    case 'list_all_project': {
                        const { action: _action, project_id, ...queryOptions } = input;
                        const encodedProjectId = encodeURIComponent(project_id);
                        return gitlab_api_1.gitlab.get(`projects/${encodedProjectId}/members/all`, {
                            query: (0, gitlab_api_1.toQuery)(queryOptions, []),
                        });
                    }
                    case 'list_all_group': {
                        const { action: _action, group_id, ...queryOptions } = input;
                        const encodedGroupId = encodeURIComponent(group_id);
                        return gitlab_api_1.gitlab.get(`groups/${encodedGroupId}/members/all`, {
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
        'manage_member',
        {
            name: 'manage_member',
            description: 'Add, remove, or update access levels for project/group members. Actions: add_to_project, add_to_group (with access level + optional expiry), remove_from_project, remove_from_group, update_project, update_group (change access level). Related: browse_members for current membership.',
            inputSchema: z.toJSONSchema(schema_1.ManageMemberSchema),
            requirements: {
                default: { tier: 'free', minVersion: '8.0' },
                actions: {
                    update_group: {
                        tier: 'free',
                        minVersion: '8.0',
                        notes: 'member_role_id requires Ultimate',
                    },
                },
            },
            handler: async (args) => {
                const input = schema_1.ManageMemberSchema.parse(args);
                (0, utils_1.assertActionAllowed)('manage_member', input.action);
                switch (input.action) {
                    case 'add_to_project': {
                        const { project_id, user_id, access_level, expires_at } = input;
                        const encodedProjectId = encodeURIComponent(project_id);
                        const body = {
                            user_id,
                            access_level,
                        };
                        if (expires_at !== undefined)
                            body.expires_at = expires_at;
                        return gitlab_api_1.gitlab.post(`projects/${encodedProjectId}/members`, {
                            body,
                            contentType: 'json',
                        });
                    }
                    case 'add_to_group': {
                        const { group_id, user_id, access_level, expires_at } = input;
                        const encodedGroupId = encodeURIComponent(group_id);
                        const body = {
                            user_id,
                            access_level,
                        };
                        if (expires_at !== undefined)
                            body.expires_at = expires_at;
                        return gitlab_api_1.gitlab.post(`groups/${encodedGroupId}/members`, {
                            body,
                            contentType: 'json',
                        });
                    }
                    case 'remove_from_project': {
                        const { project_id, user_id, skip_subresources, unassign_issuables } = input;
                        const encodedProjectId = encodeURIComponent(project_id);
                        const encodedUserId = encodeURIComponent(user_id);
                        const query = {};
                        if (skip_subresources !== undefined)
                            query.skip_subresources = skip_subresources;
                        if (unassign_issuables !== undefined)
                            query.unassign_issuables = unassign_issuables;
                        await gitlab_api_1.gitlab.delete(`projects/${encodedProjectId}/members/${encodedUserId}`, {
                            query,
                        });
                        return { removed: true, project_id, user_id };
                    }
                    case 'remove_from_group': {
                        const { group_id, user_id, skip_subresources, unassign_issuables } = input;
                        const encodedGroupId = encodeURIComponent(group_id);
                        const encodedUserId = encodeURIComponent(user_id);
                        const query = {};
                        if (skip_subresources !== undefined)
                            query.skip_subresources = skip_subresources;
                        if (unassign_issuables !== undefined)
                            query.unassign_issuables = unassign_issuables;
                        await gitlab_api_1.gitlab.delete(`groups/${encodedGroupId}/members/${encodedUserId}`, {
                            query,
                        });
                        return { removed: true, group_id, user_id };
                    }
                    case 'update_project': {
                        const { project_id, user_id, access_level, expires_at } = input;
                        const encodedProjectId = encodeURIComponent(project_id);
                        const encodedUserId = encodeURIComponent(user_id);
                        const body = { access_level };
                        if (expires_at !== undefined)
                            body.expires_at = expires_at;
                        return gitlab_api_1.gitlab.put(`projects/${encodedProjectId}/members/${encodedUserId}`, {
                            body,
                            contentType: 'json',
                        });
                    }
                    case 'update_group': {
                        const { group_id, user_id, access_level, expires_at, member_role_id } = input;
                        const encodedGroupId = encodeURIComponent(group_id);
                        const encodedUserId = encodeURIComponent(user_id);
                        const body = { access_level };
                        if (expires_at !== undefined)
                            body.expires_at = expires_at;
                        if (member_role_id !== undefined)
                            body.member_role_id = member_role_id;
                        return gitlab_api_1.gitlab.put(`groups/${encodedGroupId}/members/${encodedUserId}`, {
                            body,
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
function getMembersReadOnlyToolNames() {
    return ['browse_members'];
}
function getMembersToolDefinitions() {
    return Array.from(exports.membersToolRegistry.values());
}
function getFilteredMembersTools(readOnlyMode = false) {
    if (readOnlyMode) {
        const readOnlyNames = getMembersReadOnlyToolNames();
        return Array.from(exports.membersToolRegistry.values()).filter((tool) => readOnlyNames.includes(tool.name));
    }
    return getMembersToolDefinitions();
}
//# sourceMappingURL=registry.js.map