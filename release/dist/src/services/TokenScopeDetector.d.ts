import { z } from 'zod';
export type GitLabTokenType = 'personal_access_token' | 'project_access_token' | 'group_access_token' | 'oauth' | 'unknown';
declare const GitLabScopeSchema: z.ZodEnum<{
    api: "api";
    read_api: "read_api";
    read_user: "read_user";
    read_repository: "read_repository";
    write_repository: "write_repository";
    read_registry: "read_registry";
    write_registry: "write_registry";
    sudo: "sudo";
    admin_mode: "admin_mode";
    create_runner: "create_runner";
    manage_runner: "manage_runner";
    ai_features: "ai_features";
    k8s_proxy: "k8s_proxy";
}>;
export type GitLabScope = z.infer<typeof GitLabScopeSchema>;
export interface TokenScopeInfo {
    name: string;
    scopes: GitLabScope[];
    expiresAt: string | null;
    active: boolean;
    tokenType: GitLabTokenType;
    hasGraphQLAccess: boolean;
    hasWriteAccess: boolean;
    daysUntilExpiry: number | null;
}
export declare function detectTokenScopes(baseUrl?: string): Promise<TokenScopeInfo | null>;
export declare function isToolAvailableForScopes(toolName: string, scopes: GitLabScope[]): boolean;
export declare function getToolsForScopes(scopes: GitLabScope[]): string[];
export declare function getToolScopeRequirements(): Record<string, GitLabScope[]>;
export declare function getTokenCreationUrl(baseUrl: string, scopes?: string[]): string;
export declare function logTokenScopeInfo(info: TokenScopeInfo, totalTools: number, baseUrl?: string): void;
export {};
