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
exports.parseToolResult = parseToolResult;
exports.parseJobs = parseJobs;
exports.parseDeployments = parseDeployments;
exports.formatEvent = formatEvent;
const z = __importStar(require("zod"));
const JobSchema = z.object({
    id: z.number(),
    name: z.string(),
    stage: z.string(),
    status: z.string(),
});
const DeploymentSchema = z.object({
    id: z.number(),
    status: z.string(),
    environment: z.object({ name: z.string() }).optional(),
});
function parseToolResult(result) {
    if (result && typeof result === 'object' && 'content' in result) {
        const content = result.content;
        const text = Array.isArray(content) ? content.find((c) => c.type === 'text')?.text : undefined;
        if (typeof text === 'string') {
            try {
                return JSON.parse(text);
            }
            catch {
                return null;
            }
        }
    }
    return result;
}
function parseJobs(result) {
    const data = parseToolResult(result);
    if (!Array.isArray(data))
        return [];
    const out = [];
    for (const item of data) {
        const parsed = JobSchema.safeParse(item);
        if (parsed.success)
            out.push(parsed.data);
    }
    return out;
}
function parseDeployments(result) {
    const data = parseToolResult(result);
    if (!Array.isArray(data))
        return [];
    const out = [];
    for (const item of data) {
        const parsed = DeploymentSchema.safeParse(item);
        if (parsed.success) {
            out.push({
                id: parsed.data.id,
                name: parsed.data.environment?.name ?? `deployment-${parsed.data.id}`,
                stage: 'deploy',
                status: parsed.data.status,
            });
        }
    }
    return out;
}
function formatEvent(event) {
    const { target, pipelineState, jobs, transitions, terminal } = event;
    const jobsLine = jobs.map((j) => `${j.name}:${j.status}`).join(' ');
    const label = target.kind === 'deployment' ? 'Deployment' : 'Pipeline';
    const idKey = target.kind === 'deployment' ? 'deployment_id' : 'pipeline_id';
    const content = terminal
        ? `${label} #${target.id} (project ${target.projectId}) finished: ${pipelineState}. Jobs: ${jobsLine}`
        : `${label} #${target.id} (project ${target.projectId}) ${transitions
            .map((t) => `${t.name} ${t.from ?? 'new'}->${t.to}`)
            .join(', ')}. Now: ${jobsLine}`;
    const meta = {
        [idKey]: String(target.id),
        project_id: target.projectId,
        kind: target.kind,
        state: pipelineState,
        terminal: String(terminal),
    };
    return { content, meta };
}
//# sourceMappingURL=format.js.map