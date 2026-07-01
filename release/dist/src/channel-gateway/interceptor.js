"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interceptor = void 0;
exports.extractProjectId = extractProjectId;
const watch_1 = require("./watch");
const format_1 = require("./format");
function extractProjectId(args) {
    if (args && typeof args === 'object') {
        const p = args.project_id;
        if (typeof p === 'string')
            return p;
        if (typeof p === 'number')
            return String(p);
    }
    return '';
}
class Interceptor {
    deps;
    watches;
    pollMs;
    maxDurationMs;
    constructor(deps) {
        this.deps = deps;
        this.pollMs = deps.pollMs ?? 10_000;
        this.maxDurationMs = deps.maxDurationMs ?? 3_600_000;
        this.watches = new watch_1.WatchManager({
            pollJobs: (t) => this.pollJobs(t),
            emit: deps.emit,
            onError: (t, error) => {
                process.stderr.write(`[channel-gateway] watch ${watch_1.WatchManager.key(t)} stopped on poll error: ${String(error)}\n`);
            },
        });
    }
    get activeWatches() {
        return this.watches.size;
    }
    async pollJobs(target) {
        if (target.kind === 'deployment') {
            const result = await this.deps.forward('browse_environments', {
                action: 'list_deployments',
                project_id: target.projectId,
                order_by: 'id',
                sort: 'desc',
            });
            return (0, format_1.parseDeployments)(result).filter((d) => d.id === target.id);
        }
        const result = await this.deps.forward('browse_pipelines', {
            action: 'jobs',
            project_id: target.projectId,
            pipeline_id: target.id,
        });
        return (0, format_1.parseJobs)(result);
    }
    async handleCall(name, args) {
        const result = await this.deps.forward(name, args);
        const target = (0, watch_1.detectWatchable)(extractProjectId(args), (0, format_1.parseToolResult)(result));
        if (target && !this.watches.has(target)) {
            this.watches
                .watch(target, { pollMs: this.pollMs, maxDurationMs: this.maxDurationMs })
                .catch((error) => {
                process.stderr.write(`[channel-gateway] watch ${watch_1.WatchManager.key(target)} failed: ${String(error)}\n`);
            });
        }
        return result;
    }
    shutdown() {
        this.watches.cancelAll();
    }
}
exports.Interceptor = Interceptor;
//# sourceMappingURL=interceptor.js.map