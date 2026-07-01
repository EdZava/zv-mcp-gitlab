import { z } from 'zod';
export declare const projectIdField: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
export declare const groupIdField: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
export declare const tokenIdField: z.ZodCoercedNumber<unknown>;
export declare const BrowseAccessTokensSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
    action: z.ZodLiteral<"list_personal">;
    user_id: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    revoked: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    state: z.ZodOptional<z.ZodEnum<{
        active: "active";
        inactive: "inactive";
    }>>;
    search: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
    action: z.ZodLiteral<"list_project">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    state: z.ZodOptional<z.ZodEnum<{
        active: "active";
        inactive: "inactive";
    }>>;
}, z.core.$strip>, z.ZodObject<{
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
    action: z.ZodLiteral<"list_group">;
    group_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    state: z.ZodOptional<z.ZodEnum<{
        active: "active";
        inactive: "inactive";
    }>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"get">;
    token_id: z.ZodCoercedNumber<unknown>;
    project_id: z.ZodOptional<z.ZodPreprocess<z.ZodCoercedString<unknown>>>;
    group_id: z.ZodOptional<z.ZodPreprocess<z.ZodCoercedString<unknown>>>;
}, z.core.$strip>], "action">;
export type BrowseAccessTokensInput = z.infer<typeof BrowseAccessTokensSchema>;
