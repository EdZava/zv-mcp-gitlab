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
exports.runSetupWizard = runSetupWizard;
const p = __importStar(require("@clack/prompts"));
const discovery_1 = require("./discovery");
const local_setup_1 = require("./flows/local-setup");
const server_setup_1 = require("./flows/server-setup");
const configure_existing_1 = require("./flows/configure-existing");
async function runSetupWizard(options) {
    p.intro('GitLab MCP Setup Wizard');
    const spinner = p.spinner();
    spinner.start('Detecting environment...');
    const discovery = (0, discovery_1.runDiscovery)();
    spinner.stop('Environment detected');
    const summary = (0, discovery_1.formatDiscoverySummary)(discovery);
    p.log.info(summary);
    let mode;
    if (options?.mode) {
        mode = options.mode;
    }
    else {
        const selected = await selectMode(discovery);
        if (!selected) {
            p.outro('Setup cancelled.');
            return { success: false, error: 'Cancelled' };
        }
        mode = selected;
    }
    let result;
    switch (mode) {
        case 'configure-existing':
            result = await (0, configure_existing_1.runConfigureExistingFlow)(discovery);
            break;
        case 'local':
            result = await (0, local_setup_1.runLocalSetupFlow)(discovery);
            break;
        case 'server':
            result = await (0, server_setup_1.runServerSetupFlow)(discovery);
            break;
    }
    if (result.success) {
        const parts = ['Setup complete!'];
        if (result.configuredClients && result.configuredClients.length > 0) {
            parts.push(`Configured ${result.configuredClients.length} client(s).`);
            parts.push('Restart your MCP clients to apply changes.');
        }
        if (result.dockerConfig) {
            parts.push(`Docker container on port ${result.dockerConfig.port}.`);
        }
        p.outro(parts.join(' '));
    }
    else if (result.error !== 'Cancelled') {
        p.outro(`Setup failed: ${result.error ?? 'Unknown error'}`);
    }
    else {
        p.outro('Setup cancelled.');
    }
    return result;
}
async function selectMode(discovery) {
    const options = [];
    if (discovery.summary.hasExistingSetup) {
        const parts = [];
        if (discovery.summary.configuredCount > 0) {
            parts.push(`${discovery.summary.configuredCount} client(s)`);
        }
        if (discovery.summary.containerExists) {
            parts.push('1 docker service');
        }
        options.push({
            value: 'configure-existing',
            label: 'Configure existing',
            hint: parts.join(', '),
        });
    }
    options.push({
        value: 'local',
        label: 'New local setup (stdio)',
        hint: 'For AI IDE clients (Claude, Cursor, VS Code, etc.)',
    });
    options.push({
        value: 'server',
        label: 'New server setup (HTTP/SSE)',
        hint: 'Docker-based for shared/team access',
    });
    const mode = await p.select({
        message: 'What would you like to do?',
        options,
    });
    if (p.isCancel(mode)) {
        return null;
    }
    return mode;
}
//# sourceMappingURL=wizard.js.map