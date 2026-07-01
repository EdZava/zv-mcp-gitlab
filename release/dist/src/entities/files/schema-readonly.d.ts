import { z } from 'zod';
export declare const GitLabFileContentSchema: z.ZodObject<{
    file_name: z.ZodString;
    file_path: z.ZodString;
    size: z.ZodNumber;
    encoding: z.ZodString;
    content_sha256: z.ZodOptional<z.ZodString>;
    ref: z.ZodOptional<z.ZodString>;
    blob_id: z.ZodString;
    commit_id: z.ZodString;
    last_commit_id: z.ZodString;
    content: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const GitLabDirectoryContentSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    type: z.ZodEnum<{
        tree: "tree";
        blob: "blob";
    }>;
    path: z.ZodString;
    mode: z.ZodString;
}, z.core.$strip>;
export declare const GitLabContentSchema: z.ZodUnion<readonly [z.ZodObject<{
    file_name: z.ZodString;
    file_path: z.ZodString;
    size: z.ZodNumber;
    encoding: z.ZodString;
    content_sha256: z.ZodOptional<z.ZodString>;
    ref: z.ZodOptional<z.ZodString>;
    blob_id: z.ZodString;
    commit_id: z.ZodString;
    last_commit_id: z.ZodString;
    content: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    type: z.ZodEnum<{
        tree: "tree";
        blob: "blob";
    }>;
    path: z.ZodString;
    mode: z.ZodString;
}, z.core.$strip>]>;
export declare const GitLabCreateUpdateFileResponseSchema: z.ZodObject<{
    file_path: z.ZodString;
    branch: z.ZodString;
}, z.core.$strip>;
export declare const GitLabTreeSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    type: z.ZodEnum<{
        tree: "tree";
        blob: "blob";
    }>;
    path: z.ZodString;
    mode: z.ZodString;
}, z.core.$strip>;
export declare const BrowseFilesSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
    action: z.ZodLiteral<"tree">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    ref: z.ZodOptional<z.ZodString>;
    path: z.ZodOptional<z.ZodString>;
    recursive: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"content">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    ref: z.ZodOptional<z.ZodString>;
    file_path: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"download_attachment">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    secret: z.ZodString;
    filename: z.ZodString;
}, z.core.$strip>], "action">;
export type GitLabFileContent = z.infer<typeof GitLabFileContentSchema>;
export type GitLabDirectoryContent = z.infer<typeof GitLabDirectoryContentSchema>;
export type GitLabContent = z.infer<typeof GitLabContentSchema>;
export type GitLabCreateUpdateFileResponse = z.infer<typeof GitLabCreateUpdateFileResponseSchema>;
export type GitLabTree = z.infer<typeof GitLabTreeSchema>;
export type BrowseFilesInput = z.infer<typeof BrowseFilesSchema>;
