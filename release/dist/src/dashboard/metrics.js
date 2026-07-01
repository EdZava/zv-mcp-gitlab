"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardMetricsSchema = exports.InstanceStatusSchema = void 0;
exports.determineInstanceStatus = determineInstanceStatus;
exports.collectMetrics = collectMetrics;
exports.formatUptime = formatUptime;
const zod_1 = require("zod");
const InstanceRegistry_js_1 = require("../services/InstanceRegistry.js");
const session_manager_js_1 = require("../session-manager.js");
const config_js_1 = require("../config.js");
const index_js_1 = require("../oauth/index.js");
const registry_manager_js_1 = require("../registry-manager.js");
const serverStartTime = Date.now();
exports.InstanceStatusSchema = zod_1.z.object({
    url: zod_1.z.string().describe('GitLab instance URL'),
    label: zod_1.z.string().nullable().describe('Human-readable label for UI display'),
    status: zod_1.z.enum(['healthy', 'degraded', 'offline']).describe('Instance health status'),
    version: zod_1.z.string().nullable().describe('GitLab version'),
    tier: zod_1.z.string().nullable().describe('Instance tier (free/premium/ultimate)'),
    introspected: zod_1.z.boolean().describe('Whether schema introspection was successful'),
    rateLimit: zod_1.z
        .object({
        activeRequests: zod_1.z.number().describe('Current number of active requests'),
        maxConcurrent: zod_1.z.number().describe('Maximum concurrent requests allowed'),
        queuedRequests: zod_1.z.number().describe('Current number of queued requests'),
        queueSize: zod_1.z.number().describe('Maximum queue size'),
        totalRequests: zod_1.z.number().describe('Total requests processed'),
        rejectedRequests: zod_1.z.number().describe('Total requests rejected due to full queue'),
    })
        .describe('Rate limit metrics for this instance'),
    latency: zod_1.z
        .object({
        avgMs: zod_1.z.number().describe('Average queue wait time in milliseconds'),
    })
        .describe('Latency metrics'),
    lastHealthCheck: zod_1.z.string().nullable().describe('ISO timestamp of last health check'),
});
exports.DashboardMetricsSchema = zod_1.z.object({
    server: zod_1.z
        .object({
        version: zod_1.z.string().describe('Server version'),
        uptime: zod_1.z.number().describe('Server uptime in seconds'),
        mode: zod_1.z.enum(['oauth', 'token', 'none']).describe('Authentication mode'),
        readOnly: zod_1.z.boolean().describe('Whether server is in read-only mode'),
        toolsEnabled: zod_1.z.number().describe('Number of enabled tools'),
        toolsTotal: zod_1.z.number().describe('Total number of available tools'),
    })
        .describe('Server information'),
    instances: zod_1.z.array(exports.InstanceStatusSchema).describe('Registered GitLab instances'),
    sessions: zod_1.z
        .object({
        total: zod_1.z.number().describe('Total active sessions'),
        byInstance: zod_1.z.record(zod_1.z.string(), zod_1.z.number()).describe('Sessions per instance URL'),
    })
        .describe('Session statistics (anonymized)'),
    config: zod_1.z
        .object({
        source: zod_1.z.string().describe('Configuration source type'),
        sourceDetails: zod_1.z.string().describe('Configuration source details'),
        oauthEnabled: zod_1.z.boolean().describe('Whether OAuth is enabled'),
    })
        .describe('Configuration information'),
});
function determineInstanceStatus(instance) {
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    if (instance.lastHealthCheck === null) {
        return 'healthy';
    }
    const lastCheckMs = instance.lastHealthCheck.getTime();
    if (lastCheckMs < fiveMinutesAgo) {
        return 'offline';
    }
    const metrics = instance.rateLimit;
    if (metrics.avgQueueWaitMs > 2000) {
        return 'degraded';
    }
    if (metrics.queuedRequests > metrics.queueSize * 0.5) {
        return 'degraded';
    }
    if (metrics.requestsTotal > 0 && metrics.requestsRejected / metrics.requestsTotal > 0.1) {
        return 'degraded';
    }
    return 'healthy';
}
function toInstanceStatus(summary) {
    const status = determineInstanceStatus(summary);
    return {
        url: summary.url,
        label: summary.label ?? null,
        status,
        version: summary.introspection.version,
        tier: summary.introspection.tier,
        introspected: summary.introspection.version !== null && !summary.introspection.isExpired,
        rateLimit: {
            activeRequests: summary.rateLimit.activeRequests,
            maxConcurrent: summary.rateLimit.maxConcurrent,
            queuedRequests: summary.rateLimit.queuedRequests,
            queueSize: summary.rateLimit.queueSize,
            totalRequests: summary.rateLimit.requestsTotal,
            rejectedRequests: summary.rateLimit.requestsRejected,
        },
        latency: {
            avgMs: summary.rateLimit.avgQueueWaitMs,
        },
        lastHealthCheck: summary.lastHealthCheck?.toISOString() ?? null,
    };
}
function getAuthMode() {
    if ((0, index_js_1.isOAuthEnabled)()) {
        return 'oauth';
    }
    if (config_js_1.GITLAB_TOKEN) {
        return 'token';
    }
    return 'none';
}
function getToolCounts() {
    try {
        const registry = registry_manager_js_1.RegistryManager.getInstance();
        const catalogTools = registry.getToolCatalog();
        const discoveryTools = registry.getAllToolDefinitions();
        return {
            enabled: discoveryTools.length,
            total: catalogTools.length,
        };
    }
    catch {
        return { enabled: 0, total: 0 };
    }
}
function collectMetrics() {
    const instanceRegistry = InstanceRegistry_js_1.InstanceRegistry.getInstance();
    const sessionManager = (0, session_manager_js_1.getSessionManager)();
    const instanceSummaries = instanceRegistry.list();
    const instances = instanceSummaries.map(toInstanceStatus);
    if (instances.length === 0 && config_js_1.GITLAB_BASE_URL) {
        instances.push({
            url: config_js_1.GITLAB_BASE_URL,
            label: null,
            status: 'healthy',
            version: null,
            tier: null,
            introspected: false,
            rateLimit: {
                activeRequests: 0,
                maxConcurrent: 100,
                queuedRequests: 0,
                queueSize: 500,
                totalRequests: 0,
                rejectedRequests: 0,
            },
            latency: { avgMs: 0 },
            lastHealthCheck: null,
        });
    }
    const configSource = instanceRegistry.getConfigSource();
    const toolCounts = getToolCounts();
    const uptimeSeconds = Math.floor((Date.now() - serverStartTime) / 1000);
    const sessionsByInstanceMap = sessionManager.getSessionsByInstance();
    const sessionsByInstance = Object.fromEntries(sessionsByInstanceMap);
    return {
        server: {
            version: config_js_1.packageVersion,
            uptime: uptimeSeconds,
            mode: getAuthMode(),
            readOnly: config_js_1.GITLAB_READ_ONLY_MODE,
            toolsEnabled: toolCounts.enabled,
            toolsTotal: toolCounts.total,
        },
        instances,
        sessions: {
            total: sessionManager.activeSessionCount,
            byInstance: sessionsByInstance,
        },
        config: {
            source: configSource.source,
            sourceDetails: configSource.details,
            oauthEnabled: (0, index_js_1.isOAuthEnabled)(),
        },
    };
}
function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const parts = [];
    if (days > 0)
        parts.push(`${days}d`);
    if (hours > 0)
        parts.push(`${hours}h`);
    if (minutes > 0 || parts.length === 0)
        parts.push(`${minutes}m`);
    return parts.join(' ');
}
//# sourceMappingURL=metrics.js.map