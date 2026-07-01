import { z } from 'zod';
export declare const InstanceOAuthConfigSchema: z.ZodObject<{
    clientId: z.ZodString;
    clientSecret: z.ZodOptional<z.ZodString>;
    scopes: z.ZodDefault<z.ZodString>;
}, z.core.$strip>;
export declare const InstanceRateLimitConfigSchema: z.ZodObject<{
    maxConcurrent: z.ZodDefault<z.ZodNumber>;
    queueSize: z.ZodDefault<z.ZodNumber>;
    queueTimeout: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export declare const GitLabInstanceConfigSchema: z.ZodObject<{
    url: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
    label: z.ZodOptional<z.ZodString>;
    oauth: z.ZodOptional<z.ZodObject<{
        clientId: z.ZodString;
        clientSecret: z.ZodOptional<z.ZodString>;
        scopes: z.ZodDefault<z.ZodString>;
    }, z.core.$strip>>;
    rateLimit: z.ZodOptional<z.ZodObject<{
        maxConcurrent: z.ZodDefault<z.ZodNumber>;
        queueSize: z.ZodDefault<z.ZodNumber>;
        queueTimeout: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>>;
    insecureSkipVerify: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export declare const InstanceDefaultsSchema: z.ZodObject<{
    rateLimit: z.ZodOptional<z.ZodObject<{
        maxConcurrent: z.ZodDefault<z.ZodNumber>;
        queueSize: z.ZodDefault<z.ZodNumber>;
        queueTimeout: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>>;
    oauth: z.ZodOptional<z.ZodObject<{
        scopes: z.ZodDefault<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const InstancesConfigFileSchema: z.ZodObject<{
    instances: z.ZodArray<z.ZodObject<{
        url: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
        label: z.ZodOptional<z.ZodString>;
        oauth: z.ZodOptional<z.ZodObject<{
            clientId: z.ZodString;
            clientSecret: z.ZodOptional<z.ZodString>;
            scopes: z.ZodDefault<z.ZodString>;
        }, z.core.$strip>>;
        rateLimit: z.ZodOptional<z.ZodObject<{
            maxConcurrent: z.ZodDefault<z.ZodNumber>;
            queueSize: z.ZodDefault<z.ZodNumber>;
            queueTimeout: z.ZodDefault<z.ZodNumber>;
        }, z.core.$strip>>;
        insecureSkipVerify: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>>;
    defaults: z.ZodOptional<z.ZodObject<{
        rateLimit: z.ZodOptional<z.ZodObject<{
            maxConcurrent: z.ZodDefault<z.ZodNumber>;
            queueSize: z.ZodDefault<z.ZodNumber>;
            queueTimeout: z.ZodDefault<z.ZodNumber>;
        }, z.core.$strip>>;
        oauth: z.ZodOptional<z.ZodObject<{
            scopes: z.ZodDefault<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const ConnectionStatusSchema: z.ZodEnum<{
    healthy: "healthy";
    degraded: "degraded";
    offline: "offline";
}>;
export type InstanceOAuthConfig = z.infer<typeof InstanceOAuthConfigSchema>;
export type InstanceRateLimitConfig = z.infer<typeof InstanceRateLimitConfigSchema>;
export type GitLabInstanceConfig = z.infer<typeof GitLabInstanceConfigSchema>;
export type InstanceDefaults = z.infer<typeof InstanceDefaultsSchema>;
export type InstancesConfigFile = z.infer<typeof InstancesConfigFileSchema>;
export type ConnectionStatus = z.infer<typeof ConnectionStatusSchema>;
export interface GitLabInstanceState extends GitLabInstanceConfig {
    connectionStatus: ConnectionStatus;
    lastHealthCheck: Date | null;
    introspectionCache: CachedIntrospection | null;
}
export interface CachedIntrospection {
    version: string;
    tier: string;
    features: Record<string, boolean>;
    schemaInfo: unknown;
    cachedAt: Date;
}
export declare function parseInstanceUrlString(urlString: string): GitLabInstanceConfig;
export declare function validateInstancesConfig(config: unknown): InstancesConfigFile;
export declare function applyInstanceDefaults(instance: GitLabInstanceConfig, defaults?: InstanceDefaults): GitLabInstanceConfig;
