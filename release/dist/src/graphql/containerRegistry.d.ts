import { TypedDocumentNode } from '@graphql-typed-document-node/core';
export interface ContainerRepositoryNode {
    id: string;
    name: string | null;
    path: string;
    location: string;
    status: string | null;
    tagsCount: number;
    createdAt: string;
    updatedAt: string;
    lastPublishedAt?: string | null;
}
export interface ContainerTagNode {
    name: string;
    path: string;
    location: string;
    digest: string | null;
    revision: string | null;
    shortRevision: string | null;
    totalSize: string | null;
    createdAt: string | null;
    publishedAt: string | null;
    mediaType: string | null;
}
interface PageInfo {
    hasNextPage: boolean;
    endCursor: string | null;
}
export interface ListRepositoriesResult {
    project: {
        containerRepositories: {
            nodes: ContainerRepositoryNode[];
            pageInfo: PageInfo;
        };
    } | null;
}
export interface ListRepositoriesVars {
    fullPath: string;
    name?: string | null;
    first?: number | null;
    after?: string | null;
}
export declare const LIST_CONTAINER_REPOSITORIES: TypedDocumentNode<ListRepositoriesResult, ListRepositoriesVars>;
export interface GetRepositoryResult {
    containerRepository: ContainerRepositoryNode | null;
}
export interface GetRepositoryVars {
    id: string;
}
export declare const GET_CONTAINER_REPOSITORY: TypedDocumentNode<GetRepositoryResult, GetRepositoryVars>;
export interface ListTagsResult {
    containerRepository: {
        id: string;
        tags: {
            nodes: ContainerTagNode[];
            pageInfo: PageInfo;
        };
    } | null;
}
export interface ListTagsVars {
    id: string;
    name?: string | null;
    first?: number | null;
    after?: string | null;
}
export declare const LIST_CONTAINER_REPOSITORY_TAGS: TypedDocumentNode<ListTagsResult, ListTagsVars>;
export interface DestroyRepositoryResult {
    destroyContainerRepository: {
        containerRepository: {
            id: string;
            status: string | null;
        } | null;
        errors: string[];
    } | null;
}
export interface DestroyRepositoryVars {
    id: string;
}
export declare const DESTROY_CONTAINER_REPOSITORY: TypedDocumentNode<DestroyRepositoryResult, DestroyRepositoryVars>;
export interface DestroyTagsResult {
    destroyContainerRepositoryTags: {
        deletedTagNames: string[];
        errors: string[];
    } | null;
}
export interface DestroyTagsVars {
    id: string;
    tagNames: string[];
}
export declare const DESTROY_CONTAINER_REPOSITORY_TAGS: TypedDocumentNode<DestroyTagsResult, DestroyTagsVars>;
export {};
