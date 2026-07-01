import { z } from 'zod';
export declare const ManageMemberSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"add_to_project">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    user_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    access_level: z.ZodNumber;
    expires_at: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"add_to_group">;
    group_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    user_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    access_level: z.ZodNumber;
    expires_at: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"remove_from_project">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    user_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    skip_subresources: z.ZodOptional<z.ZodBoolean>;
    unassign_issuables: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"remove_from_group">;
    group_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    user_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    skip_subresources: z.ZodOptional<z.ZodBoolean>;
    unassign_issuables: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"update_project">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    user_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    access_level: z.ZodNumber;
    expires_at: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"update_group">;
    group_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    user_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    access_level: z.ZodNumber;
    expires_at: z.ZodOptional<z.ZodString>;
    member_role_id: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>], "action">;
export type ManageMemberOptions = z.infer<typeof ManageMemberSchema>;
