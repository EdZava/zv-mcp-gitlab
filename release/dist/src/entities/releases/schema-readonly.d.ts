import { z } from 'zod';
export declare const BrowseReleasesSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"list">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    order_by: z.ZodOptional<z.ZodEnum<{
        created_at: "created_at";
        released_at: "released_at";
    }>>;
    sort: z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    include_html_description: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    per_page: z.ZodOptional<z.ZodNumber>;
    page: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"get">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    tag_name: z.ZodString;
    include_html_description: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"assets">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    tag_name: z.ZodString;
    per_page: z.ZodOptional<z.ZodNumber>;
    page: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>], "action">;
export type BrowseReleasesInput = z.infer<typeof BrowseReleasesSchema>;
