"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManageWebhookSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
const WebhookEventFields = {
    push_events: utils_1.flexibleBoolean.optional().describe('Enable push events'),
    push_events_branch_filter: zod_1.z
        .string()
        .optional()
        .describe('Branch filter for push events (wildcard supported)'),
    tag_push_events: utils_1.flexibleBoolean.optional().describe('Enable tag push events'),
    merge_requests_events: utils_1.flexibleBoolean.optional().describe('Enable merge request events'),
    issues_events: utils_1.flexibleBoolean.optional().describe('Enable issue events'),
    confidential_issues_events: utils_1.flexibleBoolean
        .optional()
        .describe('Enable confidential issue events'),
    note_events: utils_1.flexibleBoolean.optional().describe('Enable note/comment events'),
    confidential_note_events: utils_1.flexibleBoolean.optional().describe('Enable confidential note events'),
    job_events: utils_1.flexibleBoolean.optional().describe('Enable job/build events'),
    pipeline_events: utils_1.flexibleBoolean.optional().describe('Enable pipeline events'),
    wiki_page_events: utils_1.flexibleBoolean.optional().describe('Enable wiki page events'),
    deployment_events: utils_1.flexibleBoolean.optional().describe('Enable deployment events'),
    feature_flag_events: utils_1.flexibleBoolean.optional().describe('Enable feature flag events'),
    releases_events: utils_1.flexibleBoolean.optional().describe('Enable release events'),
    emoji_events: utils_1.flexibleBoolean.optional().describe('Enable emoji events'),
    resource_access_token_events: utils_1.flexibleBoolean
        .optional()
        .describe('Enable resource access token events'),
    member_events: utils_1.flexibleBoolean.optional().describe('Enable member events'),
    subgroup_events: utils_1.flexibleBoolean
        .optional()
        .describe('Enable subgroup events (group webhooks only)'),
    project_events: utils_1.flexibleBoolean
        .optional()
        .describe('Enable project events (group webhooks only)'),
    enable_ssl_verification: utils_1.flexibleBoolean
        .optional()
        .describe('Enable SSL certificate verification'),
};
const TriggerEventSchema = zod_1.z.enum([
    'push_events',
    'tag_push_events',
    'merge_requests_events',
    'issues_events',
    'confidential_issues_events',
    'note_events',
    'job_events',
    'pipeline_events',
    'wiki_page_events',
    'releases_events',
    'milestone_events',
    'emoji_events',
    'resource_access_token_events',
]);
const scopeField = zod_1.z.enum(['project', 'group']).describe('Scope of webhook (project or group)');
const CreateWebhookSchema = zod_1.z.object({
    action: zod_1.z.literal('create'),
    scope: scopeField,
    projectId: zod_1.z.string().optional().describe('Project ID or path (required if scope=project)'),
    groupId: zod_1.z.string().optional().describe('Group ID or path (required if scope=group)'),
    url: zod_1.z.string().describe('Webhook URL (required)'),
    name: zod_1.z.string().optional().describe('Human-readable webhook name (GitLab 16.11+)'),
    description: zod_1.z.string().optional().describe('Webhook description (GitLab 16.11+)'),
    token: zod_1.z.string().optional().describe('Secret token for webhook validation'),
    ...WebhookEventFields,
});
const UpdateWebhookSchema = zod_1.z.object({
    action: zod_1.z.literal('update'),
    scope: scopeField,
    projectId: zod_1.z.string().optional().describe('Project ID or path (required if scope=project)'),
    groupId: zod_1.z.string().optional().describe('Group ID or path (required if scope=group)'),
    hookId: utils_1.requiredId.describe('Webhook ID (required)'),
    url: zod_1.z.string().optional().describe('Webhook URL'),
    name: zod_1.z.string().optional().describe('Human-readable webhook name (GitLab 16.11+)'),
    description: zod_1.z.string().optional().describe('Webhook description (GitLab 16.11+)'),
    token: zod_1.z.string().optional().describe('Secret token for webhook validation'),
    ...WebhookEventFields,
});
const DeleteWebhookSchema = zod_1.z.object({
    action: zod_1.z.literal('delete'),
    scope: scopeField,
    projectId: zod_1.z.string().optional().describe('Project ID or path (required if scope=project)'),
    groupId: zod_1.z.string().optional().describe('Group ID or path (required if scope=group)'),
    hookId: utils_1.requiredId.describe('Webhook ID (required)'),
});
const TestWebhookSchema = zod_1.z.object({
    action: zod_1.z.literal('test'),
    scope: scopeField,
    projectId: zod_1.z.string().optional().describe('Project ID or path (required if scope=project)'),
    groupId: zod_1.z.string().optional().describe('Group ID or path (required if scope=group)'),
    hookId: utils_1.requiredId.describe('Webhook ID (required)'),
    trigger: TriggerEventSchema.describe('Event type to test (required)'),
});
exports.ManageWebhookSchema = zod_1.z.discriminatedUnion('action', [
    CreateWebhookSchema,
    UpdateWebhookSchema,
    DeleteWebhookSchema,
    TestWebhookSchema,
]);
//# sourceMappingURL=schema.js.map