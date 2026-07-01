#!/usr/bin/env node
interface JsonSchemaProperty {
    type?: string;
    properties?: Record<string, JsonSchemaProperty>;
    oneOf?: JsonSchemaProperty[];
    enum?: unknown[];
    const?: unknown;
    description?: string;
    [key: string]: unknown;
}
interface ActionInfo {
    name: string;
    description: string;
}
interface MarkerMatch {
    toolName: string;
    startIdx: number;
    endIdx: number;
}
declare function extractActions(schema: JsonSchemaProperty): ActionInfo[];
declare function generateActionsTable(actions: ActionInfo[]): string;
declare function findMarkers(content: string): MarkerMatch[];
declare function processFile(filePath: string, toolSchemas: Map<string, JsonSchemaProperty>, content?: string): boolean;
interface Placeholders {
    toolCount: number;
    entityCount: number;
    readonlyToolCount: number;
    actionCount: number;
    version: string;
}
declare function replacePlaceholders(filePath: string, placeholders: Placeholders): boolean;
declare function countEntities(projectRoot: string): number;
declare function getVersion(projectRoot: string): string;
export declare function main(): void;
export { extractActions, generateActionsTable, findMarkers, processFile, replacePlaceholders, countEntities, getVersion, };
export type { JsonSchemaProperty, ActionInfo, MarkerMatch, Placeholders };
