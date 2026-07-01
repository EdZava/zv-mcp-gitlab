import { ToolRegistry, EnhancedToolDefinition } from '../../types';
export declare const variablesToolRegistry: ToolRegistry;
export declare function getVariablesReadOnlyToolNames(): string[];
export declare function getVariablesToolDefinitions(): EnhancedToolDefinition[];
export declare function getFilteredVariablesTools(readOnlyMode?: boolean): EnhancedToolDefinition[];
