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
exports.runConfigureExistingFlow = runConfigureExistingFlow;
const p = __importStar(require("@clack/prompts"));
const types_1 = require("../../install/types");
const installers_1 = require("../../install/installers");
const install_command_1 = require("../../install/install-command");
async function runConfigureExistingFlow(discovery) {
    const { detected, configured, unconfigured } = discovery.clients;
    p.log.step('Current configuration:');
    for (const client of detected) {
        const metadata = types_1.CLIENT_METADATA[client.client];
        const status = client.alreadyConfigured ? '✓ configured' : '○ not configured';
        console.log(`  ${status}  ${metadata.name}`);
    }
    if (discovery.docker.container) {
        const containerStatus = discovery.docker.container.status === 'running' ? '✓ running' : '○ stopped';
        console.log(`  ${containerStatus}  Docker container`);
    }
    console.log('');
    const actionOptions = [];
    if (unconfigured.length > 0) {
        actionOptions.push({
            value: 'add-clients',
            label: `Add gitlab-mcp to ${unconfigured.length} unconfigured client(s)`,
            hint: unconfigured.map((c) => types_1.CLIENT_METADATA[c.client].name).join(', '),
        });
    }
    if (configured.length > 0) {
        actionOptions.push({
            value: 'update-clients',
            label: `Update ${configured.length} existing configuration(s)`,
            hint: configured.map((c) => types_1.CLIENT_METADATA[c.client].name).join(', '),
        });
    }
    if (discovery.docker.container) {
        if (discovery.docker.container.status === 'running') {
            actionOptions.push({
                value: 'restart-docker',
                label: 'Restart Docker container',
            });
        }
        else {
            actionOptions.push({
                value: 'start-docker',
                label: 'Start Docker container',
            });
        }
    }
    actionOptions.push({
        value: 'cancel',
        label: 'Cancel',
    });
    const action = await p.select({
        message: 'What would you like to do?',
        options: actionOptions,
    });
    if (p.isCancel(action) || action === 'cancel') {
        return { success: false, mode: 'configure-existing', error: 'Cancelled' };
    }
    switch (action) {
        case 'add-clients':
            return addToClients(unconfigured.map((c) => c.client));
        case 'update-clients':
            return updateClients(configured.map((c) => c.client));
        case 'restart-docker':
        case 'start-docker': {
            const { startContainer, restartContainer } = await Promise.resolve().then(() => __importStar(require('../../docker/docker-utils')));
            const spinner = p.spinner();
            spinner.start(action === 'restart-docker' ? 'Restarting...' : 'Starting...');
            const result = action === 'restart-docker' ? restartContainer() : startContainer();
            if (result.success) {
                spinner.stop('Done!');
            }
            else {
                spinner.stop('Failed');
                p.log.error(result.error ?? 'Unknown error');
            }
            return {
                success: result.success,
                mode: 'configure-existing',
                error: result.success ? undefined : (result.error ?? 'Container operation failed'),
            };
        }
        default:
            return { success: false, mode: 'configure-existing', error: 'Unknown action' };
    }
}
async function addToClients(clients) {
    const selectedClients = await p.multiselect({
        message: 'Select clients to add gitlab-mcp to:',
        options: clients.map((client) => ({
            value: client,
            label: types_1.CLIENT_METADATA[client].name,
        })),
        required: true,
    });
    if (p.isCancel(selectedClients)) {
        return { success: false, mode: 'configure-existing', error: 'Cancelled' };
    }
    const targetClients = selectedClients;
    const serverConfig = (0, install_command_1.buildServerConfigFromEnv)();
    if (!serverConfig.env.GITLAB_TOKEN) {
        const token = await p.password({
            message: 'Enter GitLab Personal Access Token:',
            validate: (v) => (!v || v.length < 10 ? 'Token is too short' : undefined),
        });
        if (p.isCancel(token)) {
            return { success: false, mode: 'configure-existing', error: 'Cancelled' };
        }
        serverConfig.env.GITLAB_TOKEN = token;
    }
    const spinner = p.spinner();
    spinner.start('Installing configuration...');
    const results = (0, installers_1.installToClients)(targetClients, serverConfig, false);
    spinner.stop('Done!');
    const successful = results.filter((r) => r.success);
    if (successful.length > 0) {
        p.log.success(`Added to ${successful.length} client(s)`);
    }
    const failed = results.filter((r) => !r.success);
    if (failed.length > 0) {
        for (const r of failed) {
            p.log.error(`  ${types_1.CLIENT_METADATA[r.client].name}: ${r.error}`);
        }
    }
    return {
        success: successful.length > 0,
        mode: 'configure-existing',
        configuredClients: successful.map((r) => r.client),
    };
}
async function updateClients(clients) {
    const selectedClients = await p.multiselect({
        message: 'Select clients to update:',
        options: clients.map((client) => ({
            value: client,
            label: types_1.CLIENT_METADATA[client].name,
        })),
        required: true,
    });
    if (p.isCancel(selectedClients)) {
        return { success: false, mode: 'configure-existing', error: 'Cancelled' };
    }
    const targetClients = selectedClients;
    const serverConfig = (0, install_command_1.buildServerConfigFromEnv)();
    if (!serverConfig.env.GITLAB_TOKEN) {
        const token = await p.password({
            message: 'Enter GitLab Personal Access Token:',
            validate: (v) => (!v || v.length < 10 ? 'Token is too short' : undefined),
        });
        if (p.isCancel(token)) {
            return { success: false, mode: 'configure-existing', error: 'Cancelled' };
        }
        serverConfig.env.GITLAB_TOKEN = token;
    }
    const spinner = p.spinner();
    spinner.start('Updating configuration...');
    const results = (0, installers_1.installToClients)(targetClients, serverConfig, true);
    spinner.stop('Done!');
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);
    if (successful.length > 0) {
        p.log.success(`Updated ${successful.length} client(s)`);
    }
    if (failed.length > 0) {
        for (const r of failed) {
            p.log.error(`  ${types_1.CLIENT_METADATA[r.client].name}: ${r.error}`);
        }
    }
    return {
        success: successful.length > 0,
        mode: 'configure-existing',
        configuredClients: successful.map((r) => r.client),
        error: failed.length > 0 ? `Failed to update ${failed.length} client(s)` : undefined,
    };
}
//# sourceMappingURL=configure-existing.js.map