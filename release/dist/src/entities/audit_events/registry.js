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
exports.auditEventsToolRegistry = void 0;
exports.getAuditEventsReadOnlyToolNames = getAuditEventsReadOnlyToolNames;
const z = __importStar(require("zod"));
const schema_readonly_1 = require("./schema-readonly");
const gitlab_api_1 = require("../../utils/gitlab-api");
const utils_1 = require("../utils");
const PREMIUM_REQ = { tier: 'premium', minVersion: '12.4', notes: 'Audit Events' };
function auditBasePath(input) {
    if (input.project_id) {
        return `projects/${encodeURIComponent(input.project_id)}/audit_events`;
    }
    if (input.group_id) {
        return `groups/${encodeURIComponent(input.group_id)}/audit_events`;
    }
    return 'audit_events';
}
exports.auditEventsToolRegistry = new Map([
    [
        'browse_audit_events',
        {
            name: 'browse_audit_events',
            description: 'Inspect audit events: the immutable record of who did what, when. Actions: list_instance (instance-wide, admin-only), list_group / list_project (a group or project audit trail), get (a single event by ID - pass project_id or group_id for group/project events, neither for an instance event). Premium/Ultimate feature; there is no write counterpart because audit events cannot be modified.',
            inputSchema: z.toJSONSchema(schema_readonly_1.BrowseAuditEventsSchema),
            requirements: { default: PREMIUM_REQ },
            gate: { envVar: 'USE_AUDIT_EVENTS', defaultValue: true },
            handler: async (args) => {
                const input = schema_readonly_1.BrowseAuditEventsSchema.parse(args);
                (0, utils_1.assertActionAllowed)('browse_audit_events', input.action);
                switch (input.action) {
                    case 'list_instance': {
                        const { action: _action, ...query } = input;
                        return gitlab_api_1.gitlab.get('audit_events', { query: (0, gitlab_api_1.toQuery)(query, []) });
                    }
                    case 'list_group': {
                        const { action: _action, group_id, ...query } = input;
                        return gitlab_api_1.gitlab.get(`groups/${encodeURIComponent(group_id)}/audit_events`, {
                            query: (0, gitlab_api_1.toQuery)(query, []),
                        });
                    }
                    case 'list_project': {
                        const { action: _action, project_id, ...query } = input;
                        return gitlab_api_1.gitlab.get(`projects/${encodeURIComponent(project_id)}/audit_events`, {
                            query: (0, gitlab_api_1.toQuery)(query, []),
                        });
                    }
                    case 'get':
                        return gitlab_api_1.gitlab.get(`${auditBasePath(input)}/${input.audit_event_id}`);
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
]);
function getAuditEventsReadOnlyToolNames() {
    return ['browse_audit_events'];
}
//# sourceMappingURL=registry.js.map