"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowseIterationsSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
const utils_2 = require("../utils");
const groupIdField = utils_1.requiredId.describe('Group ID or URL-encoded path.');
const ListIterationsSchema = zod_1.z.object({
    action: zod_1.z.literal('list').describe('List iterations for a group'),
    group_id: groupIdField,
    state: zod_1.z
        .enum(['opened', 'upcoming', 'current', 'closed', 'all'])
        .optional()
        .describe('Filter by iteration state.'),
    search: zod_1.z.string().optional().describe('Search iterations by title.'),
    include_ancestors: utils_2.flexibleBoolean.optional().describe('Include iterations from parent groups.'),
    ...(0, utils_1.paginationFields)(),
});
const GetIterationSchema = zod_1.z.object({
    action: zod_1.z.literal('get').describe('Get a specific iteration by ID'),
    group_id: groupIdField,
    iteration_id: utils_1.requiredId.describe('Iteration ID.'),
});
exports.BrowseIterationsSchema = zod_1.z.discriminatedUnion('action', [
    ListIterationsSchema,
    GetIterationSchema,
]);
//# sourceMappingURL=schema-readonly.js.map