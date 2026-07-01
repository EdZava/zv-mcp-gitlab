import { ToolRegistry, EnhancedToolDefinition } from '../../types';
export declare const releasesToolRegistry: ToolRegistry;
export declare function getReleasesReadOnlyToolNames(): string[];
export declare function getReleasesToolDefinitions(): EnhancedToolDefinition[];
export declare function getFilteredReleasesTools(readOnlyMode?: boolean): EnhancedToolDefinition[];
