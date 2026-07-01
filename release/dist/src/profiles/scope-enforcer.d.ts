import { ProjectPreset, ScopeConfig } from './types';
export type { ScopeConfig } from './types';
export declare class ScopeViolationError extends Error {
    readonly attemptedTarget: string;
    readonly allowedScope: ScopeConfig;
    constructor(attemptedTarget: string, allowedScope: ScopeConfig);
}
export declare function isInNamespace(projectPath: string, namespace: string): boolean;
export declare class ScopeEnforcer {
    private readonly scope;
    private readonly allowedProjectsSet;
    private readonly allowedGroupsSet;
    private readonly includeSubgroups;
    constructor(scope: ScopeConfig);
    static fromPreset(preset: ProjectPreset): ScopeEnforcer | null;
    isAllowed(projectPath: string): boolean;
    isGroupAllowed(groupPath: string): boolean;
    enforce(projectPath: string): void;
    enforceGroup(groupPath: string): void;
    getScope(): ScopeConfig;
    getScopeDescription(): string;
    hasProjectRestrictions(): boolean;
    hasGroupRestrictions(): boolean;
    hasRestrictions(): boolean;
}
export declare function extractProjectsFromArgs(args: Record<string, unknown>): string[];
export declare function extractGroupsFromArgs(args: Record<string, unknown>): string[];
export declare function enforceArgsScope(enforcer: ScopeEnforcer, args: Record<string, unknown>): void;
