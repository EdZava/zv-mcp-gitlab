"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowseVulnerabilitiesSchema = exports.vulnerabilityIdField = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
exports.vulnerabilityIdField = zod_1.z.coerce
    .number()
    .int()
    .positive()
    .describe('Numeric vulnerability ID (from a list action); expanded to a global ID internally.');
const stateFilter = zod_1.z
    .array(zod_1.z.enum(['DETECTED', 'CONFIRMED', 'RESOLVED', 'DISMISSED']))
    .optional()
    .describe('Filter by vulnerability state(s).');
const severityFilter = zod_1.z
    .array(zod_1.z.enum(['INFO', 'UNKNOWN', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']))
    .optional()
    .describe('Filter by severity level(s).');
const reportTypeFilter = zod_1.z
    .array(zod_1.z.enum([
    'SAST',
    'DAST',
    'DEPENDENCY_SCANNING',
    'CONTAINER_SCANNING',
    'SECRET_DETECTION',
    'COVERAGE_FUZZING',
    'API_FUZZING',
    'CLUSTER_IMAGE_SCANNING',
    'GENERIC',
]))
    .optional()
    .describe('Filter by scanner report type(s).');
const sortField = zod_1.z
    .enum([
    'severity_desc',
    'severity_asc',
    'detected_desc',
    'detected_asc',
    'state_desc',
    'state_asc',
    'title_desc',
    'title_asc',
])
    .optional()
    .describe('Sort order (default: severity_desc).');
const firstField = zod_1.z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .optional()
    .describe('Max items to return (cursor pagination, default 20, max 100).');
const afterField = zod_1.z.string().optional().describe('Cursor for the next page (endCursor).');
const ListVulnerabilitiesSchema = zod_1.z.object({
    action: zod_1.z
        .literal('list')
        .describe('List vulnerabilities. Pass project_id for a project, group_id for a group, or neither for an instance-wide view (admin).'),
    project_id: utils_1.requiredId.optional().describe('Project full path or ID to scope the list.'),
    group_id: utils_1.requiredId.optional().describe('Group full path or ID to scope the list.'),
    state: stateFilter,
    severity: severityFilter,
    report_type: reportTypeFilter,
    sort: sortField,
    first: firstField,
    after: afterField,
});
const GetVulnerabilitySchema = zod_1.z.object({
    action: zod_1.z.literal('get').describe('Get a single vulnerability by its numeric ID.'),
    vulnerability_id: exports.vulnerabilityIdField,
});
exports.BrowseVulnerabilitiesSchema = zod_1.z
    .discriminatedUnion('action', [ListVulnerabilitiesSchema, GetVulnerabilitySchema])
    .refine((data) => data.action !== 'list' || !(data.project_id && data.group_id), {
    message: 'Pass at most one of project_id or group_id (a list targets a single scope)',
    path: ['project_id'],
});
//# sourceMappingURL=schema-readonly.js.map