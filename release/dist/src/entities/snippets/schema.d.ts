import { z } from 'zod';
declare const SnippetFileSchema: z.ZodObject<{
    file_path: z.ZodString;
    content: z.ZodOptional<z.ZodString>;
    action: z.ZodOptional<z.ZodEnum<{
        create: "create";
        update: "update";
        delete: "delete";
        move: "move";
    }>>;
    previous_path: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const ManageSnippetSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"create">;
    projectId: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    visibility: z.ZodDefault<z.ZodOptional<z.ZodPreprocess<z.ZodEnum<{
        public: "public";
        internal: "internal";
        private: "private";
    }>>>>;
    files: z.ZodArray<z.ZodObject<{
        file_path: z.ZodString;
        content: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"update">;
    id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    projectId: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    visibility: z.ZodOptional<z.ZodPreprocess<z.ZodEnum<{
        public: "public";
        internal: "internal";
        private: "private";
    }>>>;
    files: z.ZodOptional<z.ZodArray<z.ZodObject<{
        file_path: z.ZodString;
        content: z.ZodOptional<z.ZodString>;
        action: z.ZodOptional<z.ZodEnum<{
            create: "create";
            update: "update";
            delete: "delete";
            move: "move";
        }>>;
        previous_path: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"delete">;
    id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    projectId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>], "action">;
export type ManageSnippetInput = z.infer<typeof ManageSnippetSchema>;
export type SnippetFile = z.infer<typeof SnippetFileSchema>;
export {};
