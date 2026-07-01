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
exports.applyManualCategories = applyManualCategories;
exports.runToolSelectionFlow = runToolSelectionFlow;
const p = __importStar(require("@clack/prompts"));
const presets_1 = require("../presets");
const CATEGORY_ENV_MAP = {
    'merge-requests': 'USE_MRS',
    'work-items': 'USE_WORKITEMS',
    pipelines: 'USE_PIPELINE',
    files: 'USE_FILES',
    wiki: 'USE_GITLAB_WIKI',
    snippets: 'USE_SNIPPETS',
    releases: 'USE_RELEASES',
    refs: 'USE_REFS',
    labels: 'USE_LABELS',
    milestones: 'USE_MILESTONE',
    members: 'USE_MEMBERS',
    search: 'USE_SEARCH',
    variables: 'USE_VARIABLES',
    webhooks: 'USE_WEBHOOKS',
    integrations: 'USE_INTEGRATIONS',
};
function applyManualCategories(selectedCategories, env) {
    const selected = new Set(selectedCategories);
    for (const [category, envVar] of Object.entries(CATEGORY_ENV_MAP)) {
        if (!selected.has(category)) {
            env[envVar] = 'false';
        }
    }
}
async function runToolSelectionFlow() {
    const mode = await p.select({
        message: 'How do you want to configure tools?',
        options: [
            {
                value: 'preset',
                label: 'Use preset (recommended)',
                hint: 'Quick setup with role-based tool selection',
            },
            {
                value: 'manual',
                label: 'Select tools manually',
                hint: 'Choose individual tool categories',
            },
            {
                value: 'advanced',
                label: 'Advanced settings',
                hint: 'Full control over all environment variables',
            },
        ],
    });
    if (p.isCancel(mode)) {
        return null;
    }
    switch (mode) {
        case 'preset':
            return runPresetSelection();
        case 'manual':
            return runManualSelection();
        case 'advanced':
            return runAdvancedSettings();
    }
}
async function runPresetSelection() {
    const preset = await p.select({
        message: 'Select a preset:',
        options: presets_1.PRESET_DEFINITIONS.map((p) => ({
            value: p.id,
            label: p.name,
            hint: p.description,
        })),
    });
    if (p.isCancel(preset)) {
        return null;
    }
    const presetDef = presets_1.PRESET_DEFINITIONS.find((p) => p.id === preset);
    const toolCount = presetDef ? (0, presets_1.getToolCount)(presetDef.enabledCategories) : 0;
    const totalTools = (0, presets_1.getTotalToolCount)();
    p.log.info(`Selected: ${toolCount}/${totalTools} tools`);
    return {
        mode: 'preset',
        preset,
        enabledCategories: presetDef?.enabledCategories,
    };
}
async function runManualSelection() {
    const totalTools = (0, presets_1.getTotalToolCount)();
    const configurableCategories = presets_1.TOOL_CATEGORIES.filter((c) => c.id in CATEGORY_ENV_MAP);
    const alwaysOnCategories = presets_1.TOOL_CATEGORIES.filter((c) => !(c.id in CATEGORY_ENV_MAP));
    if (alwaysOnCategories.length > 0) {
        const alwaysOnNames = alwaysOnCategories.map((c) => c.name).join(', ');
        p.log.info(`Always enabled: ${alwaysOnNames}`);
    }
    const selectedCategories = await p.multiselect({
        message: `Select tool categories (${totalTools} tools total):`,
        options: configurableCategories.map((category) => ({
            value: category.id,
            label: `${category.name} [${category.tools.length} tools]`,
            hint: category.description,
        })),
        initialValues: configurableCategories.filter((c) => c.defaultEnabled).map((c) => c.id),
        required: true,
    });
    if (p.isCancel(selectedCategories)) {
        return null;
    }
    const categories = [...selectedCategories, ...alwaysOnCategories.map((c) => c.id)];
    const selectedCount = (0, presets_1.getToolCount)(categories);
    p.log.info(`Selected: ${selectedCount}/${totalTools} tools`);
    return {
        mode: 'manual',
        enabledCategories: categories,
    };
}
async function runAdvancedSettings() {
    const envOverrides = {};
    p.log.step('Feature Flags');
    const featureFlags = await p.multiselect({
        message: 'Enable features:',
        options: [
            { value: 'USE_WORKITEMS', label: 'Issues/Work Items', hint: 'Issue tracking and epics' },
            { value: 'USE_MRS', label: 'Merge Requests', hint: 'Code review and MR management' },
            { value: 'USE_PIPELINE', label: 'Pipelines', hint: 'CI/CD pipeline management' },
            { value: 'USE_FILES', label: 'Files', hint: 'Repository file operations' },
            { value: 'USE_GITLAB_WIKI', label: 'Wiki', hint: 'Wiki page management' },
            { value: 'USE_SNIPPETS', label: 'Snippets', hint: 'Code snippets' },
            { value: 'USE_RELEASES', label: 'Releases', hint: 'Release management' },
            { value: 'USE_REFS', label: 'Branches/Tags', hint: 'Branch and tag management' },
            { value: 'USE_LABELS', label: 'Labels', hint: 'Label management' },
            { value: 'USE_MILESTONE', label: 'Milestones', hint: 'Milestone management' },
            { value: 'USE_MEMBERS', label: 'Members', hint: 'Team member management' },
            { value: 'USE_SEARCH', label: 'Search', hint: 'Global search' },
            { value: 'USE_WEBHOOKS', label: 'Webhooks', hint: 'Webhook configuration' },
            { value: 'USE_INTEGRATIONS', label: 'Integrations', hint: 'Service integrations' },
            { value: 'USE_VARIABLES', label: 'Variables', hint: 'CI/CD variable management' },
        ],
        initialValues: ['USE_WORKITEMS', 'USE_MRS', 'USE_PIPELINE', 'USE_FILES'],
        required: false,
    });
    if (p.isCancel(featureFlags)) {
        return null;
    }
    const allFeatures = [
        'USE_WORKITEMS',
        'USE_MRS',
        'USE_PIPELINE',
        'USE_FILES',
        'USE_GITLAB_WIKI',
        'USE_SNIPPETS',
        'USE_RELEASES',
        'USE_REFS',
        'USE_LABELS',
        'USE_MILESTONE',
        'USE_MEMBERS',
        'USE_SEARCH',
        'USE_WEBHOOKS',
        'USE_INTEGRATIONS',
        'USE_VARIABLES',
    ];
    const selectedFeatures = featureFlags;
    for (const feature of allFeatures) {
        envOverrides[feature] = selectedFeatures.includes(feature) ? 'true' : 'false';
    }
    const readOnly = await p.confirm({
        message: 'Enable read-only mode?',
        initialValue: false,
    });
    if (p.isCancel(readOnly)) {
        return null;
    }
    if (readOnly) {
        envOverrides.GITLAB_READ_ONLY_MODE = 'true';
    }
    const crossRefs = await p.confirm({
        message: 'Include cross-references in tool descriptions?',
        initialValue: true,
    });
    if (p.isCancel(crossRefs)) {
        return null;
    }
    if (!crossRefs) {
        envOverrides.GITLAB_CROSS_REFS = 'false';
    }
    const configureScope = await p.confirm({
        message: 'Configure scope restrictions?',
        initialValue: false,
    });
    if (p.isCancel(configureScope)) {
        return null;
    }
    if (configureScope) {
        const scopeType = await p.select({
            message: 'Scope type:',
            options: [
                { value: 'project', label: 'Single project', hint: 'Restrict to one project' },
                { value: 'allowlist', label: 'Project allowlist', hint: 'Restrict to multiple projects' },
            ],
        });
        if (p.isCancel(scopeType)) {
            return null;
        }
        if (scopeType === 'project') {
            const project = await p.text({
                message: 'Project ID or path (e.g., group/project):',
                validate: (v) => (!v ? 'Project path is required' : undefined),
            });
            if (p.isCancel(project))
                return null;
            envOverrides.GITLAB_PROJECT_ID = project;
        }
        else {
            const allowlist = await p.text({
                message: 'Allowed project paths (comma-separated, e.g., group/project1,group/project2):',
                validate: (v) => (!v ? 'At least one project path is required' : undefined),
            });
            if (p.isCancel(allowlist))
                return null;
            envOverrides.GITLAB_ALLOWED_PROJECT_IDS = allowlist;
        }
    }
    const logLevel = await p.select({
        message: 'Log level:',
        options: [
            { value: 'info', label: 'Info (default)' },
            { value: 'debug', label: 'Debug' },
            { value: 'warn', label: 'Warn' },
            { value: 'error', label: 'Error' },
        ],
    });
    if (p.isCancel(logLevel)) {
        return null;
    }
    if (logLevel !== 'info') {
        envOverrides.LOG_LEVEL = logLevel;
    }
    return {
        mode: 'advanced',
        envOverrides,
    };
}
//# sourceMappingURL=tool-selection.js.map