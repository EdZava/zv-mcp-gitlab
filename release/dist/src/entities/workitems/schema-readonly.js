"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowseWorkItemsSchema = exports.WorkItemStateEventSchema = exports.WorkItemStateSchema = exports.WorkItemTypeEnumSchema = exports.WorkItemIdSchema = void 0;
const zod_1 = require("zod");
exports.WorkItemIdSchema = zod_1.z
    .string()
    .min(1)
    .describe("Work item ID - use numeric ID from list results (e.g., '5953'). " +
    "GID format also accepted and auto-normalized (e.g., 'gid://gitlab/WorkItem/5953').");
exports.WorkItemTypeEnumSchema = zod_1.z
    .string()
    .transform((val) => val.toUpperCase().replace(/\s+/g, '_'))
    .pipe(zod_1.z.enum([
    'EPIC',
    'ISSUE',
    'TASK',
    'INCIDENT',
    'TEST_CASE',
    'REQUIREMENT',
    'OBJECTIVE',
    'KEY_RESULT',
]))
    .describe('Type of work item');
exports.WorkItemStateSchema = zod_1.z
    .string()
    .transform((val) => val.toUpperCase())
    .pipe(zod_1.z.enum(['OPEN', 'CLOSED']))
    .describe('State of work item');
exports.WorkItemStateEventSchema = zod_1.z
    .string()
    .transform((val) => val.toUpperCase())
    .pipe(zod_1.z.enum(['CLOSE', 'REOPEN']))
    .describe('State event for updating work item');
const workItemIdField = exports.WorkItemIdSchema.describe("Work item ID to retrieve - use numeric ID from list results (e.g., '5953')");
const workItemIidField = zod_1.z
    .string()
    .min(1)
    .describe("Internal ID from URL (e.g., '95' from /issues/95). Use with namespace parameter.");
const namespaceField = zod_1.z
    .string()
    .describe("Namespace path containing the work item (e.g., 'group/project')");
const ListWorkItemsSchema = zod_1.z.object({
    action: zod_1.z.literal('list').describe('List work items with filtering'),
    namespace: zod_1.z
        .string()
        .describe('Namespace path (group or project). Groups return epics, projects return issues/tasks.'),
    types: zod_1.z.array(exports.WorkItemTypeEnumSchema).optional().describe('Filter by work item types'),
    state: zod_1.z
        .array(exports.WorkItemStateSchema)
        .optional()
        .default(['OPEN'])
        .describe('Filter by work item state. Defaults to OPEN items only. Use ["OPEN", "CLOSED"] for all items.'),
    first: zod_1.z.number().optional().default(20).describe('Number of items to return'),
    after: zod_1.z
        .string()
        .optional()
        .describe('Cursor for pagination (use endCursor from previous response)'),
    simple: zod_1.z
        .boolean()
        .optional()
        .default(true)
        .describe('Return simplified structure with essential fields only. RECOMMENDED: Use default true for most cases.'),
});
const GetWorkItemSchema = zod_1.z.object({
    action: zod_1.z.literal('get').describe('Get single work item details'),
    namespace: namespaceField.optional(),
    iid: workItemIidField.optional(),
    id: workItemIdField.optional(),
});
const BrowseWorkItemsBaseSchema = zod_1.z.discriminatedUnion('action', [
    ListWorkItemsSchema,
    GetWorkItemSchema,
]);
exports.BrowseWorkItemsSchema = BrowseWorkItemsBaseSchema.superRefine((data, ctx) => {
    if (data.action === 'get') {
        const hasNamespaceIid = data.namespace !== undefined && data.iid !== undefined;
        const hasId = data.id !== undefined;
        if (!hasNamespaceIid && !hasId) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                message: "Either 'id' (global ID) or both 'namespace' and 'iid' (from URL) must be provided",
                path: ['id'],
            });
        }
    }
});
//# sourceMappingURL=schema-readonly.js.map