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
exports.deployKeysToolRegistry = void 0;
exports.getDeployKeysReadOnlyToolNames = getDeployKeysReadOnlyToolNames;
const z = __importStar(require("zod"));
const schema_readonly_1 = require("./schema-readonly");
const schema_1 = require("./schema");
const gitlab_api_1 = require("../../utils/gitlab-api");
const utils_1 = require("../utils");
const FREE_REQ = { tier: 'free', minVersion: '8.0' };
exports.deployKeysToolRegistry = new Map([
    [
        'browse_deploy_keys',
        {
            name: 'browse_deploy_keys',
            description: 'List and inspect deploy keys (SSH keys granting repo access to CI/automation). Actions: list (a project’s keys, or all instance keys when project_id is omitted — admin only), get (a single project key by ID). Related: manage_deploy_key to add/enable/update/delete.',
            inputSchema: z.toJSONSchema(schema_readonly_1.BrowseDeployKeysSchema),
            requirements: { default: FREE_REQ },
            gate: { envVar: 'USE_CI_TOKENS', defaultValue: true },
            handler: async (args) => {
                const input = schema_readonly_1.BrowseDeployKeysSchema.parse(args);
                (0, utils_1.assertActionAllowed)('browse_deploy_keys', input.action);
                if (input.action === 'get') {
                    const encodedProjectId = encodeURIComponent(input.project_id);
                    return gitlab_api_1.gitlab.get(`projects/${encodedProjectId}/deploy_keys/${input.key_id}`);
                }
                const { action: _action, project_id, ...query } = input;
                const path = project_id
                    ? `projects/${encodeURIComponent(project_id)}/deploy_keys`
                    : 'deploy_keys';
                return gitlab_api_1.gitlab.get(path, { query: (0, gitlab_api_1.toQuery)(query, []) });
            },
        },
    ],
    [
        'manage_deploy_key',
        {
            name: 'manage_deploy_key',
            description: 'Add, enable, update, or remove project deploy keys. Actions: add (register a new SSH public key with title and optional push access/expiry), enable (attach an existing key from another project), update (change title or can_push), delete (remove from this project). Related: browse_deploy_keys to inspect.',
            inputSchema: z.toJSONSchema(schema_1.ManageDeployKeySchema),
            requirements: { default: FREE_REQ },
            gate: { envVar: 'USE_CI_TOKENS', defaultValue: true },
            handler: async (args) => {
                const input = schema_1.ManageDeployKeySchema.parse(args);
                (0, utils_1.assertActionAllowed)('manage_deploy_key', input.action);
                const encodedProjectId = encodeURIComponent(input.project_id);
                const base = `projects/${encodedProjectId}/deploy_keys`;
                switch (input.action) {
                    case 'add': {
                        const { action: _action, project_id: _project_id, ...body } = input;
                        return gitlab_api_1.gitlab.post(base, { body, contentType: 'json' });
                    }
                    case 'enable':
                        return gitlab_api_1.gitlab.post(`${base}/${input.key_id}/enable`);
                    case 'update': {
                        const { action: _action, project_id: _project_id, key_id, ...body } = input;
                        return gitlab_api_1.gitlab.put(`${base}/${key_id}`, { body, contentType: 'json' });
                    }
                    case 'delete': {
                        await gitlab_api_1.gitlab.delete(`${base}/${input.key_id}`);
                        return { deleted: true, key_id: input.key_id };
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
]);
function getDeployKeysReadOnlyToolNames() {
    return ['browse_deploy_keys'];
}
//# sourceMappingURL=registry.js.map