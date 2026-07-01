"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requiredId = exports.flexibleBooleanNullable = exports.flexibleBoolean = exports.GITLAB_MAX_PER_PAGE = exports.GITLAB_DEFAULT_PER_PAGE = void 0;
exports.paginationFields = paginationFields;
exports.assertDefined = assertDefined;
exports.validateScopeId = validateScopeId;
exports.assertActionAllowed = assertActionAllowed;
const zod_1 = require("zod");
const config_1 = require("../config");
const DEFAULT_NULL = process.env.DEFAULT_NULL === 'true';
exports.GITLAB_DEFAULT_PER_PAGE = 20;
exports.GITLAB_MAX_PER_PAGE = 100;
function paginationFields(defaultPerPage = exports.GITLAB_DEFAULT_PER_PAGE, maxPerPage = exports.GITLAB_MAX_PER_PAGE) {
    if (defaultPerPage > maxPerPage) {
        throw new Error(`Invalid pagination config: defaultPerPage (${defaultPerPage}) cannot exceed maxPerPage (${maxPerPage})`);
    }
    return {
        per_page: zod_1.z
            .number()
            .int()
            .min(1)
            .max(maxPerPage)
            .optional()
            .default(defaultPerPage)
            .describe(`Number of items per page (default: ${defaultPerPage}, max: ${maxPerPage})`),
        page: zod_1.z.number().int().min(1).optional().describe('Page number'),
    };
}
exports.flexibleBoolean = zod_1.z.preprocess((val) => {
    if (typeof val === 'boolean') {
        return val;
    }
    try {
        const result = String(val).toLowerCase();
        return ['true', 't', '1'].includes(result);
    }
    catch {
        return false;
    }
}, zod_1.z.boolean());
exports.flexibleBooleanNullable = DEFAULT_NULL
    ? exports.flexibleBoolean.nullable().default(null)
    : exports.flexibleBoolean.nullable();
exports.requiredId = zod_1.z.preprocess((val) => val ?? '', zod_1.z.coerce.string().min(1));
function assertDefined(value, fieldName) {
    if (value === undefined) {
        throw new Error(`${fieldName} is required but was not provided`);
    }
}
function validateScopeId(data) {
    if (data.scope === 'project') {
        return !!data.projectId;
    }
    if (data.scope === 'group') {
        return !!data.groupId;
    }
    return true;
}
function assertActionAllowed(toolName, action) {
    if ((0, config_1.isActionDenied)(toolName, action)) {
        throw new Error(`Action '${action}' is not allowed for ${toolName} tool`);
    }
}
//# sourceMappingURL=utils.js.map