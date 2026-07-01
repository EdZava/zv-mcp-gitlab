import { TypedDocumentNode } from '@graphql-typed-document-node/core';
export interface RunnerNode {
    id: string;
    description: string | null;
    runnerType: string;
    status: string | null;
    paused: boolean;
    locked: boolean;
    runUntagged: boolean;
    tagList: string[] | null;
    accessLevel: string | null;
    maximumTimeout: number | null;
    jobExecutionStatus: string | null;
    jobCount: number | null;
    contactedAt: string | null;
    createdAt: string | null;
}
interface PageInfo {
    hasNextPage: boolean;
    endCursor: string | null;
}
interface RunnerConnection {
    nodes: RunnerNode[];
    pageInfo: PageInfo;
}
export interface RunnerListVars {
    type?: string | null;
    status?: string | null;
    paused?: boolean | null;
    tagList?: string[] | null;
    search?: string | null;
    first?: number | null;
    after?: string | null;
}
export interface ListRunnersResult {
    runners: RunnerConnection | null;
}
export declare const LIST_RUNNERS: TypedDocumentNode<ListRunnersResult, RunnerListVars>;
export interface ListOwnedRunnersResult {
    currentUser: {
        runners: RunnerConnection | null;
    } | null;
}
export declare const LIST_OWNED_RUNNERS: TypedDocumentNode<ListOwnedRunnersResult, RunnerListVars>;
export interface ListGroupRunnersResult {
    group: {
        runners: RunnerConnection | null;
    } | null;
}
export interface ListNamespaceRunnersVars extends RunnerListVars {
    fullPath: string;
}
export declare const LIST_GROUP_RUNNERS: TypedDocumentNode<ListGroupRunnersResult, ListNamespaceRunnersVars>;
export interface ListProjectRunnersResult {
    project: {
        runners: RunnerConnection | null;
    } | null;
}
export declare const LIST_PROJECT_RUNNERS: TypedDocumentNode<ListProjectRunnersResult, ListNamespaceRunnersVars>;
export interface GetRunnerResult {
    runner: RunnerNode | null;
}
export interface GetRunnerVars {
    id: string;
}
export declare const GET_RUNNER: TypedDocumentNode<GetRunnerResult, GetRunnerVars>;
export interface RunnerJobNode {
    id: string;
    name: string | null;
    status: string | null;
    createdAt: string | null;
    finishedAt: string | null;
    duration: number | null;
    webPath: string | null;
}
export interface ListRunnerJobsResult {
    runner: {
        id: string;
        jobs: {
            nodes: RunnerJobNode[];
            pageInfo: PageInfo;
        } | null;
    } | null;
}
export interface ListRunnerJobsVars {
    id: string;
    statuses?: string[] | null;
    first?: number | null;
    after?: string | null;
}
export declare const LIST_RUNNER_JOBS: TypedDocumentNode<ListRunnerJobsResult, ListRunnerJobsVars>;
export interface ResolveGroupResult {
    group: {
        id: string;
    } | null;
}
export interface ResolveProjectResult {
    project: {
        id: string;
    } | null;
}
export interface ResolvePathVars {
    fullPath: string;
}
export declare const RESOLVE_GROUP_ID: TypedDocumentNode<ResolveGroupResult, ResolvePathVars>;
export declare const RESOLVE_PROJECT_ID: TypedDocumentNode<ResolveProjectResult, ResolvePathVars>;
export interface RunnerCreateResult {
    runnerCreate: {
        runner: (RunnerNode & {
            ephemeralAuthenticationToken: string | null;
        }) | null;
        errors: string[];
    } | null;
}
export interface RunnerCreateVars {
    input: {
        runnerType: string;
        groupId?: string | null;
        projectId?: string | null;
        description?: string | null;
        paused?: boolean | null;
        locked?: boolean | null;
        runUntagged?: boolean | null;
        tagList?: string[] | null;
        accessLevel?: string | null;
        maximumTimeout?: number | null;
        maintenanceNote?: string | null;
    };
}
export declare const RUNNER_CREATE: TypedDocumentNode<RunnerCreateResult, RunnerCreateVars>;
export interface RunnerUpdateResult {
    runnerUpdate: {
        runner: RunnerNode | null;
        errors: string[];
    } | null;
}
export interface RunnerUpdateVars {
    input: {
        id: string;
        description?: string | null;
        paused?: boolean | null;
        locked?: boolean | null;
        runUntagged?: boolean | null;
        tagList?: string[] | null;
        accessLevel?: string | null;
        maximumTimeout?: number | null;
        maintenanceNote?: string | null;
    };
}
export declare const RUNNER_UPDATE: TypedDocumentNode<RunnerUpdateResult, RunnerUpdateVars>;
export interface RunnerDeleteResult {
    runnerDelete: {
        errors: string[];
    } | null;
}
export interface RunnerDeleteVars {
    input: {
        id: string;
    };
}
export declare const RUNNER_DELETE: TypedDocumentNode<RunnerDeleteResult, RunnerDeleteVars>;
export {};
