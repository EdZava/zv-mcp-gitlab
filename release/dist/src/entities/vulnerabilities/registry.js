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
exports.vulnerabilitiesToolRegistry = void 0;
exports.getVulnerabilitiesReadOnlyToolNames = getVulnerabilitiesReadOnlyToolNames;
const z = __importStar(require("zod"));
const schema_readonly_1 = require("./schema-readonly");
const schema_1 = require("./schema");
const utils_1 = require("../utils");
const ConnectionManager_1 = require("../../services/ConnectionManager");
const idConversion_1 = require("../../utils/idConversion");
const token_context_1 = require("../../oauth/token-context");
const vulnerabilities_1 = require("../../graphql/vulnerabilities");
const ULTIMATE_REQ = {
    tier: 'ultimate',
    minVersion: '13.0',
    notes: 'Vulnerability Management',
};
const vulnerabilityGid = (id) => `gid://gitlab/Vulnerability/${id}`;
function listVars(input) {
    return {
        state: input.state ?? null,
        severity: input.severity ?? null,
        reportType: input.report_type ?? null,
        sort: input.sort ?? null,
        first: input.first ?? 20,
        after: input.after ?? null,
    };
}
function unwrapVuln(payload) {
    if (!payload) {
        throw new Error('GitLab API error: empty mutation response');
    }
    if (payload.errors.length > 0) {
        throw new Error(`GitLab API error: ${payload.errors.join(', ')}`);
    }
    return (0, idConversion_1.cleanGidsFromObject)(payload.vulnerability);
}
exports.vulnerabilitiesToolRegistry = new Map([
    [
        'browse_vulnerabilities',
        {
            name: 'browse_vulnerabilities',
            description: 'Inspect security vulnerabilities (Ultimate). Actions: list (a project, a group, or the whole instance when neither id is given; filter by state, severity, report_type), get (a single vulnerability by ID with full detail). Related: manage_vulnerability to dismiss, confirm, resolve, or revert findings.',
            inputSchema: z.toJSONSchema(schema_readonly_1.BrowseVulnerabilitiesSchema),
            requirements: { default: ULTIMATE_REQ },
            gate: { envVar: 'USE_VULNERABILITIES', defaultValue: true },
            handler: async (args) => {
                const input = schema_readonly_1.BrowseVulnerabilitiesSchema.parse(args);
                (0, utils_1.assertActionAllowed)('browse_vulnerabilities', input.action);
                const client = ConnectionManager_1.ConnectionManager.getInstance().getClient((0, token_context_1.getGitLabApiUrlFromContext)());
                switch (input.action) {
                    case 'list': {
                        if (input.project_id) {
                            const res = await client.request(vulnerabilities_1.LIST_PROJECT_VULNS, {
                                fullPath: input.project_id,
                                ...listVars(input),
                            });
                            if (!res.project) {
                                throw new Error(`Project "${input.project_id}" not found or not accessible`);
                            }
                            return (0, idConversion_1.cleanGidsFromObject)(res.project.vulnerabilities ?? { nodes: [] });
                        }
                        if (input.group_id) {
                            const res = await client.request(vulnerabilities_1.LIST_GROUP_VULNS, {
                                fullPath: input.group_id,
                                ...listVars(input),
                            });
                            if (!res.group) {
                                throw new Error(`Group "${input.group_id}" not found or not accessible`);
                            }
                            return (0, idConversion_1.cleanGidsFromObject)(res.group.vulnerabilities ?? { nodes: [] });
                        }
                        const res = await client.request(vulnerabilities_1.LIST_INSTANCE_VULNS, {
                            projectId: null,
                            ...listVars(input),
                        });
                        return (0, idConversion_1.cleanGidsFromObject)(res.vulnerabilities ?? { nodes: [] });
                    }
                    case 'get': {
                        const res = await client.request(vulnerabilities_1.GET_VULN, {
                            id: vulnerabilityGid(input.vulnerability_id),
                        });
                        if (!res.vulnerability) {
                            throw new Error(`Vulnerability ${input.vulnerability_id} not found`);
                        }
                        return (0, idConversion_1.cleanGidsFromObject)(res.vulnerability);
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
    [
        'manage_vulnerability',
        {
            name: 'manage_vulnerability',
            description: 'Drive the vulnerability state machine (Ultimate). Actions: dismiss (with optional dismissal_reason + comment), confirm (genuine finding), resolve (fixed), revert (back to detected). Related: browse_vulnerabilities to discover vulnerability IDs.',
            inputSchema: z.toJSONSchema(schema_1.ManageVulnerabilitySchema),
            requirements: { default: ULTIMATE_REQ },
            gate: { envVar: 'USE_VULNERABILITIES', defaultValue: true },
            handler: async (args) => {
                const input = schema_1.ManageVulnerabilitySchema.parse(args);
                (0, utils_1.assertActionAllowed)('manage_vulnerability', input.action);
                const client = ConnectionManager_1.ConnectionManager.getInstance().getClient((0, token_context_1.getGitLabApiUrlFromContext)());
                const id = vulnerabilityGid(input.vulnerability_id);
                switch (input.action) {
                    case 'dismiss': {
                        const res = await client.request(vulnerabilities_1.DISMISS_VULN, {
                            id,
                            comment: input.comment ?? null,
                            dismissalReason: input.dismissal_reason ?? null,
                        });
                        return unwrapVuln(res.vulnerabilityDismiss);
                    }
                    case 'confirm': {
                        const res = await client.request(vulnerabilities_1.CONFIRM_VULN, { id });
                        return unwrapVuln(res.vulnerabilityConfirm);
                    }
                    case 'resolve': {
                        const res = await client.request(vulnerabilities_1.RESOLVE_VULN, { id });
                        return unwrapVuln(res.vulnerabilityResolve);
                    }
                    case 'revert': {
                        const res = await client.request(vulnerabilities_1.REVERT_VULN, { id });
                        return unwrapVuln(res.vulnerabilityRevertToDetected);
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
]);
function getVulnerabilitiesReadOnlyToolNames() {
    return ['browse_vulnerabilities'];
}
//# sourceMappingURL=registry.js.map