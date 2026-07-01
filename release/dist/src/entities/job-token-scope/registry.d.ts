import { ToolRegistry, EnhancedToolDefinition } from '../../types';
export declare const jobTokenScopeToolRegistry: ToolRegistry;
export declare function getJobTokenScopeReadOnlyToolNames(): string[];
export declare function getJobTokenScopeToolDefinitions(): EnhancedToolDefinition[];
export declare function getFilteredJobTokenScopeTools(readOnlyMode?: boolean): EnhancedToolDefinition[];
