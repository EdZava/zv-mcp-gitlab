import { z } from 'zod';
export declare const projectIdField: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
export declare const keyIdField: z.ZodCoercedNumber<unknown>;
export declare const BrowseDeployKeysSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
    action: z.ZodLiteral<"list">;
    project_id: z.ZodOptional<z.ZodPreprocess<z.ZodCoercedString<unknown>>>;
    public: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"get">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    key_id: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>], "action">;
export type BrowseDeployKeysInput = z.infer<typeof BrowseDeployKeysSchema>;
