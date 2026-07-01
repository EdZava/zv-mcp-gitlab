"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManageVulnerabilitySchema = void 0;
const zod_1 = require("zod");
const schema_readonly_1 = require("./schema-readonly");
const DismissSchema = zod_1.z.object({
    action: zod_1.z
        .literal('dismiss')
        .describe('Dismiss a vulnerability (e.g. false positive), optionally with a reason and comment'),
    vulnerability_id: schema_readonly_1.vulnerabilityIdField,
    comment: zod_1.z.string().optional().describe('Free-text justification for the dismissal.'),
    dismissal_reason: zod_1.z
        .enum([
        'ACCEPTABLE_RISK',
        'FALSE_POSITIVE',
        'MITIGATING_CONTROL',
        'USED_IN_TESTS',
        'NOT_APPLICABLE',
    ])
        .optional()
        .describe('Structured dismissal reason.'),
});
const ConfirmSchema = zod_1.z.object({
    action: zod_1.z.literal('confirm').describe('Confirm a vulnerability as a genuine finding'),
    vulnerability_id: schema_readonly_1.vulnerabilityIdField,
});
const ResolveSchema = zod_1.z.object({
    action: zod_1.z.literal('resolve').describe('Mark a vulnerability as resolved'),
    vulnerability_id: schema_readonly_1.vulnerabilityIdField,
});
const RevertSchema = zod_1.z.object({
    action: zod_1.z
        .literal('revert')
        .describe('Revert a vulnerability back to the detected state (un-dismiss / un-resolve)'),
    vulnerability_id: schema_readonly_1.vulnerabilityIdField,
});
exports.ManageVulnerabilitySchema = zod_1.z.discriminatedUnion('action', [
    DismissSchema,
    ConfirmSchema,
    ResolveSchema,
    RevertSchema,
]);
//# sourceMappingURL=schema.js.map