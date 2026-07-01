import { z } from 'zod';
import { GitLabMilestoneSchema } from '../shared';
export { GitLabMilestoneSchema };
export declare const GitLabMilestonesSchema: z.ZodObject<{
    id: z.ZodCoercedString<unknown>;
    iid: z.ZodCoercedString<unknown>;
    project_id: z.ZodCoercedString<unknown>;
    title: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    due_date: z.ZodNullable<z.ZodString>;
    start_date: z.ZodNullable<z.ZodString>;
    state: z.ZodString;
    updated_at: z.ZodString;
    created_at: z.ZodString;
    expired: z.ZodPreprocess<z.ZodBoolean>;
    web_url: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const BrowseMilestonesSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
    action: z.ZodLiteral<"list">;
    namespace: z.ZodString;
    iids: z.ZodOptional<z.ZodArray<z.ZodString>>;
    state: z.ZodOptional<z.ZodEnum<{
        active: "active";
        closed: "closed";
    }>>;
    title: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    include_ancestors: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    updated_before: z.ZodOptional<z.ZodString>;
    updated_after: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"get">;
    namespace: z.ZodString;
    milestone_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
}, z.core.$strip>, z.ZodObject<{
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
    action: z.ZodLiteral<"issues">;
    namespace: z.ZodString;
    milestone_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
}, z.core.$strip>, z.ZodObject<{
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
    action: z.ZodLiteral<"merge_requests">;
    namespace: z.ZodString;
    milestone_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
}, z.core.$strip>, z.ZodObject<{
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
    action: z.ZodLiteral<"burndown">;
    namespace: z.ZodString;
    milestone_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
}, z.core.$strip>], "action">;
export type BrowseMilestonesInput = z.infer<typeof BrowseMilestonesSchema>;
export type GitLabMilestones = z.infer<typeof GitLabMilestonesSchema>;
