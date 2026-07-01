import { ToolRegistry, EnhancedToolDefinition } from '../../types';
export declare const contextToolRegistry: ToolRegistry;
export declare function getContextReadOnlyToolNames(): string[];
export declare function getContextToolDefinitions(): EnhancedToolDefinition[];
export declare function getFilteredContextTools(_readOnlyMode?: boolean): EnhancedToolDefinition[];
