import { z } from 'zod';
export declare const ManageProjectSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"create">;
    name: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    namespace: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    visibility: z.ZodOptional<z.ZodEnum<{
        public: "public";
        internal: "internal";
        private: "private";
    }>>;
    initialize_with_readme: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    issues_enabled: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    merge_requests_enabled: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    jobs_enabled: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    wiki_enabled: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    snippets_enabled: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    lfs_enabled: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    request_access_enabled: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    only_allow_merge_if_pipeline_succeeds: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    only_allow_merge_if_all_discussions_are_resolved: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"fork">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    namespace: z.ZodOptional<z.ZodString>;
    namespace_path: z.ZodOptional<z.ZodString>;
    fork_name: z.ZodOptional<z.ZodString>;
    fork_path: z.ZodOptional<z.ZodString>;
    issues_enabled: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    merge_requests_enabled: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    jobs_enabled: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    wiki_enabled: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    snippets_enabled: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    lfs_enabled: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    request_access_enabled: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    only_allow_merge_if_pipeline_succeeds: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    only_allow_merge_if_all_discussions_are_resolved: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"update">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    visibility: z.ZodOptional<z.ZodEnum<{
        public: "public";
        internal: "internal";
        private: "private";
    }>>;
    default_branch: z.ZodOptional<z.ZodString>;
    issues_enabled: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    merge_requests_enabled: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    jobs_enabled: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    wiki_enabled: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    snippets_enabled: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    lfs_enabled: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    request_access_enabled: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    only_allow_merge_if_pipeline_succeeds: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    only_allow_merge_if_all_discussions_are_resolved: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    issues_template: z.ZodOptional<z.ZodString>;
    merge_requests_template: z.ZodOptional<z.ZodString>;
    merge_pipelines_enabled: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    merge_trains_enabled: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    only_allow_merge_if_all_status_checks_passed: z.ZodOptional<z.ZodPreprocess<z.ZodBoolean>>;
    requirements_access_level: z.ZodOptional<z.ZodEnum<{
        enabled: "enabled";
        private: "private";
        disabled: "disabled";
    }>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"delete">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"archive">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"unarchive">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"transfer">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    namespace: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"restore">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
}, z.core.$strip>], "action">;
export declare const ManageNamespaceSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"create">;
    name: z.ZodString;
    path: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    visibility: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        public: "public";
        internal: "internal";
        private: "private";
    }>>>;
    parent_id: z.ZodOptional<z.ZodNumber>;
    lfs_enabled: z.ZodOptional<z.ZodBoolean>;
    request_access_enabled: z.ZodOptional<z.ZodBoolean>;
    default_branch_protection: z.ZodOptional<z.ZodNumber>;
    avatar: z.ZodOptional<z.ZodString>;
    membership_lock: z.ZodOptional<z.ZodBoolean>;
    wiki_access_level: z.ZodOptional<z.ZodEnum<{
        enabled: "enabled";
        private: "private";
        disabled: "disabled";
    }>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"update">;
    group_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    name: z.ZodOptional<z.ZodString>;
    path: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    visibility: z.ZodOptional<z.ZodEnum<{
        public: "public";
        internal: "internal";
        private: "private";
    }>>;
    lfs_enabled: z.ZodOptional<z.ZodBoolean>;
    request_access_enabled: z.ZodOptional<z.ZodBoolean>;
    default_branch_protection: z.ZodOptional<z.ZodNumber>;
    membership_lock: z.ZodOptional<z.ZodBoolean>;
    wiki_access_level: z.ZodOptional<z.ZodEnum<{
        enabled: "enabled";
        private: "private";
        disabled: "disabled";
    }>>;
    ip_restriction_ranges: z.ZodOptional<z.ZodString>;
    allowed_email_domains_list: z.ZodOptional<z.ZodString>;
    unique_project_download_limit: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"delete">;
    group_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"restore">;
    group_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
}, z.core.$strip>], "action">;
export declare const ManageTodosSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"mark_done">;
    id: z.ZodNumber;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"mark_all_done">;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"restore">;
    id: z.ZodNumber;
}, z.core.$strip>], "action">;
export type ManageProjectOptions = z.infer<typeof ManageProjectSchema>;
export type ManageNamespaceOptions = z.infer<typeof ManageNamespaceSchema>;
export type ManageTodosOptions = z.infer<typeof ManageTodosSchema>;
