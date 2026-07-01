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
exports.releasesToolRegistry = void 0;
exports.getReleasesReadOnlyToolNames = getReleasesReadOnlyToolNames;
exports.getReleasesToolDefinitions = getReleasesToolDefinitions;
exports.getFilteredReleasesTools = getFilteredReleasesTools;
const z = __importStar(require("zod"));
const schema_readonly_1 = require("./schema-readonly");
const schema_1 = require("./schema");
const gitlab_api_1 = require("../../utils/gitlab-api");
const utils_1 = require("../utils");
exports.releasesToolRegistry = new Map([
    [
        'browse_releases',
        {
            name: 'browse_releases',
            description: 'View project releases and asset download links. Actions: list (releases sorted by date), get (release details by tag name), assets (download link list for release). Related: manage_release to create/publish.',
            inputSchema: z.toJSONSchema(schema_readonly_1.BrowseReleasesSchema),
            requirements: { default: { tier: 'free', minVersion: '11.7' } },
            handler: async (args) => {
                const input = schema_readonly_1.BrowseReleasesSchema.parse(args);
                (0, utils_1.assertActionAllowed)('browse_releases', input.action);
                const encodedProjectId = encodeURIComponent(input.project_id);
                switch (input.action) {
                    case 'list': {
                        const { action: _action, project_id: _projectId, ...queryOptions } = input;
                        return gitlab_api_1.gitlab.get(`projects/${encodedProjectId}/releases`, {
                            query: (0, gitlab_api_1.toQuery)(queryOptions, []),
                        });
                    }
                    case 'get': {
                        const { tag_name, include_html_description } = input;
                        const encodedTagName = encodeURIComponent(tag_name);
                        const query = include_html_description ? { include_html_description: true } : {};
                        return gitlab_api_1.gitlab.get(`projects/${encodedProjectId}/releases/${encodedTagName}`, {
                            query,
                        });
                    }
                    case 'assets': {
                        const { tag_name, per_page, page } = input;
                        const encodedTagName = encodeURIComponent(tag_name);
                        return gitlab_api_1.gitlab.get(`projects/${encodedProjectId}/releases/${encodedTagName}/assets/links`, {
                            query: (0, gitlab_api_1.toQuery)({ per_page, page }, []),
                        });
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
    [
        'manage_release',
        {
            name: 'manage_release',
            description: 'Create, update, or delete project releases with asset management. Actions: create (release from tag with notes/assets), update (modify metadata), delete (remove release, tag preserved), create_link (add asset URL), delete_link (remove asset). Related: browse_releases for discovery.',
            inputSchema: z.toJSONSchema(schema_1.ManageReleaseSchema),
            requirements: { default: { tier: 'free', minVersion: '11.7' } },
            handler: async (args) => {
                const input = schema_1.ManageReleaseSchema.parse(args);
                (0, utils_1.assertActionAllowed)('manage_release', input.action);
                const encodedProjectId = encodeURIComponent(input.project_id);
                switch (input.action) {
                    case 'create': {
                        const { action: _action, project_id: _projectId, tag_name, name, description, ref, tag_message, milestones, released_at, assets, } = input;
                        const body = { tag_name };
                        if (name !== undefined)
                            body.name = name;
                        if (description !== undefined)
                            body.description = description;
                        if (ref !== undefined)
                            body.ref = ref;
                        if (tag_message !== undefined)
                            body.tag_message = tag_message;
                        if (milestones !== undefined)
                            body.milestones = milestones;
                        if (released_at !== undefined)
                            body.released_at = released_at;
                        if (assets !== undefined)
                            body.assets = assets;
                        return gitlab_api_1.gitlab.post(`projects/${encodedProjectId}/releases`, {
                            body,
                            contentType: 'json',
                        });
                    }
                    case 'update': {
                        const { action: _action, project_id: _projectId, tag_name, name, description, milestones, released_at, } = input;
                        const encodedTagName = encodeURIComponent(tag_name);
                        const body = {};
                        if (name !== undefined)
                            body.name = name;
                        if (description !== undefined)
                            body.description = description;
                        if (milestones !== undefined)
                            body.milestones = milestones;
                        if (released_at !== undefined)
                            body.released_at = released_at;
                        return gitlab_api_1.gitlab.put(`projects/${encodedProjectId}/releases/${encodedTagName}`, {
                            body,
                            contentType: 'json',
                        });
                    }
                    case 'delete': {
                        const { tag_name } = input;
                        const encodedTagName = encodeURIComponent(tag_name);
                        await gitlab_api_1.gitlab.delete(`projects/${encodedProjectId}/releases/${encodedTagName}`);
                        return { deleted: true, tag_name };
                    }
                    case 'create_link': {
                        const { action: _action, project_id: _projectId, tag_name, name, url, direct_asset_path, link_type, } = input;
                        const encodedTagName = encodeURIComponent(tag_name);
                        const body = { name, url };
                        if (direct_asset_path !== undefined)
                            body.direct_asset_path = direct_asset_path;
                        if (link_type !== undefined)
                            body.link_type = link_type;
                        return gitlab_api_1.gitlab.post(`projects/${encodedProjectId}/releases/${encodedTagName}/assets/links`, {
                            body,
                            contentType: 'json',
                        });
                    }
                    case 'delete_link': {
                        const { tag_name, link_id } = input;
                        const encodedTagName = encodeURIComponent(tag_name);
                        await gitlab_api_1.gitlab.delete(`projects/${encodedProjectId}/releases/${encodedTagName}/assets/links/${link_id}`);
                        return { deleted: true, tag_name, link_id };
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
]);
function getReleasesReadOnlyToolNames() {
    return ['browse_releases'];
}
function getReleasesToolDefinitions() {
    return Array.from(exports.releasesToolRegistry.values());
}
function getFilteredReleasesTools(readOnlyMode = false) {
    if (readOnlyMode) {
        const readOnlyNames = getReleasesReadOnlyToolNames();
        return Array.from(exports.releasesToolRegistry.values()).filter((tool) => readOnlyNames.includes(tool.name));
    }
    return getReleasesToolDefinitions();
}
//# sourceMappingURL=registry.js.map