"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowseLabelsSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
const namespaceField = zod_1.z.string().describe('Namespace path (group or project)');
const includeAncestorGroupsField = utils_1.flexibleBoolean
    .optional()
    .describe('Include ancestor groups when listing or getting labels');
const ListLabelsSchema = zod_1.z.object({
    action: zod_1.z.literal('list').describe('List labels with optional filtering'),
    namespace: namespaceField,
    search: zod_1.z.string().optional().describe('Keyword to filter labels by'),
    with_counts: utils_1.flexibleBoolean.optional().describe('Include issue and merge request counts'),
    include_ancestor_groups: includeAncestorGroupsField,
    ...(0, utils_1.paginationFields)(),
});
const GetLabelSchema = zod_1.z.object({
    action: zod_1.z.literal('get').describe('Get a single label by ID or title'),
    namespace: namespaceField,
    label_id: utils_1.requiredId.describe('The ID or title of the label'),
    include_ancestor_groups: includeAncestorGroupsField,
});
exports.BrowseLabelsSchema = zod_1.z.discriminatedUnion('action', [
    ListLabelsSchema,
    GetLabelSchema,
]);
//# sourceMappingURL=schema-readonly.js.map