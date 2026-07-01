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
exports.runnersToolRegistry = void 0;
exports.getRunnersReadOnlyToolNames = getRunnersReadOnlyToolNames;
const z = __importStar(require("zod"));
const schema_readonly_1 = require("./schema-readonly");
const schema_1 = require("./schema");
const utils_1 = require("../utils");
const ConnectionManager_1 = require("../../services/ConnectionManager");
const idConversion_1 = require("../../utils/idConversion");
const token_context_1 = require("../../oauth/token-context");
const gitlab_api_1 = require("../../utils/gitlab-api");
const runners_1 = require("../../graphql/runners");
const runnerGid = (id) => `gid://gitlab/Ci::Runner/${id}`;
function listVars(input) {
    return {
        type: input.type ?? null,
        status: input.status ?? null,
        paused: input.paused ?? null,
        tagList: input.tag_list ?? null,
        search: input.search ?? null,
        first: input.first ?? 20,
        after: input.after ?? null,
    };
}
function applyRunnerSettings(target, src) {
    if (src.description !== undefined)
        target.description = src.description;
    if (src.paused !== undefined)
        target.paused = src.paused;
    if (src.locked !== undefined)
        target.locked = src.locked;
    if (src.run_untagged !== undefined)
        target.runUntagged = src.run_untagged;
    if (src.tag_list !== undefined)
        target.tagList = src.tag_list;
    if (src.access_level !== undefined)
        target.accessLevel = src.access_level;
    if (src.maximum_timeout !== undefined)
        target.maximumTimeout = src.maximum_timeout;
    if (src.maintenance_note !== undefined)
        target.maintenanceNote = src.maintenance_note;
}
function assertNoErrors(errors) {
    if (errors && errors.length > 0) {
        throw new Error(`GitLab API error: ${errors.join(', ')}`);
    }
}
exports.runnersToolRegistry = new Map([
    [
        'browse_runners',
        {
            name: 'browse_runners',
            description: "Inspect CI runners. Actions: list_all (every runner on the instance - admin), list_owned (the current user's runners), list_project / list_group (runners available to a project/group), get (single runner by ID), list_jobs (jobs a runner has executed). Related: manage_runner to register, update, pause/resume, or delete runners.",
            inputSchema: z.toJSONSchema(schema_readonly_1.BrowseRunnersSchema),
            requirements: { default: { tier: 'free', minVersion: '13.2' } },
            gate: { envVar: 'USE_RUNNERS', defaultValue: true },
            handler: async (args) => {
                const input = schema_readonly_1.BrowseRunnersSchema.parse(args);
                (0, utils_1.assertActionAllowed)('browse_runners', input.action);
                const client = ConnectionManager_1.ConnectionManager.getInstance().getClient((0, token_context_1.getGitLabApiUrlFromContext)());
                switch (input.action) {
                    case 'list_all': {
                        const res = await client.request(runners_1.LIST_RUNNERS, listVars(input));
                        return (0, idConversion_1.cleanGidsFromObject)(res.runners);
                    }
                    case 'list_owned': {
                        const res = await client.request(runners_1.LIST_OWNED_RUNNERS, listVars(input));
                        return (0, idConversion_1.cleanGidsFromObject)(res.currentUser?.runners ?? { nodes: [] });
                    }
                    case 'list_project': {
                        const res = await client.request(runners_1.LIST_PROJECT_RUNNERS, {
                            fullPath: input.project_id,
                            ...listVars(input),
                        });
                        if (!res.project) {
                            throw new Error(`Project "${input.project_id}" not found or not accessible`);
                        }
                        return (0, idConversion_1.cleanGidsFromObject)(res.project.runners);
                    }
                    case 'list_group': {
                        const res = await client.request(runners_1.LIST_GROUP_RUNNERS, {
                            fullPath: input.group_id,
                            ...listVars(input),
                        });
                        if (!res.group) {
                            throw new Error(`Group "${input.group_id}" not found or not accessible`);
                        }
                        return (0, idConversion_1.cleanGidsFromObject)(res.group.runners);
                    }
                    case 'get': {
                        const res = await client.request(runners_1.GET_RUNNER, { id: runnerGid(input.runner_id) });
                        if (!res.runner) {
                            throw new Error(`Runner ${input.runner_id} not found`);
                        }
                        return (0, idConversion_1.cleanGidsFromObject)(res.runner);
                    }
                    case 'list_jobs': {
                        const res = await client.request(runners_1.LIST_RUNNER_JOBS, {
                            id: runnerGid(input.runner_id),
                            statuses: input.statuses ?? null,
                            first: input.first ?? 20,
                            after: input.after ?? null,
                        });
                        if (!res.runner) {
                            throw new Error(`Runner ${input.runner_id} not found`);
                        }
                        return (0, idConversion_1.cleanGidsFromObject)(res.runner.jobs ?? { nodes: [] });
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
    [
        'manage_runner',
        {
            name: 'manage_runner',
            description: 'Register and control CI runners. Actions: create_authentication_token (register a runner, GitLab 16+, returns a one-time token), update (settings), pause/resume (toggle job pickup), delete, reset_authentication_token (rotate the token). Related: browse_runners to discover runners.',
            inputSchema: z.toJSONSchema(schema_1.ManageRunnerSchema),
            requirements: { default: { tier: 'free', minVersion: '13.2' } },
            gate: { envVar: 'USE_RUNNERS', defaultValue: true },
            handler: async (args) => {
                const input = schema_1.ManageRunnerSchema.parse(args);
                (0, utils_1.assertActionAllowed)('manage_runner', input.action);
                const client = ConnectionManager_1.ConnectionManager.getInstance().getClient((0, token_context_1.getGitLabApiUrlFromContext)());
                switch (input.action) {
                    case 'create_authentication_token': {
                        const createInput = { runnerType: input.runner_type };
                        applyRunnerSettings(createInput, input);
                        if (input.runner_type === 'GROUP_TYPE') {
                            if (!input.group_id) {
                                throw new Error('group_id is required for a GROUP_TYPE runner');
                            }
                            const g = await client.request(runners_1.RESOLVE_GROUP_ID, { fullPath: input.group_id });
                            if (!g.group)
                                throw new Error(`Group "${input.group_id}" not found`);
                            createInput.groupId = g.group.id;
                        }
                        else if (input.runner_type === 'PROJECT_TYPE') {
                            if (!input.project_id) {
                                throw new Error('project_id is required for a PROJECT_TYPE runner');
                            }
                            const p = await client.request(runners_1.RESOLVE_PROJECT_ID, { fullPath: input.project_id });
                            if (!p.project)
                                throw new Error(`Project "${input.project_id}" not found`);
                            createInput.projectId = p.project.id;
                        }
                        const res = await client.request(runners_1.RUNNER_CREATE, { input: createInput });
                        assertNoErrors(res.runnerCreate?.errors);
                        return (0, idConversion_1.cleanGidsFromObject)(res.runnerCreate?.runner);
                    }
                    case 'update': {
                        const updateInput = {
                            id: runnerGid(input.runner_id),
                        };
                        applyRunnerSettings(updateInput, input);
                        const res = await client.request(runners_1.RUNNER_UPDATE, { input: updateInput });
                        assertNoErrors(res.runnerUpdate?.errors);
                        return (0, idConversion_1.cleanGidsFromObject)(res.runnerUpdate?.runner);
                    }
                    case 'pause':
                    case 'resume': {
                        const res = await client.request(runners_1.RUNNER_UPDATE, {
                            input: { id: runnerGid(input.runner_id), paused: input.action === 'pause' },
                        });
                        assertNoErrors(res.runnerUpdate?.errors);
                        return (0, idConversion_1.cleanGidsFromObject)(res.runnerUpdate?.runner);
                    }
                    case 'delete': {
                        const res = await client.request(runners_1.RUNNER_DELETE, {
                            input: { id: runnerGid(input.runner_id) },
                        });
                        assertNoErrors(res.runnerDelete?.errors);
                        return { deleted: true, runner_id: input.runner_id };
                    }
                    case 'reset_authentication_token': {
                        return gitlab_api_1.gitlab.post(`runners/${input.runner_id}/reset_authentication_token`, {
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
function getRunnersReadOnlyToolNames() {
    return ['browse_runners'];
}
//# sourceMappingURL=registry.js.map