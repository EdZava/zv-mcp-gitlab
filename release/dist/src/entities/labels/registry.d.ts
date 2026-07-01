import { ToolRegistry, EnhancedToolDefinition } from '../../types';
export declare const labelsToolRegistry: ToolRegistry;
export declare function getLabelsReadOnlyToolNames(): string[];
export declare function getLabelsToolDefinitions(): EnhancedToolDefinition[];
export declare function getFilteredLabelsTools(readOnlyMode?: boolean): EnhancedToolDefinition[];
