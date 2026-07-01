"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runDiscovery = runDiscovery;
exports.formatDiscoverySummary = formatDiscoverySummary;
const detector_1 = require("../install/detector");
const container_runtime_1 = require("../docker/container-runtime");
const docker_utils_1 = require("../docker/docker-utils");
function detectDocker() {
    const runtime = (0, container_runtime_1.getContainerRuntime)();
    return {
        dockerInstalled: runtime.runtimeVersion !== undefined,
        dockerRunning: runtime.runtimeAvailable,
        composeInstalled: runtime.composeCmd !== null,
        container: runtime.runtimeAvailable ? (0, docker_utils_1.getContainerInfo)() : undefined,
        instances: [],
        runtime,
    };
}
function runDiscovery() {
    const allClients = (0, detector_1.detectAllClients)();
    const detected = allClients.filter((r) => r.detected);
    const configured = allClients.filter((r) => r.alreadyConfigured);
    const unconfigured = detected.filter((r) => !r.alreadyConfigured);
    const docker = detectDocker();
    const hasExistingSetup = configured.length > 0 || docker.container !== undefined;
    return {
        clients: {
            detected,
            configured,
            unconfigured,
        },
        docker,
        summary: {
            hasExistingSetup,
            clientCount: detected.length,
            configuredCount: configured.length,
            dockerRunning: docker.dockerRunning,
            containerExists: docker.container !== undefined,
        },
    };
}
function formatDiscoverySummary(result) {
    const parts = [];
    if (result.summary.clientCount > 0) {
        const clientNames = result.clients.detected
            .map((c) => {
            const configured = result.clients.configured.some((cc) => cc.client === c.client);
            return configured ? `${c.client} ✓` : c.client;
        })
            .join(', ');
        parts.push(`Clients: ${clientNames}`);
    }
    else {
        parts.push('No MCP clients detected');
    }
    if (result.summary.configuredCount > 0) {
        parts.push(`Configured: ${result.summary.configuredCount} client(s)`);
    }
    if (result.docker.dockerInstalled) {
        const runtimeLabel = result.docker.runtime?.runtime === 'podman' ? 'Podman' : 'Docker';
        if (result.docker.container) {
            const status = result.docker.container.status === 'running' ? 'running' : 'stopped';
            parts.push(`${runtimeLabel}: container ${status}`);
        }
        else {
            parts.push(`${runtimeLabel}: installed, no container`);
        }
    }
    return parts.join(' | ');
}
//# sourceMappingURL=discovery.js.map