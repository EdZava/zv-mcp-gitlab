"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowseDeployKeysSchema = exports.keyIdField = exports.projectIdField = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
exports.projectIdField = utils_1.requiredId.describe("Project ID or URL-encoded path (e.g. 'group/project' or '123').");
exports.keyIdField = zod_1.z.coerce.number().int().positive().describe('Numeric deploy key ID.');
const ListDeployKeysSchema = zod_1.z.object({
    action: zod_1.z
        .literal('list')
        .describe('List deploy keys. With project_id: the keys on that project. Without project_id: all deploy keys across the instance (requires admin).'),
    project_id: utils_1.requiredId
        .optional()
        .describe('Project to list keys for. Omit to list all instance deploy keys (admin only).'),
    public: utils_1.flexibleBoolean
        .optional()
        .describe('Instance list only: when true, return only the public (non-sensitive) fields.'),
    ...(0, utils_1.paginationFields)(),
});
const GetDeployKeySchema = zod_1.z.object({
    action: zod_1.z.literal('get').describe('Get a single project deploy key by ID'),
    project_id: exports.projectIdField,
    key_id: exports.keyIdField,
});
exports.BrowseDeployKeysSchema = zod_1.z
    .discriminatedUnion('action', [ListDeployKeysSchema, GetDeployKeySchema])
    .refine((data) => data.action !== 'list' || data.public === undefined || data.project_id === undefined, {
    message: 'public is only valid for the instance-wide list (omit project_id)',
    path: ['public'],
});
//# sourceMappingURL=schema-readonly.js.map