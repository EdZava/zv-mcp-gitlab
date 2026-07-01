import { z } from 'zod';
export declare const BrowseRefsSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"list_branches">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    search: z.ZodOptional<z.ZodString>;
    regex: z.ZodOptional<z.ZodString>;
    per_page: z.ZodOptional<z.ZodNumber>;
    page: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"get_branch">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    branch: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"list_tags">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    search: z.ZodOptional<z.ZodString>;
    order_by: z.ZodOptional<z.ZodEnum<{
        name: "name";
        version: "version";
        updated: "updated";
    }>>;
    sort: z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    per_page: z.ZodOptional<z.ZodNumber>;
    page: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"get_tag">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    tag_name: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"list_protected_branches">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    search: z.ZodOptional<z.ZodString>;
    per_page: z.ZodOptional<z.ZodNumber>;
    page: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"get_protected_branch">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    name: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"list_protected_tags">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    per_page: z.ZodOptional<z.ZodNumber>;
    page: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>], "action">;
export type BrowseRefsInput = z.infer<typeof BrowseRefsSchema>;
