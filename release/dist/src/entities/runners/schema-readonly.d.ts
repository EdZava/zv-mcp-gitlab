import { z } from 'zod';
export declare const BrowseRunnersSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodOptional<z.ZodEnum<{
        INSTANCE_TYPE: "INSTANCE_TYPE";
        GROUP_TYPE: "GROUP_TYPE";
        PROJECT_TYPE: "PROJECT_TYPE";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        ONLINE: "ONLINE";
        OFFLINE: "OFFLINE";
        STALE: "STALE";
        NEVER_CONTACTED: "NEVER_CONTACTED";
    }>>;
    paused: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    tag_list: z.ZodOptional<z.ZodArray<z.ZodString>>;
    search: z.ZodOptional<z.ZodString>;
    first: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    after: z.ZodOptional<z.ZodString>;
    action: z.ZodLiteral<"list_all">;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodOptional<z.ZodEnum<{
        INSTANCE_TYPE: "INSTANCE_TYPE";
        GROUP_TYPE: "GROUP_TYPE";
        PROJECT_TYPE: "PROJECT_TYPE";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        ONLINE: "ONLINE";
        OFFLINE: "OFFLINE";
        STALE: "STALE";
        NEVER_CONTACTED: "NEVER_CONTACTED";
    }>>;
    paused: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    tag_list: z.ZodOptional<z.ZodArray<z.ZodString>>;
    search: z.ZodOptional<z.ZodString>;
    first: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    after: z.ZodOptional<z.ZodString>;
    action: z.ZodLiteral<"list_owned">;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodOptional<z.ZodEnum<{
        INSTANCE_TYPE: "INSTANCE_TYPE";
        GROUP_TYPE: "GROUP_TYPE";
        PROJECT_TYPE: "PROJECT_TYPE";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        ONLINE: "ONLINE";
        OFFLINE: "OFFLINE";
        STALE: "STALE";
        NEVER_CONTACTED: "NEVER_CONTACTED";
    }>>;
    paused: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    tag_list: z.ZodOptional<z.ZodArray<z.ZodString>>;
    search: z.ZodOptional<z.ZodString>;
    first: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    after: z.ZodOptional<z.ZodString>;
    action: z.ZodLiteral<"list_project">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodOptional<z.ZodEnum<{
        INSTANCE_TYPE: "INSTANCE_TYPE";
        GROUP_TYPE: "GROUP_TYPE";
        PROJECT_TYPE: "PROJECT_TYPE";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        ONLINE: "ONLINE";
        OFFLINE: "OFFLINE";
        STALE: "STALE";
        NEVER_CONTACTED: "NEVER_CONTACTED";
    }>>;
    paused: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    tag_list: z.ZodOptional<z.ZodArray<z.ZodString>>;
    search: z.ZodOptional<z.ZodString>;
    first: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    after: z.ZodOptional<z.ZodString>;
    action: z.ZodLiteral<"list_group">;
    group_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"get">;
    runner_id: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"list_jobs">;
    runner_id: z.ZodCoercedNumber<unknown>;
    statuses: z.ZodOptional<z.ZodArray<z.ZodEnum<{
        FAILED: "FAILED";
        CREATED: "CREATED";
        PENDING: "PENDING";
        RUNNING: "RUNNING";
        SUCCESS: "SUCCESS";
        CANCELED: "CANCELED";
        SKIPPED: "SKIPPED";
        MANUAL: "MANUAL";
        SCHEDULED: "SCHEDULED";
        WAITING_FOR_RESOURCE: "WAITING_FOR_RESOURCE";
        PREPARING: "PREPARING";
        CANCELING: "CANCELING";
    }>>>;
    first: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    after: z.ZodOptional<z.ZodString>;
}, z.core.$strip>], "action">;
export type BrowseRunnersInput = z.infer<typeof BrowseRunnersSchema>;
