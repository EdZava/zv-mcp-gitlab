import { z } from 'zod';
export declare const ManageLabelSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"create">;
    namespace: z.ZodString;
    name: z.ZodString;
    color: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    priority: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"update">;
    namespace: z.ZodString;
    label_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    name: z.ZodOptional<z.ZodString>;
    new_name: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    priority: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"delete">;
    namespace: z.ZodString;
    label_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
}, z.core.$strip>], "action">;
export type ManageLabelInput = z.infer<typeof ManageLabelSchema>;
