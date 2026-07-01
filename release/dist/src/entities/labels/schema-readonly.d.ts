import { z } from 'zod';
export declare const BrowseLabelsSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
    action: z.ZodLiteral<"list">;
    namespace: z.ZodString;
    search: z.ZodOptional<z.ZodString>;
    with_counts: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    include_ancestor_groups: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"get">;
    namespace: z.ZodString;
    label_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    include_ancestor_groups: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
}, z.core.$strip>], "action">;
export type BrowseLabelsInput = z.infer<typeof BrowseLabelsSchema>;
