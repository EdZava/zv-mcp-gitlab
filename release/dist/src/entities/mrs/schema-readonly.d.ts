import { z } from 'zod';
export declare const LOCKFILE_PATTERNS: readonly ["yarn.lock", "package-lock.json", "pnpm-lock.yaml", "Gemfile.lock", "Cargo.lock", "poetry.lock", "composer.lock", "go.sum", "Pipfile.lock", "bun.lockb", "shrinkwrap.yaml"];
export declare const GENERATED_PATTERNS: readonly ["dist/**", "build/**", ".next/**", ".nuxt/**", ".output/**", "coverage/**", "**/*.min.js", "**/*.min.css", "**/*.map", "**/*.js.map", "**/*.css.map"];
export declare const DIFF_EXCLUSION_PRESETS: {
    readonly lockfiles: readonly ["yarn.lock", "package-lock.json", "pnpm-lock.yaml", "Gemfile.lock", "Cargo.lock", "poetry.lock", "composer.lock", "go.sum", "Pipfile.lock", "bun.lockb", "shrinkwrap.yaml"];
    readonly generated: readonly ["dist/**", "build/**", ".next/**", ".nuxt/**", ".output/**", "coverage/**", "**/*.min.js", "**/*.min.css", "**/*.map", "**/*.js.map", "**/*.css.map"];
};
export declare const BrowseMergeRequestsSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
    action: z.ZodLiteral<"list">;
    project_id: z.ZodOptional<z.ZodCoercedString<unknown>>;
    state: z.ZodOptional<z.ZodEnum<{
        all: "all";
        closed: "closed";
        merged: "merged";
        opened: "opened";
        locked: "locked";
    }>>;
    order_by: z.ZodOptional<z.ZodEnum<{
        priority: "priority";
        title: "title";
        created_at: "created_at";
        updated_at: "updated_at";
    }>>;
    sort: z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    milestone: z.ZodOptional<z.ZodString>;
    view: z.ZodOptional<z.ZodEnum<{
        simple: "simple";
        full: "full";
    }>>;
    labels: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodString>]>>;
    with_labels_details: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    with_merge_status_recheck: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    created_after: z.ZodOptional<z.ZodString>;
    created_before: z.ZodOptional<z.ZodString>;
    updated_after: z.ZodOptional<z.ZodString>;
    updated_before: z.ZodOptional<z.ZodString>;
    scope: z.ZodOptional<z.ZodEnum<{
        all: "all";
        created_by_me: "created_by_me";
        assigned_to_me: "assigned_to_me";
    }>>;
    author_id: z.ZodOptional<z.ZodNumber>;
    author_username: z.ZodOptional<z.ZodString>;
    assignee_id: z.ZodOptional<z.ZodNumber>;
    assignee_username: z.ZodOptional<z.ZodString>;
    my_reaction_emoji: z.ZodOptional<z.ZodString>;
    source_branch: z.ZodOptional<z.ZodString>;
    target_branch: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    in: z.ZodOptional<z.ZodEnum<{
        description: "description";
        title: "title";
        "title,description": "title,description";
    }>>;
    wip: z.ZodOptional<z.ZodEnum<{
        yes: "yes";
        no: "no";
    }>>;
    not: z.ZodOptional<z.ZodObject<{
        labels: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodString>]>>;
        milestone: z.ZodOptional<z.ZodString>;
        author_id: z.ZodOptional<z.ZodNumber>;
        author_username: z.ZodOptional<z.ZodString>;
        assignee_id: z.ZodOptional<z.ZodNumber>;
        assignee_username: z.ZodOptional<z.ZodString>;
        my_reaction_emoji: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    environment: z.ZodOptional<z.ZodString>;
    deployed_before: z.ZodOptional<z.ZodString>;
    deployed_after: z.ZodOptional<z.ZodString>;
    approved_by_ids: z.ZodOptional<z.ZodArray<z.ZodString>>;
    approved_by_usernames: z.ZodOptional<z.ZodArray<z.ZodString>>;
    reviewer_id: z.ZodOptional<z.ZodNumber>;
    reviewer_username: z.ZodOptional<z.ZodString>;
    with_api_entity_associations: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    min_access_level: z.ZodOptional<z.ZodNumber>;
}, z.core.$loose>, z.ZodObject<{
    action: z.ZodLiteral<"get">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    merge_request_iid: z.ZodOptional<z.ZodPreprocess<z.ZodCoercedString<unknown>>>;
    branch_name: z.ZodOptional<z.ZodString>;
    include_diverged_commits_count: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    include_rebase_in_progress: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
}, z.core.$loose>, z.ZodObject<{
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
    action: z.ZodLiteral<"diffs">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    merge_request_iid: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    include_diverged_commits_count: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    include_rebase_in_progress: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    exclude_patterns: z.ZodOptional<z.ZodArray<z.ZodString>>;
    exclude_lockfiles: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    exclude_generated: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
}, z.core.$loose>, z.ZodObject<{
    action: z.ZodLiteral<"compare">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    from: z.ZodString;
    to: z.ZodString;
    straight: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
}, z.core.$loose>, z.ZodObject<{
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
    action: z.ZodLiteral<"versions">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    merge_request_iid: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
}, z.core.$loose>, z.ZodObject<{
    action: z.ZodLiteral<"version">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    merge_request_iid: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    version_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
}, z.core.$loose>], "action">;
export declare const BrowseMrDiscussionsSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
    action: z.ZodLiteral<"list">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    merge_request_iid: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"drafts">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    merge_request_iid: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"draft">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    merge_request_iid: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    draft_note_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
}, z.core.$strip>], "action">;
export type BrowseMergeRequestsInput = z.infer<typeof BrowseMergeRequestsSchema>;
export type BrowseMrDiscussionsInput = z.infer<typeof BrowseMrDiscussionsSchema>;
