import { z } from 'zod';
export declare const BrowseVariablesSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
    action: z.ZodLiteral<"list">;
    namespace: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"get">;
    namespace: z.ZodString;
    key: z.ZodString;
    filter: z.ZodOptional<z.ZodObject<{
        environment_scope: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>], "action">;
export type BrowseVariablesInput = z.infer<typeof BrowseVariablesSchema>;
