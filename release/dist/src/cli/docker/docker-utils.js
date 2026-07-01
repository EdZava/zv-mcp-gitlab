"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expandPath = void 0;
exports.getExpandedConfigDir = getExpandedConfigDir;
exports.isDockerInstalled = isDockerInstalled;
exports.isDockerRunning = isDockerRunning;
exports.isComposeInstalled = isComposeInstalled;
exports.getContainerInfo = getContainerInfo;
exports.getDockerStatus = getDockerStatus;
exports.generateDockerCompose = generateDockerCompose;
exports.generateInstancesYaml = generateInstancesYaml;
exports.loadInstances = loadInstances;
exports.saveInstances = saveInstances;
exports.saveDockerCompose = saveDockerCompose;
exports.runComposeCommand = runComposeCommand;
exports.startContainer = startContainer;
exports.stopContainer = stopContainer;
exports.restartContainer = restartContainer;
exports.upgradeContainer = upgradeContainer;
exports.tailLogs = tailLogs;
exports.getLogs = getLogs;
exports.addInstance = addInstance;
exports.removeInstance = removeInstance;
exports.initDockerConfig = initDockerConfig;
exports.saveEnvFile = saveEnvFile;
const child_process_1 = require("child_process");
const crypto_1 = require("crypto");
const fs_1 = require("fs");
const path_1 = require("path");
const yaml_1 = __importDefault(require("yaml"));
const types_1 = require("./types");
const container_runtime_1 = require("./container-runtime");
const path_utils_js_1 = require("../utils/path-utils.js");
var path_utils_js_2 = require("../utils/path-utils.js");
Object.defineProperty(exports, "expandPath", { enumerable: true, get: function () { return path_utils_js_2.expandPath; } });
function getExpandedConfigDir() {
    return (0, path_utils_js_1.expandPath)((0, types_1.getConfigDir)());
}
function isDockerInstalled() {
    const runtime = (0, container_runtime_1.getContainerRuntime)();
    return runtime.runtimeVersion !== undefined;
}
function isDockerRunning() {
    const runtime = (0, container_runtime_1.getContainerRuntime)();
    return runtime.runtimeAvailable;
}
function isComposeInstalled() {
    const runtime = (0, container_runtime_1.getContainerRuntime)();
    return runtime.composeCmd !== null;
}
function isValidContainerName(name) {
    return /^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(name);
}
function getContainerInfo(containerName = 'gitlab-mcp') {
    if (!isValidContainerName(containerName)) {
        console.error(`Invalid container name: "${containerName}". Name must match [a-zA-Z0-9][a-zA-Z0-9_.-]*`);
        return undefined;
    }
    try {
        const runtime = (0, container_runtime_1.getContainerRuntime)();
        const result = (0, child_process_1.spawnSync)(runtime.runtimeCmd, [
            'ps',
            '-a',
            '--filter',
            `name=${containerName}`,
            '--format',
            '{{.ID}}|{{.Names}}|{{.Image}}|{{.Status}}|{{.Ports}}|{{.CreatedAt}}',
        ], {
            stdio: 'pipe',
            encoding: 'utf8',
        });
        if (result.status !== 0 || !result.stdout.trim()) {
            return undefined;
        }
        const line = result.stdout.trim().split('\n')[0];
        const parts = line.split('|');
        if (parts.length < 6) {
            return undefined;
        }
        const [id, name, image, statusStr, ports, created] = parts;
        let status = 'exited';
        const statusLower = statusStr.toLowerCase();
        if (statusLower.includes('up')) {
            status = 'running';
        }
        else if (statusLower.includes('paused')) {
            status = 'paused';
        }
        else if (statusLower.includes('restarting')) {
            status = 'restarting';
        }
        else if (statusLower.includes('created')) {
            status = 'created';
        }
        else if (statusLower.includes('dead')) {
            status = 'dead';
        }
        let uptime;
        const uptimeMatch = statusStr.match(/Up\s+(.+?)(?:\s*\(|$)/i);
        if (uptimeMatch) {
            uptime = uptimeMatch[1].trim();
        }
        return {
            id,
            name,
            image,
            status,
            ports: ports ? ports.split(',').map((p) => p.trim()) : [],
            created,
            uptime,
        };
    }
    catch {
        return undefined;
    }
}
function getDockerStatus(containerName = 'gitlab-mcp') {
    const runtime = (0, container_runtime_1.getContainerRuntime)();
    const result = {
        dockerInstalled: runtime.runtimeVersion !== undefined,
        dockerRunning: runtime.runtimeAvailable,
        composeInstalled: runtime.composeCmd !== null,
        instances: [],
        runtime,
    };
    if (result.dockerRunning) {
        result.container = getContainerInfo(containerName);
    }
    result.instances = loadInstances();
    return result;
}
function generateDockerCompose(config) {
    const compose = {
        version: '3.8',
        services: {
            'gitlab-mcp': {
                image: config.image,
                container_name: config.containerName,
                ports: [`\${PORT:-${config.port}}:3333`],
                environment: [
                    'TRANSPORT=sse',
                    'HOST=0.0.0.0',
                    'PORT=3333',
                    `OAUTH_ENABLED=${config.oauthEnabled}`,
                ],
                volumes: ['gitlab-mcp-data:/data'],
                restart: 'unless-stopped',
            },
        },
        volumes: {
            'gitlab-mcp-data': {},
        },
    };
    if (config.deploymentType === 'compose-bundle' && config.oauthEnabled) {
        compose.services.postgres = {
            image: 'postgres:16-alpine',
            container_name: `${config.containerName}-db`,
            ports: [],
            environment: [
                'POSTGRES_USER=gitlab_mcp',
                'POSTGRES_PASSWORD=${POSTGRES_PASSWORD}',
                'POSTGRES_DB=gitlab_mcp',
            ],
            volumes: ['postgres-data:/var/lib/postgresql/data'],
            restart: 'unless-stopped',
        };
        compose.services['gitlab-mcp'].depends_on = ['postgres'];
        if (compose.volumes) {
            compose.volumes['postgres-data'] = {};
        }
    }
    if (config.oauthEnabled) {
        let databaseUrl;
        if (config.deploymentType === 'compose-bundle') {
            databaseUrl = 'postgresql://gitlab_mcp:${POSTGRES_PASSWORD}@postgres:5432/gitlab_mcp';
        }
        else {
            databaseUrl = config.databaseUrl ?? 'file:/data/sessions.db';
        }
        compose.services['gitlab-mcp'].environment.push('OAUTH_SESSION_SECRET=${OAUTH_SESSION_SECRET}', `DATABASE_URL=${databaseUrl}`);
        compose.services['gitlab-mcp'].volumes.push('./instances.yml:/app/config/instances.yml:ro');
    }
    if (config.environment) {
        for (const [key, value] of Object.entries(config.environment)) {
            compose.services['gitlab-mcp'].environment.push(`${key}=${value}`);
        }
    }
    return yaml_1.default.stringify(compose);
}
function generateInstancesYaml(instances) {
    const yaml = {
        instances: {},
    };
    for (const instance of instances) {
        yaml.instances[instance.host] = {
            name: instance.name,
        };
        if (instance.oauth) {
            yaml.instances[instance.host].oauth = {
                client_id: instance.oauth.clientId,
                client_secret_env: instance.oauth.clientSecretEnv,
            };
        }
        if (instance.defaultPreset) {
            yaml.instances[instance.host].default_preset = instance.defaultPreset;
        }
    }
    return yaml_1.default.stringify(yaml);
}
function loadInstances() {
    const configDir = getExpandedConfigDir();
    const instancesPath = (0, path_1.join)(configDir, 'instances.yml');
    if (!(0, fs_1.existsSync)(instancesPath)) {
        return [];
    }
    try {
        const content = (0, fs_1.readFileSync)(instancesPath, 'utf8');
        const yaml = yaml_1.default.parse(content);
        return Object.entries(yaml.instances).map(([host, config]) => ({
            host,
            name: config.name,
            oauth: config.oauth
                ? {
                    clientId: config.oauth.client_id,
                    clientSecretEnv: config.oauth.client_secret_env,
                }
                : undefined,
            defaultPreset: config.default_preset,
        }));
    }
    catch {
        return [];
    }
}
function saveInstances(instances) {
    const configDir = getExpandedConfigDir();
    if (!(0, fs_1.existsSync)(configDir)) {
        (0, fs_1.mkdirSync)(configDir, { recursive: true });
    }
    const instancesPath = (0, path_1.join)(configDir, 'instances.yml');
    const content = generateInstancesYaml(instances);
    (0, fs_1.writeFileSync)(instancesPath, content, 'utf8');
}
function saveDockerCompose(config) {
    const configDir = getExpandedConfigDir();
    if (!(0, fs_1.existsSync)(configDir)) {
        (0, fs_1.mkdirSync)(configDir, { recursive: true });
    }
    const composePath = (0, path_1.join)(configDir, 'docker-compose.yml');
    const content = generateDockerCompose(config);
    (0, fs_1.writeFileSync)(composePath, content, 'utf8');
}
function runComposeCommand(args, configDir) {
    const cwd = configDir ?? getExpandedConfigDir();
    const composePath = (0, path_1.join)(cwd, 'docker-compose.yml');
    if (!(0, fs_1.existsSync)(composePath)) {
        return {
            success: false,
            error: `docker-compose.yml not found in ${cwd}. Run 'gitlab-mcp docker init' first.`,
        };
    }
    const runtime = (0, container_runtime_1.getContainerRuntime)();
    if (!runtime.composeCmd) {
        return {
            success: false,
            error: 'No compose tool available. Install docker-compose or podman-compose.',
        };
    }
    try {
        const [composeExe, ...composePrefix] = runtime.composeCmd;
        const fullArgs = [...composePrefix, ...args];
        const result = (0, child_process_1.spawnSync)(composeExe, fullArgs, {
            cwd,
            stdio: 'pipe',
            encoding: 'utf8',
        });
        if (result.status === 0) {
            return {
                success: true,
                output: result.stdout,
            };
        }
        else {
            return {
                success: false,
                error: result.stderr || result.stdout || 'Unknown error',
            };
        }
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}
function startContainer() {
    return runComposeCommand(['up', '-d']);
}
function stopContainer() {
    return runComposeCommand(['down']);
}
function restartContainer() {
    return runComposeCommand(['restart']);
}
function upgradeContainer() {
    const pullResult = runComposeCommand(['pull']);
    if (!pullResult.success) {
        return pullResult;
    }
    return runComposeCommand(['up', '-d']);
}
function tailLogs(follow = true, lines = 100) {
    const configDir = getExpandedConfigDir();
    const runtime = (0, container_runtime_1.getContainerRuntime)();
    if (!runtime.composeCmd) {
        throw new Error('No compose tool available. Install Docker Compose or podman-compose.');
    }
    const [composeExe, ...composePrefix] = runtime.composeCmd;
    const args = [...composePrefix, 'logs'];
    if (follow) {
        args.push('-f');
    }
    args.push('--tail', String(lines));
    return (0, child_process_1.spawn)(composeExe, args, {
        cwd: configDir,
        stdio: 'inherit',
    });
}
function getLogs(lines = 100) {
    return runComposeCommand(['logs', '--tail', String(lines)]);
}
function addInstance(instance) {
    const instances = loadInstances();
    const existingIndex = instances.findIndex((i) => i.host === instance.host);
    if (existingIndex >= 0) {
        instances[existingIndex] = instance;
    }
    else {
        instances.push(instance);
    }
    saveInstances(instances);
}
function removeInstance(host) {
    const instances = loadInstances();
    const filteredInstances = instances.filter((i) => i.host !== host);
    if (filteredInstances.length === instances.length) {
        return false;
    }
    saveInstances(filteredInstances);
    return true;
}
function initDockerConfig(config = {}) {
    const fullConfig = {
        ...types_1.DEFAULT_DOCKER_CONFIG,
        ...config,
    };
    saveDockerCompose(fullConfig);
    saveEnvFile(fullConfig);
    if (fullConfig.instances.length > 0) {
        saveInstances(fullConfig.instances);
    }
    return fullConfig;
}
function saveEnvFile(config) {
    const configDir = getExpandedConfigDir();
    if (!(0, fs_1.existsSync)(configDir)) {
        (0, fs_1.mkdirSync)(configDir, { recursive: true });
    }
    const lines = [];
    if (config.oauthSessionSecret) {
        lines.push(`OAUTH_SESSION_SECRET=${config.oauthSessionSecret}`);
    }
    if (config.deploymentType === 'compose-bundle' && config.oauthEnabled) {
        const pgPassword = (0, crypto_1.randomBytes)(24).toString('base64url');
        lines.push(`POSTGRES_PASSWORD=${pgPassword}`);
    }
    if (lines.length > 0) {
        const envPath = (0, path_1.join)(configDir, '.env');
        (0, fs_1.writeFileSync)(envPath, lines.join('\n') + '\n', { encoding: 'utf8', mode: 0o600 });
    }
}
//# sourceMappingURL=docker-utils.js.map