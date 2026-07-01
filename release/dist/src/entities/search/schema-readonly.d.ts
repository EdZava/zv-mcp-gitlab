import { z } from 'zod';
export declare const SearchScopeSchema: z.ZodEnum<{
    milestones: "milestones";
    projects: "projects";
    groups: "groups";
    issues: "issues";
    commits: "commits";
    users: "users";
    merge_requests: "merge_requests";
    snippet_titles: "snippet_titles";
    blobs: "blobs";
    wiki_blobs: "wiki_blobs";
    notes: "notes";
}>;
declare const GlobalSearchSchema: z.ZodObject<{
    action: z.ZodLiteral<"global">;
    scope: z.ZodEnum<{
        milestones: "milestones";
        projects: "projects";
        groups: "groups";
        issues: "issues";
        commits: "commits";
        users: "users";
        merge_requests: "merge_requests";
        snippet_titles: "snippet_titles";
        blobs: "blobs";
        wiki_blobs: "wiki_blobs";
        notes: "notes";
    }>;
    search: z.ZodString;
    state: z.ZodOptional<z.ZodEnum<{
        all: "all";
        closed: "closed";
        merged: "merged";
        opened: "opened";
    }>>;
    confidential: z.ZodOptional<z.ZodBoolean>;
    order_by: z.ZodOptional<z.ZodEnum<{
        created_at: "created_at";
        updated_at: "updated_at";
    }>>;
    sort: z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
declare const ProjectSearchSchema: z.ZodObject<{
    action: z.ZodLiteral<"project">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    scope: z.ZodEnum<{
        milestones: "milestones";
        projects: "projects";
        groups: "groups";
        issues: "issues";
        commits: "commits";
        users: "users";
        merge_requests: "merge_requests";
        snippet_titles: "snippet_titles";
        blobs: "blobs";
        wiki_blobs: "wiki_blobs";
        notes: "notes";
    }>;
    ref: z.ZodOptional<z.ZodString>;
    search: z.ZodString;
    state: z.ZodOptional<z.ZodEnum<{
        all: "all";
        closed: "closed";
        merged: "merged";
        opened: "opened";
    }>>;
    confidential: z.ZodOptional<z.ZodBoolean>;
    order_by: z.ZodOptional<z.ZodEnum<{
        created_at: "created_at";
        updated_at: "updated_at";
    }>>;
    sort: z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
declare const GroupSearchSchema: z.ZodObject<{
    action: z.ZodLiteral<"group">;
    group_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    scope: z.ZodEnum<{
        milestones: "milestones";
        projects: "projects";
        groups: "groups";
        issues: "issues";
        commits: "commits";
        users: "users";
        merge_requests: "merge_requests";
        snippet_titles: "snippet_titles";
        blobs: "blobs";
        wiki_blobs: "wiki_blobs";
        notes: "notes";
    }>;
    search: z.ZodString;
    state: z.ZodOptional<z.ZodEnum<{
        all: "all";
        closed: "closed";
        merged: "merged";
        opened: "opened";
    }>>;
    confidential: z.ZodOptional<z.ZodBoolean>;
    order_by: z.ZodOptional<z.ZodEnum<{
        created_at: "created_at";
        updated_at: "updated_at";
    }>>;
    sort: z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const BrowseSearchSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    action: z.ZodLiteral<"global">;
    scope: z.ZodEnum<{
        milestones: "milestones";
        projects: "projects";
        groups: "groups";
        issues: "issues";
        commits: "commits";
        users: "users";
        merge_requests: "merge_requests";
        snippet_titles: "snippet_titles";
        blobs: "blobs";
        wiki_blobs: "wiki_blobs";
        notes: "notes";
    }>;
    search: z.ZodString;
    state: z.ZodOptional<z.ZodEnum<{
        all: "all";
        closed: "closed";
        merged: "merged";
        opened: "opened";
    }>>;
    confidential: z.ZodOptional<z.ZodBoolean>;
    order_by: z.ZodOptional<z.ZodEnum<{
        created_at: "created_at";
        updated_at: "updated_at";
    }>>;
    sort: z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"project">;
    project_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    scope: z.ZodEnum<{
        milestones: "milestones";
        projects: "projects";
        groups: "groups";
        issues: "issues";
        commits: "commits";
        users: "users";
        merge_requests: "merge_requests";
        snippet_titles: "snippet_titles";
        blobs: "blobs";
        wiki_blobs: "wiki_blobs";
        notes: "notes";
    }>;
    ref: z.ZodOptional<z.ZodString>;
    search: z.ZodString;
    state: z.ZodOptional<z.ZodEnum<{
        all: "all";
        closed: "closed";
        merged: "merged";
        opened: "opened";
    }>>;
    confidential: z.ZodOptional<z.ZodBoolean>;
    order_by: z.ZodOptional<z.ZodEnum<{
        created_at: "created_at";
        updated_at: "updated_at";
    }>>;
    sort: z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    action: z.ZodLiteral<"group">;
    group_id: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
    scope: z.ZodEnum<{
        milestones: "milestones";
        projects: "projects";
        groups: "groups";
        issues: "issues";
        commits: "commits";
        users: "users";
        merge_requests: "merge_requests";
        snippet_titles: "snippet_titles";
        blobs: "blobs";
        wiki_blobs: "wiki_blobs";
        notes: "notes";
    }>;
    search: z.ZodString;
    state: z.ZodOptional<z.ZodEnum<{
        all: "all";
        closed: "closed";
        merged: "merged";
        opened: "opened";
    }>>;
    confidential: z.ZodOptional<z.ZodBoolean>;
    order_by: z.ZodOptional<z.ZodEnum<{
        created_at: "created_at";
        updated_at: "updated_at";
    }>>;
    sort: z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>], "action">;
export type SearchScope = z.infer<typeof SearchScopeSchema>;
export type BrowseSearchInput = z.infer<typeof BrowseSearchSchema>;
export type GlobalSearchInput = z.infer<typeof GlobalSearchSchema>;
export type ProjectSearchInput = z.infer<typeof ProjectSearchSchema>;
export type GroupSearchInput = z.infer<typeof GroupSearchSchema>;
export {};
