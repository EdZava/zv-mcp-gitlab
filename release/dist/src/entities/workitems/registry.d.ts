import { ToolRegistry, EnhancedToolDefinition } from '../../types';
export declare const workitemsToolRegistry: ToolRegistry;
export declare function getWorkitemsReadOnlyToolNames(): string[];
export declare function getWorkitemsToolDefinitions(): EnhancedToolDefinition[];
export declare function getFilteredWorkitemsTools(readOnlyMode?: boolean): EnhancedToolDefinition[];
