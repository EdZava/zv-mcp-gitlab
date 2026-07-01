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
exports.accessTokensToolRegistry = void 0;
exports.getAccessTokensReadOnlyToolNames = getAccessTokensReadOnlyToolNames;
const z = __importStar(require("zod"));
const schema_readonly_1 = require("./schema-readonly");
const schema_1 = require("./schema");
const gitlab_api_1 = require("../../utils/gitlab-api");
const utils_1 = require("../utils");
const FREE_REQ = { tier: 'free', minVersion: '13.0' };
const NEW_TOKEN_NOTICE = 'This response contains a token value shown only once. Store it securely; it cannot be retrieved again.';
function flagSensitive(response) {
    if (response && typeof response === 'object') {
        return {
            ...response,
            _meta: { sensitive: true, notice: NEW_TOKEN_NOTICE },
        };
    }
    return response;
}
function tokenBasePath(input) {
    if (input.project_id) {
        return `projects/${encodeURIComponent(input.project_id)}/access_tokens`;
    }
    if (input.group_id) {
        return `groups/${encodeURIComponent(input.group_id)}/access_tokens`;
    }
    return 'personal_access_tokens';
}
exports.accessTokensToolRegistry = new Map([
    [
        'browse_access_tokens',
        {
            name: 'browse_access_tokens',
            description: "Inspect access tokens (CI/automation credentials). Actions: list_personal (the current user's PATs; admins may filter by user_id), list_project / list_group (a project's or group's tokens), get (a single token by ID - pass project_id or group_id for project/group tokens, neither for personal). Related: manage_access_token to create, rotate, or revoke.",
            inputSchema: z.toJSONSchema(schema_readonly_1.BrowseAccessTokensSchema),
            requirements: { default: FREE_REQ },
            gate: { envVar: 'USE_ACCESS_TOKENS', defaultValue: true },
            handler: async (args) => {
                const input = schema_readonly_1.BrowseAccessTokensSchema.parse(args);
                (0, utils_1.assertActionAllowed)('browse_access_tokens', input.action);
                switch (input.action) {
                    case 'list_personal': {
                        const { action: _action, ...query } = input;
                        return gitlab_api_1.gitlab.get('personal_access_tokens', { query: (0, gitlab_api_1.toQuery)(query, []) });
                    }
                    case 'list_project': {
                        const { action: _action, project_id, ...query } = input;
                        return gitlab_api_1.gitlab.get(`projects/${encodeURIComponent(project_id)}/access_tokens`, {
                            query: (0, gitlab_api_1.toQuery)(query, []),
                        });
                    }
                    case 'list_group': {
                        const { action: _action, group_id, ...query } = input;
                        return gitlab_api_1.gitlab.get(`groups/${encodeURIComponent(group_id)}/access_tokens`, {
                            query: (0, gitlab_api_1.toQuery)(query, []),
                        });
                    }
                    case 'get':
                        return gitlab_api_1.gitlab.get(`${tokenBasePath(input)}/${input.token_id}`);
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
    [
        'manage_access_token',
        {
            name: 'manage_access_token',
            description: 'Create, rotate, or revoke access tokens. Actions: create_project / create_group (issue a new token with name + scopes, returns the value once), rotate (revoke the old token and return a new value), revoke (delete a token permanently). For rotate/revoke pass project_id or group_id for project/group tokens, neither for personal. Related: browse_access_tokens to discover token IDs.',
            inputSchema: z.toJSONSchema(schema_1.ManageAccessTokenSchema),
            requirements: { default: FREE_REQ },
            gate: { envVar: 'USE_ACCESS_TOKENS', defaultValue: true },
            handler: async (args) => {
                const input = schema_1.ManageAccessTokenSchema.parse(args);
                (0, utils_1.assertActionAllowed)('manage_access_token', input.action);
                switch (input.action) {
                    case 'create_project': {
                        const { action: _action, project_id, ...body } = input;
                        const res = await gitlab_api_1.gitlab.post(`projects/${encodeURIComponent(project_id)}/access_tokens`, { body, contentType: 'json' });
                        return flagSensitive(res);
                    }
                    case 'create_group': {
                        const { action: _action, group_id, ...body } = input;
                        const res = await gitlab_api_1.gitlab.post(`groups/${encodeURIComponent(group_id)}/access_tokens`, {
                            body,
                            contentType: 'json',
                        });
                        return flagSensitive(res);
                    }
                    case 'rotate': {
                        const body = input.expires_at ? { expires_at: input.expires_at } : {};
                        const res = await gitlab_api_1.gitlab.post(`${tokenBasePath(input)}/${input.token_id}/rotate`, {
                            body,
                            contentType: 'json',
                        });
                        return flagSensitive(res);
                    }
                    case 'revoke': {
                        await gitlab_api_1.gitlab.delete(`${tokenBasePath(input)}/${input.token_id}`);
                        return { revoked: true, token_id: input.token_id };
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
]);
function getAccessTokensReadOnlyToolNames() {
    return ['browse_access_tokens'];
}
//# sourceMappingURL=registry.js.map