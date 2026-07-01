declare const TransportModeObj: {
    readonly STDIO: "stdio";
    readonly SSE: "sse";
    readonly STREAMABLE_HTTP: "streamable-http";
    readonly DUAL: "dual";
};
export { TransportModeObj as TransportMode };
export type TransportMode = (typeof TransportModeObj)[keyof typeof TransportModeObj];
export interface GitLabAPIResponse<T = unknown> {
    data: T;
    status: number;
    statusText: string;
}
export interface ToolDefinition {
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
}
export interface FeatureGate {
    envVar: string;
    defaultValue: boolean;
}
export interface ToolRequirement {
    tier?: 'free' | 'premium' | 'ultimate';
    minVersion?: string;
    requiresAdmin?: boolean;
    notes?: string;
}
export interface ToolRequirements {
    default: ToolRequirement;
    actions?: Record<string, ToolRequirement>;
    parameters?: Record<string, ToolRequirement>;
}
export interface EnhancedToolDefinition extends ToolDefinition {
    handler: (args: unknown) => Promise<unknown>;
    gate?: FeatureGate;
    requirements?: ToolRequirements;
    idempotent?: boolean;
}
export type ToolRegistry = Map<string, EnhancedToolDefinition>;
