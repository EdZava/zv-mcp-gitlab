import { z } from 'zod';
import { InstanceSummary } from '../services/InstanceRegistry.js';
import { ConnectionStatus } from '../config/instances-schema.js';
export declare const InstanceStatusSchema: z.ZodObject<{
    url: z.ZodString;
    label: z.ZodNullable<z.ZodString>;
    status: z.ZodEnum<{
        healthy: "healthy";
        degraded: "degraded";
        offline: "offline";
    }>;
    version: z.ZodNullable<z.ZodString>;
    tier: z.ZodNullable<z.ZodString>;
    introspected: z.ZodBoolean;
    rateLimit: z.ZodObject<{
        activeRequests: z.ZodNumber;
        maxConcurrent: z.ZodNumber;
        queuedRequests: z.ZodNumber;
        queueSize: z.ZodNumber;
        totalRequests: z.ZodNumber;
        rejectedRequests: z.ZodNumber;
    }, z.core.$strip>;
    latency: z.ZodObject<{
        avgMs: z.ZodNumber;
    }, z.core.$strip>;
    lastHealthCheck: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export type InstanceStatus = z.infer<typeof InstanceStatusSchema>;
export declare const DashboardMetricsSchema: z.ZodObject<{
    server: z.ZodObject<{
        version: z.ZodString;
        uptime: z.ZodNumber;
        mode: z.ZodEnum<{
            oauth: "oauth";
            none: "none";
            token: "token";
        }>;
        readOnly: z.ZodBoolean;
        toolsEnabled: z.ZodNumber;
        toolsTotal: z.ZodNumber;
    }, z.core.$strip>;
    instances: z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        label: z.ZodNullable<z.ZodString>;
        status: z.ZodEnum<{
            healthy: "healthy";
            degraded: "degraded";
            offline: "offline";
        }>;
        version: z.ZodNullable<z.ZodString>;
        tier: z.ZodNullable<z.ZodString>;
        introspected: z.ZodBoolean;
        rateLimit: z.ZodObject<{
            activeRequests: z.ZodNumber;
            maxConcurrent: z.ZodNumber;
            queuedRequests: z.ZodNumber;
            queueSize: z.ZodNumber;
            totalRequests: z.ZodNumber;
            rejectedRequests: z.ZodNumber;
        }, z.core.$strip>;
        latency: z.ZodObject<{
            avgMs: z.ZodNumber;
        }, z.core.$strip>;
        lastHealthCheck: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>>;
    sessions: z.ZodObject<{
        total: z.ZodNumber;
        byInstance: z.ZodRecord<z.ZodString, z.ZodNumber>;
    }, z.core.$strip>;
    config: z.ZodObject<{
        source: z.ZodString;
        sourceDetails: z.ZodString;
        oauthEnabled: z.ZodBoolean;
    }, z.core.$strip>;
}, z.core.$strip>;
export type DashboardMetrics = z.infer<typeof DashboardMetricsSchema>;
export declare function determineInstanceStatus(instance: InstanceSummary): ConnectionStatus;
export declare function collectMetrics(): DashboardMetrics;
export declare function formatUptime(seconds: number): string;
