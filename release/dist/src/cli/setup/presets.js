"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRESET_DEFINITIONS = exports.TOOL_CATEGORIES = void 0;
exports.getPresetById = getPresetById;
exports.getCategoryById = getCategoryById;
exports.getToolCount = getToolCount;
exports.getTotalToolCount = getTotalToolCount;
exports.TOOL_CATEGORIES = [
    {
        id: 'core',
        name: 'Core',
        description: 'Projects, namespaces, users, events',
        tools: [
            'browse_projects',
            'browse_namespaces',
            'browse_events',
            'browse_users',
            'manage_project',
            'manage_namespace',
        ],
        defaultEnabled: true,
    },
    {
        id: 'merge-requests',
        name: 'Merge Requests',
        description: 'MR browsing, creation, discussions, approvals',
        tools: [
            'browse_merge_requests',
            'manage_merge_request',
            'browse_mr_discussions',
            'manage_mr_discussion',
            'manage_draft_notes',
        ],
        defaultEnabled: true,
    },
    {
        id: 'work-items',
        name: 'Work Items',
        description: 'Issues, epics, tasks, incidents',
        tools: ['browse_work_items', 'manage_work_item'],
        defaultEnabled: true,
    },
    {
        id: 'pipelines',
        name: 'Pipelines & CI/CD',
        description: 'Pipeline browsing, job management, triggers',
        tools: ['browse_pipelines', 'manage_pipeline'],
        defaultEnabled: true,
    },
    {
        id: 'files',
        name: 'Files & Commits',
        description: 'Repository file browsing, commits, and diffs',
        tools: ['browse_files', 'manage_files', 'browse_commits'],
        defaultEnabled: true,
    },
    {
        id: 'refs',
        name: 'Branches & Tags',
        description: 'Branch/tag browsing and protection rules',
        tools: ['browse_refs', 'manage_ref'],
        defaultEnabled: false,
    },
    {
        id: 'releases',
        name: 'Releases',
        description: 'Release management and asset links',
        tools: ['browse_releases', 'manage_release'],
        defaultEnabled: false,
    },
    {
        id: 'labels',
        name: 'Labels',
        description: 'Label browsing and management',
        tools: ['browse_labels', 'manage_label'],
        defaultEnabled: false,
    },
    {
        id: 'milestones',
        name: 'Milestones',
        description: 'Milestone tracking and burndown charts',
        tools: ['browse_milestones', 'manage_milestone'],
        defaultEnabled: false,
    },
    {
        id: 'iterations',
        name: 'Iterations',
        description: 'Sprint/iteration planning (Premium)',
        tools: ['browse_iterations'],
        defaultEnabled: false,
    },
    {
        id: 'wiki',
        name: 'Wiki',
        description: 'Wiki page browsing and editing',
        tools: ['browse_wiki', 'manage_wiki'],
        defaultEnabled: false,
    },
    {
        id: 'snippets',
        name: 'Snippets',
        description: 'Code snippet management',
        tools: ['browse_snippets', 'manage_snippet'],
        defaultEnabled: false,
    },
    {
        id: 'variables',
        name: 'CI/CD Variables',
        description: 'Pipeline variable management',
        tools: ['browse_variables', 'manage_variable'],
        defaultEnabled: false,
    },
    {
        id: 'webhooks',
        name: 'Webhooks',
        description: 'Webhook configuration and testing',
        tools: ['browse_webhooks', 'manage_webhook'],
        defaultEnabled: false,
    },
    {
        id: 'integrations',
        name: 'Integrations',
        description: 'Third-party service integrations',
        tools: ['browse_integrations', 'manage_integration'],
        defaultEnabled: false,
    },
    {
        id: 'members',
        name: 'Members',
        description: 'Team member management and access levels',
        tools: ['browse_members', 'manage_member'],
        defaultEnabled: false,
    },
    {
        id: 'todos',
        name: 'Todos',
        description: 'Personal notification queue management',
        tools: ['browse_todos', 'manage_todos'],
        defaultEnabled: false,
    },
    {
        id: 'search',
        name: 'Search',
        description: 'Global, project, and group search',
        tools: ['browse_search'],
        defaultEnabled: false,
    },
    {
        id: 'context',
        name: 'Context',
        description: 'Runtime session context management',
        tools: ['manage_context'],
        defaultEnabled: false,
    },
];
exports.PRESET_DEFINITIONS = [
    {
        id: 'developer',
        name: 'Developer',
        description: 'Standard development workflow (issues, MRs, pipelines)',
        enabledCategories: [
            'core',
            'merge-requests',
            'work-items',
            'pipelines',
            'files',
            'labels',
            'snippets',
            'releases',
            'todos',
            'search',
        ],
    },
    {
        id: 'senior-dev',
        name: 'Senior Developer',
        description: 'Extended access with refs, wiki, and branch management',
        enabledCategories: [
            'core',
            'merge-requests',
            'work-items',
            'pipelines',
            'files',
            'refs',
            'labels',
            'snippets',
            'releases',
            'iterations',
            'todos',
            'search',
        ],
    },
    {
        id: 'devops',
        name: 'DevOps Engineer',
        description: 'CI/CD focused (pipelines, variables, webhooks, releases)',
        enabledCategories: [
            'core',
            'pipelines',
            'files',
            'refs',
            'releases',
            'variables',
            'webhooks',
            'integrations',
            'search',
        ],
    },
    {
        id: 'code-reviewer',
        name: 'Code Reviewer',
        description: 'Code review workflow (MRs, discussions, approvals)',
        enabledCategories: [
            'core',
            'merge-requests',
            'work-items',
            'pipelines',
            'files',
            'labels',
            'todos',
            'search',
        ],
    },
    {
        id: 'full-access',
        name: 'Full Access',
        description: 'All features enabled (admin/tech-lead)',
        enabledCategories: exports.TOOL_CATEGORIES.map((c) => c.id),
    },
    {
        id: 'readonly',
        name: 'Read-Only',
        description: 'Read-only access for monitoring and viewing',
        enabledCategories: [
            'core',
            'merge-requests',
            'work-items',
            'pipelines',
            'files',
            'refs',
            'releases',
            'labels',
            'milestones',
            'members',
            'search',
        ],
    },
];
function getPresetById(id) {
    return exports.PRESET_DEFINITIONS.find((p) => p.id === id);
}
function getCategoryById(id) {
    return exports.TOOL_CATEGORIES.find((c) => c.id === id);
}
function getToolCount(categoryIds) {
    return exports.TOOL_CATEGORIES.filter((c) => categoryIds.includes(c.id)).reduce((count, c) => count + c.tools.length, 0);
}
function getTotalToolCount() {
    return exports.TOOL_CATEGORIES.reduce((count, c) => count + c.tools.length, 0);
}
//# sourceMappingURL=presets.js.map