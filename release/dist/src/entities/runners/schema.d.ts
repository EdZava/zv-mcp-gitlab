import { z } from 'zod';
export declare const ManageRunnerSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    description: z.ZodOptional<z.ZodString>;
    paused: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    locked: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    run_untagged: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    tag_list: z.ZodOptional<z.ZodArray<z.ZodString>>;
    access_level: z.ZodOptional<z.ZodEnum<{
        NOT_PROTECTED: "NOT_PROTECTED";
        REF_PROTECTED: "REF_PROTECTED";
    }>>;
    maximum_timeout: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    maintenance_note: z.ZodOptional<z.ZodString>;
    action: z.ZodLiteral<"create_authentication_token">;
    runner_type: z.ZodEnum<{
        INSTANCE_TYPE: "INSTANCE_TYPE";
        GROUP_TYPE: "GROUP_TYPE";
        PROJECT_TYPE: "PROJECT_TYPE";
    }>;
    group_id: z.ZodOptional<z.ZodPreprocess<z.ZodCoercedString<unknown>>>;
    project_id: z.ZodOptional<z.ZodPreprocess<z.ZodCoercedString<unknown>>>;
}, z.core.$strip>, z.ZodObject<{
    description: z.ZodOptional<z.ZodString>;
    paused: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    locked: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    run_untagged: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    tag_list: z.ZodOptional<z.ZodArray<z.ZodString>>;
    access_level: z.ZodOptional<z.ZodEnum<{
        NOT_PROTECTED: "NOT_PROTECTED";
        REF_PROTECTED: "REF_PROTECTED";
    }>>;
    maximum_timeout: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    maintenance_note: z.ZodOptional<z.ZodString>;
    action: z.ZodLiteral<"update">;
    runner_id: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"pause">;
    runner_id: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"resume">;
    runner_id: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"delete">;
    runner_id: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"reset_authentication_token">;
    runner_id: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>], "action">;
export type ManageRunnerInput = z.infer<typeof ManageRunnerSchema>;
