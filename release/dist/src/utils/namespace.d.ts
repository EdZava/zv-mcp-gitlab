export declare function extractNamespaceFromPath(projectPath: string): string | undefined;
export declare function isLikelyProjectPath(namespacePath: string): boolean;
export declare function detectNamespaceType(namespacePath: string): Promise<'project' | 'group'>;
export declare function resolveNamespaceForAPI(namespacePath: string): Promise<{
    entityType: 'projects' | 'groups';
    encodedPath: string;
}>;
