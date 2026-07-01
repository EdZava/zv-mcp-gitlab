import { ToolRegistry, EnhancedToolDefinition } from '../../types';
export declare const pipelinesToolRegistry: ToolRegistry;
export declare function getPipelinesReadOnlyToolNames(): string[];
export declare function getPipelinesToolDefinitions(): EnhancedToolDefinition[];
export declare function getFilteredPipelinesTools(readOnlyMode?: boolean): EnhancedToolDefinition[];
