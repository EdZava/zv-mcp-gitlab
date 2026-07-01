import { z } from 'zod';
export declare const ManageEnvironmentSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"create">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    name: z.ZodString;
    external_url: z.ZodOptional<z.ZodString>;
    tier: z.ZodOptional<z.ZodEnum<{
        other: "other";
        production: "production";
        staging: "staging";
        testing: "testing";
        development: "development";
    }>>;
    description: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"update">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    environment_id: z.ZodCoercedNumber<unknown>;
    external_url: z.ZodOptional<z.ZodString>;
    tier: z.ZodOptional<z.ZodEnum<{
        other: "other";
        production: "production";
        staging: "staging";
        testing: "testing";
        development: "development";
    }>>;
    description: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"stop">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    environment_id: z.ZodCoercedNumber<unknown>;
    force: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"delete">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    environment_id: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"update_deployment_status">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    deployment_id: z.ZodCoercedNumber<unknown>;
    status: z.ZodEnum<{
        success: "success";
        failed: "failed";
        running: "running";
        canceled: "canceled";
    }>;
}, z.core.$strip>], "action">;
export type ManageEnvironmentInput = z.infer<typeof ManageEnvironmentSchema>;
