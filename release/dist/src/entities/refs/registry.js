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
exports.refsToolRegistry = void 0;
exports.getRefsReadOnlyToolNames = getRefsReadOnlyToolNames;
exports.getRefsToolDefinitions = getRefsToolDefinitions;
exports.getFilteredRefsTools = getFilteredRefsTools;
const z = __importStar(require("zod"));
const schema_readonly_1 = require("./schema-readonly");
const schema_1 = require("./schema");
const gitlab_api_1 = require("../../utils/gitlab-api");
const utils_1 = require("../utils");
exports.refsToolRegistry = new Map([
    [
        'browse_refs',
        {
            name: 'browse_refs',
            description: 'Inspect branches, tags, and their protection rules. Actions: list_branches, get_branch, list_tags, get_tag, list_protected_branches, get_protected_branch, list_protected_tags (protection details and access levels). Related: manage_ref to create/delete/protect, browse_commits for commit history.',
            inputSchema: z.toJSONSchema(schema_readonly_1.BrowseRefsSchema),
            requirements: {
                default: { tier: 'free', minVersion: '8.0' },
                actions: {
                    list_protected_branches: { tier: 'free', minVersion: '8.11' },
                    get_protected_branch: { tier: 'free', minVersion: '8.11' },
                    list_protected_tags: { tier: 'premium', minVersion: '11.3', notes: 'Protected tags' },
                },
            },
            handler: async (args) => {
                const input = schema_readonly_1.BrowseRefsSchema.parse(args);
                (0, utils_1.assertActionAllowed)('browse_refs', input.action);
                const encodedProjectId = encodeURIComponent(input.project_id);
                switch (input.action) {
                    case 'list_branches': {
                        const { action: _action, project_id: _projectId, ...queryOptions } = input;
                        return gitlab_api_1.gitlab.get(`projects/${encodedProjectId}/repository/branches`, {
                            query: (0, gitlab_api_1.toQuery)(queryOptions, []),
                        });
                    }
                    case 'get_branch': {
                        const { branch } = input;
                        const encodedBranch = encodeURIComponent(branch);
                        return gitlab_api_1.gitlab.get(`projects/${encodedProjectId}/repository/branches/${encodedBranch}`);
                    }
                    case 'list_tags': {
                        const { action: _action, project_id: _projectId, ...queryOptions } = input;
                        return gitlab_api_1.gitlab.get(`projects/${encodedProjectId}/repository/tags`, {
                            query: (0, gitlab_api_1.toQuery)(queryOptions, []),
                        });
                    }
                    case 'get_tag': {
                        const { tag_name } = input;
                        const encodedTagName = encodeURIComponent(tag_name);
                        return gitlab_api_1.gitlab.get(`projects/${encodedProjectId}/repository/tags/${encodedTagName}`);
                    }
                    case 'list_protected_branches': {
                        const { action: _action, project_id: _projectId, ...queryOptions } = input;
                        return gitlab_api_1.gitlab.get(`projects/${encodedProjectId}/protected_branches`, {
                            query: (0, gitlab_api_1.toQuery)(queryOptions, []),
                        });
                    }
                    case 'get_protected_branch': {
                        const { name } = input;
                        const encodedName = encodeURIComponent(name);
                        return gitlab_api_1.gitlab.get(`projects/${encodedProjectId}/protected_branches/${encodedName}`);
                    }
                    case 'list_protected_tags': {
                        const { action: _action, project_id: _projectId, ...queryOptions } = input;
                        return gitlab_api_1.gitlab.get(`projects/${encodedProjectId}/protected_tags`, {
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
        'manage_ref',
        {
            name: 'manage_ref',
            description: 'Create, delete, and protect branches and tags. Actions: create_branch (from ref), delete_branch, protect_branch (set allowed roles), unprotect_branch, update_branch_protection, create_tag (annotated or lightweight), delete_tag, protect_tag, unprotect_tag. Related: browse_refs for inspection.',
            inputSchema: z.toJSONSchema(schema_1.ManageRefSchema),
            requirements: {
                default: { tier: 'free', minVersion: '8.0' },
                actions: {
                    protect_branch: { tier: 'free', minVersion: '8.11' },
                    unprotect_branch: { tier: 'free', minVersion: '8.11' },
                    update_branch_protection: {
                        tier: 'free',
                        minVersion: '11.9',
                        notes: 'PATCH endpoint; code owners require Premium',
                    },
                    protect_tag: { tier: 'premium', minVersion: '11.3', notes: 'Protected tags' },
                    unprotect_tag: { tier: 'premium', minVersion: '11.3', notes: 'Protected tags' },
                },
            },
            handler: async (args) => {
                const input = schema_1.ManageRefSchema.parse(args);
                (0, utils_1.assertActionAllowed)('manage_ref', input.action);
                const encodedProjectId = encodeURIComponent(input.project_id);
                switch (input.action) {
                    case 'create_branch': {
                        const { branch, ref } = input;
                        return gitlab_api_1.gitlab.post(`projects/${encodedProjectId}/repository/branches`, {
                            body: { branch, ref },
                            contentType: 'json',
                        });
                    }
                    case 'delete_branch': {
                        const { branch } = input;
                        const encodedBranch = encodeURIComponent(branch);
                        await gitlab_api_1.gitlab.delete(`projects/${encodedProjectId}/repository/branches/${encodedBranch}`);
                        return { deleted: true, branch };
                    }
                    case 'protect_branch': {
                        const { action: _action, project_id: _projectId, name, push_access_level, merge_access_level, unprotect_access_level, allow_force_push, allowed_to_push, allowed_to_merge, allowed_to_unprotect, code_owner_approval_required, } = input;
                        const body = { name };
                        if (push_access_level !== undefined)
                            body.push_access_level = push_access_level;
                        if (merge_access_level !== undefined)
                            body.merge_access_level = merge_access_level;
                        if (unprotect_access_level !== undefined)
                            body.unprotect_access_level = unprotect_access_level;
                        if (allow_force_push !== undefined)
                            body.allow_force_push = allow_force_push;
                        if (allowed_to_push !== undefined)
                            body.allowed_to_push = allowed_to_push;
                        if (allowed_to_merge !== undefined)
                            body.allowed_to_merge = allowed_to_merge;
                        if (allowed_to_unprotect !== undefined)
                            body.allowed_to_unprotect = allowed_to_unprotect;
                        if (code_owner_approval_required !== undefined)
                            body.code_owner_approval_required = code_owner_approval_required;
                        return gitlab_api_1.gitlab.post(`projects/${encodedProjectId}/protected_branches`, {
                            body,
                            contentType: 'json',
                        });
                    }
                    case 'unprotect_branch': {
                        const { name } = input;
                        const encodedName = encodeURIComponent(name);
                        await gitlab_api_1.gitlab.delete(`projects/${encodedProjectId}/protected_branches/${encodedName}`);
                        return { unprotected: true, name };
                    }
                    case 'update_branch_protection': {
                        const { action: _action, project_id: _projectId, name, allow_force_push, allowed_to_push, allowed_to_merge, allowed_to_unprotect, code_owner_approval_required, } = input;
                        const encodedName = encodeURIComponent(name);
                        const body = {};
                        if (allow_force_push !== undefined)
                            body.allow_force_push = allow_force_push;
                        if (allowed_to_push !== undefined)
                            body.allowed_to_push = allowed_to_push;
                        if (allowed_to_merge !== undefined)
                            body.allowed_to_merge = allowed_to_merge;
                        if (allowed_to_unprotect !== undefined)
                            body.allowed_to_unprotect = allowed_to_unprotect;
                        if (code_owner_approval_required !== undefined)
                            body.code_owner_approval_required = code_owner_approval_required;
                        return gitlab_api_1.gitlab.patch(`projects/${encodedProjectId}/protected_branches/${encodedName}`, {
                            body,
                            contentType: 'json',
                        });
                    }
                    case 'create_tag': {
                        const { tag_name, ref, message } = input;
                        const body = { tag_name, ref };
                        if (message !== undefined)
                            body.message = message;
                        return gitlab_api_1.gitlab.post(`projects/${encodedProjectId}/repository/tags`, {
                            body,
                            contentType: 'json',
                        });
                    }
                    case 'delete_tag': {
                        const { tag_name } = input;
                        const encodedTagName = encodeURIComponent(tag_name);
                        await gitlab_api_1.gitlab.delete(`projects/${encodedProjectId}/repository/tags/${encodedTagName}`);
                        return { deleted: true, tag_name };
                    }
                    case 'protect_tag': {
                        const { action: _action, project_id: _projectId, name, create_access_level, allowed_to_create, } = input;
                        const body = { name };
                        if (create_access_level !== undefined)
                            body.create_access_level = create_access_level;
                        if (allowed_to_create !== undefined)
                            body.allowed_to_create = allowed_to_create;
                        return gitlab_api_1.gitlab.post(`projects/${encodedProjectId}/protected_tags`, {
                            body,
                            contentType: 'json',
                        });
                    }
                    case 'unprotect_tag': {
                        const { name } = input;
                        const encodedName = encodeURIComponent(name);
                        await gitlab_api_1.gitlab.delete(`projects/${encodedProjectId}/protected_tags/${encodedName}`);
                        return { unprotected: true, name };
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
]);
function getRefsReadOnlyToolNames() {
    return ['browse_refs'];
}
function getRefsToolDefinitions() {
    return Array.from(exports.refsToolRegistry.values());
}
function getFilteredRefsTools(readOnlyMode = false) {
    if (readOnlyMode) {
        const readOnlyNames = getRefsReadOnlyToolNames();
        return Array.from(exports.refsToolRegistry.values()).filter((tool) => readOnlyNames.includes(tool.name));
    }
    return getRefsToolDefinitions();
}
//# sourceMappingURL=registry.js.map