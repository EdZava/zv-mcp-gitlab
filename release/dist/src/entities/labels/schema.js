"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManageLabelSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
const namespaceField = zod_1.z.string().describe('Namespace path (group or project)');
const labelIdField = utils_1.requiredId.describe('The ID or title of the label');
const descriptionField = zod_1.z.string().optional().describe('The description of the label');
const priorityField = zod_1.z
    .number()
    .optional()
    .describe('The priority of the label. Must be greater or equal than zero or null to remove the priority.');
const CreateLabelSchema = zod_1.z.object({
    action: zod_1.z.literal('create').describe('Create a new label'),
    namespace: namespaceField,
    name: zod_1.z.string().describe('The name of the label'),
    color: zod_1.z
        .string()
        .describe("The color of the label in 6-digit hex notation with leading '#' (e.g. #FFAABB) or CSS color name"),
    description: descriptionField,
    priority: priorityField,
});
const UpdateLabelSchema = zod_1.z.object({
    action: zod_1.z.literal('update').describe('Update an existing label'),
    namespace: namespaceField,
    label_id: labelIdField,
    name: zod_1.z.string().optional().describe('The name of the label'),
    new_name: zod_1.z.string().optional().describe('The new name of the label'),
    color: zod_1.z
        .string()
        .optional()
        .describe("The color of the label in 6-digit hex notation with leading '#' (e.g. #FFAABB) or CSS color name"),
    description: descriptionField,
    priority: priorityField,
});
const DeleteLabelSchema = zod_1.z.object({
    action: zod_1.z.literal('delete').describe('Delete a label'),
    namespace: namespaceField,
    label_id: labelIdField,
});
exports.ManageLabelSchema = zod_1.z.discriminatedUnion('action', [
    CreateLabelSchema,
    UpdateLabelSchema,
    DeleteLabelSchema,
]);
//# sourceMappingURL=schema.js.map