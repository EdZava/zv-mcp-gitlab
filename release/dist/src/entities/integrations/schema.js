"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManageIntegrationSchema = exports.IntegrationTypeSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
exports.IntegrationTypeSchema = zod_1.z.enum([
    'slack',
    'gitlab-slack-application',
    'slack-slash-commands',
    'discord',
    'microsoft-teams',
    'mattermost',
    'mattermost-slash-commands',
    'telegram',
    'matrix',
    'pumble',
    'hangouts-chat',
    'webex-teams',
    'unify-circuit',
    'campfire',
    'irker',
    'jira',
    'jira-cloud-app',
    'bugzilla',
    'redmine',
    'youtrack',
    'clickup',
    'linear',
    'phorge',
    'pivotaltracker',
    'asana',
    'custom-issue-tracker',
    'ewm',
    'jenkins',
    'teamcity',
    'bamboo',
    'buildkite',
    'drone-ci',
    'datadog',
    'mock-ci',
    'diffblue-cover',
    'confluence',
    'external-wiki',
    'apple-app-store',
    'google-play',
    'packagist',
    'google-cloud-platform-artifact-registry',
    'google-cloud-platform-workload-identity-federation',
    'harbor',
    'git-guardian',
    'github',
    'assembla',
    'emails-on-push',
    'pipelines-email',
    'pushover',
    'squash-tm',
]);
const projectIdField = utils_1.requiredId.describe('Project ID or URL-encoded path');
const integrationField = exports.IntegrationTypeSchema.describe('Integration type slug (e.g., slack, jira, discord). Note: gitlab-slack-application cannot be created via API - it requires OAuth installation from GitLab UI.');
const eventFields = {
    active: utils_1.flexibleBoolean
        .optional()
        .describe('Enable or disable the integration without full configuration'),
    push_events: utils_1.flexibleBoolean.optional().describe('Trigger integration on push events'),
    issues_events: utils_1.flexibleBoolean.optional().describe('Trigger integration on issue events'),
    merge_requests_events: utils_1.flexibleBoolean
        .optional()
        .describe('Trigger integration on merge request events'),
    tag_push_events: utils_1.flexibleBoolean.optional().describe('Trigger integration on tag push events'),
    note_events: utils_1.flexibleBoolean.optional().describe('Trigger integration on note events'),
    confidential_issues_events: utils_1.flexibleBoolean
        .optional()
        .describe('Trigger integration on confidential issue events'),
    pipeline_events: utils_1.flexibleBoolean.optional().describe('Trigger integration on pipeline events'),
    wiki_page_events: utils_1.flexibleBoolean.optional().describe('Trigger integration on wiki page events'),
    job_events: utils_1.flexibleBoolean.optional().describe('Trigger integration on job events'),
    deployment_events: utils_1.flexibleBoolean
        .optional()
        .describe('Trigger integration on deployment events'),
    releases_events: utils_1.flexibleBoolean.optional().describe('Trigger integration on release events'),
    vulnerability_events: utils_1.flexibleBoolean
        .optional()
        .describe('Trigger integration on vulnerability events'),
    config: zod_1.z
        .record(zod_1.z.string(), zod_1.z.unknown())
        .optional()
        .describe('Integration-specific configuration parameters. Pass as key-value pairs. Examples: webhook_url, token, channel, etc. See GitLab API documentation for integration-specific fields.'),
};
const UpdateIntegrationSchema = zod_1.z
    .object({
    action: zod_1.z.literal('update').describe('Update or enable integration with specific config'),
    project_id: projectIdField,
    integration: integrationField,
    ...eventFields,
})
    .passthrough();
const DisableIntegrationSchema = zod_1.z.object({
    action: zod_1.z.literal('disable').describe('Disable and remove integration'),
    project_id: projectIdField,
    integration: integrationField,
});
exports.ManageIntegrationSchema = zod_1.z.discriminatedUnion('action', [
    UpdateIntegrationSchema,
    DisableIntegrationSchema,
]);
//# sourceMappingURL=schema.js.map