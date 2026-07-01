import { z } from 'zod';
export declare const ManageAccessTokenSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"create_project">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    name: z.ZodString;
    scopes: z.ZodArray<z.ZodString>;
    access_level: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<10>, z.ZodLiteral<20>, z.ZodLiteral<30>, z.ZodLiteral<40>, z.ZodLiteral<50>]>>;
    expires_at: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"create_group">;
    group_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    name: z.ZodString;
    scopes: z.ZodArray<z.ZodString>;
    access_level: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<10>, z.ZodLiteral<20>, z.ZodLiteral<30>, z.ZodLiteral<40>, z.ZodLiteral<50>]>>;
    expires_at: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"rotate">;
    token_id: z.ZodCoercedNumber<unknown>;
    project_id: z.ZodOptional<z.ZodPreprocess<z.ZodCoercedString<unknown>>>;
    group_id: z.ZodOptional<z.ZodPreprocess<z.ZodCoercedString<unknown>>>;
    expires_at: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"revoke">;
    token_id: z.ZodCoercedNumber<unknown>;
    project_id: z.ZodOptional<z.ZodPreprocess<z.ZodCoercedString<unknown>>>;
    group_id: z.ZodOptional<z.ZodPreprocess<z.ZodCoercedString<unknown>>>;
}, z.core.$strip>], "action">;
export type ManageAccessTokenInput = z.infer<typeof ManageAccessTokenSchema>;
