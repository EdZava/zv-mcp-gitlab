"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowseAuditEventsSchema = exports.auditEventIdField = exports.groupIdField = exports.projectIdField = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
exports.projectIdField = utils_1.requiredId.describe("Project ID or URL-encoded path (e.g. 'group/project' or '123').");
exports.groupIdField = utils_1.requiredId.describe("Group ID or URL-encoded path (e.g. 'my-group' or '42').");
exports.auditEventIdField = zod_1.z.coerce
    .number()
    .int()
    .positive()
    .describe('Numeric audit-event ID (from a list action).');
const createdAfterField = zod_1.z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'created_after must be a YYYY-MM-DD date')
    .optional()
    .describe('Return events created on or after this date (YYYY-MM-DD).');
const createdBeforeField = zod_1.z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'created_before must be a YYYY-MM-DD date')
    .optional()
    .describe('Return events created on or before this date (YYYY-MM-DD).');
const ListInstanceSchema = zod_1.z.object({
    action: zod_1.z
        .literal('list_instance')
        .describe('List instance-wide audit events (requires admin; Premium+)'),
    entity_type: zod_1.z
        .string()
        .optional()
        .describe("Filter by entity type, e.g. 'User', 'Group', 'Project', 'Key'."),
    entity_id: zod_1.z.coerce
        .number()
        .int()
        .positive()
        .optional()
        .describe('Filter by the numeric ID of the entity (used with entity_type).'),
    created_after: createdAfterField,
    created_before: createdBeforeField,
    ...(0, utils_1.paginationFields)(),
});
const ListGroupSchema = zod_1.z.object({
    action: zod_1.z
        .literal('list_group')
        .describe('List a group audit events (Premium+, group owner/admin)'),
    group_id: exports.groupIdField,
    created_after: createdAfterField,
    created_before: createdBeforeField,
    ...(0, utils_1.paginationFields)(),
});
const ListProjectSchema = zod_1.z.object({
    action: zod_1.z
        .literal('list_project')
        .describe('List a project audit events (Premium+, project owner/admin)'),
    project_id: exports.projectIdField,
    created_after: createdAfterField,
    created_before: createdBeforeField,
    ...(0, utils_1.paginationFields)(),
});
const GetAuditEventSchema = zod_1.z.object({
    action: zod_1.z
        .literal('get')
        .describe('Get a single audit event by ID. Pass project_id for a project event, group_id for a group event, or neither for an instance event (admin).'),
    audit_event_id: exports.auditEventIdField,
    project_id: utils_1.requiredId.optional().describe('Set for a project audit event.'),
    group_id: utils_1.requiredId.optional().describe('Set for a group audit event.'),
});
exports.BrowseAuditEventsSchema = zod_1.z
    .discriminatedUnion('action', [
    ListInstanceSchema,
    ListGroupSchema,
    ListProjectSchema,
    GetAuditEventSchema,
])
    .refine((data) => data.action !== 'get' || !(data.project_id && data.group_id), {
    message: 'Pass at most one of project_id or group_id (an event belongs to a single scope)',
    path: ['project_id'],
});
//# sourceMappingURL=schema-readonly.js.map