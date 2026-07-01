import { z } from 'zod';
export declare const BrowseWebhooksSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
    action: z.ZodLiteral<"list">;
    scope: z.ZodEnum<{
        project: "project";
        group: "group";
    }>;
    projectId: z.ZodOptional<z.ZodString>;
    groupId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"get">;
    scope: z.ZodEnum<{
        project: "project";
        group: "group";
    }>;
    projectId: z.ZodOptional<z.ZodString>;
    groupId: z.ZodOptional<z.ZodString>;
    hookId: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
}, z.core.$strip>], "action">;
export type BrowseWebhooksInput = z.infer<typeof BrowseWebhooksSchema>;
