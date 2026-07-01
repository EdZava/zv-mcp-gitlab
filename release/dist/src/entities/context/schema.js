"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManageContextSchema = void 0;
const zod_1 = require("zod");
const ShowContextSchema = zod_1.z.object({
    action: zod_1.z
        .literal('show')
        .describe('Display current context including host, preset, scope, and mode'),
});
const ListPresetsSchema = zod_1.z.object({
    action: zod_1.z.literal('list_presets').describe('List all available presets with descriptions'),
});
const ListProfilesSchema = zod_1.z.object({
    action: zod_1.z
        .literal('list_profiles')
        .describe('List available OAuth profiles - only works in OAuth mode'),
});
const SwitchPresetSchema = zod_1.z.object({
    action: zod_1.z.literal('switch_preset').describe('Switch to a different preset configuration'),
    preset: zod_1.z.string().min(1).describe('Name of the preset to activate'),
});
const SwitchProfileSchema = zod_1.z.object({
    action: zod_1.z
        .literal('switch_profile')
        .describe('Switch to a different OAuth profile - OAuth mode only'),
    profile: zod_1.z.string().min(1).describe('Name of the profile to activate'),
});
const SetScopeSchema = zod_1.z.object({
    action: zod_1.z.literal('set_scope').describe('Set scope to restrict operations to a namespace'),
    namespace: zod_1.z
        .string()
        .min(1)
        .describe("Namespace path (e.g., 'my-group' or 'group/project') - type is auto-detected"),
    includeSubgroups: zod_1.z
        .boolean()
        .optional()
        .default(true)
        .describe('Include subgroups when scope is a group (default: true)'),
});
const ResetContextSchema = zod_1.z.object({
    action: zod_1.z.literal('reset').describe('Reset context to initial state from session start'),
});
const WhoamiSchema = zod_1.z.object({
    action: zod_1.z
        .literal('whoami')
        .describe('Get authentication status, token capabilities, and server configuration. ' +
        'Re-introspects token to detect permission changes - if scopes changed, ' +
        'automatically refreshes available tools (scopesRefreshed=true in response). ' +
        'Use to diagnose access issues or verify new token permissions are active.'),
});
exports.ManageContextSchema = zod_1.z.discriminatedUnion('action', [
    ShowContextSchema,
    ListPresetsSchema,
    ListProfilesSchema,
    SwitchPresetSchema,
    SwitchProfileSchema,
    SetScopeSchema,
    ResetContextSchema,
    WhoamiSchema,
]);
//# sourceMappingURL=schema.js.map