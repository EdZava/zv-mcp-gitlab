import { z } from 'zod';
export declare const BrowseEnvironmentsSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
    action: z.ZodLiteral<"list">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    name: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    states: z.ZodOptional<z.ZodEnum<{
        stopped: "stopped";
        available: "available";
        stopping: "stopping";
    }>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"get">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    environment_id: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>, z.ZodObject<{
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
    action: z.ZodLiteral<"list_deployments">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    environment: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        success: "success";
        failed: "failed";
        running: "running";
        created: "created";
        blocked: "blocked";
        canceled: "canceled";
        skipped: "skipped";
    }>>;
    order_by: z.ZodOptional<z.ZodEnum<{
        id: "id";
        created_at: "created_at";
        updated_at: "updated_at";
        iid: "iid";
        ref: "ref";
        finished_at: "finished_at";
    }>>;
    sort: z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    updated_after: z.ZodOptional<z.ZodString>;
    updated_before: z.ZodOptional<z.ZodString>;
    finished_after: z.ZodOptional<z.ZodString>;
    finished_before: z.ZodOptional<z.ZodString>;
}, z.core.$strip>], "action">;
export type BrowseEnvironmentsInput = z.infer<typeof BrowseEnvironmentsSchema>;
