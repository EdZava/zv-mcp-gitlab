import { TypedDocumentNode } from '@graphql-typed-document-node/core';
export interface GraphQLClientOptions {
    endpoint: string;
    headers?: Record<string, string>;
}
export declare class GraphQLClient {
    private _endpoint;
    private defaultHeaders;
    constructor(endpoint: string, options?: {
        headers?: Record<string, string>;
    });
    get endpoint(): string;
    setEndpoint(endpoint: string): void;
    request<TResult = unknown, TVariables = Record<string, unknown>>(document: TypedDocumentNode<TResult, TVariables>, variables?: TVariables, requestHeaders?: Record<string, string>): Promise<TResult>;
    setHeaders(headers: Record<string, string>): void;
    setAuthToken(token: string): void;
}
