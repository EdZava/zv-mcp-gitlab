import { EnhancedToolDefinition, ToolDefinition } from './types';
declare class RegistryManager {
    private static instance;
    private registries;
    private readonly toolLookupCaches;
    private readonly toolDefinitionsCaches;
    private readonly toolNamesCaches;
    private readonly filterStatsCaches;
    private readonly verifiedContextUrls;
    private descriptionOverrides;
    private readOnlyToolsCache;
    private constructor();
    static getInstance(): RegistryManager;
    private initializeRegistries;
    private loadDescriptionOverrides;
    private buildReadOnlyToolsList;
    private getReadOnlyTools;
    private loadInstanceContext;
    private getToolExclusionReason;
    private buildFilteredTools;
    private postProcessRelatedReferences;
    private resolveCacheUrl;
    private resolveCache;
    private buildToolLookupCache;
    private invalidateCaches;
    getTool(toolName: string, instanceUrl?: string): EnhancedToolDefinition | null;
    executeTool(toolName: string, args: unknown, instanceUrl?: string): Promise<unknown>;
    refreshCache(instanceUrl?: string): void;
    getAllToolDefinitions(instanceUrl?: string): ToolDefinition[];
    getToolCatalog(instanceUrl?: string): ToolDefinition[];
    getAllToolDefinitionsTierless(): EnhancedToolDefinition[];
    getAllToolDefinitionsUnfiltered(): EnhancedToolDefinition[];
    hasToolHandler(toolName: string, instanceUrl?: string): boolean;
    getAvailableToolNames(instanceUrl?: string): string[];
    private isUnreachableFor;
    private aggregateFilterCounters;
    getFilterStats(instanceUrl?: string): FilterStats;
}
export interface FilterStats {
    available: number;
    total: number;
    filteredByScopes: number;
    filteredByReadOnly: number;
    filteredByTier: number;
    filteredByDeniedRegex: number;
    filteredByActionDenial: number;
    filteredByAdmin: number;
}
export { RegistryManager };
