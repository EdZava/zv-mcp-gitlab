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
exports.snippetsToolRegistry = void 0;
exports.getSnippetsReadOnlyToolNames = getSnippetsReadOnlyToolNames;
exports.getSnippetsToolDefinitions = getSnippetsToolDefinitions;
exports.getFilteredSnippetsTools = getFilteredSnippetsTools;
const z = __importStar(require("zod"));
const schema_readonly_1 = require("./schema-readonly");
const schema_1 = require("./schema");
const gitlab_api_1 = require("../../utils/gitlab-api");
const utils_1 = require("../utils");
exports.snippetsToolRegistry = new Map([
    [
        'browse_snippets',
        {
            name: 'browse_snippets',
            description: 'Find and read code snippets with versioning support. Actions: list (personal/project/public scope with filtering), get (snippet metadata or raw file content). Related: manage_snippet to create/update.',
            inputSchema: z.toJSONSchema(schema_readonly_1.BrowseSnippetsSchema),
            requirements: { default: { tier: 'free', minVersion: '8.15' } },
            gate: { envVar: 'USE_SNIPPETS', defaultValue: true },
            handler: async (args) => {
                const input = schema_readonly_1.BrowseSnippetsSchema.parse(args);
                (0, utils_1.assertActionAllowed)('browse_snippets', input.action);
                switch (input.action) {
                    case 'list': {
                        const { action: _action, scope, projectId, ...queryOptions } = input;
                        let path;
                        if (scope === 'personal') {
                            path = 'snippets';
                        }
                        else if (scope === 'public') {
                            path = 'snippets/public';
                        }
                        else {
                            if (!projectId) {
                                throw new Error("projectId is required when scope is 'project'");
                            }
                            const encodedProjectId = encodeURIComponent(projectId);
                            path = `projects/${encodedProjectId}/snippets`;
                        }
                        return gitlab_api_1.gitlab.get(path, {
                            query: (0, gitlab_api_1.toQuery)(queryOptions, []),
                        });
                    }
                    case 'get': {
                        const { id, projectId, raw } = input;
                        const encodedId = id.toString();
                        let path;
                        if (projectId) {
                            const encodedProjectId = encodeURIComponent(projectId);
                            path = `projects/${encodedProjectId}/snippets/${encodedId}`;
                        }
                        else {
                            path = `snippets/${encodedId}`;
                        }
                        if (raw) {
                            path = `${path}/raw`;
                        }
                        return gitlab_api_1.gitlab.get(path);
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
    [
        'manage_snippet',
        {
            name: 'manage_snippet',
            description: 'Create, update, or delete code snippets with multi-file support. Actions: create (new snippet with files and visibility), update (modify content/metadata, file operations), delete (remove permanently). Related: browse_snippets for discovery.',
            inputSchema: z.toJSONSchema(schema_1.ManageSnippetSchema),
            requirements: { default: { tier: 'free', minVersion: '8.15' } },
            gate: { envVar: 'USE_SNIPPETS', defaultValue: true },
            handler: async (args) => {
                const input = schema_1.ManageSnippetSchema.parse(args);
                (0, utils_1.assertActionAllowed)('manage_snippet', input.action);
                switch (input.action) {
                    case 'create': {
                        const { projectId, title, description, visibility, files } = input;
                        const body = {
                            title,
                            visibility,
                            files,
                        };
                        if (description) {
                            body.description = description;
                        }
                        let path;
                        if (projectId) {
                            const encodedProjectId = encodeURIComponent(projectId);
                            path = `projects/${encodedProjectId}/snippets`;
                        }
                        else {
                            path = 'snippets';
                        }
                        return gitlab_api_1.gitlab.post(path, {
                            body,
                            contentType: 'json',
                        });
                    }
                    case 'update': {
                        const { id, projectId, title, description, visibility, files } = input;
                        const encodedId = id.toString();
                        const body = {};
                        if (title !== undefined) {
                            body.title = title;
                        }
                        if (description !== undefined) {
                            body.description = description;
                        }
                        if (visibility !== undefined) {
                            body.visibility = visibility;
                        }
                        if (files !== undefined) {
                            body.files = files;
                        }
                        let path;
                        if (projectId) {
                            const encodedProjectId = encodeURIComponent(projectId);
                            path = `projects/${encodedProjectId}/snippets/${encodedId}`;
                        }
                        else {
                            path = `snippets/${encodedId}`;
                        }
                        return gitlab_api_1.gitlab.put(path, {
                            body,
                            contentType: 'json',
                        });
                    }
                    case 'delete': {
                        const { id, projectId } = input;
                        const encodedId = id.toString();
                        let path;
                        if (projectId) {
                            const encodedProjectId = encodeURIComponent(projectId);
                            path = `projects/${encodedProjectId}/snippets/${encodedId}`;
                        }
                        else {
                            path = `snippets/${encodedId}`;
                        }
                        await gitlab_api_1.gitlab.delete(path);
                        return { deleted: true, id };
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
]);
function getSnippetsReadOnlyToolNames() {
    return ['browse_snippets'];
}
function getSnippetsToolDefinitions() {
    return Array.from(exports.snippetsToolRegistry.values());
}
function getFilteredSnippetsTools(readOnlyMode = false) {
    if (readOnlyMode) {
        const readOnlyNames = getSnippetsReadOnlyToolNames();
        return Array.from(exports.snippetsToolRegistry.values()).filter((tool) => readOnlyNames.includes(tool.name));
    }
    return getSnippetsToolDefinitions();
}
//# sourceMappingURL=registry.js.map