import { z } from 'zod';
export declare const ManagePipelineSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"create">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    ref: z.ZodString;
    variables: z.ZodOptional<z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        value: z.ZodString;
        variable_type: z.ZodOptional<z.ZodEnum<{
            file: "file";
            env_var: "env_var";
        }>>;
    }, z.core.$strip>>>;
    inputs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodArray<z.ZodString>]>>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"retry">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    pipeline_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"cancel">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    pipeline_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"play_job">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    job_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    job_variables_attributes: z.ZodOptional<z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        value: z.ZodString;
        variable_type: z.ZodOptional<z.ZodEnum<{
            file: "file";
            env_var: "env_var";
        }>>;
    }, z.core.$strip>>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"retry_job">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    job_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"cancel_job">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    job_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    force: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>], "action">;
export type ManagePipelineInput = z.infer<typeof ManagePipelineSchema>;
