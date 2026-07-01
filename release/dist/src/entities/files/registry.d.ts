import { ToolRegistry, EnhancedToolDefinition } from '../../types';
export declare const filesToolRegistry: ToolRegistry;
export declare function getFilesReadOnlyToolNames(): string[];
export declare function getFilesToolDefinitions(): EnhancedToolDefinition[];
export declare function getFilteredFilesTools(readOnlyMode?: boolean): EnhancedToolDefinition[];
