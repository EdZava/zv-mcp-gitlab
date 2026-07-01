import { z } from 'zod';
export declare const ManageRefSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"create_branch">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    branch: z.ZodString;
    ref: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"delete_branch">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    branch: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"protect_branch">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    name: z.ZodString;
    push_access_level: z.ZodOptional<z.ZodNumber>;
    merge_access_level: z.ZodOptional<z.ZodNumber>;
    unprotect_access_level: z.ZodOptional<z.ZodNumber>;
    allow_force_push: z.ZodOptional<z.ZodBoolean>;
    allowed_to_push: z.ZodOptional<z.ZodArray<z.ZodObject<{
        user_id: z.ZodOptional<z.ZodNumber>;
        group_id: z.ZodOptional<z.ZodNumber>;
        access_level: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>>;
    allowed_to_merge: z.ZodOptional<z.ZodArray<z.ZodObject<{
        user_id: z.ZodOptional<z.ZodNumber>;
        group_id: z.ZodOptional<z.ZodNumber>;
        access_level: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>>;
    allowed_to_unprotect: z.ZodOptional<z.ZodArray<z.ZodObject<{
        user_id: z.ZodOptional<z.ZodNumber>;
        group_id: z.ZodOptional<z.ZodNumber>;
        access_level: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>>;
    code_owner_approval_required: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"unprotect_branch">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    name: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"update_branch_protection">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    name: z.ZodString;
    allow_force_push: z.ZodOptional<z.ZodBoolean>;
    allowed_to_push: z.ZodOptional<z.ZodArray<z.ZodObject<{
        user_id: z.ZodOptional<z.ZodNumber>;
        group_id: z.ZodOptional<z.ZodNumber>;
        access_level: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>>;
    allowed_to_merge: z.ZodOptional<z.ZodArray<z.ZodObject<{
        user_id: z.ZodOptional<z.ZodNumber>;
        group_id: z.ZodOptional<z.ZodNumber>;
        access_level: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>>;
    allowed_to_unprotect: z.ZodOptional<z.ZodArray<z.ZodObject<{
        user_id: z.ZodOptional<z.ZodNumber>;
        group_id: z.ZodOptional<z.ZodNumber>;
        access_level: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>>;
    code_owner_approval_required: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"create_tag">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    tag_name: z.ZodString;
    ref: z.ZodString;
    message: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"delete_tag">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    tag_name: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"protect_tag">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    name: z.ZodString;
    create_access_level: z.ZodOptional<z.ZodNumber>;
    allowed_to_create: z.ZodOptional<z.ZodArray<z.ZodObject<{
        user_id: z.ZodOptional<z.ZodNumber>;
        group_id: z.ZodOptional<z.ZodNumber>;
        access_level: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"unprotect_tag">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    name: z.ZodString;
}, z.core.$strip>], "action">;
export type ManageRefInput = z.infer<typeof ManageRefSchema>;
