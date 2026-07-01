import { GraphQLClient } from '../graphql/client';
export interface FieldInfo {
    name: string;
    type: {
        name: string | null;
        kind: string;
        ofType?: {
            name: string | null;
            kind: string;
        } | null;
    };
}
export interface TypeInfo {
    name: string;
    fields: FieldInfo[] | null;
    enumValues?: Array<{
        name: string;
        description?: string;
    }> | null;
}
export interface SchemaInfo {
    workItemWidgetTypes: string[];
    typeDefinitions: Map<string, TypeInfo>;
    availableFeatures: Set<string>;
}
export declare class SchemaIntrospector {
    private client;
    private cachedSchema;
    constructor(client: GraphQLClient);
    introspectSchema(): Promise<SchemaInfo>;
    isWidgetTypeAvailable(widgetType: string): boolean;
    getFieldsForType(typeName: string): FieldInfo[];
    hasField(typeName: string, fieldName: string): boolean;
    getAvailableWidgetTypes(): string[];
    generateSafeWidgetQuery(requestedWidgets: string[]): string;
    private generateSafeFieldSelections;
    rehydrate(schema: SchemaInfo): void;
    getCachedSchema(): SchemaInfo | null;
    clearCache(): void;
}
