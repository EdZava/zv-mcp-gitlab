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
exports.iterationsToolRegistry = void 0;
exports.getIterationsReadOnlyToolNames = getIterationsReadOnlyToolNames;
exports.getIterationsToolDefinitions = getIterationsToolDefinitions;
exports.getFilteredIterationsTools = getFilteredIterationsTools;
const z = __importStar(require("zod"));
const schema_readonly_1 = require("./schema-readonly");
const fetch_1 = require("../../utils/fetch");
const utils_1 = require("../utils");
exports.iterationsToolRegistry = new Map([
    [
        'browse_iterations',
        {
            name: 'browse_iterations',
            description: 'View group iterations for agile sprint planning. Actions: list (filter by state: current, upcoming, closed), get (retrieve specific iteration details). Related: browse_work_items for items in an iteration.',
            inputSchema: z.toJSONSchema(schema_readonly_1.BrowseIterationsSchema),
            requirements: {
                default: { tier: 'premium', minVersion: '13.1', notes: 'Iterations/Sprints' },
            },
            handler: async (args) => {
                const input = schema_readonly_1.BrowseIterationsSchema.parse(args);
                (0, utils_1.assertActionAllowed)('browse_iterations', input.action);
                switch (input.action) {
                    case 'list': {
                        const { group_id } = input;
                        const queryParams = new URLSearchParams();
                        if (input.state)
                            queryParams.set('state', input.state);
                        if (input.search)
                            queryParams.set('search', input.search);
                        if (input.include_ancestors !== undefined)
                            queryParams.set('include_ancestors', String(input.include_ancestors));
                        if (input.per_page)
                            queryParams.set('per_page', String(input.per_page));
                        if (input.page)
                            queryParams.set('page', String(input.page));
                        const apiUrl = `${process.env.GITLAB_API_URL}/api/v4/groups/${encodeURIComponent(group_id)}/iterations?${queryParams}`;
                        const response = await (0, fetch_1.enhancedFetch)(apiUrl);
                        if (!response.ok) {
                            throw new Error(`GitLab API error: ${response.status} ${response.statusText}`);
                        }
                        return await response.json();
                    }
                    case 'get': {
                        const { group_id, iteration_id } = input;
                        const apiUrl = `${process.env.GITLAB_API_URL}/api/v4/groups/${encodeURIComponent(group_id)}/iterations/${encodeURIComponent(iteration_id)}`;
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
]);
function getIterationsReadOnlyToolNames() {
    return ['browse_iterations'];
}
function getIterationsToolDefinitions() {
    return Array.from(exports.iterationsToolRegistry.values());
}
function getFilteredIterationsTools(readOnlyMode = false) {
    if (readOnlyMode) {
        const readOnlyNames = getIterationsReadOnlyToolNames();
        return Array.from(exports.iterationsToolRegistry.values()).filter((tool) => readOnlyNames.includes(tool.name));
    }
    return getIterationsToolDefinitions();
}
//# sourceMappingURL=registry.js.map