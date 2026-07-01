import { z } from 'zod';
export declare const ManageFilesSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"single">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    file_path: z.ZodString;
    content: z.ZodString;
    commit_message: z.ZodString;
    branch: z.ZodString;
    overwrite: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    start_branch: z.ZodOptional<z.ZodString>;
    encoding: z.ZodOptional<z.ZodEnum<{
        base64: "base64";
        text: "text";
    }>>;
    author_email: z.ZodOptional<z.ZodString>;
    author_name: z.ZodOptional<z.ZodString>;
    last_commit_id: z.ZodOptional<z.ZodString>;
    execute_filemode: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"batch">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    branch: z.ZodString;
    commit_message: z.ZodString;
    files: z.ZodArray<z.ZodObject<{
        file_path: z.ZodString;
        content: z.ZodString;
        encoding: z.ZodOptional<z.ZodEnum<{
            base64: "base64";
            text: "text";
        }>>;
        execute_filemode: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    }, z.core.$strip>>;
    overwrite: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    start_branch: z.ZodOptional<z.ZodString>;
    author_email: z.ZodOptional<z.ZodString>;
    author_name: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"upload">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    file: z.ZodString;
    filename: z.ZodString;
}, z.core.$strip>], "action">;
export type ManageFilesInput = z.infer<typeof ManageFilesSchema>;
