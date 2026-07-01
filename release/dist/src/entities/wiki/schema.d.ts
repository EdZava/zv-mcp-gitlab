import { z } from 'zod';
export declare const ManageWikiSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"create">;
    namespace: z.ZodString;
    title: z.ZodString;
    content: z.ZodString;
    format: z.ZodOptional<z.ZodEnum<{
        markdown: "markdown";
        rdoc: "rdoc";
        asciidoc: "asciidoc";
        org: "org";
    }>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"update">;
    namespace: z.ZodString;
    slug: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    format: z.ZodOptional<z.ZodEnum<{
        markdown: "markdown";
        rdoc: "rdoc";
        asciidoc: "asciidoc";
        org: "org";
    }>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"delete">;
    namespace: z.ZodString;
    slug: z.ZodString;
}, z.core.$strip>], "action">;
export type ManageWikiInput = z.infer<typeof ManageWikiSchema>;
