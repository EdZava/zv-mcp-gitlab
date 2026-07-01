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
exports.searchToolRegistry = void 0;
exports.getSearchReadOnlyToolNames = getSearchReadOnlyToolNames;
exports.getSearchToolDefinitions = getSearchToolDefinitions;
exports.getFilteredSearchTools = getFilteredSearchTools;
const z = __importStar(require("zod"));
const schema_readonly_1 = require("./schema-readonly");
const utils_1 = require("../utils");
const gitlab_api_1 = require("../../utils/gitlab-api");
exports.searchToolRegistry = new Map([
    [
        'browse_search',
        {
            name: 'browse_search',
            description: 'Search across GitLab resources globally or within a scope. Actions: global (entire instance), project (within specific project), group (within specific group). Searchable: projects, issues, merge_requests, milestones, users, blobs (code), commits, wiki_blobs, notes.',
            inputSchema: z.toJSONSchema(schema_readonly_1.BrowseSearchSchema),
            requirements: {
                default: { tier: 'free', minVersion: '8.0' },
                actions: {
                    group: { tier: 'free', minVersion: '10.5', notes: 'Group-scoped search' },
                },
            },
            gate: { envVar: 'USE_SEARCH', defaultValue: true },
            handler: async (args) => {
                const input = schema_readonly_1.BrowseSearchSchema.parse(args);
                (0, utils_1.assertActionAllowed)('browse_search', input.action);
                switch (input.action) {
                    case 'global': {
                        const { scope, ...params } = input;
                        const query = (0, gitlab_api_1.toQuery)(params, ['action']);
                        const results = await gitlab_api_1.gitlab.get('search', {
                            query: { ...query, scope },
                        });
                        return {
                            scope,
                            count: results.length,
                            results,
                        };
                    }
                    case 'project': {
                        const { project_id, scope, ref, ...params } = input;
                        const query = (0, gitlab_api_1.toQuery)(params, ['action']);
                        const results = await gitlab_api_1.gitlab.get(`${gitlab_api_1.paths.project(project_id)}/search`, {
                            query: { ...query, scope, ...(ref && { ref }) },
                        });
                        return {
                            project_id,
                            scope,
                            count: results.length,
                            results,
                        };
                    }
                    case 'group': {
                        const { group_id, scope, ...params } = input;
                        const query = (0, gitlab_api_1.toQuery)(params, ['action']);
                        const results = await gitlab_api_1.gitlab.get(`${gitlab_api_1.paths.group(group_id)}/search`, {
                            query: { ...query, scope },
                        });
                        return {
                            group_id,
                            scope,
                            count: results.length,
                            results,
                        };
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
]);
function getSearchReadOnlyToolNames() {
    return ['browse_search'];
}
function getSearchToolDefinitions() {
    return Array.from(exports.searchToolRegistry.values());
}
function getFilteredSearchTools(readOnlyMode = false) {
    void readOnlyMode;
    return getSearchToolDefinitions();
}
//# sourceMappingURL=registry.js.map