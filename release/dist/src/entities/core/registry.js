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
exports.coreToolRegistry = void 0;
exports.getCoreReadOnlyToolNames = getCoreReadOnlyToolNames;
exports.getCoreToolDefinitions = getCoreToolDefinitions;
exports.getFilteredCoreTools = getFilteredCoreTools;
const z = __importStar(require("zod"));
const schema_readonly_1 = require("./schema-readonly");
const schema_1 = require("./schema");
const fetch_1 = require("../../utils/fetch");
const projectIdentifier_1 = require("../../utils/projectIdentifier");
const smart_user_search_1 = require("../../utils/smart-user-search");
const idConversion_1 = require("../../utils/idConversion");
const utils_1 = require("../utils");
const ConnectionManager_1 = require("../../services/ConnectionManager");
const token_context_1 = require("../../oauth/token-context");
const version_1 = require("../../utils/version");
const RestoredEntitySchema = z
    .object({
    id: z.number().int().positive(),
    marked_for_deletion_on: z.string().nullable().optional(),
})
    .passthrough();
async function restoreEntity(apiUrl) {
    const response = await (0, fetch_1.enhancedFetch)(apiUrl, { method: 'POST' });
    if (!response.ok) {
        throw new Error(`GitLab API error: ${response.status} ${response.statusText}`);
    }
    const restored = RestoredEntitySchema.safeParse(await response.json());
    if (!restored.success) {
        throw new Error(`GitLab API error: unexpected restore response shape (${restored.error.issues[0]?.message ?? 'invalid'})`);
    }
    return restored.data;
}
exports.coreToolRegistry = new Map([
    [
        'browse_projects',
        {
            name: 'browse_projects',
            description: 'Find, list, or inspect GitLab projects. Actions: search (find by name/topic across GitLab), list (browse accessible projects or group projects), get (retrieve full project details). Related: manage_project to create/update/delete projects.',
            inputSchema: z.toJSONSchema(schema_readonly_1.BrowseProjectsSchema),
            requirements: {
                default: { tier: 'free', minVersion: '8.0' },
                parameters: {
                    include_deleted: { requiresAdmin: true },
                    marked_for_deletion_on: { tier: 'premium', minVersion: '17.1' },
                },
            },
            handler: async (args) => {
                const input = schema_readonly_1.BrowseProjectsSchema.parse(args);
                (0, utils_1.assertActionAllowed)('browse_projects', input.action);
                switch (input.action) {
                    case 'search': {
                        const { q, with_programming_language, visibility, order_by, sort, per_page, page } = input;
                        const queryParams = new URLSearchParams();
                        if (q) {
                            let finalSearchTerms = q;
                            const topicMatches = q.match(/topic:(\w+)/g);
                            if (topicMatches) {
                                const topics = topicMatches.map((match) => match.replace('topic:', ''));
                                queryParams.set('topic', topics.join(','));
                                finalSearchTerms = finalSearchTerms.replace(/topic:\w+/g, '').trim();
                            }
                            if (finalSearchTerms) {
                                queryParams.set('search', finalSearchTerms);
                            }
                        }
                        if (with_programming_language)
                            queryParams.set('with_programming_language', with_programming_language);
                        if (visibility)
                            queryParams.set('visibility', visibility);
                        if (order_by)
                            queryParams.set('order_by', order_by);
                        if (sort)
                            queryParams.set('sort', sort);
                        if (per_page)
                            queryParams.set('per_page', String(per_page));
                        if (page)
                            queryParams.set('page', String(page));
                        queryParams.set('active', 'true');
                        const apiUrl = `${process.env.GITLAB_API_URL}/api/v4/projects?${queryParams}`;
                        const response = await (0, fetch_1.enhancedFetch)(apiUrl);
                        if (!response.ok) {
                            throw new Error(`GitLab API error: ${response.status} ${response.statusText}`);
                        }
                        const projects = await response.json();
                        return (0, idConversion_1.cleanGidsFromObject)(projects);
                    }
                    case 'list': {
                        const { group_id, search, owned, starred, membership, simple, with_programming_language, include_subgroups, with_shared, include_deleted, marked_for_deletion_on, active, visibility, archived, order_by, sort, per_page, page, } = input;
                        const queryParams = new URLSearchParams();
                        if (visibility)
                            queryParams.set('visibility', visibility);
                        if (archived !== undefined)
                            queryParams.set('archived', String(archived));
                        if (owned !== undefined)
                            queryParams.set('owned', String(owned));
                        if (starred !== undefined)
                            queryParams.set('starred', String(starred));
                        if (membership !== undefined)
                            queryParams.set('membership', String(membership));
                        if (search)
                            queryParams.set('search', search);
                        if (simple !== undefined)
                            queryParams.set('simple', String(simple));
                        if (order_by)
                            queryParams.set('order_by', order_by);
                        if (sort)
                            queryParams.set('sort', sort);
                        if (per_page)
                            queryParams.set('per_page', String(per_page));
                        if (page)
                            queryParams.set('page', String(page));
                        if (include_subgroups !== undefined)
                            queryParams.set('include_subgroups', String(include_subgroups));
                        if (with_shared !== undefined)
                            queryParams.set('with_shared', String(with_shared));
                        if (with_programming_language)
                            queryParams.set('with_programming_language', with_programming_language);
                        if (marked_for_deletion_on)
                            queryParams.set('marked_for_deletion_on', marked_for_deletion_on);
                        if (!queryParams.has('order_by'))
                            queryParams.set('order_by', 'created_at');
                        if (!queryParams.has('sort'))
                            queryParams.set('sort', 'desc');
                        if (!queryParams.has('simple'))
                            queryParams.set('simple', 'true');
                        if (!queryParams.has('per_page'))
                            queryParams.set('per_page', '20');
                        let activeFilterSupported = true;
                        try {
                            const version = ConnectionManager_1.ConnectionManager.getInstance().getInstanceInfo((0, token_context_1.getGitLabApiUrlFromContext)()).version;
                            activeFilterSupported =
                                version === 'unknown' || (0, version_1.parseVersion)(version) >= (0, version_1.parseVersion)('18.5');
                        }
                        catch {
                        }
                        const applyActiveFilter = (value) => {
                            if (activeFilterSupported) {
                                queryParams.delete('archived');
                                queryParams.set('active', String(value));
                            }
                            else {
                                queryParams.delete('active');
                                queryParams.set('archived', String(!value));
                            }
                        };
                        let apiUrl;
                        if (group_id) {
                            if (active !== undefined)
                                applyActiveFilter(active);
                            apiUrl = `${process.env.GITLAB_API_URL}/api/v4/groups/${(0, projectIdentifier_1.normalizeProjectId)(group_id)}/projects?${queryParams}`;
                        }
                        else if (include_deleted) {
                            queryParams.set('include_pending_delete', 'true');
                            apiUrl = `${process.env.GITLAB_API_URL}/api/v4/projects?${queryParams}`;
                        }
                        else if (active !== undefined) {
                            applyActiveFilter(active);
                            apiUrl = `${process.env.GITLAB_API_URL}/api/v4/projects?${queryParams}`;
                        }
                        else {
                            queryParams.set('active', 'true');
                            apiUrl = `${process.env.GITLAB_API_URL}/api/v4/projects?${queryParams}`;
                        }
                        const response = await (0, fetch_1.enhancedFetch)(apiUrl);
                        if (!response.ok) {
                            throw new Error(`GitLab API error: ${response.status} ${response.statusText}`);
                        }
                        const projects = await response.json();
                        return (0, idConversion_1.cleanGidsFromObject)(projects);
                    }
                    case 'get': {
                        const { project_id, statistics, license } = input;
                        const queryParams = new URLSearchParams();
                        if (statistics)
                            queryParams.set('statistics', 'true');
                        if (license)
                            queryParams.set('license', 'true');
                        const apiUrl = `${process.env.GITLAB_API_URL}/api/v4/projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}?${queryParams}`;
                        const response = await (0, fetch_1.enhancedFetch)(apiUrl);
                        if (!response.ok) {
                            throw new Error(`GitLab API error: ${response.status} ${response.statusText}`);
                        }
                        const project = await response.json();
                        return (0, idConversion_1.cleanGidsFromObject)(project);
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
    [
        'browse_namespaces',
        {
            name: 'browse_namespaces',
            description: 'Explore GitLab groups and user namespaces. Actions: list (discover available namespaces), get (retrieve details with storage stats), verify (check if path exists). Related: manage_namespace to create/update/delete groups.',
            inputSchema: z.toJSONSchema(schema_readonly_1.BrowseNamespacesSchema),
            requirements: { default: { tier: 'free', minVersion: '9.0' } },
            handler: async (args) => {
                const input = schema_readonly_1.BrowseNamespacesSchema.parse(args);
                (0, utils_1.assertActionAllowed)('browse_namespaces', input.action);
                switch (input.action) {
                    case 'list': {
                        const { search, owned_only, top_level_only, with_statistics, min_access_level, per_page, page, } = input;
                        const queryParams = new URLSearchParams();
                        if (search)
                            queryParams.set('search', search);
                        if (owned_only !== undefined)
                            queryParams.set('owned_only', String(owned_only));
                        if (top_level_only !== undefined)
                            queryParams.set('top_level_only', String(top_level_only));
                        if (with_statistics !== undefined)
                            queryParams.set('with_statistics', String(with_statistics));
                        if (min_access_level !== undefined)
                            queryParams.set('min_access_level', String(min_access_level));
                        if (per_page)
                            queryParams.set('per_page', String(per_page));
                        if (page)
                            queryParams.set('page', String(page));
                        const apiUrl = `${process.env.GITLAB_API_URL}/api/v4/namespaces?${queryParams}`;
                        const response = await (0, fetch_1.enhancedFetch)(apiUrl);
                        if (!response.ok) {
                            throw new Error(`GitLab API error: ${response.status} ${response.statusText}`);
                        }
                        const namespaces = await response.json();
                        return (0, idConversion_1.cleanGidsFromObject)(namespaces);
                    }
                    case 'get': {
                        const { namespace_id } = input;
                        const apiUrl = `${process.env.GITLAB_API_URL}/api/v4/namespaces/${encodeURIComponent(namespace_id)}`;
                        const response = await (0, fetch_1.enhancedFetch)(apiUrl);
                        if (!response.ok) {
                            throw new Error(`GitLab API error: ${response.status} ${response.statusText}`);
                        }
                        const namespace = await response.json();
                        return (0, idConversion_1.cleanGidsFromObject)(namespace);
                    }
                    case 'verify': {
                        const { namespace_id } = input;
                        const apiUrl = `${process.env.GITLAB_API_URL}/api/v4/namespaces/${encodeURIComponent(namespace_id)}`;
                        const response = await (0, fetch_1.enhancedFetch)(apiUrl);
                        return {
                            exists: response.ok,
                            status: response.status,
                            namespace: namespace_id,
                            data: response.ok ? await response.json() : null,
                        };
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
    [
        'browse_commits',
        {
            name: 'browse_commits',
            description: 'Explore repository commit history and diffs. Actions: list (browse commits with filters), get (retrieve commit metadata and stats), diff (view code changes). Related: browse_refs for branch/tag info.',
            inputSchema: z.toJSONSchema(schema_readonly_1.BrowseCommitsSchema),
            requirements: { default: { tier: 'free', minVersion: '8.0' } },
            handler: async (args) => {
                const input = schema_readonly_1.BrowseCommitsSchema.parse(args);
                (0, utils_1.assertActionAllowed)('browse_commits', input.action);
                switch (input.action) {
                    case 'list': {
                        const { project_id, ref_name, since, until, path, author, all, with_stats, first_parent, order, trailers, per_page, page, } = input;
                        const queryParams = new URLSearchParams();
                        if (ref_name)
                            queryParams.set('ref_name', ref_name);
                        if (since)
                            queryParams.set('since', since);
                        if (until)
                            queryParams.set('until', until);
                        if (path)
                            queryParams.set('path', path);
                        if (author)
                            queryParams.set('author', author);
                        if (all !== undefined)
                            queryParams.set('all', String(all));
                        if (with_stats !== undefined)
                            queryParams.set('with_stats', String(with_stats));
                        if (first_parent !== undefined)
                            queryParams.set('first_parent', String(first_parent));
                        if (order)
                            queryParams.set('order', order);
                        if (trailers !== undefined)
                            queryParams.set('trailers', String(trailers));
                        if (per_page)
                            queryParams.set('per_page', String(per_page));
                        if (page)
                            queryParams.set('page', String(page));
                        const apiUrl = `${process.env.GITLAB_API_URL}/api/v4/projects/${encodeURIComponent(project_id)}/repository/commits?${queryParams}`;
                        const response = await (0, fetch_1.enhancedFetch)(apiUrl);
                        if (!response.ok) {
                            throw new Error(`GitLab API error: ${response.status} ${response.statusText}`);
                        }
                        return await response.json();
                    }
                    case 'get': {
                        const { project_id, sha, stats } = input;
                        const queryParams = new URLSearchParams();
                        if (stats)
                            queryParams.set('stats', 'true');
                        const apiUrl = `${process.env.GITLAB_API_URL}/api/v4/projects/${encodeURIComponent(project_id)}/repository/commits/${encodeURIComponent(sha)}?${queryParams}`;
                        const response = await (0, fetch_1.enhancedFetch)(apiUrl);
                        if (!response.ok) {
                            throw new Error(`GitLab API error: ${response.status} ${response.statusText}`);
                        }
                        return await response.json();
                    }
                    case 'diff': {
                        const { project_id, sha, unidiff, per_page, page } = input;
                        const queryParams = new URLSearchParams();
                        if (unidiff)
                            queryParams.set('unidiff', 'true');
                        if (per_page)
                            queryParams.set('per_page', String(per_page));
                        if (page)
                            queryParams.set('page', String(page));
                        const apiUrl = `${process.env.GITLAB_API_URL}/api/v4/projects/${encodeURIComponent(project_id)}/repository/commits/${encodeURIComponent(sha)}/diff?${queryParams}`;
                        const response = await (0, fetch_1.enhancedFetch)(apiUrl);
                        if (!response.ok) {
                            throw new Error(`GitLab API error: ${response.status} ${response.statusText}`);
                        }
                        return await response.json();
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
    [
        'browse_events',
        {
            name: 'browse_events',
            description: 'Track GitLab activity and events. Actions: user (your activity across all projects), project (specific project activity feed). Filter by date range, action type, or target type.',
            inputSchema: z.toJSONSchema(schema_readonly_1.BrowseEventsSchema),
            requirements: { default: { tier: 'free', minVersion: '9.0' } },
            handler: async (args) => {
                const input = schema_readonly_1.BrowseEventsSchema.parse(args);
                (0, utils_1.assertActionAllowed)('browse_events', input.action);
                const buildQueryParams = (opts) => {
                    const queryParams = new URLSearchParams();
                    if (opts.target_type)
                        queryParams.set('target_type', opts.target_type);
                    if (opts.event_action)
                        queryParams.set('action', opts.event_action);
                    if (opts.before)
                        queryParams.set('before', opts.before);
                    if (opts.after)
                        queryParams.set('after', opts.after);
                    if (opts.sort)
                        queryParams.set('sort', opts.sort);
                    if (opts.per_page)
                        queryParams.set('per_page', String(opts.per_page));
                    if (opts.page)
                        queryParams.set('page', String(opts.page));
                    return queryParams;
                };
                switch (input.action) {
                    case 'user': {
                        const queryParams = buildQueryParams(input);
                        const apiUrl = `${process.env.GITLAB_API_URL}/api/v4/events?${queryParams}`;
                        const response = await (0, fetch_1.enhancedFetch)(apiUrl);
                        if (!response.ok) {
                            throw new Error(`GitLab API error: ${response.status} ${response.statusText}`);
                        }
                        return await response.json();
                    }
                    case 'project': {
                        const { project_id } = input;
                        const queryParams = buildQueryParams(input);
                        const apiUrl = `${process.env.GITLAB_API_URL}/api/v4/projects/${encodeURIComponent(project_id)}/events?${queryParams}`;
                        const response = await (0, fetch_1.enhancedFetch)(apiUrl);
                        if (!response.ok) {
                            throw new Error(`GitLab API error: ${response.status} ${response.statusText}`);
                        }
                        return await response.json();
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
    [
        'browse_users',
        {
            name: 'browse_users',
            description: 'Find GitLab users with smart pattern detection. Actions: search (find users by name/email/username with transliteration support), get (retrieve specific user by ID). Related: browse_members for project/group membership.',
            inputSchema: z.toJSONSchema(schema_readonly_1.BrowseUsersSchema),
            requirements: { default: { tier: 'free', minVersion: '8.0' } },
            handler: async (args) => {
                const input = schema_readonly_1.BrowseUsersSchema.parse(args);
                (0, utils_1.assertActionAllowed)('browse_users', input.action);
                switch (input.action) {
                    case 'search': {
                        const { smart_search, search, username, public_email, ...otherParams } = input;
                        const hasUsernameOrEmail = Boolean(username) || Boolean(public_email);
                        const hasOnlySearch = Boolean(search) && !hasUsernameOrEmail;
                        const shouldUseSmartSearch = smart_search === false ? false : smart_search === true || hasOnlySearch;
                        if (shouldUseSmartSearch && (search || username || public_email)) {
                            const query = search ?? username ?? public_email ?? '';
                            const additionalParams = {};
                            Object.entries(otherParams).forEach(([key, value]) => {
                                if (value !== undefined && key !== 'smart_search' && key !== 'action') {
                                    additionalParams[key] = value;
                                }
                            });
                            return await (0, smart_user_search_1.smartUserSearch)(query, additionalParams);
                        }
                        else {
                            const queryParams = new URLSearchParams();
                            Object.entries(input).forEach(([key, value]) => {
                                if (value !== undefined && key !== 'smart_search' && key !== 'action') {
                                    queryParams.set(key, String(value));
                                }
                            });
                            const apiUrl = `${process.env.GITLAB_API_URL}/api/v4/users?${queryParams}`;
                            const response = await (0, fetch_1.enhancedFetch)(apiUrl);
                            if (!response.ok) {
                                throw new Error(`GitLab API error: ${response.status} ${response.statusText}`);
                            }
                            const users = await response.json();
                            return (0, idConversion_1.cleanGidsFromObject)(users);
                        }
                    }
                    case 'get': {
                        const { user_id } = input;
                        const apiUrl = `${process.env.GITLAB_API_URL}/api/v4/users/${encodeURIComponent(user_id)}`;
                        const response = await (0, fetch_1.enhancedFetch)(apiUrl);
                        if (!response.ok) {
                            throw new Error(`GitLab API error: ${response.status} ${response.statusText}`);
                        }
                        const user = await response.json();
                        return (0, idConversion_1.cleanGidsFromObject)(user);
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
    [
        'browse_todos',
        {
            name: 'browse_todos',
            description: 'View your GitLab todo queue (notifications requiring action). Actions: list (filter by state, action type, target type). Todos are auto-created for assignments, mentions, reviews, and pipeline failures. Related: manage_todos to mark done/restore.',
            inputSchema: z.toJSONSchema(schema_readonly_1.BrowseTodosSchema),
            requirements: { default: { tier: 'free', minVersion: '8.0' } },
            handler: async (args) => {
                const input = schema_readonly_1.BrowseTodosSchema.parse(args);
                (0, utils_1.assertActionAllowed)('browse_todos', input.action);
                switch (input.action) {
                    case 'list': {
                        const queryParams = new URLSearchParams();
                        const { action: _action, todo_action, ...rest } = input;
                        if (todo_action)
                            queryParams.set('action', todo_action);
                        Object.entries(rest).forEach(([key, value]) => {
                            if (value !== undefined) {
                                queryParams.set(key, String(value));
                            }
                        });
                        const apiUrl = `${process.env.GITLAB_API_URL}/api/v4/todos?${queryParams}`;
                        const response = await (0, fetch_1.enhancedFetch)(apiUrl);
                        if (!response.ok) {
                            throw new Error(`GitLab API error: ${response.status} ${response.statusText}`);
                        }
                        const todos = await response.json();
                        return (0, idConversion_1.cleanGidsFromObject)(todos);
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
    [
        'manage_project',
        {
            name: 'manage_project',
            description: 'Create, update, or manage GitLab projects. Actions: create (new project with settings), fork (copy existing project), update (modify settings), delete (remove permanently), restore (recover a soft-deleted project before purge), archive/unarchive (toggle read-only), transfer (move to different namespace). Related: browse_projects for discovery, including include_deleted to find restorable projects.',
            inputSchema: z.toJSONSchema(schema_1.ManageProjectSchema),
            requirements: {
                default: { tier: 'free', minVersion: '8.0' },
                parameters: {
                    issues_template: { tier: 'premium' },
                    merge_requests_template: { tier: 'premium' },
                    merge_pipelines_enabled: { tier: 'premium' },
                    merge_trains_enabled: { tier: 'premium' },
                    only_allow_merge_if_all_status_checks_passed: { tier: 'ultimate' },
                    requirements_access_level: { tier: 'ultimate' },
                },
            },
            handler: async (args) => {
                const input = schema_1.ManageProjectSchema.parse(args);
                (0, utils_1.assertActionAllowed)('manage_project', input.action);
                switch (input.action) {
                    case 'create': {
                        const { name, namespace, description, visibility, initialize_with_readme, issues_enabled, merge_requests_enabled, jobs_enabled, wiki_enabled, snippets_enabled, lfs_enabled, request_access_enabled, only_allow_merge_if_pipeline_succeeds, only_allow_merge_if_all_discussions_are_resolved, } = input;
                        let namespaceId;
                        let resolvedNamespace = null;
                        if (namespace) {
                            const namespaceApiUrl = `${process.env.GITLAB_API_URL}/api/v4/namespaces/${encodeURIComponent(namespace)}`;
                            const namespaceResponse = await (0, fetch_1.enhancedFetch)(namespaceApiUrl);
                            if (namespaceResponse.ok) {
                                resolvedNamespace = (await namespaceResponse.json());
                                namespaceId = String(resolvedNamespace.id);
                            }
                            else {
                                throw new Error(`Namespace '${namespace}' not found or not accessible`);
                            }
                        }
                        const targetNamespacePath = resolvedNamespace
                            ? resolvedNamespace.full_path
                            : 'current-user';
                        const projectPath = `${targetNamespacePath}/${name}`;
                        const checkProjectUrl = `${process.env.GITLAB_API_URL}/api/v4/projects/${encodeURIComponent(projectPath)}`;
                        const checkResponse = await (0, fetch_1.enhancedFetch)(checkProjectUrl);
                        if (checkResponse.ok) {
                            const existingProject = (await checkResponse.json());
                            throw new Error(`Project '${projectPath}' already exists (ID: ${existingProject.id}).`);
                        }
                        const body = new URLSearchParams();
                        body.set('name', name);
                        const generatedPath = name
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, '-')
                            .replace(/-+/g, '-')
                            .replace(/^-|-$/g, '');
                        body.set('path', generatedPath);
                        if (namespaceId)
                            body.set('namespace_id', namespaceId);
                        if (description)
                            body.set('description', description);
                        if (visibility)
                            body.set('visibility', visibility);
                        if (initialize_with_readme)
                            body.set('initialize_with_readme', 'true');
                        if (issues_enabled !== undefined)
                            body.set('issues_enabled', String(issues_enabled));
                        if (merge_requests_enabled !== undefined)
                            body.set('merge_requests_enabled', String(merge_requests_enabled));
                        if (jobs_enabled !== undefined)
                            body.set('jobs_enabled', String(jobs_enabled));
                        if (wiki_enabled !== undefined)
                            body.set('wiki_enabled', String(wiki_enabled));
                        if (snippets_enabled !== undefined)
                            body.set('snippets_enabled', String(snippets_enabled));
                        if (lfs_enabled !== undefined)
                            body.set('lfs_enabled', String(lfs_enabled));
                        if (request_access_enabled !== undefined)
                            body.set('request_access_enabled', String(request_access_enabled));
                        if (only_allow_merge_if_pipeline_succeeds !== undefined)
                            body.set('only_allow_merge_if_pipeline_succeeds', String(only_allow_merge_if_pipeline_succeeds));
                        if (only_allow_merge_if_all_discussions_are_resolved !== undefined)
                            body.set('only_allow_merge_if_all_discussions_are_resolved', String(only_allow_merge_if_all_discussions_are_resolved));
                        const createApiUrl = `${process.env.GITLAB_API_URL}/api/v4/projects`;
                        const createResponse = await (0, fetch_1.enhancedFetch)(createApiUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            body: body.toString(),
                        });
                        if (!createResponse.ok) {
                            throw new Error(`GitLab API error: ${createResponse.status} ${createResponse.statusText}`);
                        }
                        const project = await createResponse.json();
                        return {
                            ...project,
                            validation: {
                                namespace_resolved: namespace ? `${namespace} -> ${namespaceId}` : 'current-user',
                                generated_path: generatedPath,
                            },
                        };
                    }
                    case 'fork': {
                        const { project_id, namespace, namespace_path, fork_name, fork_path } = input;
                        const body = new URLSearchParams();
                        if (namespace)
                            body.set('namespace', namespace);
                        if (namespace_path)
                            body.set('namespace_path', namespace_path);
                        if (fork_name)
                            body.set('name', fork_name);
                        if (fork_path)
                            body.set('path', fork_path);
                        const apiUrl = `${process.env.GITLAB_API_URL}/api/v4/projects/${encodeURIComponent(project_id)}/fork`;
                        const response = await (0, fetch_1.enhancedFetch)(apiUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            body: body.toString(),
                        });
                        if (!response.ok) {
                            throw new Error(`GitLab API error: ${response.status} ${response.statusText}`);
                        }
                        return await response.json();
                    }
                    case 'update': {
                        const { project_id, action: _action, ...updateParams } = input;
                        const body = new URLSearchParams();
                        Object.entries(updateParams).forEach(([key, value]) => {
                            if (value !== undefined) {
                                body.set(key, String(value));
                            }
                        });
                        const apiUrl = `${process.env.GITLAB_API_URL}/api/v4/projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}`;
                        const response = await (0, fetch_1.enhancedFetch)(apiUrl, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            body: body.toString(),
                        });
                        if (!response.ok) {
                            throw new Error(`GitLab API error: ${response.status} ${response.statusText}`);
                        }
                        return await response.json();
                    }
                    case 'delete': {
                        const { project_id } = input;
                        const apiUrl = `${process.env.GITLAB_API_URL}/api/v4/projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}`;
                        const response = await (0, fetch_1.enhancedFetch)(apiUrl, { method: 'DELETE' });
                        if (!response.ok) {
                            throw new Error(`GitLab API error: ${response.status} ${response.statusText}`);
                        }
                        return { success: true, message: `Project ${project_id} deleted` };
                    }
                    case 'archive': {
                        const { project_id } = input;
                        const apiUrl = `${process.env.GITLAB_API_URL}/api/v4/projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}/archive`;
                        const response = await (0, fetch_1.enhancedFetch)(apiUrl, { method: 'POST' });
                        if (!response.ok) {
                            throw new Error(`GitLab API error: ${response.status} ${response.statusText}`);
                        }
                        return await response.json();
                    }
                    case 'unarchive': {
                        const { project_id } = input;
                        const apiUrl = `${process.env.GITLAB_API_URL}/api/v4/projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}/unarchive`;
                        const response = await (0, fetch_1.enhancedFetch)(apiUrl, { method: 'POST' });
                        if (!response.ok) {
                            throw new Error(`GitLab API error: ${response.status} ${response.statusText}`);
                        }
                        return await response.json();
                    }
                    case 'transfer': {
                        const { project_id, namespace } = input;
                        const body = new URLSearchParams();
                        body.set('namespace', namespace);
                        const apiUrl = `${process.env.GITLAB_API_URL}/api/v4/projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}/transfer`;
                        const response = await (0, fetch_1.enhancedFetch)(apiUrl, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            body: body.toString(),
                        });
                        if (!response.ok) {
                            throw new Error(`GitLab API error: ${response.status} ${response.statusText}`);
                        }
                        return await response.json();
                    }
                    case 'restore': {
                        const { project_id } = input;
                        return restoreEntity(`${process.env.GITLAB_API_URL}/api/v4/projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}/restore`);
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
    [
        'manage_namespace',
        {
            name: 'manage_namespace',
            description: 'Create, update, or delete GitLab groups/namespaces. Actions: create (new group with visibility/settings), update (modify group settings), delete (remove permanently), restore (recover a soft-deleted group before purge; requires GitLab 18.0+). Related: browse_namespaces for discovery.',
            inputSchema: z.toJSONSchema(schema_1.ManageNamespaceSchema),
            requirements: {
                default: { tier: 'free', minVersion: '8.0' },
                parameters: {
                    membership_lock: { tier: 'premium' },
                    wiki_access_level: { tier: 'premium' },
                    ip_restriction_ranges: { tier: 'premium' },
                    allowed_email_domains_list: { tier: 'premium' },
                    unique_project_download_limit: { tier: 'ultimate' },
                },
            },
            handler: async (args) => {
                const input = schema_1.ManageNamespaceSchema.parse(args);
                (0, utils_1.assertActionAllowed)('manage_namespace', input.action);
                switch (input.action) {
                    case 'create': {
                        const body = new URLSearchParams();
                        body.set('name', input.name);
                        body.set('path', input.path);
                        if (input.description)
                            body.set('description', input.description);
                        if (input.visibility)
                            body.set('visibility', input.visibility);
                        if (input.parent_id !== undefined)
                            body.set('parent_id', String(input.parent_id));
                        if (input.lfs_enabled !== undefined)
                            body.set('lfs_enabled', String(input.lfs_enabled));
                        if (input.request_access_enabled !== undefined)
                            body.set('request_access_enabled', String(input.request_access_enabled));
                        if (input.default_branch_protection !== undefined)
                            body.set('default_branch_protection', String(input.default_branch_protection));
                        if (input.avatar)
                            body.set('avatar', input.avatar);
                        if (input.membership_lock !== undefined)
                            body.set('membership_lock', String(input.membership_lock));
                        if (input.wiki_access_level !== undefined)
                            body.set('wiki_access_level', input.wiki_access_level);
                        const apiUrl = `${process.env.GITLAB_API_URL}/api/v4/groups`;
                        const response = await (0, fetch_1.enhancedFetch)(apiUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            body: body.toString(),
                        });
                        if (!response.ok) {
                            throw new Error(`GitLab API error: ${response.status} ${response.statusText}`);
                        }
                        return await response.json();
                    }
                    case 'update': {
                        const { group_id, action: _action, ...updateParams } = input;
                        const body = new URLSearchParams();
                        Object.entries(updateParams).forEach(([key, value]) => {
                            if (value !== undefined) {
                                body.set(key, String(value));
                            }
                        });
                        const apiUrl = `${process.env.GITLAB_API_URL}/api/v4/groups/${(0, projectIdentifier_1.normalizeProjectId)(group_id)}`;
                        const response = await (0, fetch_1.enhancedFetch)(apiUrl, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            body: body.toString(),
                        });
                        if (!response.ok) {
                            throw new Error(`GitLab API error: ${response.status} ${response.statusText}`);
                        }
                        return await response.json();
                    }
                    case 'delete': {
                        const { group_id } = input;
                        const apiUrl = `${process.env.GITLAB_API_URL}/api/v4/groups/${(0, projectIdentifier_1.normalizeProjectId)(group_id)}`;
                        const response = await (0, fetch_1.enhancedFetch)(apiUrl, { method: 'DELETE' });
                        if (!response.ok) {
                            throw new Error(`GitLab API error: ${response.status} ${response.statusText}`);
                        }
                        return { success: true, message: `Group ${group_id} deleted` };
                    }
                    case 'restore': {
                        const { group_id } = input;
                        let version = 'unknown';
                        try {
                            version = ConnectionManager_1.ConnectionManager.getInstance().getInstanceInfo((0, token_context_1.getGitLabApiUrlFromContext)()).version;
                        }
                        catch {
                        }
                        if (version !== 'unknown' && (0, version_1.parseVersion)(version) < (0, version_1.parseVersion)('18.0')) {
                            throw new Error(`Group restore requires GitLab 18.0+, but the instance is ${version}`);
                        }
                        return restoreEntity(`${process.env.GITLAB_API_URL}/api/v4/groups/${(0, projectIdentifier_1.normalizeProjectId)(group_id)}/restore`);
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
    [
        'manage_todos',
        {
            name: 'manage_todos',
            description: 'Manage your GitLab todo queue. Actions: mark_done (complete a single todo), mark_all_done (clear entire queue), restore (undo completion). Related: browse_todos to view your todo list.',
            inputSchema: z.toJSONSchema(schema_1.ManageTodosSchema),
            requirements: { default: { tier: 'free', minVersion: '8.0' } },
            handler: async (args) => {
                const input = schema_1.ManageTodosSchema.parse(args);
                (0, utils_1.assertActionAllowed)('manage_todos', input.action);
                switch (input.action) {
                    case 'mark_done': {
                        const apiUrl = `${process.env.GITLAB_API_URL}/api/v4/todos/${input.id}/mark_as_done`;
                        const response = await (0, fetch_1.enhancedFetch)(apiUrl, { method: 'POST' });
                        if (!response.ok) {
                            throw new Error(`GitLab API error: ${response.status} ${response.statusText}`);
                        }
                        const todo = await response.json();
                        return (0, idConversion_1.cleanGidsFromObject)(todo);
                    }
                    case 'mark_all_done': {
                        const apiUrl = `${process.env.GITLAB_API_URL}/api/v4/todos/mark_all_as_done`;
                        const response = await (0, fetch_1.enhancedFetch)(apiUrl, { method: 'POST' });
                        if (!response.ok) {
                            throw new Error(`GitLab API error: ${response.status} ${response.statusText}`);
                        }
                        return { success: true, message: 'All todos marked as done' };
                    }
                    case 'restore': {
                        const apiUrl = `${process.env.GITLAB_API_URL}/api/v4/todos/${input.id}/mark_as_pending`;
                        const response = await (0, fetch_1.enhancedFetch)(apiUrl, { method: 'POST' });
                        if (!response.ok) {
                            throw new Error(`GitLab API error: ${response.status} ${response.statusText}`);
                        }
                        const todo = await response.json();
                        return (0, idConversion_1.cleanGidsFromObject)(todo);
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
]);
function getCoreReadOnlyToolNames() {
    return [
        'browse_projects',
        'browse_namespaces',
        'browse_commits',
        'browse_events',
        'browse_users',
        'browse_todos',
    ];
}
function getCoreToolDefinitions() {
    return Array.from(exports.coreToolRegistry.values());
}
function getFilteredCoreTools(readOnlyMode = false) {
    if (readOnlyMode) {
        const readOnlyNames = getCoreReadOnlyToolNames();
        return Array.from(exports.coreToolRegistry.values()).filter((tool) => readOnlyNames.includes(tool.name));
    }
    return getCoreToolDefinitions();
}
//# sourceMappingURL=registry.js.map