import { z } from 'zod';
export declare const GitLabSearchResponseSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodUnknown>;
    total_count: z.ZodNumber;
}, z.core.$strip>;
export declare const GitLabReferenceSchema: z.ZodObject<{
    type: z.ZodString;
    name: z.ZodString;
    path: z.ZodString;
    location: z.ZodString;
}, z.core.$strip>;
export declare const GitLabCompareResultSchema: z.ZodObject<{
    commit: z.ZodObject<{
        id: z.ZodString;
        short_id: z.ZodString;
        title: z.ZodString;
        author_name: z.ZodString;
        author_email: z.ZodString;
        authored_date: z.ZodString;
        committer_name: z.ZodString;
        committer_email: z.ZodString;
        committed_date: z.ZodString;
        message: z.ZodString;
    }, z.core.$strip>;
    commits: z.ZodArray<z.ZodUnknown>;
    diffs: z.ZodArray<z.ZodUnknown>;
}, z.core.$strip>;
export declare const BrowseProjectsSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
    action: z.ZodLiteral<"search">;
    q: z.ZodOptional<z.ZodString>;
    visibility: z.ZodOptional<z.ZodEnum<{
        public: "public";
        internal: "internal";
        private: "private";
    }>>;
    archived: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    order_by: z.ZodOptional<z.ZodEnum<{
        name: "name";
        path: "path";
        id: "id";
        created_at: "created_at";
        updated_at: "updated_at";
        last_activity_at: "last_activity_at";
        similarity: "similarity";
    }>>;
    sort: z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    with_programming_language: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
    action: z.ZodLiteral<"list">;
    group_id: z.ZodOptional<z.ZodCoercedString<unknown>>;
    search: z.ZodOptional<z.ZodString>;
    owned: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    starred: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    membership: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    simple: z.ZodDefault<z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>>;
    include_subgroups: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    with_shared: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    include_deleted: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    marked_for_deletion_on: z.ZodOptional<z.ZodString>;
    active: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    visibility: z.ZodOptional<z.ZodEnum<{
        public: "public";
        internal: "internal";
        private: "private";
    }>>;
    archived: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    order_by: z.ZodOptional<z.ZodEnum<{
        name: "name";
        path: "path";
        id: "id";
        created_at: "created_at";
        updated_at: "updated_at";
        last_activity_at: "last_activity_at";
        similarity: "similarity";
    }>>;
    sort: z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    with_programming_language: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"get">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    statistics: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    license: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
}, z.core.$strip>], "action">;
export declare const BrowseNamespacesSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
    action: z.ZodLiteral<"list">;
    search: z.ZodOptional<z.ZodString>;
    owned_only: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    top_level_only: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    with_statistics: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    min_access_level: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"get">;
    namespace_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"verify">;
    namespace_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
}, z.core.$strip>], "action">;
export declare const BrowseCommitsSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
    action: z.ZodLiteral<"list">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    ref_name: z.ZodOptional<z.ZodString>;
    since: z.ZodOptional<z.ZodString>;
    until: z.ZodOptional<z.ZodString>;
    path: z.ZodOptional<z.ZodString>;
    author: z.ZodOptional<z.ZodString>;
    all: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    first_parent: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    order: z.ZodOptional<z.ZodEnum<{
        default: "default";
        topo: "topo";
    }>>;
    with_stats: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    trailers: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"get">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    sha: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    stats: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
}, z.core.$strip>, z.ZodObject<{
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
    action: z.ZodLiteral<"diff">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    sha: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    unidiff: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
}, z.core.$strip>], "action">;
export declare const BrowseEventsSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
    action: z.ZodLiteral<"user">;
    target_type: z.ZodOptional<z.ZodEnum<{
        project: "project";
        milestone: "milestone";
        merge_request: "merge_request";
        issue: "issue";
        user: "user";
        note: "note";
        snippet: "snippet";
    }>>;
    event_action: z.ZodOptional<z.ZodEnum<{
        destroyed: "destroyed";
        expired: "expired";
        created: "created";
        updated: "updated";
        closed: "closed";
        reopened: "reopened";
        pushed: "pushed";
        commented: "commented";
        merged: "merged";
        joined: "joined";
        left: "left";
    }>>;
    before: z.ZodOptional<z.ZodString>;
    after: z.ZodOptional<z.ZodString>;
    sort: z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
}, z.core.$strip>, z.ZodObject<{
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
    action: z.ZodLiteral<"project">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    target_type: z.ZodOptional<z.ZodEnum<{
        project: "project";
        milestone: "milestone";
        merge_request: "merge_request";
        issue: "issue";
        user: "user";
        note: "note";
        snippet: "snippet";
    }>>;
    event_action: z.ZodOptional<z.ZodEnum<{
        destroyed: "destroyed";
        expired: "expired";
        created: "created";
        updated: "updated";
        closed: "closed";
        reopened: "reopened";
        pushed: "pushed";
        commented: "commented";
        merged: "merged";
        joined: "joined";
        left: "left";
    }>>;
    before: z.ZodOptional<z.ZodString>;
    after: z.ZodOptional<z.ZodString>;
    sort: z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
}, z.core.$strip>], "action">;
export declare const BrowseUsersSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
    active: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    external: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    blocked: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    humans: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    created_after: z.ZodOptional<z.ZodString>;
    created_before: z.ZodOptional<z.ZodString>;
    exclude_active: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    exclude_external: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    exclude_humans: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    exclude_internal: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    without_project_bots: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    action: z.ZodLiteral<"search">;
    username: z.ZodOptional<z.ZodString>;
    public_email: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    smart_search: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"get">;
    user_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
}, z.core.$strip>], "action">;
export declare const BrowseTodosSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
    action: z.ZodLiteral<"list">;
    state: z.ZodOptional<z.ZodEnum<{
        pending: "pending";
        done: "done";
    }>>;
    todo_action: z.ZodOptional<z.ZodEnum<{
        assigned: "assigned";
        mentioned: "mentioned";
        build_failed: "build_failed";
        marked: "marked";
        approval_required: "approval_required";
        unmergeable: "unmergeable";
        directly_addressed: "directly_addressed";
        merge_train_removed: "merge_train_removed";
        review_requested: "review_requested";
        member_access_requested: "member_access_requested";
        review_submitted: "review_submitted";
    }>>;
    type: z.ZodOptional<z.ZodEnum<{
        Issue: "Issue";
        MergeRequest: "MergeRequest";
        Commit: "Commit";
        Epic: "Epic";
        "DesignManagement::Design": "DesignManagement::Design";
        "AlertManagement::Alert": "AlertManagement::Alert";
    }>>;
    project_id: z.ZodOptional<z.ZodNumber>;
    group_id: z.ZodOptional<z.ZodNumber>;
    author_id: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>], "action">;
export type GitLabSearchResponse = z.infer<typeof GitLabSearchResponseSchema>;
export type GitLabReference = z.infer<typeof GitLabReferenceSchema>;
export type GitLabCompareResult = z.infer<typeof GitLabCompareResultSchema>;
export type BrowseProjectsOptions = z.infer<typeof BrowseProjectsSchema>;
export type BrowseNamespacesOptions = z.infer<typeof BrowseNamespacesSchema>;
export type BrowseCommitsOptions = z.infer<typeof BrowseCommitsSchema>;
export type BrowseEventsOptions = z.infer<typeof BrowseEventsSchema>;
export type BrowseUsersOptions = z.infer<typeof BrowseUsersSchema>;
export type BrowseTodosOptions = z.infer<typeof BrowseTodosSchema>;
