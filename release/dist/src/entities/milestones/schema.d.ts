import { z } from 'zod';
export declare const ManageMilestoneSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"create">;
    namespace: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    due_date: z.ZodOptional<z.ZodString>;
    start_date: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"update">;
    namespace: z.ZodString;
    milestone_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    due_date: z.ZodOptional<z.ZodString>;
    start_date: z.ZodOptional<z.ZodString>;
    state_event: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodEnum<{
        close: "close";
        activate: "activate";
    }>>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"delete">;
    namespace: z.ZodString;
    milestone_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"promote">;
    namespace: z.ZodString;
    milestone_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
}, z.core.$strip>], "action">;
export type ManageMilestoneInput = z.infer<typeof ManageMilestoneSchema>;
