import { ToolRegistry, EnhancedToolDefinition } from '../../types';
export declare const integrationsToolRegistry: ToolRegistry;
export declare function getIntegrationsReadOnlyToolNames(): string[];
export declare function getIntegrationsToolDefinitions(): EnhancedToolDefinition[];
export declare function getFilteredIntegrationsTools(readOnlyMode?: boolean): EnhancedToolDefinition[];
