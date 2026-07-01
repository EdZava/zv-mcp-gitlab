"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManageWorkItemSchema = void 0;
const zod_1 = require("zod");
const schema_readonly_1 = require("./schema-readonly");
const workItemIdField = schema_readonly_1.WorkItemIdSchema.describe("Work item ID - use numeric ID from list results (e.g., '5953')");
const LinkTypeSchema = zod_1.z
    .enum(['BLOCKS', 'BLOCKED_BY', 'RELATED'])
    .describe('Relationship type: BLOCKS (this blocks target), BLOCKED_BY (this is blocked by target), RELATED (general relationship)');
const DateSchema = zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');
const CreateWorkItemSchema = zod_1.z.object({
    action: zod_1.z.literal('create').describe('Create a new work item'),
    namespace: zod_1.z
        .string()
        .describe('CRITICAL: Namespace path (group OR project). For Epics use GROUP path (e.g. "my-group"). For Issues/Tasks use PROJECT path (e.g. "my-group/my-project").'),
    workItemType: schema_readonly_1.WorkItemTypeEnumSchema.describe('Type of work item'),
    title: zod_1.z.string().describe('Title of the work item'),
    description: zod_1.z.string().optional().describe('Description of the work item'),
    assigneeIds: zod_1.z.array(zod_1.z.string()).optional().describe('Array of assignee user IDs'),
    labelIds: zod_1.z.array(zod_1.z.string()).optional().describe('Array of label IDs'),
    milestoneId: zod_1.z.string().optional().describe('Milestone ID'),
    startDate: DateSchema.optional().describe('Start date in YYYY-MM-DD format'),
    dueDate: DateSchema.optional().describe('Due date in YYYY-MM-DD format'),
    parentId: zod_1.z
        .string()
        .min(1)
        .optional()
        .describe('Parent work item ID to set hierarchy relationship'),
    childrenIds: zod_1.z
        .array(zod_1.z.string().min(1))
        .optional()
        .describe('Array of child work item IDs to add'),
    timeEstimate: zod_1.z
        .string()
        .optional()
        .describe('Time estimate (e.g. "1h 30m", "2d"). Applied via update after create. Check _warning in response if application failed.'),
    isFixed: zod_1.z
        .boolean()
        .optional()
        .describe('Fixed dates - not inherited from children (Premium tier)'),
    weight: zod_1.z.number().int().min(0).optional().describe('Story points / weight value (Premium tier)'),
    iterationId: zod_1.z
        .string()
        .min(1)
        .optional()
        .describe('Iteration/sprint ID to assign (Premium tier)'),
    progressCurrentValue: zod_1.z
        .number()
        .int()
        .min(0)
        .max(100)
        .optional()
        .describe('Current progress value 0-100 for OKR key results (Premium tier)'),
    healthStatus: zod_1.z
        .enum(['onTrack', 'needsAttention', 'atRisk'])
        .optional()
        .describe('Health status indicator (Ultimate tier)'),
    color: zod_1.z
        .string()
        .regex(/^#[0-9a-fA-F]{6}$/, 'Color must be hex format like #FF5733')
        .optional()
        .describe('Custom hex color for epics (Ultimate tier)'),
});
const UpdateWorkItemSchema = zod_1.z.object({
    action: zod_1.z.literal('update').describe('Update an existing work item'),
    id: workItemIdField,
    title: zod_1.z.string().optional().describe('Title of the work item'),
    description: zod_1.z.string().optional().describe('Description of the work item'),
    assigneeIds: zod_1.z.array(zod_1.z.string()).optional().describe('Array of assignee user IDs'),
    labelIds: zod_1.z
        .array(zod_1.z.string())
        .optional()
        .describe('Array of label IDs to SET (replaces all existing labels). Cannot be used with addLabelIds or removeLabelIds.'),
    addLabelIds: zod_1.z
        .array(zod_1.z.string())
        .optional()
        .describe('Array of label IDs to ADD to existing labels. Can be used with removeLabelIds. Cannot be used with labelIds.'),
    removeLabelIds: zod_1.z
        .array(zod_1.z.string())
        .optional()
        .describe('Array of label IDs to REMOVE from existing labels. Can be used with addLabelIds. Cannot be used with labelIds.'),
    milestoneId: zod_1.z.string().optional().describe('Milestone ID'),
    state: schema_readonly_1.WorkItemStateEventSchema.optional().describe('State event for the work item (CLOSE, REOPEN)'),
    linkType: LinkTypeSchema.optional().describe('Relationship type to create. Use with targetId to link work items during update. Applied via separate mutation after the main update.'),
    targetId: schema_readonly_1.WorkItemIdSchema.optional().describe('Target work item ID to link to. Use with linkType to create a relationship during update.'),
    startDate: DateSchema.nullable()
        .optional()
        .describe('Start date in YYYY-MM-DD format (null to clear)'),
    dueDate: DateSchema.nullable()
        .optional()
        .describe('Due date in YYYY-MM-DD format (null to clear)'),
    parentId: zod_1.z
        .string()
        .min(1)
        .nullable()
        .optional()
        .describe('Parent work item ID (null to unlink parent)'),
    childrenIds: zod_1.z
        .array(zod_1.z.string().min(1))
        .optional()
        .describe('Array of child work item IDs to add'),
    timeEstimate: zod_1.z
        .string()
        .optional()
        .describe('Time estimate in human-readable format (e.g. "1h 30m", "2d", "0h" to clear)'),
    timeSpent: zod_1.z
        .string()
        .optional()
        .describe('Time spent to log as timelog entry (e.g. "2h", "1h 30m")'),
    timeSpentAt: zod_1.z
        .string()
        .optional()
        .describe('When time was spent in ISO 8601 format (defaults to now)'),
    timeSpentSummary: zod_1.z
        .string()
        .optional()
        .describe('Summary/description of work done for the timelog entry'),
    isFixed: zod_1.z
        .boolean()
        .optional()
        .describe('Fixed dates - not inherited from children (Premium tier)'),
    weight: zod_1.z
        .number()
        .int()
        .min(0)
        .nullable()
        .optional()
        .describe('Story points / weight value, null to clear (Premium tier)'),
    iterationId: zod_1.z
        .string()
        .min(1)
        .nullable()
        .optional()
        .describe('Iteration/sprint ID, null to unassign (Premium tier)'),
    progressCurrentValue: zod_1.z
        .number()
        .int()
        .min(0)
        .max(100)
        .optional()
        .describe('Current progress value 0-100 for OKR key results (Premium tier)'),
    healthStatus: zod_1.z
        .enum(['onTrack', 'needsAttention', 'atRisk'])
        .nullable()
        .optional()
        .describe('Health status indicator, null to clear (Ultimate tier)'),
    color: zod_1.z
        .string()
        .regex(/^#[0-9a-fA-F]{6}$/, 'Color must be hex format like #FF5733')
        .optional()
        .describe('Custom hex color for epics (Ultimate tier)'),
    verificationStatus: zod_1.z
        .enum(['PASSED', 'FAILED'])
        .optional()
        .describe('Set verification status for requirement work items: PASSED or FAILED (Ultimate tier). Creates a test report internally.'),
});
const DeleteWorkItemSchema = zod_1.z.object({
    action: zod_1.z.literal('delete').describe('Delete a work item'),
    id: workItemIdField,
});
const DeleteTimelogSchema = zod_1.z.object({
    action: zod_1.z.literal('delete_timelog').describe('Delete a time tracking entry from a work item'),
    timelogId: zod_1.z
        .string()
        .min(1)
        .describe("Global ID of the timelog entry (gid://gitlab/Timelog/N) — obtain from work item's TIME_TRACKING widget via browse_work_items get action"),
});
const AddLinkSchema = zod_1.z.object({
    action: zod_1.z.literal('add_link').describe('Add a relationship link between two work items'),
    id: workItemIdField.describe('Source work item ID'),
    targetId: schema_readonly_1.WorkItemIdSchema.describe('Target work item ID to link to'),
    linkType: LinkTypeSchema,
});
const RemoveLinkSchema = zod_1.z.object({
    action: zod_1.z.literal('remove_link').describe('Remove a relationship link between two work items'),
    id: workItemIdField.describe('Source work item ID'),
    targetId: schema_readonly_1.WorkItemIdSchema.describe('Target work item ID to unlink'),
});
exports.ManageWorkItemSchema = zod_1.z.discriminatedUnion('action', [
    CreateWorkItemSchema,
    UpdateWorkItemSchema,
    DeleteWorkItemSchema,
    DeleteTimelogSchema,
    AddLinkSchema,
    RemoveLinkSchema,
]);
//# sourceMappingURL=schema.js.map