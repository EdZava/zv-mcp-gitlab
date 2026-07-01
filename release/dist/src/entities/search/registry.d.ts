import { ToolRegistry, EnhancedToolDefinition } from '../../types';
export declare const searchToolRegistry: ToolRegistry;
export declare function getSearchReadOnlyToolNames(): string[];
export declare function getSearchToolDefinitions(): EnhancedToolDefinition[];
export declare function getFilteredSearchTools(readOnlyMode?: boolean): EnhancedToolDefinition[];
