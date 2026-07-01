import { z } from 'zod';
export declare const BrowseIterationsSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
    action: z.ZodLiteral<"list">;
    group_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    state: z.ZodOptional<z.ZodEnum<{
        all: "all";
        closed: "closed";
        opened: "opened";
        upcoming: "upcoming";
        current: "current";
    }>>;
    search: z.ZodOptional<z.ZodString>;
    include_ancestors: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"get">;
    group_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    iteration_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
}, z.core.$strip>], "action">;
export type BrowseIterationsInput = z.infer<typeof BrowseIterationsSchema>;
