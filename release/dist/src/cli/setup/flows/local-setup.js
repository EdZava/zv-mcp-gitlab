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
exports.runLocalSetupFlow = runLocalSetupFlow;
const p = __importStar(require("@clack/prompts"));
const types_1 = require("../../install/types");
const connection_1 = require("../../init/connection");
const browser_1 = require("../../init/browser");
const installers_1 = require("../../install/installers");
const tool_selection_1 = require("./tool-selection");
async function runLocalSetupFlow(discovery) {
    const instanceType = await p.select({
        message: 'Which GitLab instance?',
        options: [
            { value: 'saas', label: 'GitLab.com (SaaS)' },
            { value: 'self-hosted', label: 'Self-hosted GitLab' },
        ],
    });
    if (p.isCancel(instanceType)) {
        return { success: false, mode: 'local', error: 'Cancelled' };
    }
    let instanceUrl;
    if (instanceType === 'saas') {
        instanceUrl = 'https://gitlab.com';
    }
    else {
        const urlInput = await p.text({
            message: 'Enter your GitLab instance URL:',
            placeholder: 'https://gitlab.example.com',
            validate: (value) => {
                const result = (0, connection_1.validateGitLabUrl)(value ?? '');
                return result.valid ? undefined : result.error;
            },
        });
        if (p.isCancel(urlInput)) {
            return { success: false, mode: 'local', error: 'Cancelled' };
        }
        instanceUrl = urlInput.replace(/\/+$/, '').replace(/\/api\/v4$/i, '');
    }
    const hasToken = await p.confirm({
        message: 'Do you already have a GitLab Personal Access Token (PAT)?',
        initialValue: false,
    });
    if (p.isCancel(hasToken)) {
        return { success: false, mode: 'local', error: 'Cancelled' };
    }
    if (!hasToken) {
        const patUrl = (0, connection_1.getPatCreationUrl)(instanceUrl);
        p.note(`You need a Personal Access Token with these scopes:\n` +
            `  - api (full API access)\n` +
            `  - read_user (read user info)\n\n` +
            `Token URL: ${patUrl}`, 'Create a Personal Access Token');
        const openBrowser = await p.confirm({
            message: 'Open browser to create token?',
            initialValue: true,
        });
        if (!p.isCancel(openBrowser) && openBrowser) {
            const opened = await (0, browser_1.openUrl)(patUrl);
            if (opened) {
                p.log.info('Browser opened. Create your token and copy it.');
            }
            else {
                p.log.warn('Could not open browser automatically');
                p.note(patUrl, 'Open this URL manually:');
            }
        }
    }
    const tokenInput = await p.password({
        message: 'Enter your Personal Access Token:',
        validate: (value) => {
            if (!value || value.length < 10) {
                return 'Token is too short';
            }
            return undefined;
        },
    });
    if (p.isCancel(tokenInput)) {
        return { success: false, mode: 'local', error: 'Cancelled' };
    }
    const token = tokenInput;
    const spinner = p.spinner();
    spinner.start('Testing connection...');
    const connectionResult = await (0, connection_1.testConnection)(instanceUrl, token);
    if (!connectionResult.success) {
        spinner.stop('Connection failed');
        p.log.error(`Connection error: ${connectionResult.error ?? 'Unknown error'}`);
        return { success: false, mode: 'local', error: connectionResult.error };
    }
    spinner.stop('Connection successful!');
    p.log.success(`Connected as ${connectionResult.username ?? 'unknown user'}` +
        (connectionResult.gitlabVersion ? ` (GitLab ${connectionResult.gitlabVersion})` : ''));
    const toolConfig = await (0, tool_selection_1.runToolSelectionFlow)();
    if (!toolConfig) {
        return { success: false, mode: 'local', error: 'Cancelled' };
    }
    const serverConfig = buildServerConfig(instanceUrl, token, toolConfig);
    const targetClients = await selectClients(discovery);
    if (!targetClients || targetClients.length === 0) {
        p.log.step('Generated configuration:');
        const configJson = JSON.stringify({ mcpServers: { gitlab: serverConfig } }, null, 2);
        const masked = configJson.replace(/("GITLAB_TOKEN"\s*:\s*")((?:\\.|[^"\\])*)(")/g, '$1****$3');
        p.note(masked, 'MCP Server Configuration');
        p.log.warn('Replace **** with your actual token in the config file.');
        return { success: true, mode: 'local' };
    }
    spinner.start('Installing configuration...');
    const results = (0, installers_1.installToClients)(targetClients, serverConfig, true);
    spinner.stop('Installation complete!');
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);
    if (successful.length > 0) {
        p.log.success(`Installed to ${successful.length} client(s):`);
        for (const result of successful) {
            const metadata = types_1.CLIENT_METADATA[result.client];
            let info = `  ✓ ${metadata.name}`;
            if (result.configPath)
                info += ` (${result.configPath})`;
            console.log(info);
        }
    }
    if (failed.length > 0) {
        p.log.error(`Failed for ${failed.length} client(s):`);
        for (const result of failed) {
            const metadata = types_1.CLIENT_METADATA[result.client];
            console.log(`  ✗ ${metadata.name}: ${result.error}`);
        }
    }
    return {
        success: successful.length > 0,
        mode: 'local',
        configuredClients: successful.map((r) => r.client),
    };
}
function buildServerConfig(instanceUrl, token, toolConfig) {
    const env = {
        GITLAB_API_URL: instanceUrl,
        GITLAB_TOKEN: token,
    };
    if (toolConfig.mode === 'preset' && toolConfig.preset) {
        env.GITLAB_PROFILE = toolConfig.preset;
    }
    if (toolConfig.mode === 'manual' && toolConfig.enabledCategories) {
        (0, tool_selection_1.applyManualCategories)(toolConfig.enabledCategories, env);
    }
    if (toolConfig.mode === 'advanced' && toolConfig.envOverrides) {
        Object.assign(env, toolConfig.envOverrides);
    }
    return {
        command: 'npx',
        args: ['-y', '@structured-world/gitlab-mcp@latest'],
        env,
    };
}
async function selectClients(discovery) {
    const detected = discovery.clients.detected;
    if (detected.length === 0) {
        p.log.warn('No MCP clients detected. Configuration will be displayed instead.');
        return null;
    }
    const selectedClients = await p.multiselect({
        message: 'Select clients to install to:',
        options: detected.map((result) => ({
            value: result.client,
            label: types_1.CLIENT_METADATA[result.client].name,
            hint: result.alreadyConfigured ? 'already configured (will overwrite)' : undefined,
        })),
        required: false,
    });
    if (p.isCancel(selectedClients)) {
        return null;
    }
    return selectedClients;
}
//# sourceMappingURL=local-setup.js.map