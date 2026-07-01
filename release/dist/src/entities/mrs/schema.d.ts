import { z } from 'zod';
export declare const MergeRequestThreadPositionSchema: z.ZodObject<{
    base_sha: z.ZodOptional<z.ZodString>;
    start_sha: z.ZodOptional<z.ZodString>;
    head_sha: z.ZodOptional<z.ZodString>;
    position_type: z.ZodOptional<z.ZodEnum<{
        text: "text";
        image: "image";
    }>>;
    old_path: z.ZodOptional<z.ZodString>;
    new_path: z.ZodOptional<z.ZodString>;
    old_line: z.ZodOptional<z.ZodNumber>;
    new_line: z.ZodOptional<z.ZodNumber>;
    line_range: z.ZodOptional<z.ZodObject<{
        start: z.ZodObject<{
            line_code: z.ZodString;
            type: z.ZodOptional<z.ZodEnum<{
                new: "new";
                old: "old";
            }>>;
            old_line: z.ZodOptional<z.ZodNumber>;
            new_line: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
        end: z.ZodObject<{
            line_code: z.ZodString;
            type: z.ZodOptional<z.ZodEnum<{
                new: "new";
                old: "old";
            }>>;
            old_line: z.ZodOptional<z.ZodNumber>;
            new_line: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
    }, z.core.$strip>>;
    width: z.ZodOptional<z.ZodNumber>;
    height: z.ZodOptional<z.ZodNumber>;
    x: z.ZodOptional<z.ZodNumber>;
    y: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const ManageMergeRequestSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"create">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    source_branch: z.ZodString;
    target_branch: z.ZodString;
    title: z.ZodString;
    assignee_id: z.ZodOptional<z.ZodString>;
    assignee_ids: z.ZodOptional<z.ZodArray<z.ZodString>>;
    reviewer_ids: z.ZodOptional<z.ZodArray<z.ZodString>>;
    description: z.ZodOptional<z.ZodString>;
    target_project_id: z.ZodOptional<z.ZodCoercedString<unknown>>;
    labels: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodString>]>>;
    milestone_id: z.ZodOptional<z.ZodString>;
    remove_source_branch: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    allow_collaboration: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    allow_maintainer_to_push: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    squash: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"update">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    merge_request_iid: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    target_branch: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    assignee_id: z.ZodOptional<z.ZodString>;
    assignee_ids: z.ZodOptional<z.ZodArray<z.ZodString>>;
    reviewer_ids: z.ZodOptional<z.ZodArray<z.ZodString>>;
    description: z.ZodOptional<z.ZodString>;
    labels: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodString>]>>;
    add_labels: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodString>]>>;
    remove_labels: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodString>]>>;
    milestone_id: z.ZodOptional<z.ZodString>;
    remove_source_branch: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    allow_collaboration: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    allow_maintainer_to_push: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    squash: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    state_event: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodEnum<{
        close: "close";
        reopen: "reopen";
    }>>>;
    discussion_locked: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"merge">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    merge_request_iid: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    merge_commit_message: z.ZodOptional<z.ZodString>;
    squash_commit_message: z.ZodOptional<z.ZodString>;
    squash: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    should_remove_source_branch: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    merge_when_pipeline_succeeds: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    sha: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"approve">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    merge_request_iid: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    sha: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"unapprove">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    merge_request_iid: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"get_approval_state">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    merge_request_iid: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
}, z.core.$strip>], "action">;
export declare const ManageMrDiscussionSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"comment">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    noteable_type: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodEnum<{
        merge_request: "merge_request";
        issue: "issue";
    }>>;
    noteable_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    body: z.ZodString;
    confidential: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    created_at: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"thread">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    merge_request_iid: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    body: z.ZodString;
    position: z.ZodOptional<z.ZodObject<{
        base_sha: z.ZodOptional<z.ZodString>;
        start_sha: z.ZodOptional<z.ZodString>;
        head_sha: z.ZodOptional<z.ZodString>;
        position_type: z.ZodOptional<z.ZodEnum<{
            text: "text";
            image: "image";
        }>>;
        old_path: z.ZodOptional<z.ZodString>;
        new_path: z.ZodOptional<z.ZodString>;
        old_line: z.ZodOptional<z.ZodNumber>;
        new_line: z.ZodOptional<z.ZodNumber>;
        line_range: z.ZodOptional<z.ZodObject<{
            start: z.ZodObject<{
                line_code: z.ZodString;
                type: z.ZodOptional<z.ZodEnum<{
                    new: "new";
                    old: "old";
                }>>;
                old_line: z.ZodOptional<z.ZodNumber>;
                new_line: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
            end: z.ZodObject<{
                line_code: z.ZodString;
                type: z.ZodOptional<z.ZodEnum<{
                    new: "new";
                    old: "old";
                }>>;
                old_line: z.ZodOptional<z.ZodNumber>;
                new_line: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
        }, z.core.$strip>>;
        width: z.ZodOptional<z.ZodNumber>;
        height: z.ZodOptional<z.ZodNumber>;
        x: z.ZodOptional<z.ZodNumber>;
        y: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    commit_id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"reply">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    merge_request_iid: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    discussion_id: z.ZodString;
    body: z.ZodString;
    created_at: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"update">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    merge_request_iid: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    note_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    body: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"apply_suggestion">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    merge_request_iid: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    suggestion_id: z.ZodNumber;
    commit_message: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"apply_suggestions">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    merge_request_iid: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    suggestion_ids: z.ZodArray<z.ZodNumber>;
    commit_message: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"resolve">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    merge_request_iid: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    discussion_id: z.ZodString;
    resolved: z.ZodPreprocess<z.ZodBoolean>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"suggest">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    merge_request_iid: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    position: z.ZodObject<{
        base_sha: z.ZodOptional<z.ZodString>;
        start_sha: z.ZodOptional<z.ZodString>;
        head_sha: z.ZodOptional<z.ZodString>;
        position_type: z.ZodOptional<z.ZodEnum<{
            text: "text";
            image: "image";
        }>>;
        old_path: z.ZodOptional<z.ZodString>;
        new_path: z.ZodOptional<z.ZodString>;
        old_line: z.ZodOptional<z.ZodNumber>;
        new_line: z.ZodOptional<z.ZodNumber>;
        line_range: z.ZodOptional<z.ZodObject<{
            start: z.ZodObject<{
                line_code: z.ZodString;
                type: z.ZodOptional<z.ZodEnum<{
                    new: "new";
                    old: "old";
                }>>;
                old_line: z.ZodOptional<z.ZodNumber>;
                new_line: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
            end: z.ZodObject<{
                line_code: z.ZodString;
                type: z.ZodOptional<z.ZodEnum<{
                    new: "new";
                    old: "old";
                }>>;
                old_line: z.ZodOptional<z.ZodNumber>;
                new_line: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
        }, z.core.$strip>>;
        width: z.ZodOptional<z.ZodNumber>;
        height: z.ZodOptional<z.ZodNumber>;
        x: z.ZodOptional<z.ZodNumber>;
        y: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
    suggestion: z.ZodString;
    comment: z.ZodOptional<z.ZodString>;
    lines_above: z.ZodDefault<z.ZodNumber>;
    lines_below: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>], "action">;
export declare const ManageDraftNotesSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"create">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    merge_request_iid: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    note: z.ZodString;
    position: z.ZodOptional<z.ZodObject<{
        base_sha: z.ZodOptional<z.ZodString>;
        start_sha: z.ZodOptional<z.ZodString>;
        head_sha: z.ZodOptional<z.ZodString>;
        position_type: z.ZodOptional<z.ZodEnum<{
            text: "text";
            image: "image";
        }>>;
        old_path: z.ZodOptional<z.ZodString>;
        new_path: z.ZodOptional<z.ZodString>;
        old_line: z.ZodOptional<z.ZodNumber>;
        new_line: z.ZodOptional<z.ZodNumber>;
        line_range: z.ZodOptional<z.ZodObject<{
            start: z.ZodObject<{
                line_code: z.ZodString;
                type: z.ZodOptional<z.ZodEnum<{
                    new: "new";
                    old: "old";
                }>>;
                old_line: z.ZodOptional<z.ZodNumber>;
                new_line: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
            end: z.ZodObject<{
                line_code: z.ZodString;
                type: z.ZodOptional<z.ZodEnum<{
                    new: "new";
                    old: "old";
                }>>;
                old_line: z.ZodOptional<z.ZodNumber>;
                new_line: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
        }, z.core.$strip>>;
        width: z.ZodOptional<z.ZodNumber>;
        height: z.ZodOptional<z.ZodNumber>;
        x: z.ZodOptional<z.ZodNumber>;
        y: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    in_reply_to_discussion_id: z.ZodOptional<z.ZodString>;
    commit_id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"update">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    merge_request_iid: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    draft_note_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    note: z.ZodString;
    position: z.ZodOptional<z.ZodObject<{
        base_sha: z.ZodOptional<z.ZodString>;
        start_sha: z.ZodOptional<z.ZodString>;
        head_sha: z.ZodOptional<z.ZodString>;
        position_type: z.ZodOptional<z.ZodEnum<{
            text: "text";
            image: "image";
        }>>;
        old_path: z.ZodOptional<z.ZodString>;
        new_path: z.ZodOptional<z.ZodString>;
        old_line: z.ZodOptional<z.ZodNumber>;
        new_line: z.ZodOptional<z.ZodNumber>;
        line_range: z.ZodOptional<z.ZodObject<{
            start: z.ZodObject<{
                line_code: z.ZodString;
                type: z.ZodOptional<z.ZodEnum<{
                    new: "new";
                    old: "old";
                }>>;
                old_line: z.ZodOptional<z.ZodNumber>;
                new_line: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
            end: z.ZodObject<{
                line_code: z.ZodString;
                type: z.ZodOptional<z.ZodEnum<{
                    new: "new";
                    old: "old";
                }>>;
                old_line: z.ZodOptional<z.ZodNumber>;
                new_line: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
        }, z.core.$strip>>;
        width: z.ZodOptional<z.ZodNumber>;
        height: z.ZodOptional<z.ZodNumber>;
        x: z.ZodOptional<z.ZodNumber>;
        y: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"publish">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    merge_request_iid: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    draft_note_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"publish_all">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    merge_request_iid: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"delete">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    merge_request_iid: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    draft_note_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
}, z.core.$strip>], "action">;
export type ManageMergeRequestInput = z.infer<typeof ManageMergeRequestSchema>;
export type ManageMrDiscussionInput = z.infer<typeof ManageMrDiscussionSchema>;
export type ManageDraftNotesInput = z.infer<typeof ManageDraftNotesSchema>;
export type MergeRequestThreadPosition = z.infer<typeof MergeRequestThreadPositionSchema>;
