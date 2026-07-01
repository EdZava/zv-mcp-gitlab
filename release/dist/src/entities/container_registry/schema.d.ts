import { z } from 'zod';
export declare const ManageRegistrySchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"delete_repository">;
    repository_id: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"delete_tag">;
    repository_id: z.ZodCoercedNumber<unknown>;
    tag_name: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"delete_tags_bulk">;
    repository_id: z.ZodCoercedNumber<unknown>;
    name_regex_delete: z.ZodString;
    name_regex_keep: z.ZodOptional<z.ZodString>;
    keep_n: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    older_than: z.ZodOptional<z.ZodString>;
}, z.core.$strip>], "action">;
export type ManageRegistryInput = z.infer<typeof ManageRegistrySchema>;
