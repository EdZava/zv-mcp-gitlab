"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManageMilestoneSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
const namespaceField = zod_1.z.string().describe('Namespace path (group or project)');
const milestoneIdField = utils_1.requiredId.describe("The ID of a project or group milestone. Required for 'update', 'delete', 'promote' action(s).");
const CreateMilestoneSchema = zod_1.z.object({
    action: zod_1.z.literal('create'),
    namespace: namespaceField,
    title: zod_1.z.string().describe('The title of the milestone'),
    description: zod_1.z.string().optional().describe('The description of the milestone'),
    due_date: zod_1.z.string().optional().describe('The due date of the milestone (YYYY-MM-DD)'),
    start_date: zod_1.z.string().optional().describe('The start date of the milestone (YYYY-MM-DD)'),
});
const UpdateMilestoneSchema = zod_1.z.object({
    action: zod_1.z.literal('update'),
    namespace: namespaceField,
    milestone_id: milestoneIdField,
    title: zod_1.z.string().optional().describe('The new title of the milestone'),
    description: zod_1.z.string().optional().describe('The new description of the milestone'),
    due_date: zod_1.z.string().optional().describe('The due date of the milestone (YYYY-MM-DD)'),
    start_date: zod_1.z.string().optional().describe('The start date of the milestone (YYYY-MM-DD)'),
    state_event: zod_1.z
        .string()
        .transform((val) => val.toLowerCase())
        .pipe(zod_1.z.enum(['close', 'activate']))
        .optional()
        .describe("State event to apply: 'close' or 'activate'"),
});
const DeleteMilestoneSchema = zod_1.z.object({
    action: zod_1.z.literal('delete'),
    namespace: namespaceField,
    milestone_id: milestoneIdField,
});
const PromoteMilestoneSchema = zod_1.z.object({
    action: zod_1.z.literal('promote'),
    namespace: namespaceField,
    milestone_id: milestoneIdField,
});
exports.ManageMilestoneSchema = zod_1.z.discriminatedUnion('action', [
    CreateMilestoneSchema,
    UpdateMilestoneSchema,
    DeleteMilestoneSchema,
    PromoteMilestoneSchema,
]);
//# sourceMappingURL=schema.js.map