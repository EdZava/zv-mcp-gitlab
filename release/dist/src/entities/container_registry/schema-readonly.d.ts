import { z } from 'zod';
export declare const BrowseRegistrySchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"list_repositories">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    name: z.ZodOptional<z.ZodString>;
    first: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    after: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"get_repository">;
    repository_id: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"list_tags">;
    repository_id: z.ZodCoercedNumber<unknown>;
    name: z.ZodOptional<z.ZodString>;
    first: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    after: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"get_tag">;
    repository_id: z.ZodCoercedNumber<unknown>;
    tag_name: z.ZodString;
}, z.core.$strip>], "action">;
export type BrowseRegistryInput = z.infer<typeof BrowseRegistrySchema>;
