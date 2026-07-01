import { z } from 'zod';
declare const ShowContextSchema: z.ZodObject<{
    action: z.ZodLiteral<"show">;
}, z.core.$strip>;
declare const ListPresetsSchema: z.ZodObject<{
    action: z.ZodLiteral<"list_presets">;
}, z.core.$strip>;
declare const ListProfilesSchema: z.ZodObject<{
    action: z.ZodLiteral<"list_profiles">;
}, z.core.$strip>;
declare const SwitchPresetSchema: z.ZodObject<{
    action: z.ZodLiteral<"switch_preset">;
    preset: z.ZodString;
}, z.core.$strip>;
declare const SwitchProfileSchema: z.ZodObject<{
    action: z.ZodLiteral<"switch_profile">;
    profile: z.ZodString;
}, z.core.$strip>;
declare const SetScopeSchema: z.ZodObject<{
    action: z.ZodLiteral<"set_scope">;
    namespace: z.ZodString;
    includeSubgroups: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
declare const ResetContextSchema: z.ZodObject<{
    action: z.ZodLiteral<"reset">;
}, z.core.$strip>;
declare const WhoamiSchema: z.ZodObject<{
    action: z.ZodLiteral<"whoami">;
}, z.core.$strip>;
export declare const ManageContextSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"show">;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"list_presets">;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"list_profiles">;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"switch_preset">;
    preset: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"switch_profile">;
    profile: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"set_scope">;
    namespace: z.ZodString;
    includeSubgroups: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"reset">;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"whoami">;
}, z.core.$strip>], "action">;
export type ManageContextInput = z.infer<typeof ManageContextSchema>;
export type ShowContextInput = z.infer<typeof ShowContextSchema>;
export type ListPresetsInput = z.infer<typeof ListPresetsSchema>;
export type ListProfilesInput = z.infer<typeof ListProfilesSchema>;
export type SwitchPresetInput = z.infer<typeof SwitchPresetSchema>;
export type SwitchProfileInput = z.infer<typeof SwitchProfileSchema>;
export type SetScopeInput = z.infer<typeof SetScopeSchema>;
export type ResetContextInput = z.infer<typeof ResetContextSchema>;
export type WhoamiInput = z.infer<typeof WhoamiSchema>;
export {};
