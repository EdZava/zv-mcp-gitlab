export interface ProjectIdentifier {
    identifier: string;
    isNumericId: boolean;
    originalValue: string;
}
export declare function processProjectIdentifier(input: string): ProjectIdentifier;
export declare function safeEncodeProjectId(projectId: string): string;
export declare function normalizeProjectId(projectId: string): string;
export declare function validateProjectIdentifier(input: string): string | null;
