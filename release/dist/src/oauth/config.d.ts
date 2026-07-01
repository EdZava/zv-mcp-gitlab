import { z } from 'zod';
declare const OAuthConfigSchema: z.ZodObject<{
    enabled: z.ZodLiteral<true>;
    sessionSecret: z.ZodString;
    gitlabClientId: z.ZodString;
    gitlabClientSecret: z.ZodOptional<z.ZodString>;
    gitlabScopes: z.ZodDefault<z.ZodString>;
    tokenTtl: z.ZodDefault<z.ZodNumber>;
    refreshTokenTtl: z.ZodDefault<z.ZodNumber>;
    devicePollInterval: z.ZodDefault<z.ZodNumber>;
    deviceTimeout: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export type OAuthConfig = z.infer<typeof OAuthConfigSchema>;
export declare function loadOAuthConfig(): OAuthConfig | null;
export declare class ConfigurationError extends Error {
    readonly guidance: string;
    constructor(guidance: string);
}
export declare function validateStaticConfig(): void;
export declare function isOAuthEnabled(): boolean;
export declare function resetOAuthConfigCache(): void;
export declare function getAuthModeDescription(): string;
export declare function isStaticTokenConfigured(): boolean;
export declare function isAuthenticationConfigured(): boolean;
export {};
