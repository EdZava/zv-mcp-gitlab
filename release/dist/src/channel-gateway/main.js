#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = require("node:path");
const gateway_1 = require("./gateway");
function cleanEnv(env) {
    const out = {};
    for (const [k, v] of Object.entries(env))
        if (typeof v === 'string')
            out[k] = v;
    return out;
}
const MIN_POLL_MS = 1_000;
const DEFAULT_POLL_MS = 10_000;
function parsePollMs(raw) {
    if (raw === undefined)
        return DEFAULT_POLL_MS;
    const n = Number(raw);
    return Number.isFinite(n) && n >= MIN_POLL_MS ? n : DEFAULT_POLL_MS;
}
async function main() {
    const args = process.env.GATEWAY_DOWNSTREAM_ARGS
        ? process.env.GATEWAY_DOWNSTREAM_ARGS.split(' ').filter(Boolean)
        : [(0, node_path_1.join)(__dirname, '..', 'main.js'), 'stdio'];
    const gateway = new gateway_1.ChannelGateway({
        downstreamCommand: process.env.GATEWAY_DOWNSTREAM_COMMAND ?? 'node',
        downstreamArgs: args,
        downstreamEnv: cleanEnv(process.env),
        pollMs: parsePollMs(process.env.GATEWAY_POLL_MS),
    });
    const stop = () => {
        void gateway.stop().finally(() => process.exit(0));
    };
    process.on('SIGINT', stop);
    process.on('SIGTERM', stop);
    await gateway.start();
}
main().catch((err) => {
    process.stderr.write(`channel-gateway failed: ${String(err)}\n`);
    process.exit(1);
});
//# sourceMappingURL=main.js.map