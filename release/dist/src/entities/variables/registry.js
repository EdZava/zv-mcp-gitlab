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
exports.variablesToolRegistry = void 0;
exports.getVariablesReadOnlyToolNames = getVariablesReadOnlyToolNames;
exports.getVariablesToolDefinitions = getVariablesToolDefinitions;
exports.getFilteredVariablesTools = getFilteredVariablesTools;
const z = __importStar(require("zod"));
const schema_readonly_1 = require("./schema-readonly");
const schema_1 = require("./schema");
const gitlab_api_1 = require("../../utils/gitlab-api");
const namespace_1 = require("../../utils/namespace");
const utils_1 = require("../utils");
exports.variablesToolRegistry = new Map([
    [
        'browse_variables',
        {
            name: 'browse_variables',
            description: 'List and inspect CI/CD variables for projects or groups. Actions: list (all variables with pagination), get (single variable by key with environment scope filter). Related: manage_variable to create/update/delete.',
            inputSchema: z.toJSONSchema(schema_readonly_1.BrowseVariablesSchema),
            requirements: { default: { tier: 'free', minVersion: '9.0' } },
            gate: { envVar: 'USE_VARIABLES', defaultValue: true },
            handler: async (args) => {
                const input = schema_readonly_1.BrowseVariablesSchema.parse(args);
                (0, utils_1.assertActionAllowed)('browse_variables', input.action);
                const { entityType, encodedPath } = await (0, namespace_1.resolveNamespaceForAPI)(input.namespace);
                switch (input.action) {
                    case 'list': {
                        const { action: _action, namespace: _namespace, ...rest } = input;
                        const query = (0, gitlab_api_1.toQuery)(rest, []);
                        return gitlab_api_1.gitlab.get(`${entityType}/${encodedPath}/variables`, { query });
                    }
                    case 'get': {
                        const query = {};
                        if (input.filter?.environment_scope) {
                            query['filter[environment_scope]'] = input.filter.environment_scope;
                        }
                        return gitlab_api_1.gitlab.get(`${entityType}/${encodedPath}/variables/${encodeURIComponent(input.key)}`, { query });
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
    [
        'manage_variable',
        {
            name: 'manage_variable',
            description: 'Create, update, or delete CI/CD variables with environment scoping. Actions: create (key + value, set scope/protection/masking), update (modify value or settings), delete (remove permanently). Related: browse_variables for discovery.',
            inputSchema: z.toJSONSchema(schema_1.ManageVariableSchema),
            requirements: { default: { tier: 'free', minVersion: '9.0' } },
            gate: { envVar: 'USE_VARIABLES', defaultValue: true },
            handler: async (args) => {
                const input = schema_1.ManageVariableSchema.parse(args);
                (0, utils_1.assertActionAllowed)('manage_variable', input.action);
                const { entityType, encodedPath } = await (0, namespace_1.resolveNamespaceForAPI)(input.namespace);
                switch (input.action) {
                    case 'create': {
                        const { action: _action, namespace: _namespace, ...body } = input;
                        return gitlab_api_1.gitlab.post(`${entityType}/${encodedPath}/variables`, {
                            body,
                            contentType: 'json',
                        });
                    }
                    case 'update': {
                        const { action: _action, namespace: _namespace, key, filter, ...body } = input;
                        const query = {};
                        if (filter?.environment_scope) {
                            query['filter[environment_scope]'] = filter.environment_scope;
                        }
                        return gitlab_api_1.gitlab.put(`${entityType}/${encodedPath}/variables/${encodeURIComponent(key)}`, {
                            query,
                            body,
                            contentType: 'json',
                        });
                    }
                    case 'delete': {
                        const query = {};
                        if (input.filter?.environment_scope) {
                            query['filter[environment_scope]'] = input.filter.environment_scope;
                        }
                        await gitlab_api_1.gitlab.delete(`${entityType}/${encodedPath}/variables/${encodeURIComponent(input.key)}`, { query });
                        return { deleted: true };
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
]);
function getVariablesReadOnlyToolNames() {
    return ['browse_variables'];
}
function getVariablesToolDefinitions() {
    return Array.from(exports.variablesToolRegistry.values());
}
function getFilteredVariablesTools(readOnlyMode = false) {
    if (readOnlyMode) {
        const readOnlyNames = getVariablesReadOnlyToolNames();
        return Array.from(exports.variablesToolRegistry.values()).filter((tool) => readOnlyNames.includes(tool.name));
    }
    return getVariablesToolDefinitions();
}
//# sourceMappingURL=registry.js.map