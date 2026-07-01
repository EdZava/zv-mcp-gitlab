import { z } from 'zod';
export declare const ManageJobTokenScopeSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"set_enabled">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    enabled: z.ZodPreprocess<z.ZodBoolean>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"add_project">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    target_project_id: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"remove_project">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    target_project_id: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"add_group">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    target_group_id: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"remove_group">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    target_group_id: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>], "action">;
export type ManageJobTokenScopeInput = z.infer<typeof ManageJobTokenScopeSchema>;
