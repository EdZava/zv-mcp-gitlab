import { ToolRegistry, EnhancedToolDefinition } from '../../types';
export declare const snippetsToolRegistry: ToolRegistry;
export declare function getSnippetsReadOnlyToolNames(): string[];
export declare function getSnippetsToolDefinitions(): EnhancedToolDefinition[];
export declare function getFilteredSnippetsTools(readOnlyMode?: boolean): EnhancedToolDefinition[];
