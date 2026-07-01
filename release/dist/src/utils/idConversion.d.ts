export interface GitLabObject {
    [key: string]: unknown;
}
export interface GitLabWorkItemType {
    id: string;
    name: string;
}
export interface GitLabWorkItem extends GitLabObject {
    id: string;
    iid?: string;
    title?: string;
    description?: string;
    state?: string;
    workItemType?: GitLabWorkItemType | string;
    widgets?: GitLabWidget[];
    createdAt?: string;
    updatedAt?: string;
    closedAt?: string;
    webUrl?: string;
}
export interface GitLabWidget {
    type: string;
    assignees?: {
        nodes?: Array<{
            id: string;
            [key: string]: unknown;
        }>;
    };
    labels?: {
        nodes?: Array<{
            id: string;
            [key: string]: unknown;
        }>;
    };
    milestone?: {
        id: string;
        [key: string]: unknown;
    };
    parent?: {
        id: string;
        [key: string]: unknown;
    };
    linkedItems?: {
        nodes?: Array<{
            linkType?: string;
            workItem?: {
                id: string;
                [key: string]: unknown;
            };
            [key: string]: unknown;
        }>;
    };
    [key: string]: unknown;
}
declare const GID_PREFIXES: {
    readonly WorkItem: "gid://gitlab/WorkItem/";
    readonly User: "gid://gitlab/User/";
    readonly Project: "gid://gitlab/Project/";
    readonly Group: "gid://gitlab/Group/";
    readonly Label: "gid://gitlab/ProjectLabel/";
    readonly Milestone: "gid://gitlab/Milestone/";
    readonly Iteration: "gid://gitlab/Iteration/";
    readonly MergeRequest: "gid://gitlab/MergeRequest/";
    readonly Pipeline: "gid://gitlab/Ci::Pipeline/";
    readonly Job: "gid://gitlab/Ci::Build/";
    readonly Variable: "gid://gitlab/Ci::Variable/";
    readonly Wiki: "gid://gitlab/Wiki/";
    readonly Note: "gid://gitlab/Note/";
    readonly Discussion: "gid://gitlab/Discussion/";
    readonly Timelog: "gid://gitlab/Timelog/";
};
export type EntityType = keyof typeof GID_PREFIXES;
export declare function extractSimpleId(gid: string): string;
export declare function normalizeWorkItemGid(gid: string): string;
export declare function toGid(id: string, entityType: EntityType): string;
export declare function toGids(ids: string[], entityType: EntityType): string[];
export declare function extractSimpleIds(gids: string[]): string[];
export declare function cleanGidsFromObject<T>(obj: T): T;
export declare function cleanWorkItemResponse(workItem: GitLabWorkItem): GitLabWorkItem;
export declare function convertTypeNamesToGids(typeNames: string[], namespacePath: string, getWorkItemTypes: (path: string) => Promise<GitLabWorkItemType[]>): Promise<string[]>;
export {};
