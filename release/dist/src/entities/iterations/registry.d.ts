import { ToolRegistry, EnhancedToolDefinition } from '../../types';
export declare const iterationsToolRegistry: ToolRegistry;
export declare function getIterationsReadOnlyToolNames(): string[];
export declare function getIterationsToolDefinitions(): EnhancedToolDefinition[];
export declare function getFilteredIterationsTools(readOnlyMode?: boolean): EnhancedToolDefinition[];
