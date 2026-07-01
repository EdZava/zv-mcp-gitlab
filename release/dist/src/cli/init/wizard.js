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
exports.runWizard = runWizard;
const p = __importStar(require("@clack/prompts"));
const types_1 = require("./types");
const connection_1 = require("./connection");
const config_generator_1 = require("./config-generator");
const browser_1 = require("./browser");
function maskSensitiveContent(content) {
    let masked = content;
    masked = masked.replace(/("GITLAB_TOKEN"\s*:\s*")((?:\\.|[^"\\])*)(")/g, '$1****$3');
    masked = masked.replace(/(GITLAB_TOKEN=")((?:\\.|[^"\\])*)(")/g, '$1****$3');
    masked = masked.replace(/(GITLAB_TOKEN=)([^\s"]+)/g, '$1****');
    return masked;
}
async function runWizard() {
    p.intro('GitLab MCP Setup Wizard');
    const instanceType = await p.select({
        message: 'Which GitLab instance do you want to connect to?',
        options: [
            { value: 'saas', label: 'GitLab.com (SaaS)' },
            { value: 'self-hosted', label: 'Self-hosted GitLab' },
        ],
    });
    if (p.isCancel(instanceType)) {
        p.cancel('Setup cancelled');
        process.exit(0);
        return;
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
            p.cancel('Setup cancelled');
            process.exit(0);
            return;
        }
        instanceUrl = urlInput.replace(/\/+$/, '').replace(/\/api\/v4$/i, '');
    }
    const hasToken = await p.confirm({
        message: 'Do you already have a GitLab Personal Access Token (PAT)?',
        initialValue: false,
    });
    if (p.isCancel(hasToken)) {
        p.cancel('Setup cancelled');
        process.exit(0);
        return;
    }
    let token;
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
        if (p.isCancel(openBrowser)) {
            p.cancel('Setup cancelled');
            process.exit(0);
            return;
        }
        if (openBrowser) {
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
        p.cancel('Setup cancelled');
        process.exit(0);
        return;
    }
    token = tokenInput;
    const spinner = p.spinner();
    spinner.start('Testing connection...');
    const connectionResult = await (0, connection_1.testConnection)(instanceUrl, token);
    if (!connectionResult.success) {
        spinner.stop('Connection failed');
        p.log.error(`Connection error: ${connectionResult.error ?? 'Unknown error'}`);
        p.cancel('Please check your URL and token');
        process.exit(1);
        return;
    }
    spinner.stop('Connection successful!');
    p.log.success(`Connected as ${connectionResult.username ?? 'unknown user'}` +
        (connectionResult.gitlabVersion ? ` (GitLab ${connectionResult.gitlabVersion})` : ''));
    const roleOptions = Object.keys(types_1.ROLE_DESCRIPTIONS).map((r) => ({
        value: r,
        label: formatRoleLabel(r),
        hint: types_1.ROLE_DESCRIPTIONS[r],
    }));
    const role = await p.select({
        message: 'What is your primary role?',
        options: roleOptions,
    });
    if (p.isCancel(role)) {
        p.cancel('Setup cancelled');
        process.exit(0);
        return;
    }
    let readOnly = role === 'readonly';
    if (!readOnly) {
        const confirmReadWrite = await p.confirm({
            message: 'Enable write operations (create issues, merge MRs, etc.)?',
            initialValue: true,
        });
        if (p.isCancel(confirmReadWrite)) {
            p.cancel('Setup cancelled');
            process.exit(0);
            return;
        }
        readOnly = !confirmReadWrite;
    }
    const clientOptions = Object.keys(types_1.MCP_CLIENT_INFO).map((c) => ({
        value: c,
        label: types_1.MCP_CLIENT_INFO[c].name,
        hint: types_1.MCP_CLIENT_INFO[c].configPath ? types_1.MCP_CLIENT_INFO[c].configPath : undefined,
    }));
    const client = await p.select({
        message: 'Which MCP client are you using?',
        options: clientOptions,
    });
    if (p.isCancel(client)) {
        p.cancel('Setup cancelled');
        process.exit(0);
        return;
    }
    const wizardConfig = {
        instanceUrl,
        token,
        role,
        client,
        readOnly,
        presetName: types_1.ROLE_PRESETS[role],
    };
    const generatedConfig = (0, config_generator_1.generateClientConfig)(wizardConfig);
    p.log.step('Configuration generated');
    if (generatedConfig.type === 'cli' && generatedConfig.cliCommand) {
        p.note(maskSensitiveContent(generatedConfig.cliCommand), 'Run this command to install:');
        p.log.info('If copying this command, replace **** with your actual token.');
        const runNow = await p.confirm({
            message: 'Run this command now?',
            initialValue: true,
        });
        if (p.isCancel(runNow)) {
            p.cancel('Setup cancelled');
            process.exit(0);
            return;
        }
        if (runNow) {
            const { spawnSync } = await Promise.resolve().then(() => __importStar(require('child_process')));
            const serverConfig = (0, config_generator_1.generateServerConfig)(wizardConfig);
            const args = [
                'mcp',
                'add',
                'gitlab',
                serverConfig.command,
                ...serverConfig.args,
                ...Object.entries(serverConfig.env).flatMap(([key, value]) => ['--env', `${key}=${value}`]),
            ];
            try {
                spinner.start('Installing MCP server...');
                const result = spawnSync('claude', args, { stdio: 'inherit' });
                if (result.status === 0) {
                    spinner.stop('MCP server installed!');
                }
                else {
                    spinner.stop('Installation failed');
                    p.log.error('Failed to run command. You can run it manually.');
                }
            }
            catch {
                spinner.stop('Installation failed');
                p.log.error('Failed to run command. You can run it manually.');
            }
        }
    }
    else {
        p.note(maskSensitiveContent(generatedConfig.content), 'Add to your MCP configuration:');
        p.log.warn('Note: Replace **** with your actual token in the config file');
        if (generatedConfig.configPath) {
            p.log.info(`Config file: ${generatedConfig.configPath}`);
        }
    }
    if (client === 'claude-desktop') {
        const deepLink = (0, config_generator_1.generateClaudeDeepLink)(wizardConfig);
        p.log.warn('Security: the deep link encodes your GitLab token. ' +
            'It may be recorded in OS/app logs. Treat it like a password.');
        const useDeepLink = await p.confirm({
            message: 'Open Claude Desktop with deep link?',
            initialValue: true,
        });
        if (p.isCancel(useDeepLink)) {
            p.cancel('Setup cancelled');
            process.exit(0);
            return;
        }
        if (useDeepLink) {
            const opened = await (0, browser_1.openUrl)(deepLink);
            if (opened) {
                p.log.success('Claude Desktop should open with the configuration');
            }
            else {
                p.log.warn('Could not open Claude Desktop automatically');
                p.note(deepLink, 'Copy this sensitive link (treat like a password):');
            }
        }
    }
    p.outro(`Setup complete! Preset: ${wizardConfig.presetName ?? 'default'}` +
        (readOnly ? ' (read-only)' : ''));
}
function formatRoleLabel(role) {
    const labels = {
        developer: 'Developer',
        'senior-developer': 'Senior Developer',
        'tech-lead': 'Tech Lead / Admin',
        devops: 'DevOps Engineer',
        reviewer: 'Code Reviewer',
        readonly: 'Read-Only Access',
    };
    return labels[role];
}
//# sourceMappingURL=wizard.js.map