import { ToolRegistry, EnhancedToolDefinition } from '../../types';
export declare const coreToolRegistry: ToolRegistry;
export declare function getCoreReadOnlyToolNames(): string[];
export declare function getCoreToolDefinitions(): EnhancedToolDefinition[];
export declare function getFilteredCoreTools(readOnlyMode?: boolean): EnhancedToolDefinition[];
