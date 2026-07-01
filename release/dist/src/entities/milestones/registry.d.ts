import { ToolRegistry, EnhancedToolDefinition } from '../../types';
export declare const milestonesToolRegistry: ToolRegistry;
export declare function getMilestonesReadOnlyToolNames(): string[];
export declare function getMilestonesToolDefinitions(): EnhancedToolDefinition[];
export declare function getFilteredMilestonesTools(readOnlyMode?: boolean): EnhancedToolDefinition[];
