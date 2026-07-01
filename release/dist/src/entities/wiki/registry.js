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
exports.wikiToolRegistry = void 0;
exports.getWikiReadOnlyToolNames = getWikiReadOnlyToolNames;
exports.getWikiToolDefinitions = getWikiToolDefinitions;
exports.getFilteredWikiTools = getFilteredWikiTools;
const z = __importStar(require("zod"));
const schema_readonly_1 = require("./schema-readonly");
const schema_1 = require("./schema");
const gitlab_api_1 = require("../../utils/gitlab-api");
const namespace_1 = require("../../utils/namespace");
const utils_1 = require("../utils");
exports.wikiToolRegistry = new Map([
    [
        'browse_wiki',
        {
            name: 'browse_wiki',
            description: 'Read wiki pages in projects or groups. Actions: list (all pages with metadata), get (page content by slug). Related: manage_wiki to create/update/delete.',
            inputSchema: z.toJSONSchema(schema_readonly_1.BrowseWikiSchema),
            requirements: { default: { tier: 'free', minVersion: '9.0' } },
            gate: { envVar: 'USE_GITLAB_WIKI', defaultValue: true },
            handler: async (args) => {
                const input = schema_readonly_1.BrowseWikiSchema.parse(args);
                (0, utils_1.assertActionAllowed)('browse_wiki', input.action);
                const { entityType, encodedPath } = await (0, namespace_1.resolveNamespaceForAPI)(input.namespace);
                switch (input.action) {
                    case 'list': {
                        const { action: _action, namespace: _namespace, ...rest } = input;
                        const query = (0, gitlab_api_1.toQuery)(rest, []);
                        return gitlab_api_1.gitlab.get(`${entityType}/${encodedPath}/wikis`, { query });
                    }
                    case 'get': {
                        return gitlab_api_1.gitlab.get(`${entityType}/${encodedPath}/wikis/${encodeURIComponent(input.slug)}`);
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
    [
        'manage_wiki',
        {
            name: 'manage_wiki',
            description: 'Create, update, or delete wiki pages. Actions: create (new page with title/content/format), update (modify content or title), delete (remove permanently). Related: browse_wiki to read pages.',
            inputSchema: z.toJSONSchema(schema_1.ManageWikiSchema),
            requirements: { default: { tier: 'free', minVersion: '9.0' } },
            gate: { envVar: 'USE_GITLAB_WIKI', defaultValue: true },
            handler: async (args) => {
                const input = schema_1.ManageWikiSchema.parse(args);
                (0, utils_1.assertActionAllowed)('manage_wiki', input.action);
                const { entityType, encodedPath } = await (0, namespace_1.resolveNamespaceForAPI)(input.namespace);
                switch (input.action) {
                    case 'create': {
                        const { action: _action, namespace: _namespace, ...body } = input;
                        return gitlab_api_1.gitlab.post(`${entityType}/${encodedPath}/wikis`, {
                            body,
                            contentType: 'json',
                        });
                    }
                    case 'update': {
                        const { action: _action, namespace: _namespace, slug, ...body } = input;
                        return gitlab_api_1.gitlab.put(`${entityType}/${encodedPath}/wikis/${encodeURIComponent(slug)}`, {
                            body,
                            contentType: 'json',
                        });
                    }
                    case 'delete': {
                        await gitlab_api_1.gitlab.delete(`${entityType}/${encodedPath}/wikis/${encodeURIComponent(input.slug)}`);
                        return { deleted: true };
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
]);
function getWikiReadOnlyToolNames() {
    return ['browse_wiki'];
}
function getWikiToolDefinitions() {
    return Array.from(exports.wikiToolRegistry.values());
}
function getFilteredWikiTools(readOnlyMode = false) {
    if (readOnlyMode) {
        const readOnlyNames = getWikiReadOnlyToolNames();
        return Array.from(exports.wikiToolRegistry.values()).filter((tool) => readOnlyNames.includes(tool.name));
    }
    return getWikiToolDefinitions();
}
//# sourceMappingURL=registry.js.map