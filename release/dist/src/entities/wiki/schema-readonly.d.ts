import { z } from 'zod';
export declare const BrowseWikiSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
    action: z.ZodLiteral<"list">;
    namespace: z.ZodString;
    with_content: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"get">;
    namespace: z.ZodString;
    slug: z.ZodString;
}, z.core.$strip>], "action">;
export declare const GitLabWikiPageSchema: z.ZodObject<{
    title: z.ZodString;
    slug: z.ZodString;
    format: z.ZodString;
    content: z.ZodOptional<z.ZodString>;
    created_at: z.ZodOptional<z.ZodString>;
    updated_at: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type BrowseWikiInput = z.infer<typeof BrowseWikiSchema>;
export type GitLabWikiPage = z.infer<typeof GitLabWikiPageSchema>;
