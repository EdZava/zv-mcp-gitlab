import { ToolRegistry, EnhancedToolDefinition } from '../../types';
export declare const membersToolRegistry: ToolRegistry;
export declare function getMembersReadOnlyToolNames(): string[];
export declare function getMembersToolDefinitions(): EnhancedToolDefinition[];
export declare function getFilteredMembersTools(readOnlyMode?: boolean): EnhancedToolDefinition[];
