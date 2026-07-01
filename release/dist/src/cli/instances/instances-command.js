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
exports.parseInstanceSubcommand = parseInstanceSubcommand;
exports.runInstanceCommand = runInstanceCommand;
const p = __importStar(require("@clack/prompts"));
const InstanceRegistry_js_1 = require("../../services/InstanceRegistry.js");
const instances_loader_js_1 = require("../../config/instances-loader.js");
const fetch_1 = require("../../utils/fetch");
function parseInstanceSubcommand(args) {
    const subcommand = args[0];
    const subArgs = args.slice(1);
    const validSubcommands = [
        'list',
        'add',
        'remove',
        'test',
        'info',
        'sample-config',
    ];
    if (subcommand && !validSubcommands.includes(subcommand)) {
        return { subcommand: undefined, subArgs: args };
    }
    return { subcommand, subArgs };
}
async function runInstanceCommand(args) {
    const { subcommand, subArgs } = parseInstanceSubcommand(args);
    if (!subcommand) {
        showHelp();
        return;
    }
    switch (subcommand) {
        case 'list':
            await listInstances();
            break;
        case 'add':
            await addInstance();
            break;
        case 'remove':
            await removeInstance(subArgs[0]);
            break;
        case 'test':
            await testInstance(subArgs[0]);
            break;
        case 'info':
            await showInstanceInfo(subArgs[0]);
            break;
        case 'sample-config':
            showSampleConfig(subArgs[0]);
            break;
    }
}
function showHelp() {
    console.log(`
GitLab Instance Management Commands

Usage: npx @structured-world/gitlab-mcp instances <command> [options]

Commands:
  list                List all configured GitLab instances
  add                 Add a new GitLab instance (interactive)
  remove <url>        Remove a GitLab instance
  test [url]          Test connection to instance(s)
  info <url>          Show detailed instance information
  sample-config [fmt] Generate sample config file (yaml or json)

Configuration:
  Instances can be configured via:
  1. GITLAB_INSTANCES_FILE - Path to YAML/JSON config file
  2. GITLAB_INSTANCES - Environment variable (URL, array, or JSON)
  3. GITLAB_API_URL - Legacy single-instance mode

Examples:
  npx @structured-world/gitlab-mcp instances list
  npx @structured-world/gitlab-mcp instances add
  npx @structured-world/gitlab-mcp instances test https://gitlab.com
  npx @structured-world/gitlab-mcp instances sample-config yaml
`);
}
async function listInstances() {
    const config = await (0, instances_loader_js_1.loadInstancesConfig)();
    console.log(`\nConfigured GitLab Instances (source: ${config.source})`);
    console.log(`─`.repeat(60));
    if (config.instances.length === 0) {
        console.log('No instances configured.');
        return;
    }
    for (const instance of config.instances) {
        const label = instance.label ? ` (${instance.label})` : '';
        const oauth = instance.oauth ? ' [OAuth]' : '';
        const rateLimit = instance.rateLimit
            ? ` [Rate: ${instance.rateLimit.maxConcurrent} concurrent]`
            : '';
        const tls = instance.insecureSkipVerify ? ' [TLS: skip]' : '';
        console.log(`  ${instance.url}${label}${oauth}${rateLimit}${tls}`);
    }
    console.log(`\nTotal: ${config.instances.length} instance(s)`);
}
async function addInstance() {
    p.intro('Add GitLab Instance');
    const url = await p.text({
        message: 'GitLab instance URL:',
        placeholder: 'https://gitlab.com',
        validate: (value) => {
            if (!value)
                return 'URL is required';
            try {
                new URL(value);
                return undefined;
            }
            catch {
                return 'Please enter a valid URL';
            }
        },
    });
    if (p.isCancel(url)) {
        p.cancel('Cancelled');
        return;
    }
    const label = await p.text({
        message: 'Label (optional):',
        placeholder: 'My GitLab',
    });
    if (p.isCancel(label)) {
        p.cancel('Cancelled');
        return;
    }
    const useOAuth = await p.confirm({
        message: 'Configure OAuth?',
        initialValue: false,
    });
    if (p.isCancel(useOAuth)) {
        p.cancel('Cancelled');
        return;
    }
    let oauth;
    if (useOAuth) {
        const clientId = await p.text({
            message: 'OAuth Application ID:',
            validate: (value) => (value ? undefined : 'Required'),
        });
        if (p.isCancel(clientId)) {
            p.cancel('Cancelled');
            return;
        }
        const clientSecret = await p.password({
            message: 'OAuth Secret (optional, for confidential apps):',
        });
        if (p.isCancel(clientSecret)) {
            p.cancel('Cancelled');
            return;
        }
        oauth = {
            clientId: clientId,
            clientSecret: clientSecret || undefined,
            scopes: 'api read_user',
        };
    }
    const config = {
        url: url,
        label: label || undefined,
        oauth,
        insecureSkipVerify: false,
    };
    const logConfigPreview = {
        url: config.url,
        label: config.label,
        insecureSkipVerify: config.insecureSkipVerify,
        oauthConfigured: !!config.oauth,
    };
    console.log('\nInstance Configuration:');
    console.log(JSON.stringify(logConfigPreview, null, 2));
    const confirmed = await p.confirm({
        message: 'Add this configuration?',
        initialValue: true,
    });
    if (p.isCancel(confirmed) || !confirmed) {
        p.cancel('Cancelled');
        return;
    }
    p.outro(`
Instance configured! To use it, add to your configuration:

Environment variable:
  GITLAB_INSTANCES="${config.url}${oauth ? `:${oauth.clientId}` : ''}"

Or add to instances.yaml:
  instances:
    - url: ${config.url}
      label: "${config.label ?? ''}"
${oauth ? `      oauth:\n        clientId: "${oauth.clientId}"` : ''}
`);
}
async function removeInstance(url) {
    if (!url) {
        console.log('Usage: instances remove <url>');
        console.log('Example: instances remove https://gitlab.com');
        return;
    }
    console.log(`\nTo remove instance ${url}, edit your configuration file`);
    console.log('and remove the corresponding entry from the instances array.');
}
async function testInstance(url) {
    const registry = InstanceRegistry_js_1.InstanceRegistry.getInstance();
    if (!registry.isInitialized()) {
        await registry.initialize();
    }
    const urls = url ? [url] : registry.getUrls();
    if (urls.length === 0) {
        console.log('No instances to test.');
        return;
    }
    console.log('\nTesting GitLab Instance Connections');
    console.log(`─`.repeat(60));
    for (const instanceUrl of urls) {
        process.stdout.write(`  ${instanceUrl}... `);
        try {
            const versionUrl = `${instanceUrl}/api/v4/version`;
            const response = await (0, fetch_1.enhancedFetch)(versionUrl, {
                headers: { Accept: 'application/json' },
                retry: false,
                skipAuth: true,
                rateLimit: false,
            });
            if (response.ok) {
                const data = (await response.json());
                console.log(`✓ Connected (v${data.version ?? 'unknown'})`);
            }
            else if (response.status === 401) {
                console.log('✓ Reachable (authentication required)');
            }
            else {
                console.log(`✗ Error: HTTP ${response.status}`);
            }
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.log(`✗ Failed: ${message}`);
        }
    }
}
async function showInstanceInfo(url) {
    if (!url) {
        console.log('Usage: instances info <url>');
        console.log('Example: instances info https://gitlab.com');
        return;
    }
    const registry = InstanceRegistry_js_1.InstanceRegistry.getInstance();
    if (!registry.isInitialized()) {
        await registry.initialize();
    }
    const entry = registry.get(url);
    if (!entry) {
        console.log(`Instance not found: ${url}`);
        console.log("Use 'instances list' to see configured instances.");
        return;
    }
    const { config, state } = entry;
    const metrics = registry.getRateLimitMetrics(url);
    const introspection = registry.getIntrospection(url);
    console.log(`\nInstance Information: ${url}`);
    console.log(`─`.repeat(60));
    console.log('\nConfiguration:');
    console.log(`  URL: ${config.url}`);
    console.log(`  Label: ${config.label ?? '(none)'}`);
    console.log(`  OAuth: ${config.oauth ? 'Enabled (client configured)' : 'Disabled'}`);
    console.log(`  TLS Verify: ${config.insecureSkipVerify ? 'Disabled' : 'Enabled'}`);
    if (config.rateLimit) {
        console.log('\nRate Limit Config:');
        console.log(`  Max Concurrent: ${config.rateLimit.maxConcurrent}`);
        console.log(`  Queue Size: ${config.rateLimit.queueSize}`);
        console.log(`  Queue Timeout: ${config.rateLimit.queueTimeout}ms`);
    }
    console.log('\nRuntime State:');
    console.log(`  Connection: ${state.connectionStatus}`);
    console.log(`  Last Health Check: ${state.lastHealthCheck?.toISOString() ?? '(never)'}`);
    if (metrics) {
        console.log('\nRate Limit Metrics:');
        console.log(`  Active Requests: ${metrics.activeRequests}/${metrics.maxConcurrent}`);
        console.log(`  Queued: ${metrics.queuedRequests}/${metrics.queueSize}`);
        console.log(`  Total Requests: ${metrics.requestsTotal}`);
        console.log(`  Rejected: ${metrics.requestsRejected}`);
        console.log(`  Avg Queue Wait: ${metrics.avgQueueWaitMs}ms`);
    }
    if (introspection) {
        console.log('\nIntrospection Cache:');
        console.log(`  Version: ${introspection.version}`);
        console.log(`  Tier: ${introspection.tier}`);
        console.log(`  Cached At: ${introspection.cachedAt.toISOString()}`);
    }
    else {
        console.log('\nIntrospection Cache: (not cached)');
    }
}
function showSampleConfig(format) {
    const fmt = format ?? 'yaml';
    let config = (0, instances_loader_js_1.generateSampleConfig)(fmt);
    if (fmt === 'json') {
        try {
            const parsed = JSON.parse(config);
            if (parsed?.instances) {
                for (const instance of parsed.instances) {
                    if (instance?.oauth?.clientSecret) {
                        instance.oauth.clientSecret = '***masked***';
                    }
                }
            }
            if (parsed?.defaults?.oauth?.clientSecret) {
                parsed.defaults.oauth.clientSecret = '***masked***';
            }
            config = JSON.stringify(parsed, null, 2);
        }
        catch {
        }
    }
    else {
        config = config.replace(/clientSecret:\s*["']?[^"'\n]+["']?/g, 'clientSecret: "***masked***"');
    }
    console.log(`\nSample ${fmt.toUpperCase()} Configuration:`);
    console.log(`─`.repeat(60));
    console.log(config);
}
//# sourceMappingURL=instances-command.js.map