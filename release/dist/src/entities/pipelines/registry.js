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
exports.pipelinesToolRegistry = void 0;
exports.getPipelinesReadOnlyToolNames = getPipelinesReadOnlyToolNames;
exports.getPipelinesToolDefinitions = getPipelinesToolDefinitions;
exports.getFilteredPipelinesTools = getFilteredPipelinesTools;
const z = __importStar(require("zod"));
const schema_readonly_1 = require("./schema-readonly");
const schema_1 = require("./schema");
const gitlab_api_1 = require("../../utils/gitlab-api");
const projectIdentifier_1 = require("../../utils/projectIdentifier");
const fetch_1 = require("../../utils/fetch");
const logger_1 = require("../../logger");
const utils_1 = require("../utils");
exports.pipelinesToolRegistry = new Map([
    [
        'browse_pipelines',
        {
            name: 'browse_pipelines',
            description: 'Monitor CI/CD pipelines and read job logs. Actions: list (filter by status/ref/source/username), get (pipeline details), jobs (list pipeline jobs), triggers (bridge/trigger jobs), job (single job details), logs (job console output). Related: manage_pipeline to trigger/retry/cancel pipelines and play/retry/cancel individual jobs.',
            inputSchema: z.toJSONSchema(schema_readonly_1.BrowsePipelinesSchema),
            requirements: { default: { tier: 'free', minVersion: '9.0' } },
            gate: { envVar: 'USE_PIPELINE', defaultValue: true },
            handler: async (args) => {
                const input = schema_readonly_1.BrowsePipelinesSchema.parse(args);
                (0, utils_1.assertActionAllowed)('browse_pipelines', input.action);
                switch (input.action) {
                    case 'list': {
                        const { project_id, action: _action, ...queryOptions } = input;
                        return gitlab_api_1.gitlab.get(`projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}/pipelines`, {
                            query: (0, gitlab_api_1.toQuery)(queryOptions, []),
                        });
                    }
                    case 'get': {
                        const { project_id, pipeline_id } = input;
                        return gitlab_api_1.gitlab.get(`projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}/pipelines/${pipeline_id}`);
                    }
                    case 'jobs': {
                        const { project_id, pipeline_id, job_scope, include_retried, per_page, page } = input;
                        const queryOptions = {};
                        if (job_scope)
                            queryOptions.scope = job_scope;
                        if (include_retried !== undefined)
                            queryOptions.include_retried = include_retried;
                        if (per_page !== undefined)
                            queryOptions.per_page = per_page;
                        if (page !== undefined)
                            queryOptions.page = page;
                        return gitlab_api_1.gitlab.get(`projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}/pipelines/${pipeline_id}/jobs`, { query: (0, gitlab_api_1.toQuery)(queryOptions, []) });
                    }
                    case 'triggers': {
                        const { project_id, pipeline_id, trigger_scope, include_retried, per_page, page } = input;
                        const queryOptions = {};
                        if (trigger_scope)
                            queryOptions.scope = trigger_scope;
                        if (include_retried !== undefined)
                            queryOptions.include_retried = include_retried;
                        if (per_page !== undefined)
                            queryOptions.per_page = per_page;
                        if (page !== undefined)
                            queryOptions.page = page;
                        return gitlab_api_1.gitlab.get(`projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}/pipelines/${pipeline_id}/bridges`, { query: (0, gitlab_api_1.toQuery)(queryOptions, []) });
                    }
                    case 'job': {
                        const { project_id, job_id } = input;
                        return gitlab_api_1.gitlab.get(`projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}/jobs/${job_id}`);
                    }
                    case 'logs': {
                        const { project_id, job_id, per_page, start } = input;
                        const apiUrl = `${process.env.GITLAB_API_URL}/api/v4/projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}/jobs/${job_id}/trace`;
                        const response = await (0, fetch_1.enhancedFetch)(apiUrl);
                        if (!response.ok) {
                            throw new Error(`GitLab API error: ${response.status} ${response.statusText}`);
                        }
                        let trace = await response.text();
                        const lines = trace.split('\n');
                        const totalLines = lines.length;
                        const defaultMaxLines = 200;
                        const maxLinesToShow = per_page ?? defaultMaxLines;
                        let processedLines;
                        let outOfBoundsMessage = '';
                        let effectiveStart;
                        if (start !== undefined && start < 0) {
                            effectiveStart = Math.max(0, totalLines + start);
                            processedLines = lines.slice(start);
                            if (processedLines.length > maxLinesToShow) {
                                effectiveStart = totalLines - maxLinesToShow;
                                processedLines = processedLines.slice(-maxLinesToShow);
                            }
                        }
                        else if (start !== undefined && start >= 0) {
                            effectiveStart = start;
                            if (start >= totalLines) {
                                processedLines = [];
                                outOfBoundsMessage = `[OUT OF BOUNDS: Start position ${start} exceeds total lines ${totalLines}. Available range: 0-${totalLines - 1}]`;
                            }
                            else {
                                processedLines = lines.slice(start, start + maxLinesToShow);
                                if (start + maxLinesToShow > totalLines) {
                                    const availableFromStart = totalLines - start;
                                    outOfBoundsMessage = `[PARTIAL REQUEST: Requested ${maxLinesToShow} lines from position ${start}, but only ${availableFromStart} lines available]`;
                                }
                            }
                        }
                        else {
                            effectiveStart = Math.max(0, totalLines - maxLinesToShow);
                            processedLines = lines.slice(-maxLinesToShow);
                        }
                        const actualDataLines = processedLines.length;
                        if (outOfBoundsMessage) {
                            processedLines.unshift(outOfBoundsMessage);
                        }
                        if (actualDataLines < totalLines && !outOfBoundsMessage) {
                            const endLine = effectiveStart + actualDataLines - 1;
                            let truncationMessage;
                            if (start === undefined || start < 0) {
                                truncationMessage = `[LOG TRUNCATED: Showing last ${actualDataLines} of ${totalLines} lines (lines ${effectiveStart}-${endLine})]`;
                            }
                            else {
                                truncationMessage = `[LOG TRUNCATED: Showing lines ${effectiveStart}-${endLine} of ${totalLines}]`;
                            }
                            processedLines.unshift(truncationMessage);
                        }
                        trace = processedLines.join('\n');
                        const hasMore = effectiveStart + actualDataLines < totalLines;
                        const nextStart = hasMore ? effectiveStart + actualDataLines : null;
                        return {
                            trace,
                            totalLines,
                            shownLines: actualDataLines,
                            startLine: effectiveStart,
                            hasMore,
                            nextStart,
                        };
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
    [
        'manage_pipeline',
        {
            name: 'manage_pipeline',
            description: "Trigger, retry, or cancel CI/CD pipelines and individual jobs. Pipeline actions: create (run pipeline on ref with variables or typed inputs), retry (re-run failed jobs), cancel (stop running pipeline). Job actions: play_job (trigger a manual/delayed job with variables), retry_job (re-run a single job), cancel_job (stop a running job). Related: browse_pipelines actions 'job'/'logs' for job details.",
            inputSchema: z.toJSONSchema(schema_1.ManagePipelineSchema),
            requirements: { default: { tier: 'free', minVersion: '9.0' } },
            gate: { envVar: 'USE_PIPELINE', defaultValue: true },
            handler: async (args) => {
                const input = schema_1.ManagePipelineSchema.parse(args);
                (0, utils_1.assertActionAllowed)('manage_pipeline', input.action);
                switch (input.action) {
                    case 'create': {
                        const { project_id, ref, variables, inputs } = input;
                        const queryParams = new URLSearchParams();
                        queryParams.set('ref', ref);
                        const body = {};
                        if (variables && variables.length > 0) {
                            body.variables = variables;
                        }
                        if (inputs && Object.keys(inputs).length > 0) {
                            body.inputs = inputs;
                        }
                        const apiUrl = `${process.env.GITLAB_API_URL}/api/v4/projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}/pipeline?${queryParams}`;
                        const response = await (0, fetch_1.enhancedFetch)(apiUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(body),
                        });
                        if (!response.ok) {
                            let errorMessage = `GitLab API error: ${response.status} ${response.statusText}`;
                            try {
                                const errorBody = (await response.json());
                                if (errorBody.message) {
                                    if (typeof errorBody.message === 'string') {
                                        errorMessage += ` - ${errorBody.message}`;
                                    }
                                    else if (typeof errorBody.message === 'object' && errorBody.message !== null) {
                                        const errorDetails = [];
                                        const messageObj = errorBody.message;
                                        Object.keys(messageObj).forEach((key) => {
                                            const value = messageObj[key];
                                            if (Array.isArray(value)) {
                                                errorDetails.push(`${key}: ${value.join(', ')}`);
                                            }
                                            else {
                                                errorDetails.push(`${key}: ${String(value)}`);
                                            }
                                        });
                                        if (errorDetails.length > 0) {
                                            errorMessage += ` - ${errorDetails.join('; ')}`;
                                        }
                                    }
                                }
                                if (typeof errorBody.error === 'string') {
                                    errorMessage += ` - ${errorBody.error}`;
                                }
                                if (Array.isArray(errorBody.errors)) {
                                    errorMessage += ` - ${errorBody.errors.map((e) => String(e)).join(', ')}`;
                                }
                                (0, logger_1.logError)('manage_pipeline create failed', {
                                    status: response.status,
                                    errorBody,
                                    url: apiUrl,
                                });
                            }
                            catch {
                                (0, logger_1.logError)('manage_pipeline create failed (could not parse error)', {
                                    status: response.status,
                                    url: apiUrl,
                                });
                            }
                            throw new Error(errorMessage);
                        }
                        const pipeline = (await response.json());
                        return pipeline;
                    }
                    case 'retry': {
                        const { project_id, pipeline_id } = input;
                        return gitlab_api_1.gitlab.post(`projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}/pipelines/${pipeline_id}/retry`);
                    }
                    case 'cancel': {
                        const { project_id, pipeline_id } = input;
                        return gitlab_api_1.gitlab.post(`projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}/pipelines/${pipeline_id}/cancel`);
                    }
                    case 'play_job': {
                        const { project_id, job_id, job_variables_attributes } = input;
                        const body = {};
                        if (job_variables_attributes) {
                            body.job_variables_attributes = job_variables_attributes;
                        }
                        return gitlab_api_1.gitlab.post(`projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}/jobs/${job_id}/play`, {
                            body,
                            contentType: 'json',
                        });
                    }
                    case 'retry_job': {
                        const { project_id, job_id } = input;
                        return gitlab_api_1.gitlab.post(`projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}/jobs/${job_id}/retry`);
                    }
                    case 'cancel_job': {
                        const { project_id, job_id, force } = input;
                        const query = force ? { force: 'true' } : undefined;
                        return gitlab_api_1.gitlab.post(`projects/${(0, projectIdentifier_1.normalizeProjectId)(project_id)}/jobs/${job_id}/cancel`, {
                            query,
                        });
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
]);
function getPipelinesReadOnlyToolNames() {
    return ['browse_pipelines'];
}
function getPipelinesToolDefinitions() {
    return Array.from(exports.pipelinesToolRegistry.values());
}
function getFilteredPipelinesTools(readOnlyMode = false) {
    if (readOnlyMode) {
        const readOnlyNames = getPipelinesReadOnlyToolNames();
        return Array.from(exports.pipelinesToolRegistry.values()).filter((tool) => readOnlyNames.includes(tool.name));
    }
    return getPipelinesToolDefinitions();
}
//# sourceMappingURL=registry.js.map