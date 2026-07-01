import { z } from 'zod';
export declare const GITLAB_DEFAULT_PER_PAGE = 20;
export declare const GITLAB_MAX_PER_PAGE = 100;
export declare function paginationFields(defaultPerPage?: number, maxPerPage?: number): {
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodOptional<z.ZodNumber>;
};
export declare const flexibleBoolean: z.ZodPreprocess<z.ZodBoolean>;
export declare const flexibleBooleanNullable: z.ZodNullable<z.ZodPreprocess<z.ZodBoolean>> | z.ZodDefault<z.ZodNullable<z.ZodPreprocess<z.ZodBoolean>>>;
export declare const requiredId: z.ZodPreprocess<z.ZodCoercedString<unknown>>;
export declare function assertDefined<T>(value: T | undefined, fieldName: string): asserts value is T;
export declare function validateScopeId(data: {
    scope: 'project' | 'group';
    projectId?: string;
    groupId?: string;
}): boolean;
export declare function assertActionAllowed(toolName: string, action: string): void;
