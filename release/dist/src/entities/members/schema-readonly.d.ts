import { z } from 'zod';
declare const AccessLevelSchema: z.ZodNumber;
export declare const BrowseMembersSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"list_project">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    query: z.ZodOptional<z.ZodString>;
    user_ids: z.ZodOptional<z.ZodArray<z.ZodCoercedString<unknown>>>;
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"list_group">;
    group_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    query: z.ZodOptional<z.ZodString>;
    user_ids: z.ZodOptional<z.ZodArray<z.ZodCoercedString<unknown>>>;
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"get_project">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    user_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    include_inherited: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"get_group">;
    group_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    user_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    include_inherited: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"list_all_project">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    query: z.ZodOptional<z.ZodString>;
    user_ids: z.ZodOptional<z.ZodArray<z.ZodCoercedString<unknown>>>;
    state: z.ZodOptional<z.ZodEnum<{
        active: "active";
        blocked: "blocked";
        awaiting: "awaiting";
    }>>;
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"list_all_group">;
    group_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    query: z.ZodOptional<z.ZodString>;
    user_ids: z.ZodOptional<z.ZodArray<z.ZodCoercedString<unknown>>>;
    state: z.ZodOptional<z.ZodEnum<{
        active: "active";
        blocked: "blocked";
        awaiting: "awaiting";
    }>>;
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>], "action">;
export type BrowseMembersOptions = z.infer<typeof BrowseMembersSchema>;
export { AccessLevelSchema };
