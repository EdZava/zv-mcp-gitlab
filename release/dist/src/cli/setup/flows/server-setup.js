"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.runServerSetupFlow = runServerSetupFlow;
const p = __importStar(require("@clack/prompts"));
const crypto_1 = require("crypto");
const docker_utils_1 = require("../../docker/docker-utils");
const container_runtime_1 = require("../../docker/container-runtime");
const types_1 = require("../../docker/types");
const tool_selection_1 = require("./tool-selection");
async function runServerSetupFlow(discovery) {
    const status = discovery.docker;
    const runtime = (0, container_runtime_1.getContainerRuntime)();
    const runtimeLabel = runtime.runtime === 'podman' ? 'Podman' : 'Docker';
    if (!status.dockerInstalled) {
        p.log.error('No container runtime (Docker or Podman) is installed.');
        p.note('Install Docker: https://docs.docker.com/get-docker/\nOr Podman: https://podman.io/getting-started/installation', 'Install Runtime');
        return { success: false, mode: 'server', error: 'Container runtime not installed' };
    }
    if (!status.composeInstalled) {
        p.log.error(`No compose tool found for ${runtimeLabel}.`);
        p.note(`A compose tool is required.\nFor Docker: bundled with Docker Desktop or 'docker compose'\nFor Podman: install podman-compose`, 'Install Compose');
        return { success: false, mode: 'server', error: 'Compose tool not installed' };
    }
    const deploymentType = await p.select({
        message: 'Deployment type:',
        options: [
            {
                value: 'standalone',
                label: 'Docker standalone',
                hint: 'Stateless, for dev/testing',
            },
            {
                value: 'external-db',
                label: 'Docker + external PostgreSQL',
                hint: 'Production with existing database',
            },
            {
                value: 'compose-bundle',
                label: 'Docker Compose bundle',
                hint: 'All-in-one with postgres included',
            },
        ],
    });
    if (p.isCancel(deploymentType)) {
        return { success: false, mode: 'server', error: 'Cancelled' };
    }
    const port = await p.text({
        message: 'SSE port for MCP server:',
        placeholder: '3333',
        initialValue: '3333',
        validate: (value) => {
            const num = parseInt(value ?? '', 10);
            if (isNaN(num) || num < 1 || num > 65535) {
                return 'Port must be between 1 and 65535';
            }
            return undefined;
        },
    });
    if (p.isCancel(port)) {
        return { success: false, mode: 'server', error: 'Cancelled' };
    }
    const enableOAuth = await p.confirm({
        message: 'Enable OAuth for multi-user support?',
        initialValue: deploymentType !== 'standalone',
    });
    if (p.isCancel(enableOAuth)) {
        return { success: false, mode: 'server', error: 'Cancelled' };
    }
    let oauthSessionSecret;
    let databaseUrl;
    if (enableOAuth) {
        oauthSessionSecret = (0, crypto_1.randomBytes)(32).toString('hex');
        p.log.info('Session secret generated and stored in .env file (not in compose).');
        if (deploymentType === 'external-db') {
            const dbUrl = await p.text({
                message: 'PostgreSQL DATABASE_URL:',
                placeholder: 'postgresql://user:pass@host:5432/gitlab_mcp',
                validate: (v) => {
                    if (!v?.startsWith('postgresql://')) {
                        return 'Must be a valid PostgreSQL URL';
                    }
                    return undefined;
                },
            });
            if (p.isCancel(dbUrl)) {
                return { success: false, mode: 'server', error: 'Cancelled' };
            }
            databaseUrl = dbUrl;
        }
    }
    const toolConfig = await (0, tool_selection_1.runToolSelectionFlow)();
    if (!toolConfig) {
        return { success: false, mode: 'server', error: 'Cancelled' };
    }
    const toolEnv = {};
    if (toolConfig.mode === 'preset' && toolConfig.preset) {
        toolEnv.GITLAB_PROFILE = toolConfig.preset;
    }
    else if (toolConfig.mode === 'advanced' && toolConfig.envOverrides) {
        Object.assign(toolEnv, toolConfig.envOverrides);
    }
    else if (toolConfig.mode === 'manual' && toolConfig.enabledCategories) {
        (0, tool_selection_1.applyManualCategories)(toolConfig.enabledCategories, toolEnv);
    }
    const config = {
        ...types_1.DEFAULT_DOCKER_CONFIG,
        port: parseInt(port, 10),
        deploymentType,
        oauthEnabled: enableOAuth,
        oauthSessionSecret,
        databaseUrl,
        environment: Object.keys(toolEnv).length > 0 ? toolEnv : undefined,
    };
    const spinner = p.spinner();
    spinner.start('Creating Docker configuration...');
    try {
        (0, docker_utils_1.initDockerConfig)(config);
        spinner.stop('Docker configuration created!');
        const startNow = await p.confirm({
            message: 'Start the container now?',
            initialValue: true,
        });
        if (!p.isCancel(startNow) && startNow) {
            spinner.start('Starting container...');
            const result = (0, docker_utils_1.startContainer)();
            if (result.success) {
                spinner.stop('Container started!');
                p.log.success(`MCP server running at http://localhost:${port}`);
            }
            else {
                spinner.stop('Failed to start container');
                p.log.error(result.error ?? 'Unknown error');
            }
        }
        return {
            success: true,
            mode: 'server',
            dockerConfig: {
                port: parseInt(port, 10),
                deploymentType,
                instances: [],
            },
        };
    }
    catch (error) {
        spinner.stop('Configuration failed');
        const msg = error instanceof Error ? error.message : String(error);
        p.log.error(msg);
        return { success: false, mode: 'server', error: msg };
    }
}
//# sourceMappingURL=server-setup.js.map