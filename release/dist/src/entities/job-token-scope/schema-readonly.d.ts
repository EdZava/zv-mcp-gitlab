import { z } from 'zod';
export declare const BrowseJobTokenScopeSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"get">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
}, z.core.$strip>, z.ZodObject<{
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
    action: z.ZodLiteral<"list_projects">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
}, z.core.$strip>, z.ZodObject<{
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
    action: z.ZodLiteral<"list_groups">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
}, z.core.$strip>], "action">;
export type BrowseJobTokenScopeInput = z.infer<typeof BrowseJobTokenScopeSchema>;
