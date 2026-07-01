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
exports.parseDockerSubcommand = parseDockerSubcommand;
exports.showStatus = showStatus;
exports.initDocker = initDocker;
exports.dockerStart = dockerStart;
exports.dockerStop = dockerStop;
exports.dockerRestart = dockerRestart;
exports.dockerUpgrade = dockerUpgrade;
exports.dockerLogs = dockerLogs;
exports.dockerAddInstance = dockerAddInstance;
exports.dockerRemoveInstance = dockerRemoveInstance;
exports.runDockerCommand = runDockerCommand;
const p = __importStar(require("@clack/prompts"));
const crypto_1 = require("crypto");
const docker_utils_1 = require("./docker-utils");
const types_1 = require("./types");
function parseDockerSubcommand(args) {
    const subcommand = args[0];
    const subArgs = args.slice(1);
    const validSubcommands = [
        'status',
        'init',
        'start',
        'stop',
        'restart',
        'upgrade',
        'logs',
        'add-instance',
        'remove-instance',
    ];
    if (subcommand && !validSubcommands.includes(subcommand)) {
        return { subcommand: undefined, subArgs: args };
    }
    return { subcommand, subArgs };
}
function showStatus() {
    const status = (0, docker_utils_1.getDockerStatus)();
    console.log('\nDocker Environment:');
    console.log(`  Docker installed: ${status.dockerInstalled ? '✓' : '✗'}`);
    if (!status.dockerInstalled) {
        console.log('\n⚠ Docker is not installed. Install Docker first.');
        console.log('  https://docs.docker.com/get-docker/');
        return;
    }
    console.log(`  Docker running: ${status.dockerRunning ? '✓' : '✗'}`);
    console.log(`  Compose installed: ${status.composeInstalled ? '✓' : '✗'}`);
    if (!status.dockerRunning) {
        console.log('\n⚠ Docker daemon is not running. Start Docker first.');
        return;
    }
    console.log('\nContainer Status:');
    if (status.container) {
        const c = status.container;
        console.log(`  Name: ${c.name}`);
        console.log(`  Status: ${c.status}${c.uptime ? ` (${c.uptime})` : ''}`);
        console.log(`  Image: ${c.image}`);
        if (c.ports.length > 0) {
            console.log(`  Ports: ${c.ports.join(', ')}`);
        }
    }
    else {
        console.log("  Container not found. Run 'gitlab-mcp docker init' to set up.");
    }
    console.log('\nConfigured Instances:');
    if (status.instances.length > 0) {
        for (const instance of status.instances) {
            console.log(`  ${instance.host}: ${instance.name}`);
            if (instance.oauth) {
                console.log(`    OAuth: enabled`);
            }
            if (instance.defaultPreset) {
                console.log(`    Preset: ${instance.defaultPreset}`);
            }
        }
    }
    else {
        console.log('  No instances configured.');
    }
    console.log(`\nConfig directory: ${(0, docker_utils_1.getExpandedConfigDir)()}`);
}
async function initDocker() {
    p.intro('Initialize GitLab MCP Docker Setup');
    const status = (0, docker_utils_1.getDockerStatus)();
    if (!status.dockerInstalled) {
        p.log.error('Docker is not installed.');
        p.note('Visit https://docs.docker.com/get-docker/ to install Docker.', 'Install Docker');
        p.outro('Setup cancelled.');
        return;
    }
    if (!status.composeInstalled) {
        p.log.error('Docker Compose is not installed.');
        p.note('Docker Compose is required. Install it with:\n  docker compose version (v2, bundled with Docker Desktop)\n  or\n  pip install docker-compose (v1)', 'Install Compose');
        p.outro('Setup cancelled.');
        return;
    }
    const port = await p.text({
        message: 'SSE port for MCP server:',
        placeholder: '3333',
        initialValue: '3333',
        validate: (value) => {
            const num = parseInt(value ?? '', 10);
            if (isNaN(num) || num < 1 || num > 65535) {
                return 'Port must be a number between 1 and 65535';
            }
            return undefined;
        },
    });
    if (p.isCancel(port)) {
        p.cancel('Setup cancelled');
        return;
    }
    const enableOAuth = await p.confirm({
        message: 'Enable OAuth for multi-instance support?',
        initialValue: false,
    });
    if (p.isCancel(enableOAuth)) {
        p.cancel('Setup cancelled');
        return;
    }
    let oauthSessionSecret;
    if (enableOAuth) {
        p.note('OAuth mode allows users to authenticate with multiple GitLab instances.\n' +
            "You'll need to register OAuth applications on each GitLab instance.", 'OAuth Mode');
        oauthSessionSecret = (0, crypto_1.randomBytes)(32).toString('hex');
        p.log.warn('Session secret will be stored in docker-compose.yml. Keep this file secure and do NOT commit to version control.');
    }
    const config = {
        ...types_1.DEFAULT_DOCKER_CONFIG,
        port: parseInt(port, 10),
        oauthEnabled: enableOAuth,
        oauthSessionSecret,
    };
    const spinner = p.spinner();
    spinner.start('Creating Docker configuration...');
    try {
        (0, docker_utils_1.initDockerConfig)(config);
        spinner.stop('Docker configuration created!');
        p.log.success(`Config directory: ${(0, docker_utils_1.getExpandedConfigDir)()}`);
        const startNow = await p.confirm({
            message: 'Start the container now?',
            initialValue: true,
        });
        if (p.isCancel(startNow)) {
            p.cancel('Setup complete without starting container');
            return;
        }
        if (startNow) {
            spinner.start('Starting container...');
            const result = (0, docker_utils_1.startContainer)();
            if (result.success) {
                spinner.stop('Container started!');
            }
            else {
                spinner.stop('Failed to start container');
                p.log.error(result.error ?? 'Unknown error');
            }
        }
        p.outro('Docker setup complete!');
    }
    catch (error) {
        spinner.stop('Configuration failed');
        p.log.error(error instanceof Error ? error.message : String(error));
    }
}
function dockerStart() {
    console.log('Starting gitlab-mcp container...');
    const result = (0, docker_utils_1.startContainer)();
    if (result.success) {
        console.log('✓ Container started');
        if (result.output) {
            console.log(result.output);
        }
    }
    else {
        console.error(`✗ Failed to start container: ${result.error}`);
    }
}
function dockerStop() {
    console.log('Stopping gitlab-mcp container...');
    const result = (0, docker_utils_1.stopContainer)();
    if (result.success) {
        console.log('✓ Container stopped');
    }
    else {
        console.error(`✗ Failed to stop container: ${result.error}`);
    }
}
function dockerRestart() {
    console.log('Restarting gitlab-mcp container...');
    const result = (0, docker_utils_1.restartContainer)();
    if (result.success) {
        console.log('✓ Container restarted');
    }
    else {
        console.error(`✗ Failed to restart container: ${result.error}`);
    }
}
function dockerUpgrade() {
    console.log('Upgrading gitlab-mcp container...');
    const result = (0, docker_utils_1.upgradeContainer)();
    if (result.success) {
        console.log('✓ Container upgraded to latest version');
    }
    else {
        console.error(`✗ Failed to upgrade container: ${result.error}`);
    }
}
function dockerLogs(follow = false, lines = 100) {
    if (follow) {
        console.log(`Tailing logs (last ${lines} lines, Ctrl+C to exit)...\n`);
        const process = (0, docker_utils_1.tailLogs)(true, lines);
        process.on('error', (error) => {
            console.error(`Failed to get logs: ${error.message}`);
        });
    }
    else {
        const result = (0, docker_utils_1.getLogs)(lines);
        if (result.success) {
            console.log(result.output);
        }
        else {
            console.error(`Failed to get logs: ${result.error}`);
        }
    }
}
async function dockerAddInstance(host) {
    p.intro('Add GitLab Instance');
    let instanceHost;
    if (host) {
        instanceHost = host;
    }
    else {
        const hostInput = await p.text({
            message: 'GitLab instance host:',
            placeholder: 'gitlab.company.com',
            validate: (value) => {
                if (!value || value.length < 1) {
                    return 'Host is required';
                }
                const hostnamePattern = /^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)*[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i;
                const ipv4Pattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
                const ipMatch = value.match(ipv4Pattern);
                if (ipMatch) {
                    const octets = [ipMatch[1], ipMatch[2], ipMatch[3], ipMatch[4]].map(Number);
                    if (octets.every((o) => o >= 0 && o <= 255)) {
                        return undefined;
                    }
                    return 'IP address octets must be between 0 and 255';
                }
                if (hostnamePattern.test(value)) {
                    return undefined;
                }
                return 'Invalid hostname or IP address format';
            },
        });
        if (p.isCancel(hostInput)) {
            p.cancel('Setup cancelled');
            return;
        }
        instanceHost = hostInput;
    }
    const name = await p.text({
        message: 'Display name:',
        placeholder: 'Company GitLab',
        initialValue: instanceHost,
    });
    if (p.isCancel(name)) {
        p.cancel('Setup cancelled');
        return;
    }
    const configureOAuth = await p.confirm({
        message: 'Configure OAuth for this instance?',
        initialValue: false,
    });
    if (p.isCancel(configureOAuth)) {
        p.cancel('Setup cancelled');
        return;
    }
    let oauth;
    if (configureOAuth) {
        const clientId = await p.text({
            message: 'OAuth Application ID:',
            validate: (value) => {
                if (!value || value.length < 10) {
                    return 'Application ID is required';
                }
                return undefined;
            },
        });
        if (p.isCancel(clientId)) {
            p.cancel('Setup cancelled');
            return;
        }
        const envName = instanceHost.toUpperCase().replace(/[^A-Z0-9]/g, '_') + '_SECRET';
        p.note(`Store your OAuth secret in environment variable: ${envName}\n` +
            `Add to docker-compose.yml environment section or use .env file.`, 'OAuth Secret');
        oauth = {
            clientId,
            clientSecretEnv: envName,
        };
    }
    const preset = await p.select({
        message: 'Default preset for this instance:',
        options: [
            { value: 'developer', label: 'Developer (default)' },
            { value: 'senior-dev', label: 'Senior Developer' },
            { value: 'full-access', label: 'Full Access' },
            { value: 'devops', label: 'DevOps' },
            { value: 'code-reviewer', label: 'Code Reviewer' },
            { value: 'readonly', label: 'Read-Only' },
        ],
    });
    if (p.isCancel(preset)) {
        p.cancel('Setup cancelled');
        return;
    }
    const instance = {
        host: instanceHost,
        name,
        oauth,
        defaultPreset: preset,
    };
    (0, docker_utils_1.addInstance)(instance);
    p.log.success(`Added instance: ${instanceHost}`);
    p.outro('Instance configuration saved. Restart container to apply changes.');
}
function dockerRemoveInstance(host) {
    if ((0, docker_utils_1.removeInstance)(host)) {
        console.log(`✓ Removed instance: ${host}`);
        console.log('Restart container to apply changes.');
    }
    else {
        console.error(`✗ Instance not found: ${host}`);
    }
}
async function runDockerCommand(args) {
    const { subcommand, subArgs } = parseDockerSubcommand(args);
    switch (subcommand) {
        case 'status':
            showStatus();
            break;
        case 'init':
            await initDocker();
            break;
        case 'start':
            dockerStart();
            break;
        case 'stop':
            dockerStop();
            break;
        case 'restart':
            dockerRestart();
            break;
        case 'upgrade':
            dockerUpgrade();
            break;
        case 'logs': {
            const follow = subArgs.includes('-f') || subArgs.includes('--follow');
            const linesArg = subArgs.find((a) => a.startsWith('--lines='));
            const lines = linesArg ? parseInt(linesArg.split('=')[1], 10) : 100;
            dockerLogs(follow, lines);
            break;
        }
        case 'add-instance':
            await dockerAddInstance(subArgs[0]);
            break;
        case 'remove-instance':
            if (!subArgs[0]) {
                throw new Error('Usage: gitlab-mcp docker remove-instance <host>');
            }
            dockerRemoveInstance(subArgs[0]);
            break;
        default:
            console.log('GitLab MCP Docker Commands:\n');
            console.log('  gitlab-mcp docker status          Show container and instances status');
            console.log('  gitlab-mcp docker init            Initialize Docker configuration');
            console.log('  gitlab-mcp docker start           Start container');
            console.log('  gitlab-mcp docker stop            Stop container');
            console.log('  gitlab-mcp docker restart         Restart container');
            console.log('  gitlab-mcp docker upgrade         Pull latest image and restart');
            console.log('  gitlab-mcp docker logs [-f]       Show container logs');
            console.log('  gitlab-mcp docker add-instance    Add GitLab instance');
            console.log('  gitlab-mcp docker remove-instance Remove GitLab instance');
            break;
    }
}
//# sourceMappingURL=docker-command.js.map