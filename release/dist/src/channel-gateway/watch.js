"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WatchManager = exports.TERMINAL = exports.NON_FINAL = void 0;
exports.aggregateState = aggregateState;
exports.isTerminal = isTerminal;
exports.diffJobs = diffJobs;
exports.snapshot = snapshot;
exports.detectWatchable = detectWatchable;
exports.NON_FINAL = new Set([
    'created',
    'pending',
    'running',
    'waiting_for_resource',
    'preparing',
    'scheduled',
    'blocked',
]);
exports.TERMINAL = {
    pipeline: new Set(['success', 'failed', 'canceled', 'skipped']),
    job: new Set(['success', 'failed', 'canceled', 'skipped', 'manual']),
    deployment: new Set(['success', 'failed', 'canceled', 'skipped']),
};
function aggregateState(jobs) {
    if (jobs.length === 0)
        return 'pending';
    const states = new Set(jobs.map((j) => j.status));
    for (const s of states)
        if (exports.NON_FINAL.has(s))
            return 'running';
    if (states.has('failed'))
        return 'failed';
    if (states.has('canceled'))
        return 'canceled';
    if (states.has('skipped') && states.size === 1)
        return 'skipped';
    return 'success';
}
function isTerminal(pipelineState) {
    return exports.TERMINAL.pipeline.has(pipelineState);
}
function diffJobs(prev, jobs) {
    const out = [];
    for (const j of jobs) {
        const before = prev.get(j.name) ?? null;
        if (before !== j.status)
            out.push({ name: j.name, from: before, to: j.status });
    }
    return out;
}
function snapshot(jobs) {
    return new Map(jobs.map((j) => [j.name, j.status]));
}
function detectWatchable(projectId, result) {
    if (!projectId)
        return null;
    if (result && typeof result === 'object' && !Array.isArray(result)) {
        const r = result;
        const id = r.id;
        const status = r.status;
        if (typeof id === 'number' && typeof status === 'string') {
            const isDeployment = 'environment' in r && 'deployable' in r;
            const isPipeline = 'ref' in r || 'sha' in r || 'source' in r;
            const kind = isDeployment
                ? 'deployment'
                : isPipeline
                    ? 'pipeline'
                    : null;
            if (kind && !exports.TERMINAL[kind].has(status))
                return { kind, projectId, id };
        }
    }
    return null;
}
const defaultSleep = (ms) => new Promise((r) => setTimeout(r, ms));
class WatchManager {
    active = new Map();
    deps;
    constructor(deps) {
        this.deps = {
            sleep: defaultSleep,
            now: () => Date.now(),
            onError: () => { },
            ...deps,
        };
    }
    static key(t) {
        return `${t.projectId}#${t.kind}#${t.id}`;
    }
    get size() {
        return this.active.size;
    }
    has(target) {
        return this.active.has(WatchManager.key(target));
    }
    watch(target, opts = {}) {
        const key = WatchManager.key(target);
        if (this.active.has(key))
            return Promise.resolve();
        const ctrl = new AbortController();
        this.active.set(key, ctrl);
        return this.run(target, opts, ctrl.signal).finally(() => {
            this.active.delete(key);
        });
    }
    cancel(target) {
        this.active.get(WatchManager.key(target))?.abort();
    }
    cancelAll() {
        for (const ctrl of this.active.values())
            ctrl.abort();
        this.active.clear();
    }
    async run(target, opts, signal) {
        const pollMs = opts.pollMs ?? 10_000;
        const maxDurationMs = opts.maxDurationMs ?? 3_600_000;
        const started = this.deps.now();
        let prev = new Map();
        while (!signal.aborted) {
            let jobs;
            try {
                jobs = await this.deps.pollJobs(target);
            }
            catch (error) {
                this.deps.onError(target, error);
                return;
            }
            const pipelineState = aggregateState(jobs);
            const transitions = diffJobs(prev, jobs);
            const terminal = isTerminal(pipelineState);
            if (transitions.length > 0 || terminal) {
                this.deps.emit({ target, pipelineState, jobs, transitions, terminal });
            }
            prev = snapshot(jobs);
            if (terminal)
                return;
            if (this.deps.now() - started >= maxDurationMs)
                return;
            await this.deps.sleep(pollMs);
        }
    }
}
exports.WatchManager = WatchManager;
//# sourceMappingURL=watch.js.map