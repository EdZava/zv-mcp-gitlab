import { z } from 'zod';
export declare const ManageDeployKeySchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"add">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    title: z.ZodString;
    key: z.ZodString;
    can_push: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    expires_at: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"enable">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    key_id: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"update">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    key_id: z.ZodCoercedNumber<unknown>;
    title: z.ZodOptional<z.ZodString>;
    can_push: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"delete">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    key_id: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>], "action">;
export type ManageDeployKeyInput = z.infer<typeof ManageDeployKeySchema>;
