import { ToolRegistry, EnhancedToolDefinition } from '../../types';
export declare const refsToolRegistry: ToolRegistry;
export declare function getRefsReadOnlyToolNames(): string[];
export declare function getRefsToolDefinitions(): EnhancedToolDefinition[];
export declare function getFilteredRefsTools(readOnlyMode?: boolean): EnhancedToolDefinition[];
