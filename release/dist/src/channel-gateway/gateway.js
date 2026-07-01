"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelGateway = void 0;
const index_js_1 = require("@modelcontextprotocol/sdk/client/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/client/stdio.js");
const index_js_2 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_2 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const interceptor_1 = require("./interceptor");
const format_1 = require("./format");
const forwarding_1 = require("./forwarding");
const CHANNEL_NOTIFICATION = 'notifications/claude/channel';
class ChannelGateway {
    config;
    server;
    client;
    transport;
    interceptor;
    connected = false;
    reconnecting = false;
    closing = false;
    pendingWaiters = 0;
    constructor(config) {
        this.config = config;
        this.server = new index_js_2.Server({ name: config.name ?? 'gitlab-ci-gateway', version: config.version ?? '0.1.0' }, {
            capabilities: {
                tools: {},
                experimental: { 'claude/channel': {} },
            },
            instructions: 'Forwards the full gitlab-mcp tool catalog. When a CI pipeline/job is ' +
                'still running, it is watched in the background and a <channel> event ' +
                'is pushed on each state change and on completion.',
        });
        this.client = this.newClient();
        this.interceptor = new interceptor_1.Interceptor({
            forward: (name, args) => this.forward(name, args),
            emit: (event) => this.emit(event),
            pollMs: config.pollMs,
        });
        this.registerHandlers();
    }
    async start() {
        await this.connectDownstream();
        await this.server.connect(new stdio_js_2.StdioServerTransport());
    }
    async stop() {
        this.closing = true;
        this.interceptor.shutdown();
        await this.transport?.close().catch(() => { });
    }
    newClient() {
        return new index_js_1.Client({ name: this.config.name ?? 'gitlab-ci-gateway', version: '0.1.0' });
    }
    registerHandlers() {
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
            const { tools } = (await (0, forwarding_1.forwardWithPolicy)({
                isRead: () => true,
                isConnected: () => this.connected,
                waitForConnection: () => this.waitForConnection(),
                call: () => this.client.listTools(),
            }, 'tools/list', undefined));
            return { tools };
        });
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            return (await this.interceptor.handleCall(name, args ?? {}));
        });
    }
    async connectDownstream() {
        const maxBackoff = this.config.maxBackoffMs ?? 30_000;
        let backoff = 500;
        for (;;) {
            if (this.closing)
                return;
            try {
                this.transport = new stdio_js_1.StdioClientTransport({
                    command: this.config.downstreamCommand,
                    args: this.config.downstreamArgs,
                    env: this.config.downstreamEnv,
                });
                this.transport.onclose = () => this.handleDownstreamClose();
                this.client = this.newClient();
                await this.client.connect(this.transport);
                if (this.closing) {
                    await this.transport.close().catch(() => { });
                    return;
                }
                this.connected = true;
                if (this.reconnecting)
                    this.notifyLink('restored');
                return;
            }
            catch {
                if (this.closing)
                    return;
                await this.sleep(backoff);
                backoff = Math.min(backoff * 2, maxBackoff);
            }
        }
    }
    handleDownstreamClose() {
        this.connected = false;
        if (this.closing || this.reconnecting)
            return;
        this.reconnecting = true;
        this.notifyLink('lost');
        void this.connectDownstream().finally(() => {
            this.reconnecting = false;
        });
    }
    async waitForConnection() {
        if (this.connected)
            return;
        const maxQueued = this.config.maxQueued ?? 100;
        if (this.pendingWaiters >= maxQueued) {
            throw new Error(`downstream unavailable: request buffer full (${maxQueued})`);
        }
        this.pendingWaiters++;
        try {
            const deadline = Date.now() + (this.config.connectTimeoutMs ?? 30_000);
            while (!this.connected && !this.closing && Date.now() < deadline) {
                await this.sleep(100);
            }
            if (!this.connected) {
                throw new Error('downstream unavailable: reconnect timed out');
            }
        }
        finally {
            this.pendingWaiters--;
        }
    }
    forward(name, args) {
        return (0, forwarding_1.forwardWithPolicy)({
            isRead: forwarding_1.isReadCall,
            isConnected: () => this.connected,
            waitForConnection: () => this.waitForConnection(),
            call: (n, a) => this.callDownstream(n, a),
        }, name, args);
    }
    async callDownstream(name, args) {
        return await this.client.callTool({
            name,
            arguments: (args ?? {}),
        });
    }
    emit(event) {
        const { content, meta } = (0, format_1.formatEvent)(event);
        void this.server.notification({ method: CHANNEL_NOTIFICATION, params: { content, meta } });
    }
    notifyLink(state) {
        const content = state === 'lost'
            ? 'gitlab-mcp link lost - reconnecting; reads will retry, writes will surface errors'
            : 'gitlab-mcp link restored';
        void this.server.notification({
            method: CHANNEL_NOTIFICATION,
            params: { content, meta: { kind: 'link', state } },
        });
    }
    sleep(ms) {
        return new Promise((r) => setTimeout(r, ms));
    }
}
exports.ChannelGateway = ChannelGateway;
//# sourceMappingURL=gateway.js.map