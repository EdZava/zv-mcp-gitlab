import { ToolRegistry, EnhancedToolDefinition } from '../../types';
export declare const wikiToolRegistry: ToolRegistry;
export declare function getWikiReadOnlyToolNames(): string[];
export declare function getWikiToolDefinitions(): EnhancedToolDefinition[];
export declare function getFilteredWikiTools(readOnlyMode?: boolean): EnhancedToolDefinition[];
