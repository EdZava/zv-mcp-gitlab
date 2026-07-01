"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowsePipelinesSchema = exports.GitLabPipelineTriggerJobSchema = exports.GitLabPipelineJobSchema = exports.GitLabPipelineSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
exports.GitLabPipelineSchema = zod_1.z.object({
    id: zod_1.z.coerce.string(),
    project_id: zod_1.z.coerce.string(),
    sha: zod_1.z.string(),
    ref: zod_1.z.string(),
    status: zod_1.z.string(),
    source: zod_1.z.string().optional(),
    created_at: zod_1.z.string(),
    updated_at: zod_1.z.string(),
    web_url: zod_1.z.string(),
    duration: zod_1.z.number().nullable().optional(),
    started_at: zod_1.z.string().nullable().optional(),
    finished_at: zod_1.z.string().nullable().optional(),
    coverage: zod_1.z.coerce.number().nullable().optional(),
    user: zod_1.z
        .object({
        id: zod_1.z.coerce.string(),
        name: zod_1.z.string(),
        username: zod_1.z.string(),
        avatar_url: zod_1.z.string().nullable().optional(),
    })
        .optional(),
    detailed_status: zod_1.z
        .object({
        icon: zod_1.z.string().optional(),
        text: zod_1.z.string().optional(),
        label: zod_1.z.string().optional(),
        group: zod_1.z.string().optional(),
        tooltip: zod_1.z.string().optional(),
        has_details: utils_1.flexibleBoolean.optional(),
        details_path: zod_1.z.string().optional(),
        illustration: zod_1.z
            .object({
            image: zod_1.z.string().optional(),
            size: zod_1.z.string().optional(),
            title: zod_1.z.string().optional(),
        })
            .nullable()
            .optional(),
        favicon: zod_1.z.string().optional(),
    })
        .optional(),
});
exports.GitLabPipelineJobSchema = zod_1.z.object({
    id: zod_1.z.coerce.string(),
    status: zod_1.z.string(),
    stage: zod_1.z.string(),
    name: zod_1.z.string(),
    ref: zod_1.z.string(),
    tag: utils_1.flexibleBoolean,
    coverage: zod_1.z.coerce.number().nullable().optional(),
    allow_failure: utils_1.flexibleBoolean.optional(),
    created_at: zod_1.z.string(),
    started_at: zod_1.z.string().optional(),
    finished_at: zod_1.z.string().optional(),
    duration: zod_1.z.number().optional(),
    queued_duration: zod_1.z.number().optional(),
    user: zod_1.z
        .object({
        id: zod_1.z.coerce.string(),
        name: zod_1.z.string(),
        username: zod_1.z.string(),
        state: zod_1.z.string(),
        avatar_url: zod_1.z.string().nullable().optional(),
        web_url: zod_1.z.string(),
    })
        .optional(),
    commit: zod_1.z
        .object({
        id: zod_1.z.string(),
        short_id: zod_1.z.string(),
        title: zod_1.z.string(),
        author_name: zod_1.z.string(),
        author_email: zod_1.z.string(),
        created_at: zod_1.z.string(),
        message: zod_1.z.string(),
    })
        .optional(),
    pipeline: zod_1.z
        .object({
        id: zod_1.z.coerce.string(),
        project_id: zod_1.z.coerce.string(),
        ref: zod_1.z.string(),
        sha: zod_1.z.string(),
        status: zod_1.z.string(),
    })
        .optional(),
    web_url: zod_1.z.string(),
});
exports.GitLabPipelineTriggerJobSchema = zod_1.z.object({
    id: zod_1.z.coerce.string(),
    status: zod_1.z.string(),
    stage: zod_1.z.string(),
    name: zod_1.z.string(),
    ref: zod_1.z.string(),
    tag: utils_1.flexibleBoolean,
    coverage: zod_1.z.coerce.number().nullable().optional(),
    allow_failure: utils_1.flexibleBoolean.optional(),
    created_at: zod_1.z.string(),
    started_at: zod_1.z.string().optional(),
    finished_at: zod_1.z.string().optional(),
    duration: zod_1.z.number().optional(),
    queued_duration: zod_1.z.number().optional(),
    user: zod_1.z
        .object({
        id: zod_1.z.coerce.string(),
        name: zod_1.z.string(),
        username: zod_1.z.string(),
        state: zod_1.z.string(),
        avatar_url: zod_1.z.string().nullable().optional(),
        web_url: zod_1.z.string(),
    })
        .optional(),
    commit: zod_1.z
        .object({
        id: zod_1.z.string(),
        short_id: zod_1.z.string(),
        title: zod_1.z.string(),
        author_name: zod_1.z.string(),
        author_email: zod_1.z.string(),
        created_at: zod_1.z.string(),
        message: zod_1.z.string(),
    })
        .optional(),
    pipeline: zod_1.z
        .object({
        id: zod_1.z.coerce.string(),
        project_id: zod_1.z.coerce.string(),
        ref: zod_1.z.string(),
        sha: zod_1.z.string(),
        status: zod_1.z.string(),
    })
        .optional(),
    web_url: zod_1.z.string(),
    downstream_pipeline: zod_1.z
        .object({
        id: zod_1.z.coerce.string(),
        sha: zod_1.z.string(),
        ref: zod_1.z.string(),
        status: zod_1.z.string(),
        created_at: zod_1.z.string(),
        updated_at: zod_1.z.string(),
        web_url: zod_1.z.string(),
    })
        .optional(),
});
const PipelineScopeSchema = zod_1.z
    .enum(['running', 'pending', 'finished', 'branches', 'tags'])
    .describe('The scope of pipelines to return');
const PipelineStatusSchema = zod_1.z
    .enum([
    'created',
    'waiting_for_resource',
    'preparing',
    'pending',
    'running',
    'success',
    'failed',
    'canceled',
    'skipped',
    'manual',
    'scheduled',
])
    .describe('The status of pipelines to return');
const PipelineSourceSchema = zod_1.z
    .enum([
    'push',
    'web',
    'trigger',
    'schedule',
    'api',
    'external',
    'chat',
    'webide',
    'merge_request_event',
    'external_pull_request_event',
    'parent_pipeline',
    'ondemand_dast_scan',
    'ondemand_dast_validation',
])
    .describe('The source of pipelines');
const JobScopeSchema = zod_1.z
    .enum(['created', 'pending', 'running', 'failed', 'success', 'canceled', 'skipped', 'manual'])
    .describe('Scope of jobs to show');
const TriggerJobScopeSchema = zod_1.z
    .enum([
    'created',
    'pending',
    'running',
    'failed',
    'success',
    'canceled',
    'skipped',
    'manual',
    'waiting_for_resource',
    'preparing',
])
    .describe('Scope of trigger jobs to show');
const projectIdField = utils_1.requiredId.describe('Project ID or URL-encoded path');
const ListPipelinesSchema = zod_1.z.object({
    action: zod_1.z.literal('list').describe('List pipelines with filtering'),
    project_id: projectIdField,
    scope: PipelineScopeSchema.optional().describe('Pipeline scope filter'),
    status: PipelineStatusSchema.optional().describe('Pipeline status filter'),
    source: PipelineSourceSchema.optional().describe('Pipeline source filter'),
    ref: zod_1.z.string().optional().describe('Filter by branch or tag ref'),
    sha: zod_1.z.string().optional().describe('Filter by SHA'),
    yaml_errors: zod_1.z.boolean().optional().describe('Filter by YAML errors'),
    name: zod_1.z.string().optional().describe('Filter by name of user who triggered pipeline'),
    username: zod_1.z.string().optional().describe('Filter by username who triggered pipeline'),
    updated_after: zod_1.z.string().optional().describe('ISO 8601 datetime to filter by updated_after'),
    updated_before: zod_1.z.string().optional().describe('ISO 8601 datetime to filter by updated_before'),
    order_by: zod_1.z
        .enum(['id', 'status', 'ref', 'updated_at', 'user_id'])
        .optional()
        .describe('Order pipelines by'),
    sort: zod_1.z.enum(['asc', 'desc']).optional().describe('Sort order'),
    ...(0, utils_1.paginationFields)(),
});
const GetPipelineSchema = zod_1.z.object({
    action: zod_1.z.literal('get').describe('Get single pipeline details'),
    project_id: projectIdField,
    pipeline_id: utils_1.requiredId.describe('The ID of the pipeline'),
});
const ListPipelineJobsSchema = zod_1.z.object({
    action: zod_1.z.literal('jobs').describe('List jobs in a pipeline'),
    project_id: projectIdField,
    pipeline_id: utils_1.requiredId.describe('The ID of the pipeline'),
    job_scope: zod_1.z.array(JobScopeSchema).optional().describe('Scope of jobs to show'),
    include_retried: zod_1.z.boolean().optional().describe('Include retried jobs in the response'),
    ...(0, utils_1.paginationFields)(),
});
const ListPipelineTriggersSchema = zod_1.z.object({
    action: zod_1.z.literal('triggers').describe('List bridge/trigger jobs in a pipeline'),
    project_id: projectIdField,
    pipeline_id: utils_1.requiredId.describe('The ID of the pipeline'),
    trigger_scope: zod_1.z
        .array(TriggerJobScopeSchema)
        .optional()
        .describe('Scope of trigger jobs to show'),
    include_retried: zod_1.z.boolean().optional().describe('Include retried jobs in the response'),
    ...(0, utils_1.paginationFields)(),
});
const GetJobSchema = zod_1.z.object({
    action: zod_1.z.literal('job').describe('Get single job details'),
    project_id: projectIdField,
    job_id: utils_1.requiredId.describe('The ID of the job'),
});
const GetJobLogsSchema = zod_1.z.object({
    action: zod_1.z.literal('logs').describe('Get job console output/logs'),
    project_id: projectIdField,
    job_id: utils_1.requiredId.describe('The ID of the job'),
    per_page: zod_1.z
        .number()
        .int()
        .min(1)
        .max(10000)
        .optional()
        .describe('Maximum number of lines to return (default: 200, max: 10000). Use with start for pagination'),
    start: zod_1.z
        .number()
        .optional()
        .describe('Start from specific line number (0-based). Positive from beginning, negative from end (e.g., -100 = last 100 lines). Use nextStart from previous response to paginate'),
});
exports.BrowsePipelinesSchema = zod_1.z.discriminatedUnion('action', [
    ListPipelinesSchema,
    GetPipelineSchema,
    ListPipelineJobsSchema,
    ListPipelineTriggersSchema,
    GetJobSchema,
    GetJobLogsSchema,
]);
//# sourceMappingURL=schema-readonly.js.map