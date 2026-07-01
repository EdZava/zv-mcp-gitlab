import { TypedDocumentNode } from '@graphql-typed-document-node/core';
export interface VulnerabilityNode {
    id: string;
    title: string | null;
    description: string | null;
    state: string | null;
    severity: string | null;
    reportType: string | null;
    resolvedOnDefaultBranch: boolean | null;
    detectedAt: string | null;
    confirmedAt: string | null;
    resolvedAt: string | null;
    dismissedAt: string | null;
    vulnerabilityPath: string | null;
    webUrl: string | null;
}
interface PageInfo {
    hasNextPage: boolean;
    endCursor: string | null;
}
interface VulnConnection {
    nodes: VulnerabilityNode[];
    pageInfo: PageInfo;
}
export interface VulnListVars {
    state?: string[] | null;
    severity?: string[] | null;
    reportType?: string[] | null;
    sort?: string | null;
    first?: number | null;
    after?: string | null;
}
export interface ListProjectVulnsResult {
    project: {
        vulnerabilities: VulnConnection | null;
    } | null;
}
export interface ListNamespaceVulnsVars extends VulnListVars {
    fullPath: string;
}
export declare const LIST_PROJECT_VULNS: TypedDocumentNode<ListProjectVulnsResult, ListNamespaceVulnsVars>;
export interface ListGroupVulnsResult {
    group: {
        vulnerabilities: VulnConnection | null;
    } | null;
}
export declare const LIST_GROUP_VULNS: TypedDocumentNode<ListGroupVulnsResult, ListNamespaceVulnsVars>;
export interface ListInstanceVulnsResult {
    vulnerabilities: VulnConnection | null;
}
export interface ListInstanceVulnsVars extends VulnListVars {
    projectId?: string[] | null;
}
export declare const LIST_INSTANCE_VULNS: TypedDocumentNode<ListInstanceVulnsResult, ListInstanceVulnsVars>;
export interface GetVulnResult {
    vulnerability: VulnerabilityNode | null;
}
export interface GetVulnVars {
    id: string;
}
export declare const GET_VULN: TypedDocumentNode<GetVulnResult, GetVulnVars>;
interface VulnMutationPayload {
    vulnerability: VulnerabilityNode | null;
    errors: string[];
}
export interface DismissVulnResult {
    vulnerabilityDismiss: VulnMutationPayload | null;
}
export interface DismissVulnVars {
    id: string;
    comment?: string | null;
    dismissalReason?: string | null;
}
export declare const DISMISS_VULN: TypedDocumentNode<DismissVulnResult, DismissVulnVars>;
export interface ConfirmVulnResult {
    vulnerabilityConfirm: VulnMutationPayload | null;
}
export interface VulnIdVars {
    id: string;
}
export declare const CONFIRM_VULN: TypedDocumentNode<ConfirmVulnResult, VulnIdVars>;
export interface ResolveVulnResult {
    vulnerabilityResolve: VulnMutationPayload | null;
}
export declare const RESOLVE_VULN: TypedDocumentNode<ResolveVulnResult, VulnIdVars>;
export interface RevertVulnResult {
    vulnerabilityRevertToDetected: VulnMutationPayload | null;
}
export declare const REVERT_VULN: TypedDocumentNode<RevertVulnResult, VulnIdVars>;
export {};
