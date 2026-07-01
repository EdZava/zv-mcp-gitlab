"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowseVariablesSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
const namespaceField = zod_1.z.string().describe('Namespace path (group or project)');
const filterField = zod_1.z
    .object({
    environment_scope: zod_1.z
        .string()
        .optional()
        .describe('The environment scope filter. Use "*" for all environments or specific environment name like "production".'),
})
    .optional()
    .describe('Filter parameters for variable lookup');
const ListVariablesSchema = zod_1.z.object({
    action: zod_1.z.literal('list').describe('List all CI/CD variables'),
    namespace: namespaceField,
    ...(0, utils_1.paginationFields)(),
});
const GetVariableSchema = zod_1.z.object({
    action: zod_1.z.literal('get').describe('Get a single CI/CD variable by key'),
    namespace: namespaceField,
    key: zod_1.z
        .string()
        .describe('The key of the CI/CD variable. Maximum 255 characters, alphanumeric and underscore only.'),
    filter: filterField,
});
exports.BrowseVariablesSchema = zod_1.z.discriminatedUnion('action', [
    ListVariablesSchema,
    GetVariableSchema,
]);
//# sourceMappingURL=schema-readonly.js.map