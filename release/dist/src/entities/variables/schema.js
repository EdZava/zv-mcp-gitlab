"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManageVariableSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
const flexibleVariableType = zod_1.z.preprocess((val) => {
    if (typeof val === 'string') {
        const normalized = val.toLowerCase().trim();
        if (['env_var', 'env', 'environment', 'var', 'variable'].includes(normalized)) {
            return 'env_var';
        }
        if (['file', 'file_var'].includes(normalized)) {
            return 'file';
        }
    }
    return val;
}, zod_1.z.enum(['env_var', 'file']));
const namespaceField = zod_1.z.string().describe('Namespace path (group or project)');
const keyField = zod_1.z
    .string()
    .describe('The key of the CI/CD variable. Maximum 255 characters, only alphanumeric and underscore characters allowed.');
const variableTypeField = flexibleVariableType
    .optional()
    .describe('The type of variable: "env_var" for environment variables (default) or "file" for file variables.');
const environmentScopeField = zod_1.z
    .string()
    .optional()
    .describe('The environment scope. Use "*" for all environments (default), or specify like "production", "staging".');
const protectedField = utils_1.flexibleBoolean
    .optional()
    .describe('Whether this variable is protected. Protected variables are only available to protected branches/tags.');
const maskedField = utils_1.flexibleBoolean
    .optional()
    .describe('Whether this variable should be masked in job logs. MASKING REQUIREMENTS: Value must be at least 8 characters, single line with no spaces, only A-Z a-z 0-9 + / = . ~ - _ @ : characters.');
const rawField = utils_1.flexibleBoolean
    .optional()
    .describe('Whether variable expansion is disabled. When true, variables like $OTHER_VAR in the value will NOT be expanded.');
const descriptionField = zod_1.z
    .string()
    .optional()
    .describe('Optional description explaining the purpose of this variable (GitLab 16.2+).');
const filterField = zod_1.z
    .object({
    environment_scope: zod_1.z
        .string()
        .optional()
        .describe('Filter to specify which environment scope variant to update/delete when multiple variables exist with the same key.'),
})
    .optional()
    .describe('Filter parameters to identify the specific variable');
const CreateVariableSchema = zod_1.z.object({
    action: zod_1.z.literal('create').describe('Create a new CI/CD variable'),
    namespace: namespaceField,
    key: keyField,
    value: zod_1.z
        .string()
        .describe('The value of the CI/CD variable. For file type variables, this is the file content.'),
    variable_type: variableTypeField,
    environment_scope: environmentScopeField,
    protected: protectedField,
    masked: maskedField,
    raw: rawField,
    description: descriptionField,
});
const UpdateVariableSchema = zod_1.z.object({
    action: zod_1.z.literal('update').describe('Update an existing CI/CD variable'),
    namespace: namespaceField,
    key: keyField,
    value: zod_1.z
        .string()
        .optional()
        .describe('The value of the CI/CD variable. For file type variables, this is the file content.'),
    variable_type: variableTypeField,
    environment_scope: environmentScopeField,
    protected: protectedField,
    masked: maskedField,
    raw: rawField,
    description: descriptionField,
    filter: filterField,
});
const DeleteVariableSchema = zod_1.z.object({
    action: zod_1.z.literal('delete').describe('Delete a CI/CD variable'),
    namespace: namespaceField,
    key: keyField,
    filter: filterField,
});
exports.ManageVariableSchema = zod_1.z.discriminatedUnion('action', [
    CreateVariableSchema,
    UpdateVariableSchema,
    DeleteVariableSchema,
]);
//# sourceMappingURL=schema.js.map