"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManageDraftNotesSchema = exports.ManageMrDiscussionSchema = exports.ManageMergeRequestSchema = exports.MergeRequestThreadPositionSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
exports.MergeRequestThreadPositionSchema = zod_1.z.object({
    base_sha: zod_1.z.string().optional().describe('Base commit SHA for three-way diff.'),
    start_sha: zod_1.z.string().optional().describe('Starting commit SHA in target branch.'),
    head_sha: zod_1.z.string().optional().describe('Latest commit SHA in MR source branch.'),
    position_type: zod_1.z.enum(['text', 'image']).optional().describe('Comment type: text or image.'),
    old_path: zod_1.z.string().optional().describe('Original file path before changes.'),
    new_path: zod_1.z.string().optional().describe('Current file path after changes.'),
    old_line: zod_1.z.number().optional().describe('Line number in original file.'),
    new_line: zod_1.z.number().optional().describe('Line number in changed file.'),
    line_range: zod_1.z
        .object({
        start: zod_1.z.object({
            line_code: zod_1.z.string(),
            type: zod_1.z.enum(['new', 'old']).optional(),
            old_line: zod_1.z.number().optional(),
            new_line: zod_1.z.number().optional(),
        }),
        end: zod_1.z.object({
            line_code: zod_1.z.string(),
            type: zod_1.z.enum(['new', 'old']).optional(),
            old_line: zod_1.z.number().optional(),
            new_line: zod_1.z.number().optional(),
        }),
    })
        .optional()
        .describe('Line range for multi-line comments.'),
    width: zod_1.z.number().optional().describe('Image width in pixels.'),
    height: zod_1.z.number().optional().describe('Image height in pixels.'),
    x: zod_1.z.number().optional().describe('Horizontal pixel position for image comment.'),
    y: zod_1.z.number().optional().describe('Vertical pixel position for image comment.'),
});
const projectIdField = utils_1.requiredId.describe('Project ID or URL-encoded path');
const mergeRequestIidField = utils_1.requiredId.describe('Internal MR ID unique to project');
const CreateMergeRequestSchema = zod_1.z.object({
    action: zod_1.z.literal('create').describe('Create a new merge request'),
    project_id: projectIdField,
    source_branch: zod_1.z.string().describe('Branch containing changes to merge'),
    target_branch: zod_1.z.string().describe('Branch to merge into'),
    title: zod_1.z.string().describe('MR title/summary'),
    assignee_id: zod_1.z.string().optional().describe('Single assignee user ID'),
    assignee_ids: zod_1.z.array(zod_1.z.string()).optional().describe('Multiple assignee IDs'),
    reviewer_ids: zod_1.z.array(zod_1.z.string()).optional().describe('User IDs for code reviewers'),
    description: zod_1.z.string().optional().describe('MR description (Markdown)'),
    target_project_id: zod_1.z.coerce.string().optional().describe('Target project for cross-project MRs'),
    labels: zod_1.z
        .union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())])
        .optional()
        .describe('Labels to categorize MR'),
    milestone_id: zod_1.z.string().optional().describe('Associate MR with milestone'),
    remove_source_branch: utils_1.flexibleBoolean
        .optional()
        .describe('Auto-delete source branch after merge'),
    allow_collaboration: utils_1.flexibleBoolean.optional().describe('Let maintainers push to source branch'),
    allow_maintainer_to_push: utils_1.flexibleBoolean
        .optional()
        .describe('Deprecated - use allow_collaboration'),
    squash: utils_1.flexibleBoolean.optional().describe('Combine all commits into one when merging'),
});
const UpdateMergeRequestSchema = zod_1.z.object({
    action: zod_1.z.literal('update').describe('Update an existing merge request'),
    project_id: projectIdField,
    merge_request_iid: mergeRequestIidField,
    target_branch: zod_1.z.string().optional().describe('Branch to merge into'),
    title: zod_1.z.string().optional().describe('MR title/summary'),
    assignee_id: zod_1.z.string().optional().describe('Single assignee user ID'),
    assignee_ids: zod_1.z.array(zod_1.z.string()).optional().describe('Multiple assignee IDs'),
    reviewer_ids: zod_1.z.array(zod_1.z.string()).optional().describe('User IDs for code reviewers'),
    description: zod_1.z.string().optional().describe('MR description (Markdown)'),
    labels: zod_1.z
        .union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())])
        .optional()
        .describe('Labels to categorize MR'),
    add_labels: zod_1.z
        .union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())])
        .optional()
        .describe('Labels to add'),
    remove_labels: zod_1.z
        .union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())])
        .optional()
        .describe('Labels to remove'),
    milestone_id: zod_1.z.string().optional().describe('Associate MR with milestone'),
    remove_source_branch: utils_1.flexibleBoolean
        .optional()
        .describe('Auto-delete source branch after merge'),
    allow_collaboration: utils_1.flexibleBoolean.optional().describe('Let maintainers push to source branch'),
    allow_maintainer_to_push: utils_1.flexibleBoolean
        .optional()
        .describe('Deprecated - use allow_collaboration'),
    squash: utils_1.flexibleBoolean.optional().describe('Combine all commits into one when merging'),
    state_event: zod_1.z
        .string()
        .transform((val) => val.toLowerCase())
        .pipe(zod_1.z.enum(['close', 'reopen']))
        .optional()
        .describe('State event: close or reopen'),
    discussion_locked: utils_1.flexibleBoolean.optional().describe('Lock discussion thread'),
});
const MergeMergeRequestSchema = zod_1.z.object({
    action: zod_1.z.literal('merge').describe('Merge an approved merge request'),
    project_id: projectIdField,
    merge_request_iid: mergeRequestIidField,
    merge_commit_message: zod_1.z.string().optional().describe('Custom merge commit message'),
    squash_commit_message: zod_1.z.string().optional().describe('Custom squash commit message'),
    squash: utils_1.flexibleBoolean.optional().describe('Combine all commits into one when merging'),
    should_remove_source_branch: utils_1.flexibleBoolean
        .optional()
        .describe('Remove source branch after merge'),
    merge_when_pipeline_succeeds: utils_1.flexibleBoolean.optional().describe('Merge when pipeline succeeds'),
    sha: zod_1.z.string().optional().describe('SHA of the head commit'),
});
const ApproveMergeRequestSchema = zod_1.z.object({
    action: zod_1.z.literal('approve').describe('Approve a merge request'),
    project_id: projectIdField,
    merge_request_iid: mergeRequestIidField,
    sha: zod_1.z.string().optional().describe('SHA of head commit to approve specific version'),
});
const UnapproveMergeRequestSchema = zod_1.z.object({
    action: zod_1.z.literal('unapprove').describe('Remove your approval from a merge request'),
    project_id: projectIdField,
    merge_request_iid: mergeRequestIidField,
});
const GetApprovalStateMergeRequestSchema = zod_1.z.object({
    action: zod_1.z.literal('get_approval_state').describe('Get current approval status and rules'),
    project_id: projectIdField,
    merge_request_iid: mergeRequestIidField,
});
exports.ManageMergeRequestSchema = zod_1.z.discriminatedUnion('action', [
    CreateMergeRequestSchema,
    UpdateMergeRequestSchema,
    MergeMergeRequestSchema,
    ApproveMergeRequestSchema,
    UnapproveMergeRequestSchema,
    GetApprovalStateMergeRequestSchema,
]);
const CommentOnNoteableSchema = zod_1.z.object({
    action: zod_1.z.literal('comment').describe('Add a comment to an issue or merge request'),
    project_id: projectIdField,
    noteable_type: zod_1.z
        .string()
        .transform((val) => val.toLowerCase())
        .pipe(zod_1.z.enum(['issue', 'merge_request']))
        .describe('Type of noteable: issue or merge_request'),
    noteable_id: utils_1.requiredId.describe('ID of the noteable object'),
    body: zod_1.z.string().describe('Content/text of the comment'),
    confidential: utils_1.flexibleBoolean.optional().describe('Confidential note flag'),
    created_at: zod_1.z.string().optional().describe('Date time string (ISO 8601)'),
});
const CreateThreadSchema = zod_1.z.object({
    action: zod_1.z.literal('thread').describe('Start a new discussion thread on an MR'),
    project_id: projectIdField,
    merge_request_iid: mergeRequestIidField,
    body: zod_1.z.string().describe('Content/text of the thread'),
    position: exports.MergeRequestThreadPositionSchema.optional().describe('Position for diff note'),
    commit_id: zod_1.z.string().optional().describe('SHA of commit to start discussion on'),
});
const ReplyToThreadSchema = zod_1.z.object({
    action: zod_1.z.literal('reply').describe('Reply to an existing discussion thread'),
    project_id: projectIdField,
    merge_request_iid: mergeRequestIidField,
    discussion_id: zod_1.z.string().describe('ID of the discussion to reply to'),
    body: zod_1.z.string().describe('Content/text of the reply'),
    created_at: zod_1.z.string().optional().describe('Date time string (ISO 8601)'),
});
const UpdateNoteSchema = zod_1.z.object({
    action: zod_1.z.literal('update').describe('Update an existing note/comment'),
    project_id: projectIdField,
    merge_request_iid: mergeRequestIidField,
    note_id: utils_1.requiredId.describe('ID of the note to update'),
    body: zod_1.z.string().describe('New content/text for the note'),
});
const ApplySuggestionSchema = zod_1.z.object({
    action: zod_1.z.literal('apply_suggestion').describe('Apply a single code suggestion from a review'),
    project_id: projectIdField,
    merge_request_iid: mergeRequestIidField,
    suggestion_id: zod_1.z.number().describe('ID of the suggestion to apply'),
    commit_message: zod_1.z.string().optional().describe('Custom commit message for the apply commit'),
});
const ApplySuggestionsSchema = zod_1.z.object({
    action: zod_1.z.literal('apply_suggestions').describe('Batch apply multiple code suggestions'),
    project_id: projectIdField,
    merge_request_iid: mergeRequestIidField,
    suggestion_ids: zod_1.z.array(zod_1.z.number()).min(1).describe('Array of suggestion IDs to apply'),
    commit_message: zod_1.z.string().optional().describe('Custom commit message for the apply commit'),
});
const ResolveThreadSchema = zod_1.z.object({
    action: zod_1.z.literal('resolve').describe('Resolve or unresolve a discussion thread'),
    project_id: projectIdField,
    merge_request_iid: mergeRequestIidField,
    discussion_id: zod_1.z.string().describe('ID of the discussion thread to resolve/unresolve'),
    resolved: utils_1.flexibleBoolean.describe('true to resolve, false to unresolve'),
});
const SuggestCodeChangeSchema = zod_1.z.object({
    action: zod_1.z.literal('suggest').describe('Create a code suggestion on a diff line'),
    project_id: projectIdField,
    merge_request_iid: mergeRequestIidField,
    position: exports.MergeRequestThreadPositionSchema.describe('Position in diff for the suggestion (requires base_sha, head_sha, start_sha, new_path, new_line)'),
    suggestion: zod_1.z.string().describe('The suggested code (raw code, no markdown formatting needed)'),
    comment: zod_1.z.string().optional().describe('Optional explanation comment before the suggestion'),
    lines_above: zod_1.z.number().int().min(0).default(0).describe('Lines to include above (default: 0)'),
    lines_below: zod_1.z.number().int().min(0).default(0).describe('Lines to include below (default: 0)'),
});
exports.ManageMrDiscussionSchema = zod_1.z.discriminatedUnion('action', [
    CommentOnNoteableSchema,
    CreateThreadSchema,
    ReplyToThreadSchema,
    UpdateNoteSchema,
    ApplySuggestionSchema,
    ApplySuggestionsSchema,
    ResolveThreadSchema,
    SuggestCodeChangeSchema,
]);
const draftNoteIdField = utils_1.requiredId.describe('ID of the draft note');
const CreateDraftNoteSchema = zod_1.z.object({
    action: zod_1.z.literal('create').describe('Create a new draft note'),
    project_id: projectIdField,
    merge_request_iid: mergeRequestIidField,
    note: zod_1.z.string().describe('Content of the draft note'),
    position: exports.MergeRequestThreadPositionSchema.optional().describe('Position for diff note'),
    in_reply_to_discussion_id: zod_1.z.string().optional().describe('Discussion ID to reply to'),
    commit_id: zod_1.z.string().optional().describe('SHA of commit to start discussion on'),
});
const UpdateDraftNoteSchema = zod_1.z.object({
    action: zod_1.z.literal('update').describe('Update an existing draft note'),
    project_id: projectIdField,
    merge_request_iid: mergeRequestIidField,
    draft_note_id: draftNoteIdField,
    note: zod_1.z.string().describe('New content for the draft note'),
    position: exports.MergeRequestThreadPositionSchema.optional().describe('Position for diff note'),
});
const PublishDraftNoteSchema = zod_1.z.object({
    action: zod_1.z.literal('publish').describe('Publish a single draft note'),
    project_id: projectIdField,
    merge_request_iid: mergeRequestIidField,
    draft_note_id: draftNoteIdField,
});
const PublishAllDraftNotesSchema = zod_1.z.object({
    action: zod_1.z.literal('publish_all').describe('Publish all draft notes at once'),
    project_id: projectIdField,
    merge_request_iid: mergeRequestIidField,
});
const DeleteDraftNoteSchema = zod_1.z.object({
    action: zod_1.z.literal('delete').describe('Delete a draft note'),
    project_id: projectIdField,
    merge_request_iid: mergeRequestIidField,
    draft_note_id: draftNoteIdField,
});
exports.ManageDraftNotesSchema = zod_1.z.discriminatedUnion('action', [
    CreateDraftNoteSchema,
    UpdateDraftNoteSchema,
    PublishDraftNoteSchema,
    PublishAllDraftNotesSchema,
    DeleteDraftNoteSchema,
]);
//# sourceMappingURL=schema.js.map