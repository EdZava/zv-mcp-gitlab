export declare function setDetectedSchemaMode(clientName?: string): void;
export declare function clearDetectedSchemaMode(): void;
interface JSONSchemaProperty {
    type?: string;
    enum?: string[];
    const?: string;
    description?: string;
    [key: string]: unknown;
}
interface JSONSchema {
    type?: string;
    properties?: Record<string, JSONSchemaProperty>;
    required?: string[];
    description?: string;
    oneOf?: JSONSchema[];
    anyOf?: JSONSchema[];
    allOf?: JSONSchema[];
    discriminator?: {
        propertyName: string;
    };
    $schema?: string;
    [key: string]: unknown;
}
export declare function filterDiscriminatedUnionActions(schema: JSONSchema, toolName: string): JSONSchema;
export declare function flattenDiscriminatedUnion(schema: JSONSchema): JSONSchema;
export declare function applyDescriptionOverrides(schema: JSONSchema, toolName: string): JSONSchema;
export declare function transformToolSchema(toolName: string, inputSchema: JSONSchema): JSONSchema;
export declare function stripTierRestrictedParameters(schema: JSONSchema, restrictedParams: string[]): JSONSchema;
export declare function shouldRemoveTool(toolName: string, allActions: string[]): boolean;
export declare function extractActionsFromSchema(inputSchema: JSONSchema): string[];
export {};
