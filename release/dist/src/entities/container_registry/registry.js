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
exports.containerRegistryToolRegistry = void 0;
exports.getContainerRegistryReadOnlyToolNames = getContainerRegistryReadOnlyToolNames;
const z = __importStar(require("zod"));
const schema_readonly_1 = require("./schema-readonly");
const schema_1 = require("./schema");
const utils_1 = require("../utils");
const ConnectionManager_1 = require("../../services/ConnectionManager");
const idConversion_1 = require("../../utils/idConversion");
const token_context_1 = require("../../oauth/token-context");
const containerRegistry_1 = require("../../graphql/containerRegistry");
const REPOSITORY_GID_PREFIX = 'gid://gitlab/ContainerRepository/';
const repositoryGid = (id) => `${REPOSITORY_GID_PREFIX}${id}`;
const DESTROY_TAGS_BATCH = 20;
const BULK_TAG_SCAN_CAP = 1000;
const OLDER_THAN_UNIT_MS = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
};
function durationToMs(older_than) {
    const match = /^(\d+)(s|m|h|d)$/.exec(older_than);
    if (!match)
        throw new Error(`Invalid duration: ${older_than}`);
    return parseInt(match[1], 10) * OLDER_THAN_UNIT_MS[match[2]];
}
function resolveBulkDeleteTags(tags, opts) {
    const deleteRe = new RegExp(opts.name_regex_delete);
    const keepRe = opts.name_regex_keep ? new RegExp(opts.name_regex_keep) : null;
    let candidates = tags.filter((t) => deleteRe.test(t.name) && !keepRe?.test(t.name));
    candidates.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
    if (opts.keep_n !== undefined) {
        candidates = candidates.slice(opts.keep_n);
    }
    if (opts.older_than !== undefined) {
        const cutoff = Date.now() - durationToMs(opts.older_than);
        candidates = candidates.filter((t) => t.createdAt !== null && Date.parse(t.createdAt) < cutoff);
    }
    return candidates.map((t) => t.name);
}
exports.containerRegistryToolRegistry = new Map([
    [
        'browse_registry',
        {
            name: 'browse_registry',
            description: "Inspect the GitLab Container Registry. Actions: list_repositories (a project's image repositories), get_repository (single repository by ID), list_tags (tags of a repository), get_tag (single tag with manifest digest, size, and timestamps). Related: manage_registry to delete repositories and tags (including regex bulk cleanup).",
            inputSchema: z.toJSONSchema(schema_readonly_1.BrowseRegistrySchema),
            requirements: { default: { tier: 'free', minVersion: '12.0' } },
            gate: { envVar: 'USE_REGISTRY', defaultValue: true },
            handler: async (args) => {
                const input = schema_readonly_1.BrowseRegistrySchema.parse(args);
                (0, utils_1.assertActionAllowed)('browse_registry', input.action);
                const client = ConnectionManager_1.ConnectionManager.getInstance().getClient((0, token_context_1.getGitLabApiUrlFromContext)());
                switch (input.action) {
                    case 'list_repositories': {
                        const res = await client.request(containerRegistry_1.LIST_CONTAINER_REPOSITORIES, {
                            fullPath: input.project_id,
                            name: input.name ?? null,
                            first: input.first ?? 20,
                            after: input.after ?? null,
                        });
                        if (!res.project) {
                            throw new Error(`Project "${input.project_id}" not found or not accessible`);
                        }
                        return (0, idConversion_1.cleanGidsFromObject)(res.project.containerRepositories);
                    }
                    case 'get_repository': {
                        const res = await client.request(containerRegistry_1.GET_CONTAINER_REPOSITORY, {
                            id: repositoryGid(input.repository_id),
                        });
                        if (!res.containerRepository) {
                            throw new Error(`Container repository ${input.repository_id} not found`);
                        }
                        return (0, idConversion_1.cleanGidsFromObject)(res.containerRepository);
                    }
                    case 'list_tags': {
                        const res = await client.request(containerRegistry_1.LIST_CONTAINER_REPOSITORY_TAGS, {
                            id: repositoryGid(input.repository_id),
                            name: input.name ?? null,
                            first: input.first ?? 20,
                            after: input.after ?? null,
                        });
                        if (!res.containerRepository) {
                            throw new Error(`Container repository ${input.repository_id} not found`);
                        }
                        return (0, idConversion_1.cleanGidsFromObject)(res.containerRepository.tags);
                    }
                    case 'get_tag': {
                        const gid = repositoryGid(input.repository_id);
                        let after = null;
                        for (;;) {
                            const res = await client.request(containerRegistry_1.LIST_CONTAINER_REPOSITORY_TAGS, {
                                id: gid,
                                name: input.tag_name,
                                first: 100,
                                after,
                            });
                            if (!res.containerRepository) {
                                throw new Error(`Container repository ${input.repository_id} not found`);
                            }
                            const conn = res.containerRepository.tags;
                            const tag = conn.nodes.find((t) => t.name === input.tag_name);
                            if (tag)
                                return (0, idConversion_1.cleanGidsFromObject)(tag);
                            if (!conn.pageInfo.hasNextPage || !conn.pageInfo.endCursor)
                                break;
                            after = conn.pageInfo.endCursor;
                        }
                        throw new Error(`Tag "${input.tag_name}" not found in container repository ${input.repository_id}`);
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
    [
        'manage_registry',
        {
            name: 'manage_registry',
            description: 'Delete GitLab Container Registry repositories and tags. Actions: delete_repository (remove a whole repository), delete_tag (remove one tag), delete_tags_bulk (regex cleanup with keep_n/older_than retention - destructive). Related: browse_registry to inspect before deleting.',
            inputSchema: z.toJSONSchema(schema_1.ManageRegistrySchema),
            requirements: { default: { tier: 'free', minVersion: '12.0' } },
            gate: { envVar: 'USE_REGISTRY', defaultValue: true },
            handler: async (args) => {
                const input = schema_1.ManageRegistrySchema.parse(args);
                (0, utils_1.assertActionAllowed)('manage_registry', input.action);
                const client = ConnectionManager_1.ConnectionManager.getInstance().getClient((0, token_context_1.getGitLabApiUrlFromContext)());
                const gid = repositoryGid(input.repository_id);
                switch (input.action) {
                    case 'delete_repository': {
                        const res = await client.request(containerRegistry_1.DESTROY_CONTAINER_REPOSITORY, { id: gid });
                        const errors = res.destroyContainerRepository?.errors ?? [];
                        if (errors.length > 0) {
                            throw new Error(`GitLab API error: ${errors.join(', ')}`);
                        }
                        return {
                            deleted: true,
                            repository_id: input.repository_id,
                            status: res.destroyContainerRepository?.containerRepository?.status ?? null,
                        };
                    }
                    case 'delete_tag': {
                        const res = await client.request(containerRegistry_1.DESTROY_CONTAINER_REPOSITORY_TAGS, {
                            id: gid,
                            tagNames: [input.tag_name],
                        });
                        const errors = res.destroyContainerRepositoryTags?.errors ?? [];
                        if (errors.length > 0) {
                            throw new Error(`GitLab API error: ${errors.join(', ')}`);
                        }
                        return {
                            deleted: true,
                            repository_id: input.repository_id,
                            tag_name: input.tag_name,
                        };
                    }
                    case 'delete_tags_bulk': {
                        const tags = [];
                        let capped = false;
                        let after = null;
                        for (;;) {
                            const page = await client.request(containerRegistry_1.LIST_CONTAINER_REPOSITORY_TAGS, {
                                id: gid,
                                name: null,
                                first: 100,
                                after,
                            });
                            if (!page.containerRepository) {
                                throw new Error(`Container repository ${input.repository_id} not found`);
                            }
                            const conn = page.containerRepository.tags;
                            tags.push(...conn.nodes);
                            if (tags.length >= BULK_TAG_SCAN_CAP) {
                                tags.length = BULK_TAG_SCAN_CAP;
                                capped = true;
                                break;
                            }
                            if (!conn.pageInfo.hasNextPage || !conn.pageInfo.endCursor)
                                break;
                            after = conn.pageInfo.endCursor;
                        }
                        const toDelete = resolveBulkDeleteTags(tags, {
                            name_regex_delete: input.name_regex_delete,
                            name_regex_keep: input.name_regex_keep,
                            keep_n: input.keep_n,
                            older_than: input.older_than,
                        });
                        const deleted = [];
                        for (let i = 0; i < toDelete.length; i += DESTROY_TAGS_BATCH) {
                            const batch = toDelete.slice(i, i + DESTROY_TAGS_BATCH);
                            const res = await client.request(containerRegistry_1.DESTROY_CONTAINER_REPOSITORY_TAGS, {
                                id: gid,
                                tagNames: batch,
                            });
                            const errors = res.destroyContainerRepositoryTags?.errors ?? [];
                            if (errors.length > 0) {
                                throw new Error(`GitLab API error: ${errors.join(', ')}`);
                            }
                            deleted.push(...batch);
                        }
                        return {
                            deleted: true,
                            repository_id: input.repository_id,
                            deleted_count: deleted.length,
                            deleted_tags: deleted,
                            scan_capped: capped,
                        };
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
]);
function getContainerRegistryReadOnlyToolNames() {
    return ['browse_registry'];
}
//# sourceMappingURL=registry.js.map