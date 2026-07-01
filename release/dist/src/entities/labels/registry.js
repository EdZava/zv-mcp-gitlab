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
exports.labelsToolRegistry = void 0;
exports.getLabelsReadOnlyToolNames = getLabelsReadOnlyToolNames;
exports.getLabelsToolDefinitions = getLabelsToolDefinitions;
exports.getFilteredLabelsTools = getFilteredLabelsTools;
const z = __importStar(require("zod"));
const schema_readonly_1 = require("./schema-readonly");
const schema_1 = require("./schema");
const gitlab_api_1 = require("../../utils/gitlab-api");
const namespace_1 = require("../../utils/namespace");
const utils_1 = require("../utils");
exports.labelsToolRegistry = new Map([
    [
        'browse_labels',
        {
            name: 'browse_labels',
            description: 'List and inspect project or group labels. Actions: list (all labels with search filtering), get (single label by ID or name). Related: manage_label to create/update/delete.',
            inputSchema: z.toJSONSchema(schema_readonly_1.BrowseLabelsSchema),
            requirements: { default: { tier: 'free', minVersion: '8.0' } },
            gate: { envVar: 'USE_LABELS', defaultValue: true },
            handler: async (args) => {
                const input = schema_readonly_1.BrowseLabelsSchema.parse(args);
                (0, utils_1.assertActionAllowed)('browse_labels', input.action);
                const { entityType, encodedPath } = await (0, namespace_1.resolveNamespaceForAPI)(input.namespace);
                switch (input.action) {
                    case 'list': {
                        const { action: _action, namespace: _namespace, ...rest } = input;
                        const query = (0, gitlab_api_1.toQuery)(rest, []);
                        return gitlab_api_1.gitlab.get(`${entityType}/${encodedPath}/labels`, { query });
                    }
                    case 'get': {
                        const query = input.include_ancestor_groups
                            ? (0, gitlab_api_1.toQuery)({ include_ancestor_groups: input.include_ancestor_groups }, [])
                            : undefined;
                        return gitlab_api_1.gitlab.get(`${entityType}/${encodedPath}/labels/${encodeURIComponent(input.label_id)}`, { query });
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
    [
        'manage_label',
        {
            name: 'manage_label',
            description: 'Create, update, or delete project/group labels. Actions: create (name + hex color required), update (modify properties), delete (remove permanently). Related: browse_labels for discovery.',
            inputSchema: z.toJSONSchema(schema_1.ManageLabelSchema),
            requirements: { default: { tier: 'free', minVersion: '8.0' } },
            gate: { envVar: 'USE_LABELS', defaultValue: true },
            handler: async (args) => {
                const input = schema_1.ManageLabelSchema.parse(args);
                (0, utils_1.assertActionAllowed)('manage_label', input.action);
                const { entityType, encodedPath } = await (0, namespace_1.resolveNamespaceForAPI)(input.namespace);
                switch (input.action) {
                    case 'create': {
                        return gitlab_api_1.gitlab.post(`${entityType}/${encodedPath}/labels`, {
                            body: {
                                name: input.name,
                                color: input.color,
                                description: input.description,
                                priority: input.priority,
                            },
                            contentType: 'json',
                        });
                    }
                    case 'update': {
                        const { action: _action, namespace: _namespace, label_id, name: _name, ...body } = input;
                        return gitlab_api_1.gitlab.put(`${entityType}/${encodedPath}/labels/${encodeURIComponent(label_id)}`, { body, contentType: 'json' });
                    }
                    case 'delete': {
                        await gitlab_api_1.gitlab.delete(`${entityType}/${encodedPath}/labels/${encodeURIComponent(input.label_id)}`);
                        return { deleted: true };
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
]);
function getLabelsReadOnlyToolNames() {
    return ['browse_labels'];
}
function getLabelsToolDefinitions() {
    return Array.from(exports.labelsToolRegistry.values());
}
function getFilteredLabelsTools(readOnlyMode = false) {
    if (readOnlyMode) {
        const readOnlyNames = getLabelsReadOnlyToolNames();
        return Array.from(exports.labelsToolRegistry.values()).filter((tool) => readOnlyNames.includes(tool.name));
    }
    return getLabelsToolDefinitions();
}
//# sourceMappingURL=registry.js.map