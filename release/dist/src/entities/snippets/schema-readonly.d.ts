import { z } from 'zod';
export declare const BrowseSnippetsSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
    action: z.ZodLiteral<"list">;
    scope: z.ZodEnum<{
        project: "project";
        public: "public";
        personal: "personal";
    }>;
    projectId: z.ZodOptional<z.ZodString>;
    visibility: z.ZodOptional<z.ZodEnum<{
        public: "public";
        internal: "internal";
        private: "private";
    }>>;
    created_after: z.ZodOptional<z.ZodString>;
    created_before: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"get">;
    id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    projectId: z.ZodOptional<z.ZodString>;
    raw: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>], "action">;
export type BrowseSnippetsInput = z.infer<typeof BrowseSnippetsSchema>;
