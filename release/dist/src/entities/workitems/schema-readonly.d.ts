import { z } from 'zod';
export declare const WorkItemIdSchema: z.ZodString;
export declare const WorkItemTypeEnumSchema: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodEnum<{
    OBJECTIVE: "OBJECTIVE";
    KEY_RESULT: "KEY_RESULT";
    REQUIREMENT: "REQUIREMENT";
    EPIC: "EPIC";
    ISSUE: "ISSUE";
    INCIDENT: "INCIDENT";
    TEST_CASE: "TEST_CASE";
    TASK: "TASK";
}>>;
export declare const WorkItemStateSchema: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodEnum<{
    OPEN: "OPEN";
    CLOSED: "CLOSED";
}>>;
export declare const WorkItemStateEventSchema: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodEnum<{
    CLOSE: "CLOSE";
    REOPEN: "REOPEN";
}>>;
export declare const BrowseWorkItemsSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"list">;
    namespace: z.ZodString;
    types: z.ZodOptional<z.ZodArray<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodEnum<{
        OBJECTIVE: "OBJECTIVE";
        KEY_RESULT: "KEY_RESULT";
        REQUIREMENT: "REQUIREMENT";
        EPIC: "EPIC";
        ISSUE: "ISSUE";
        INCIDENT: "INCIDENT";
        TEST_CASE: "TEST_CASE";
        TASK: "TASK";
    }>>>>;
    state: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodEnum<{
        OPEN: "OPEN";
        CLOSED: "CLOSED";
    }>>>>>;
    first: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    after: z.ZodOptional<z.ZodString>;
    simple: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"get">;
    namespace: z.ZodOptional<z.ZodString>;
    iid: z.ZodOptional<z.ZodString>;
    id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>], "action">;
export type BrowseWorkItemsInput = z.infer<typeof BrowseWorkItemsSchema>;
export type WorkItemTypeEnum = z.infer<typeof WorkItemTypeEnumSchema>;
export type WorkItemState = z.infer<typeof WorkItemStateSchema>;
