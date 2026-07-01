import { z } from 'zod';
export declare const ManageWorkItemSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"create">;
    namespace: z.ZodString;
    workItemType: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodEnum<{
        OBJECTIVE: "OBJECTIVE";
        KEY_RESULT: "KEY_RESULT";
        REQUIREMENT: "REQUIREMENT";
        EPIC: "EPIC";
        ISSUE: "ISSUE";
        INCIDENT: "INCIDENT";
        TEST_CASE: "TEST_CASE";
        TASK: "TASK";
    }>>;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    assigneeIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    labelIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    milestoneId: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodString>;
    parentId: z.ZodOptional<z.ZodString>;
    childrenIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    timeEstimate: z.ZodOptional<z.ZodString>;
    isFixed: z.ZodOptional<z.ZodBoolean>;
    weight: z.ZodOptional<z.ZodNumber>;
    iterationId: z.ZodOptional<z.ZodString>;
    progressCurrentValue: z.ZodOptional<z.ZodNumber>;
    healthStatus: z.ZodOptional<z.ZodEnum<{
        onTrack: "onTrack";
        needsAttention: "needsAttention";
        atRisk: "atRisk";
    }>>;
    color: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"update">;
    id: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    assigneeIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    labelIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    addLabelIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    removeLabelIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    milestoneId: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodEnum<{
        CLOSE: "CLOSE";
        REOPEN: "REOPEN";
    }>>>;
    linkType: z.ZodOptional<z.ZodEnum<{
        BLOCKED_BY: "BLOCKED_BY";
        BLOCKS: "BLOCKS";
        RELATED: "RELATED";
    }>>;
    targetId: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    dueDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    parentId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    childrenIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    timeEstimate: z.ZodOptional<z.ZodString>;
    timeSpent: z.ZodOptional<z.ZodString>;
    timeSpentAt: z.ZodOptional<z.ZodString>;
    timeSpentSummary: z.ZodOptional<z.ZodString>;
    isFixed: z.ZodOptional<z.ZodBoolean>;
    weight: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    iterationId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    progressCurrentValue: z.ZodOptional<z.ZodNumber>;
    healthStatus: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
        onTrack: "onTrack";
        needsAttention: "needsAttention";
        atRisk: "atRisk";
    }>>>;
    color: z.ZodOptional<z.ZodString>;
    verificationStatus: z.ZodOptional<z.ZodEnum<{
        PASSED: "PASSED";
        FAILED: "FAILED";
    }>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"delete">;
    id: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"delete_timelog">;
    timelogId: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"add_link">;
    id: z.ZodString;
    targetId: z.ZodString;
    linkType: z.ZodEnum<{
        BLOCKED_BY: "BLOCKED_BY";
        BLOCKS: "BLOCKS";
        RELATED: "RELATED";
    }>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"remove_link">;
    id: z.ZodString;
    targetId: z.ZodString;
}, z.core.$strip>], "action">;
export type ManageWorkItemInput = z.infer<typeof ManageWorkItemSchema>;
