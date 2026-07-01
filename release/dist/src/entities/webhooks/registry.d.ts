import { ToolRegistry, EnhancedToolDefinition } from '../../types';
export declare const webhooksToolRegistry: ToolRegistry;
export declare function getWebhooksReadOnlyToolNames(): string[];
export declare function getWebhooksToolDefinitions(): EnhancedToolDefinition[];
export declare function getFilteredWebhooksTools(readOnlyMode?: boolean): EnhancedToolDefinition[];
