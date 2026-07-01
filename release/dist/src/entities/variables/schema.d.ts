import { z } from 'zod';
export declare const ManageVariableSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"create">;
    namespace: z.ZodString;
    key: z.ZodString;
    value: z.ZodString;
    variable_type: z.ZodOptional<z.ZodPreprocess<z.ZodEnum<{
        file: "file";
        env_var: "env_var";
    }>>>;
    environment_scope: z.ZodOptional<z.ZodString>;
    protected: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    masked: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    raw: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    description: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"update">;
    namespace: z.ZodString;
    key: z.ZodString;
    value: z.ZodOptional<z.ZodString>;
    variable_type: z.ZodOptional<z.ZodPreprocess<z.ZodEnum<{
        file: "file";
        env_var: "env_var";
    }>>>;
    environment_scope: z.ZodOptional<z.ZodString>;
    protected: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    masked: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    raw: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    description: z.ZodOptional<z.ZodString>;
    filter: z.ZodOptional<z.ZodObject<{
        environment_scope: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"delete">;
    namespace: z.ZodString;
    key: z.ZodString;
    filter: z.ZodOptional<z.ZodObject<{
        environment_scope: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>], "action">;
export type ManageVariableInput = z.infer<typeof ManageVariableSchema>;
