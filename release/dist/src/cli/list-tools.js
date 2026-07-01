#!/usr/bin/env node
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
exports.main = main;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const registry_manager_1 = require("../registry-manager");
const InstanceCapabilities_1 = require("../services/InstanceCapabilities");
const profiles_1 = require("../profiles");
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        format: 'markdown',
        showEnv: false,
        showEnvGates: false,
        verbose: false,
        detail: false,
        noExamples: false,
        toc: false,
        showPresets: false,
        showProfiles: false,
        validate: false,
    };
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        switch (arg) {
            case '--json':
                options.format = 'json';
                break;
            case '--simple':
                options.format = 'simple';
                break;
            case '--export':
                options.format = 'export';
                break;
            case '--entity':
                if (i + 1 >= args.length) {
                    console.error('Error: --entity flag requires a value.');
                    console.error('Usage: yarn list-tools --entity <entity_name>');
                    process.exit(1);
                }
                options.entity = args[++i];
                break;
            case '--tool':
                if (i + 1 >= args.length) {
                    console.error('Error: --tool flag requires a value.');
                    console.error('Usage: yarn list-tools --tool <tool_name>');
                    process.exit(1);
                }
                options.tool = args[++i];
                break;
            case '--env':
                options.showEnv = true;
                break;
            case '--env-gates':
                options.showEnvGates = true;
                break;
            case '--verbose':
            case '-v':
                options.verbose = true;
                break;
            case '--detail':
                options.detail = true;
                break;
            case '--no-examples':
                options.noExamples = true;
                break;
            case '--toc':
                options.toc = true;
                break;
            case '--presets':
                options.showPresets = true;
                break;
            case '--profiles':
                options.showProfiles = true;
                break;
            case '--preset':
                if (i + 1 >= args.length) {
                    console.error('Error: --preset flag requires a value.');
                    console.error('Usage: yarn list-tools --preset <preset_name>');
                    process.exit(1);
                }
                options.preset = args[++i];
                break;
            case '--profile':
                if (i + 1 >= args.length) {
                    console.error('Error: --profile flag requires a value.');
                    console.error('Usage: yarn list-tools --profile <profile_name>');
                    process.exit(1);
                }
                options.profile = args[++i];
                break;
            case '--validate':
                options.validate = true;
                break;
            case '--compare':
                if (i + 1 >= args.length) {
                    console.error('Error: --compare flag requires a value.');
                    console.error('Usage: yarn list-tools --preset <name> --compare <other_name>');
                    process.exit(1);
                }
                options.compare = args[++i];
                break;
            case '--help':
            case '-h':
                printHelp();
                process.exit(0);
                break;
            default:
                if (arg.startsWith('-')) {
                    console.error(`Error: Unrecognized option '${arg}'.`);
                    console.error("Use '--help' to see available options.");
                    process.exit(1);
                }
                break;
        }
    }
    return options;
}
function printHelp() {
    console.log(`
GitLab MCP Tool Lister

Usage: yarn list-tools [options]

Tool Options:
  --json              Output in JSON format
  --simple            Simple list of tool names
  --export            Generate complete API reference documentation
  --env-gates         Show USE_* environment variable gates
  --entity <name>     Filter by entity (e.g., workitems, labels, mrs)
  --tool <name>       Show details for specific tool
  --env               Show environment configuration
  --verbose, -v       Show additional details
  --detail            Show all tools with their input schemas
  --no-examples       Skip example JSON blocks (for --export)
  --toc               Include table of contents (for --export)

Profile/Preset Options:
  --presets           List all available presets (built-in and user)
  --profiles          List user-defined profiles
  --preset <name>     Inspect a specific preset
  --profile <name>    Inspect a specific profile
  --validate          Validate configuration (use with --preset or --profile)
  --compare <name>    Compare two presets (use with --preset)

General:
  --help, -h          Show this help

Examples:
  yarn list-tools                                # List all tools in markdown
  yarn list-tools --json                         # JSON output
  yarn list-tools --export                       # Generate API reference to stdout
  yarn list-tools --export > docs/tools/api-reference.md  # Generate to file
  yarn list-tools --export --toc                 # With table of contents
  yarn list-tools --export --no-examples         # Skip example JSON blocks
  yarn list-tools --env-gates                    # Show USE_* variable gates
  yarn list-tools --env-gates --json             # JSON output of gates
  yarn list-tools --entity workitems             # Only work items tools
  yarn list-tools --tool list_work_items         # Specific tool details

Profile/Preset Examples:
  yarn list-tools --presets                      # List all presets
  yarn list-tools --profiles                     # List user profiles
  yarn list-tools --preset junior-dev            # Inspect preset details
  yarn list-tools --preset junior-dev --validate # Validate preset
  yarn list-tools --preset junior-dev --compare senior-dev  # Compare presets
  yarn list-tools --presets --json               # JSON output of presets

Environment Variables:
  GITLAB_READONLY              Show only read-only tools
  GITLAB_DENIED_TOOLS_REGEX    Regex pattern to exclude tools
  GITLAB_ALLOWED_TOOLS_REGEX   Regex pattern to include tools
  `);
}
function resolveJsonSchemaType(prop, schema) {
    if (prop.$ref) {
        const refPath = prop.$ref.replace('#/properties/', '');
        const referencedProp = schema.properties?.[refPath];
        if (referencedProp) {
            return resolveJsonSchemaType(referencedProp, schema);
        }
        return 'reference';
    }
    if (prop.type) {
        if (prop.type === 'array' && prop.items) {
            const itemType = resolveJsonSchemaType(prop.items, schema);
            return `${itemType}[]`;
        }
        return prop.type;
    }
    if (prop.enum) {
        return 'enum';
    }
    if (prop.oneOf ?? prop.anyOf) {
        const unionTypes = (prop.oneOf ?? prop.anyOf)?.map((option) => resolveJsonSchemaType(option, schema)) ?? [];
        return unionTypes.join(' | ');
    }
    return 'unknown';
}
function getParameterDescription(schema) {
    const params = [];
    if (schema.properties) {
        for (const [key, value] of Object.entries(schema.properties)) {
            const prop = value;
            const required = schema.required?.includes(key) ?? false;
            const type = resolveJsonSchemaType(prop, schema);
            const description = prop.description ?? '';
            let paramStr = `  - \`${key}\` (${type}${required ? ', required' : ', optional'})`;
            if (description) {
                paramStr += `: ${description}`;
            }
            params.push(paramStr);
        }
    }
    if (schema._def?.schema?._def?.checks) {
        const checks = schema._def.schema._def.checks;
        for (const check of checks) {
            if (check.message) {
                params.push(`  - **Validation**: ${check.message}`);
            }
        }
    }
    return params;
}
function printEnvironmentInfo() {
    console.log('=== Environment Configuration ===\n');
    console.log(`GITLAB_READONLY: ${process.env.GITLAB_READONLY ?? 'false'}`);
    console.log(`GITLAB_DENIED_TOOLS_REGEX: ${process.env.GITLAB_DENIED_TOOLS_REGEX ?? '(not set)'}`);
    console.log(`GITLAB_ALLOWED_TOOLS_REGEX: ${process.env.GITLAB_ALLOWED_TOOLS_REGEX ?? '(not set)'}`);
    console.log(`GITLAB_API_URL: ${process.env.GITLAB_API_URL ?? 'https://gitlab.com'}`);
    console.log();
}
function getToolTierInfo(requirements, action) {
    const tierLabels = {
        free: 'Free',
        premium: 'Premium',
        ultimate: 'Ultimate',
    };
    if (!requirements)
        return '';
    if (action) {
        const tier = (0, InstanceCapabilities_1.resolveRequirement)(requirements, action).tier ?? 'free';
        return `[tier: ${tierLabels[tier] ?? tier}]`;
    }
    const highestTier = (0, InstanceCapabilities_1.getHighestTier)(requirements);
    const tierBadge = tierLabels[highestTier] ?? highestTier;
    const defaultTier = requirements?.default.tier ?? 'free';
    const hasMixedTiers = highestTier !== defaultTier;
    if (hasMixedTiers) {
        return `[tier: ${tierBadge}*]`;
    }
    return `[tier: ${tierBadge}]`;
}
const ENTITY_TOOLS = {
    'Projects & Repository': [
        'browse_projects',
        'browse_namespaces',
        'browse_commits',
        'browse_events',
        'browse_files',
        'browse_refs',
        'manage_project',
        'manage_namespace',
        'manage_files',
        'manage_ref',
        'browse_releases',
        'manage_release',
    ],
    Collaboration: [
        'browse_merge_requests',
        'browse_mr_discussions',
        'manage_merge_request',
        'manage_mr_discussion',
        'manage_draft_notes',
        'browse_members',
        'manage_member',
        'browse_users',
        'browse_todos',
        'manage_todos',
    ],
    Planning: [
        'browse_work_items',
        'manage_work_item',
        'browse_milestones',
        'manage_milestone',
        'browse_labels',
        'manage_label',
        'browse_iterations',
    ],
    'CI/CD': ['browse_pipelines', 'manage_pipeline', 'browse_variables', 'manage_variable'],
    'Integrations & Content': [
        'browse_wiki',
        'manage_wiki',
        'browse_snippets',
        'manage_snippet',
        'browse_webhooks',
        'manage_webhook',
        'browse_integrations',
        'manage_integration',
    ],
    Discovery: ['browse_search'],
    Session: ['manage_context'],
};
function groupToolsByEntity(tools) {
    const grouped = new Map();
    const toolToEntity = new Map();
    for (const [entity, toolNames] of Object.entries(ENTITY_TOOLS)) {
        for (const toolName of toolNames) {
            toolToEntity.set(toolName, entity);
        }
    }
    for (const tool of tools) {
        const entity = toolToEntity.get(tool.name) ?? 'Other';
        if (!grouped.has(entity)) {
            grouped.set(entity, []);
        }
        grouped.get(entity).push(tool);
    }
    const entityOrder = [
        'Projects & Repository',
        'Collaboration',
        'Planning',
        'CI/CD',
        'Integrations & Content',
        'Discovery',
        'Session',
        'Other',
    ];
    const sortedGrouped = new Map();
    for (const entity of entityOrder) {
        if (grouped.has(entity)) {
            sortedGrouped.set(entity, grouped.get(entity));
        }
    }
    return sortedGrouped;
}
const ACTION_DESCRIPTIONS = {
    list: 'List items with filtering and pagination',
    get: 'Get a single item by ID',
    create: 'Create a new item',
    update: 'Update an existing item',
    delete: 'Delete an item',
    search: 'Search for items',
    diffs: 'Get file changes/diffs',
    compare: 'Compare two branches or commits',
    merge: 'Merge a merge request',
    approve: 'Approve a merge request',
    unapprove: 'Remove approval from a merge request',
    rebase: 'Rebase a merge request',
    cancel: 'Cancel a running operation',
    retry: 'Retry a failed operation',
    play: 'Run a manual job',
    publish: 'Publish draft notes',
    drafts: 'List draft notes',
    draft: 'Get a single draft note',
    resolve: 'Resolve a discussion thread',
    unresolve: 'Unresolve a discussion thread',
    note: 'Add a note/comment',
    mark_done: 'Mark as done',
    mark_pending: 'Mark as pending',
    disable: 'Disable the integration',
    test: 'Test a webhook',
    read: 'Read item details',
};
function extractActions(schema) {
    const actions = [];
    if (schema.oneOf && Array.isArray(schema.oneOf)) {
        for (const branch of schema.oneOf) {
            const actionProp = branch.properties?.action;
            const actionName = actionProp?.const;
            if (actionName) {
                const description = actionProp?.description ??
                    ACTION_DESCRIPTIONS[actionName] ??
                    `Perform ${actionName} operation`;
                actions.push({ name: actionName, description });
            }
        }
        return actions;
    }
    const actionProp = schema.properties?.action;
    if (actionProp?.enum && Array.isArray(actionProp.enum)) {
        for (const actionName of actionProp.enum) {
            if (typeof actionName === 'string') {
                const description = ACTION_DESCRIPTIONS[actionName] ?? `Perform ${actionName} operation`;
                actions.push({ name: actionName, description });
            }
        }
    }
    return actions;
}
function extractParameters(schema) {
    if (!schema.properties)
        return [];
    const requiredFields = schema.required ?? [];
    const params = [];
    for (const [name, prop] of Object.entries(schema.properties)) {
        params.push({
            name,
            type: resolveJsonSchemaType(prop, schema),
            required: requiredFields.includes(name),
            description: prop.description ?? '',
        });
    }
    return sortParameters(params);
}
function sortParameters(params) {
    return params.sort((a, b) => {
        if (a.required && !b.required)
            return -1;
        if (!a.required && b.required)
            return 1;
        if (a.name === 'action')
            return -1;
        if (b.name === 'action')
            return 1;
        return a.name.localeCompare(b.name);
    });
}
function extractParametersGrouped(schema) {
    const result = {
        common: [],
        byAction: new Map(),
    };
    if (!schema.oneOf || !Array.isArray(schema.oneOf)) {
        result.common = extractParameters(schema);
        return result;
    }
    const totalActions = schema.oneOf.length;
    const paramOccurrences = new Map();
    for (const branch of schema.oneOf) {
        const actionName = branch.properties?.action?.const;
        if (!actionName || !branch.properties)
            continue;
        const requiredFields = branch.required ?? [];
        for (const [name, prop] of Object.entries(branch.properties)) {
            if (name === 'action')
                continue;
            const type = resolveJsonSchemaType(prop, branch);
            const required = requiredFields.includes(name);
            const description = prop.description ?? '';
            if (!paramOccurrences.has(name)) {
                paramOccurrences.set(name, {
                    actions: new Map(),
                    type,
                    description,
                });
            }
            const occurrence = paramOccurrences.get(name);
            occurrence.actions.set(actionName, { required, type, description });
            if (description.length > occurrence.description.length) {
                occurrence.description = description;
            }
        }
    }
    for (const [name, data] of paramOccurrences) {
        if (data.actions.size === totalActions) {
            const requiredInAll = Array.from(data.actions.values()).every((a) => a.required);
            result.common.push({
                name,
                type: data.type,
                required: requiredInAll,
                description: data.description,
            });
        }
        else {
            for (const [actionName, actionData] of data.actions) {
                if (!result.byAction.has(actionName)) {
                    result.byAction.set(actionName, []);
                }
                result.byAction.get(actionName).push({
                    name,
                    type: actionData.type,
                    required: actionData.required,
                    requiredForAction: actionData.required,
                    description: actionData.description || data.description,
                });
            }
        }
    }
    result.common = sortParameters(result.common);
    for (const [action, params] of result.byAction) {
        result.byAction.set(action, params.sort((a, b) => {
            if (a.requiredForAction && !b.requiredForAction)
                return -1;
            if (!a.requiredForAction && b.requiredForAction)
                return 1;
            return a.name.localeCompare(b.name);
        }));
    }
    return result;
}
function generateExample(schema) {
    const example = {};
    const actions = extractActions(schema);
    if (actions.length > 0) {
        example.action = actions[0].name;
    }
    let targetSchema = schema;
    let requiredFields;
    if (schema.oneOf && Array.isArray(schema.oneOf) && schema.oneOf.length > 0) {
        targetSchema = schema.oneOf[0];
        requiredFields = targetSchema.required ?? [];
    }
    else if (schema.properties) {
        requiredFields = schema.required ?? [];
    }
    else {
        return example;
    }
    if (!targetSchema.properties)
        return example;
    for (const [name, prop] of Object.entries(targetSchema.properties)) {
        if (name === 'action')
            continue;
        const isRequired = requiredFields.includes(name);
        const description = (prop.description ?? '').toLowerCase();
        if (!isRequired)
            continue;
        if (prop.enum && Array.isArray(prop.enum) && prop.enum.length > 0) {
            example[name] = prop.enum[0];
        }
        else if (name.includes('project_id') || name === 'projectId') {
            example[name] = 'my-group/my-project';
        }
        else if (name.includes('group_id') || name === 'groupId') {
            example[name] = 'my-group';
        }
        else if (name.includes('namespace')) {
            example[name] = 'my-group/my-project';
        }
        else if (name.includes('_iid') || name === 'iid') {
            example[name] = '1';
        }
        else if (name.includes('_id') || name === 'id') {
            example[name] = '123';
        }
        else if (name === 'title') {
            example[name] = 'Example title';
        }
        else if (name === 'description') {
            example[name] = 'Example description';
        }
        else if (name === 'url') {
            example[name] = 'https://example.com/webhook';
        }
        else if (name === 'content') {
            example[name] = 'File content here';
        }
        else if (name === 'file_path' || name === 'path') {
            example[name] = 'path/to/file.txt';
        }
        else if (name === 'ref' || name === 'branch') {
            example[name] = 'main';
        }
        else if (name === 'from' || name === 'to') {
            example[name] = name === 'from' ? 'main' : 'feature-branch';
        }
        else if (description.includes('boolean') || prop.type === 'boolean') {
            example[name] = true;
        }
        else if (prop.type === 'number' || prop.type === 'integer') {
            example[name] = 10;
        }
        else if (prop.type === 'array') {
            example[name] = [];
        }
        else {
            example[name] = `example_${name}`;
        }
    }
    return example;
}
function getPackageVersion() {
    try {
        let dir = process.cwd();
        let fallbackVersion = null;
        for (let i = 0; i < 5; i++) {
            const pkgPath = path.join(dir, 'package.json');
            if (fs.existsSync(pkgPath)) {
                const content = fs.readFileSync(pkgPath, 'utf8');
                const pkg = JSON.parse(content);
                if (fallbackVersion === null && pkg.version) {
                    fallbackVersion = pkg.version;
                }
                if (pkg.name === '@structured-world/gitlab-mcp') {
                    return pkg.version ?? 'unknown';
                }
            }
            const parent = path.dirname(dir);
            if (parent === dir)
                break;
            dir = parent;
        }
        return fallbackVersion ?? 'unknown';
    }
    catch {
        return 'unknown';
    }
}
function generateExportMarkdown(tools, options) {
    const lines = [];
    const version = getPackageVersion();
    const timestamp = new Date().toISOString().split('T')[0];
    lines.push('# GitLab MCP Tools Reference');
    lines.push('');
    lines.push('> Auto-generated from source code. Do not edit manually.');
    lines.push(`> Generated: ${timestamp} | Tools: ${tools.length} | Version: ${version}`);
    lines.push('');
    const grouped = groupToolsByEntity(tools);
    if (options.toc) {
        lines.push('## Table of Contents');
        lines.push('');
        for (const [entity, entityTools] of grouped) {
            const anchor = entity.toLowerCase().replace(/\s+/g, '-');
            lines.push(`- [${entity} (${entityTools.length})](#${anchor})`);
        }
        lines.push('');
        lines.push('---');
        lines.push('');
    }
    for (const [entity, entityTools] of grouped) {
        lines.push(`## ${entity}`);
        lines.push('');
        for (const tool of entityTools) {
            const tierInfo = getToolTierInfo(tool.requirements);
            const tierDisplay = tierInfo ? ` ${tierInfo}` : '';
            lines.push(`### ${tool.name}${tierDisplay}`);
            lines.push('');
            lines.push(tool.description);
            lines.push('');
            const actions = extractActions(tool.inputSchema);
            if (actions.length > 0) {
                lines.push('#### Actions');
                lines.push('');
                lines.push('| Action | Tier | Description |');
                lines.push('|--------|------|-------------|');
                for (const action of actions) {
                    const actionTierInfo = getToolTierInfo(tool.requirements, action.name);
                    const tierDisplay = actionTierInfo.replace('[tier: ', '').replace(/]/g, '') || 'Unknown';
                    lines.push(`| \`${action.name}\` | ${tierDisplay} | ${action.description} |`);
                }
                lines.push('');
            }
            const groupedParams = extractParametersGrouped(tool.inputSchema);
            const hasParams = groupedParams.common.length > 0 || groupedParams.byAction.size > 0;
            if (hasParams) {
                lines.push('#### Parameters');
                lines.push('');
                if (groupedParams.common.length > 0) {
                    if (groupedParams.byAction.size > 0) {
                        lines.push('**Common** (all actions):');
                        lines.push('');
                    }
                    lines.push('| Parameter | Type | Required | Description |');
                    lines.push('|-----------|------|----------|-------------|');
                    for (const param of groupedParams.common) {
                        const req = param.required ? 'Yes' : 'No';
                        const desc = param.description || '-';
                        lines.push(`| \`${param.name}\` | ${param.type} | ${req} | ${desc} |`);
                    }
                    lines.push('');
                }
                if (groupedParams.byAction.size > 0) {
                    const sortedActions = Array.from(groupedParams.byAction.keys()).sort();
                    for (const actionName of sortedActions) {
                        const actionParams = groupedParams.byAction.get(actionName);
                        if (actionParams.length === 0)
                            continue;
                        lines.push(`**Action \`${actionName}\`**:`);
                        lines.push('');
                        lines.push('| Parameter | Type | Required | Description |');
                        lines.push('|-----------|------|----------|-------------|');
                        for (const param of actionParams) {
                            const req = param.requiredForAction ? 'Yes' : 'No';
                            const desc = param.description || '-';
                            lines.push(`| \`${param.name}\` | ${param.type} | ${req} | ${desc} |`);
                        }
                        lines.push('');
                    }
                }
            }
            if (!options.noExamples && tool.inputSchema) {
                const example = generateExample(tool.inputSchema);
                if (Object.keys(example).length > 0) {
                    lines.push('#### Example');
                    lines.push('');
                    lines.push('```json');
                    lines.push(JSON.stringify(example, null, 2));
                    lines.push('```');
                    lines.push('');
                }
            }
            lines.push('---');
            lines.push('');
        }
    }
    return lines.join('\n');
}
function extractEnvGates(tools) {
    const gatesMap = new Map();
    for (const tool of tools) {
        if (tool.gate) {
            const existing = gatesMap.get(tool.gate.envVar);
            if (existing) {
                existing.tools.push(tool.name);
            }
            else {
                gatesMap.set(tool.gate.envVar, {
                    envVar: tool.gate.envVar,
                    defaultValue: tool.gate.defaultValue,
                    tools: [tool.name],
                });
            }
        }
    }
    return Array.from(gatesMap.values()).sort((a, b) => a.envVar.localeCompare(b.envVar));
}
function getUngatedTools(tools) {
    return tools.filter((tool) => !tool.gate).map((tool) => tool.name);
}
function printEnvGatesMarkdown(gates, ungatedTools, format) {
    if (format === 'json') {
        const output = {
            gates: gates.map((g) => ({
                envVar: g.envVar,
                defaultValue: g.defaultValue,
                tools: g.tools,
            })),
            ungated: {
                description: 'Core tools (always enabled)',
                tools: ungatedTools,
            },
        };
        console.log(JSON.stringify(output, null, 2));
        return;
    }
    console.log('# Environment Variable Gates\n');
    console.log('This table shows which `USE_*` environment variables control which tools.\n');
    console.log('| Variable | Default | Tools Controlled |');
    console.log('|----------|---------|------------------|');
    for (const gate of gates) {
        const defaultStr = gate.defaultValue ? '`true`' : '`false`';
        const toolsStr = gate.tools.map((t) => `\`${t}\``).join(', ');
        console.log(`| \`${gate.envVar}\` | ${defaultStr} | ${toolsStr} |`);
    }
    if (ungatedTools.length > 0) {
        const toolsStr = ungatedTools.map((t) => `\`${t}\``).join(', ');
        console.log(`| *(none - always on)* | - | ${toolsStr} |`);
    }
    console.log('\n## Usage\n');
    console.log('Set environment variables to `false` to disable tool groups:\n');
    console.log('```bash');
    console.log('# Disable wiki tools');
    console.log('USE_GITLAB_WIKI=false');
    console.log('');
    console.log('# Disable pipeline tools');
    console.log('USE_PIPELINE=false');
    console.log('```');
}
const FEATURE_TO_TOOLS = {
    wiki: ['browse_wiki', 'manage_wiki'],
    milestones: ['browse_milestones', 'manage_milestone'],
    pipelines: ['browse_pipelines', 'manage_pipeline'],
    labels: ['browse_labels', 'manage_label'],
    mrs: [
        'browse_merge_requests',
        'browse_mr_discussions',
        'manage_merge_request',
        'manage_mr_discussion',
        'manage_draft_notes',
    ],
    files: ['browse_files', 'manage_files'],
    variables: ['browse_variables', 'manage_variable'],
    workitems: ['browse_work_items', 'manage_work_item'],
    webhooks: ['browse_webhooks', 'manage_webhook'],
    snippets: ['browse_snippets', 'manage_snippet'],
    integrations: ['browse_integrations', 'manage_integration'],
    iterations: ['browse_iterations'],
};
const FEATURE_NAMES = Object.keys(FEATURE_TO_TOOLS);
function countToolsForPreset(preset, allToolNames) {
    let enabledTools = allToolNames;
    if (preset.read_only) {
        enabledTools = enabledTools.filter((name) => !name.startsWith('manage_'));
    }
    if (preset.denied_tools_regex) {
        try {
            const regex = new RegExp(preset.denied_tools_regex);
            enabledTools = enabledTools.filter((name) => !regex.test(name));
        }
        catch (error) {
            console.warn(`Warning: invalid denied_tools_regex "${preset.denied_tools_regex}": ${error instanceof Error ? error.message : 'unknown error'}`);
        }
    }
    if (preset.allowed_tools && preset.allowed_tools.length > 0) {
        const allowedSet = new Set(preset.allowed_tools);
        enabledTools = enabledTools.filter((name) => allowedSet.has(name));
    }
    if (preset.features) {
        for (const [feature, tools] of Object.entries(FEATURE_TO_TOOLS)) {
            const featureKey = feature;
            if (preset.features[featureKey] === false) {
                const toolSet = new Set(tools);
                enabledTools = enabledTools.filter((name) => !toolSet.has(name));
            }
        }
    }
    return enabledTools.length;
}
function getToolsForPreset(preset, allToolNames) {
    let enabledTools = [...allToolNames];
    const disabledTools = [];
    if (preset.read_only) {
        const manageTools = enabledTools.filter((name) => name.startsWith('manage_'));
        disabledTools.push(...manageTools);
        enabledTools = enabledTools.filter((name) => !name.startsWith('manage_'));
    }
    if (preset.denied_tools_regex) {
        try {
            const regex = new RegExp(preset.denied_tools_regex);
            const denied = enabledTools.filter((name) => regex.test(name));
            disabledTools.push(...denied);
            enabledTools = enabledTools.filter((name) => !regex.test(name));
        }
        catch (error) {
            console.warn(`Warning: invalid denied_tools_regex "${preset.denied_tools_regex}": ${error instanceof Error ? error.message : 'unknown error'}`);
        }
    }
    if (preset.allowed_tools && preset.allowed_tools.length > 0) {
        const allowedSet = new Set(preset.allowed_tools);
        const notAllowed = enabledTools.filter((name) => !allowedSet.has(name));
        disabledTools.push(...notAllowed);
        enabledTools = enabledTools.filter((name) => allowedSet.has(name));
    }
    if (preset.features) {
        for (const [feature, tools] of Object.entries(FEATURE_TO_TOOLS)) {
            const featureKey = feature;
            if (preset.features[featureKey] === false) {
                const toolSet = new Set(tools);
                const disabled = enabledTools.filter((name) => toolSet.has(name));
                disabledTools.push(...disabled);
                enabledTools = enabledTools.filter((name) => !toolSet.has(name));
            }
        }
    }
    return {
        enabled: enabledTools.sort(),
        disabled: [...new Set(disabledTools)].sort(),
    };
}
async function printPresetsList(loader, allToolNames, format) {
    const profiles = await loader.listProfiles();
    const presets = profiles.filter((p) => p.isPreset);
    const userProfiles = profiles.filter((p) => !p.isPreset);
    if (format === 'json') {
        const output = {
            builtIn: await Promise.all(presets.map(async (p) => {
                const preset = await loader.loadPreset(p.name);
                return {
                    name: p.name,
                    description: p.description ?? '',
                    readOnly: p.readOnly,
                    toolCount: countToolsForPreset(preset, allToolNames),
                };
            })),
            userPresets: userProfiles.length,
            totalTools: allToolNames.length,
        };
        console.log(JSON.stringify(output, null, 2));
        return;
    }
    console.log('# Available Presets\n');
    console.log(`Total tools available: ${allToolNames.length}\n`);
    console.log('## Built-in Presets\n');
    console.log('| Preset | Tools | Read-Only | Description |');
    console.log('|--------|-------|-----------|-------------|');
    for (const p of presets) {
        const preset = await loader.loadPreset(p.name);
        const toolCount = countToolsForPreset(preset, allToolNames);
        const ro = p.readOnly ? 'Yes' : 'No';
        const desc = p.description ?? '-';
        console.log(`| \`${p.name}\` | ${toolCount} | ${ro} | ${desc} |`);
    }
    if (userProfiles.length > 0) {
        console.log('\n## User Profiles\n');
        console.log(`${userProfiles.length} user profile(s) defined. Use \`--profiles\` to list them.`);
    }
    console.log('\nUse `yarn list-tools --preset <name>` for details.');
}
async function printProfilesList(loader, format) {
    const profiles = await loader.listProfiles();
    const userProfiles = profiles.filter((p) => !p.isPreset);
    if (format === 'json') {
        const output = userProfiles.map((p) => ({
            name: p.name,
            host: p.host,
            authType: p.authType,
            readOnly: p.readOnly,
        }));
        console.log(JSON.stringify(output, null, 2));
        return;
    }
    console.log('# User Profiles\n');
    if (userProfiles.length === 0) {
        console.log('No user profiles defined.\n');
        console.log('Create profiles in: `~/.config/gitlab-mcp/profiles.yaml`\n');
        console.log('Example:\n');
        console.log('```yaml');
        console.log('profiles:');
        console.log('  work:');
        console.log('    host: gitlab.company.com');
        console.log('    auth:');
        console.log('      type: pat');
        console.log('      token_env: GITLAB_WORK_TOKEN');
        console.log('```');
        return;
    }
    console.log('| Profile | Host | Auth | Read-Only |');
    console.log('|---------|------|------|-----------|');
    for (const p of userProfiles) {
        const ro = p.readOnly ? 'Yes' : 'No';
        console.log(`| \`${p.name}\` | ${p.host ?? '-'} | ${p.authType ?? '-'} | ${ro} |`);
    }
    console.log('\nUse `yarn list-tools --profile <name>` for details.');
}
async function printPresetDetails(loader, presetName, allToolNames, format, validate) {
    let preset;
    try {
        preset = await loader.loadPreset(presetName);
    }
    catch {
        console.error(`Error: Preset '${presetName}' not found`);
        process.exit(1);
        return;
    }
    const { enabled, disabled } = getToolsForPreset(preset, allToolNames);
    if (format === 'json') {
        const output = {
            name: presetName,
            type: 'builtin',
            description: preset.description ?? null,
            readOnly: preset.read_only ?? false,
            toolsEnabled: enabled.length,
            toolsDisabled: disabled.length,
            features: preset.features ?? {},
            deniedToolsRegex: preset.denied_tools_regex ?? null,
            allowedTools: preset.allowed_tools ?? null,
            deniedActions: preset.denied_actions ?? null,
            enabledTools: enabled,
            disabledTools: disabled,
        };
        if (validate) {
            const validation = await loader.validatePreset(preset);
            output.validation = validation;
        }
        console.log(JSON.stringify(output, null, 2));
        return;
    }
    console.log(`# Preset: ${presetName}\n`);
    console.log(`**Type:** Built-in`);
    console.log(`**Description:** ${preset.description ?? '-'}`);
    console.log(`**Tools Enabled:** ${enabled.length} (of ${allToolNames.length} available)`);
    console.log(`**Read-Only:** ${preset.read_only ? 'Yes' : 'No'}\n`);
    if (preset.features) {
        console.log('## Features\n');
        console.log('| Feature | Status |');
        console.log('|---------|--------|');
        for (const f of FEATURE_NAMES) {
            const featureKey = f;
            const status = preset.features[featureKey] === true
                ? 'Enabled'
                : preset.features[featureKey] === false
                    ? 'Disabled'
                    : '-';
            console.log(`| ${f} | ${status} |`);
        }
        console.log();
    }
    console.log('## Tool Restrictions\n');
    if (preset.denied_tools_regex) {
        console.log(`**Denied tools regex:** \`${preset.denied_tools_regex}\`\n`);
    }
    if (preset.allowed_tools && preset.allowed_tools.length > 0) {
        console.log(`**Allowed tools (whitelist):** ${preset.allowed_tools.length} tools\n`);
    }
    if (preset.denied_actions && preset.denied_actions.length > 0) {
        console.log(`**Denied actions:** ${preset.denied_actions.join(', ')}\n`);
    }
    if (!preset.denied_tools_regex &&
        !preset.allowed_tools?.length &&
        !preset.denied_actions?.length) {
        console.log('No explicit tool restrictions.\n');
    }
    console.log('## Enabled Tools\n');
    for (const tool of enabled) {
        console.log(`- ${tool}`);
    }
    console.log();
    if (disabled.length > 0) {
        console.log('## Disabled Tools\n');
        for (const tool of disabled) {
            console.log(`- ${tool}`);
        }
        console.log();
    }
    if (validate) {
        console.log('## Validation\n');
        const validation = await loader.validatePreset(preset);
        if (validation.valid && validation.warnings.length === 0) {
            console.log('**Status: VALID**\n');
        }
        else if (validation.valid) {
            console.log(`**Status: VALID** (${validation.warnings.length} warning(s))\n`);
            console.log('### Warnings\n');
            for (const w of validation.warnings) {
                console.log(`- ${w}`);
            }
        }
        else {
            console.log(`**Status: INVALID** (${validation.errors.length} error(s))\n`);
            console.log('### Errors\n');
            for (const e of validation.errors) {
                console.log(`- ${e}`);
            }
            if (validation.warnings.length > 0) {
                console.log('\n### Warnings\n');
                for (const w of validation.warnings) {
                    console.log(`- ${w}`);
                }
            }
        }
    }
}
async function printProfileDetails(loader, profileName, format, validate) {
    let profile;
    try {
        profile = await loader.loadProfile(profileName);
    }
    catch {
        console.error(`Error: Profile '${profileName}' not found`);
        process.exit(1);
        return;
    }
    if (format === 'json') {
        const output = {
            name: profileName,
            type: 'user',
            host: profile.host,
            authType: profile.auth.type,
            readOnly: profile.read_only ?? false,
            features: profile.features ?? {},
            deniedToolsRegex: profile.denied_tools_regex ?? null,
            allowedTools: profile.allowed_tools ?? null,
            deniedActions: profile.denied_actions ?? null,
            allowedProjects: profile.allowed_projects ?? null,
            allowedGroups: profile.allowed_groups ?? null,
            defaultProject: profile.default_project ?? null,
            defaultNamespace: profile.default_namespace ?? null,
            timeoutMs: profile.timeout_ms ?? null,
            skipTlsVerify: profile.skip_tls_verify ?? false,
        };
        if (validate) {
            const validation = await loader.validateProfile(profile);
            output.validation = validation;
        }
        console.log(JSON.stringify(output, null, 2));
        return;
    }
    console.log(`# Profile: ${profileName}\n`);
    console.log(`**Type:** User-defined`);
    console.log(`**Host:** ${profile.host}`);
    console.log(`**Auth:** ${profile.auth.type}`);
    console.log(`**Read-Only:** ${profile.read_only ? 'Yes' : 'No'}\n`);
    console.log('## Settings\n');
    console.log('| Setting | Value |');
    console.log('|---------|-------|');
    console.log(`| Timeout | ${profile.timeout_ms ?? 'default'}ms |`);
    console.log(`| TLS Verify | ${profile.skip_tls_verify ? 'No' : 'Yes'} |`);
    if (profile.default_project) {
        console.log(`| Default Project | ${profile.default_project} |`);
    }
    if (profile.default_namespace) {
        console.log(`| Default Namespace | ${profile.default_namespace} |`);
    }
    console.log();
    if (profile.allowed_projects?.length || profile.allowed_groups?.length) {
        console.log('## Access Restrictions\n');
        if (profile.allowed_projects?.length) {
            console.log(`**Allowed Projects:** ${profile.allowed_projects.join(', ')}\n`);
        }
        if (profile.allowed_groups?.length) {
            console.log(`**Allowed Groups:** ${profile.allowed_groups.join(', ')}\n`);
        }
    }
    if (profile.denied_tools_regex ||
        profile.allowed_tools?.length ||
        profile.denied_actions?.length) {
        console.log('## Tool Restrictions\n');
        if (profile.denied_tools_regex) {
            console.log(`**Denied tools regex:** \`${profile.denied_tools_regex}\`\n`);
        }
        if (profile.allowed_tools?.length) {
            console.log(`**Allowed tools (whitelist):** ${profile.allowed_tools.length} tools\n`);
        }
        if (profile.denied_actions?.length) {
            console.log(`**Denied actions:** ${profile.denied_actions.join(', ')}\n`);
        }
    }
    if (validate) {
        console.log('## Validation\n');
        const validation = await loader.validateProfile(profile);
        if (validation.valid && validation.warnings.length === 0) {
            console.log('**Status: VALID**\n');
        }
        else if (validation.valid) {
            console.log(`**Status: VALID** (${validation.warnings.length} warning(s))\n`);
            console.log('### Warnings\n');
            for (const w of validation.warnings) {
                console.log(`- ${w}`);
            }
        }
        else {
            console.log(`**Status: INVALID** (${validation.errors.length} error(s))\n`);
            console.log('### Errors\n');
            for (const e of validation.errors) {
                console.log(`- ${e}`);
            }
        }
    }
}
async function comparePresets(loader, presetA, presetB, allToolNames, format) {
    let a, b;
    try {
        a = await loader.loadPreset(presetA);
    }
    catch {
        console.error(`Error: Preset '${presetA}' not found`);
        process.exit(1);
        return;
    }
    try {
        b = await loader.loadPreset(presetB);
    }
    catch {
        console.error(`Error: Preset '${presetB}' not found`);
        process.exit(1);
        return;
    }
    const toolsA = getToolsForPreset(a, allToolNames);
    const toolsB = getToolsForPreset(b, allToolNames);
    const enabledSetA = new Set(toolsA.enabled);
    const enabledSetB = new Set(toolsB.enabled);
    const onlyInA = toolsA.enabled.filter((t) => !enabledSetB.has(t));
    const onlyInB = toolsB.enabled.filter((t) => !enabledSetA.has(t));
    const common = toolsA.enabled.filter((t) => enabledSetB.has(t));
    if (format === 'json') {
        const output = {
            presetA: {
                name: presetA,
                description: a.description ?? null,
                toolCount: toolsA.enabled.length,
                readOnly: a.read_only ?? false,
            },
            presetB: {
                name: presetB,
                description: b.description ?? null,
                toolCount: toolsB.enabled.length,
                readOnly: b.read_only ?? false,
            },
            comparison: {
                commonTools: common.length,
                onlyInA: onlyInA.length,
                onlyInB: onlyInB.length,
                onlyInAList: onlyInA,
                onlyInBList: onlyInB,
            },
        };
        console.log(JSON.stringify(output, null, 2));
        return;
    }
    console.log(`# Comparison: ${presetA} vs ${presetB}\n`);
    console.log('## Summary\n');
    console.log('| | ' + presetA + ' | ' + presetB + ' |');
    console.log('|---|---|---|');
    console.log(`| Tools | ${toolsA.enabled.length} | ${toolsB.enabled.length} |`);
    console.log(`| Read-Only | ${a.read_only ? 'Yes' : 'No'} | ${b.read_only ? 'Yes' : 'No'} |`);
    console.log();
    console.log(`**Common tools:** ${common.length}\n`);
    if (onlyInA.length > 0) {
        console.log(`## Only in ${presetA} (${onlyInA.length})\n`);
        for (const t of onlyInA) {
            console.log(`- ${t}`);
        }
        console.log();
    }
    if (onlyInB.length > 0) {
        console.log(`## Only in ${presetB} (${onlyInB.length})\n`);
        for (const t of onlyInB) {
            console.log(`- ${t}`);
        }
        console.log();
    }
    if (a.features || b.features) {
        console.log('## Feature Comparison\n');
        console.log('| Feature | ' + presetA + ' | ' + presetB + ' |');
        console.log('|---------|---|---|');
        for (const f of FEATURE_NAMES) {
            const featureKey = f;
            const statusA = a.features?.[featureKey] === true ? 'Yes' : a.features?.[featureKey] === false ? 'No' : '-';
            const statusB = b.features?.[featureKey] === true ? 'Yes' : b.features?.[featureKey] === false ? 'No' : '-';
            if (statusA !== statusB) {
                console.log(`| **${f}** | ${statusA} | ${statusB} |`);
            }
            else {
                console.log(`| ${f} | ${statusA} | ${statusB} |`);
            }
        }
    }
}
async function main() {
    const options = parseArgs();
    if (options.compare && !options.preset) {
        console.error('Error: --compare flag must be used with --preset.');
        console.error('Usage: yarn list-tools --preset <name> --compare <other_name>');
        process.exit(1);
        return;
    }
    if (options.validate && !options.preset && !options.profile) {
        console.error('Error: --validate flag must be used with --preset or --profile.');
        console.error('Usage: yarn list-tools --preset <name> --validate');
        console.error('   or: yarn list-tools --profile <name> --validate');
        process.exit(1);
        return;
    }
    if (options.showEnv) {
        printEnvironmentInfo();
    }
    const registryManager = registry_manager_1.RegistryManager.getInstance();
    if (options.showEnvGates) {
        const allTools = registryManager.getAllToolDefinitionsUnfiltered();
        const gates = extractEnvGates(allTools);
        const ungated = getUngatedTools(allTools);
        printEnvGatesMarkdown(gates, ungated, options.format === 'json' ? 'json' : 'markdown');
        return;
    }
    const needsProfileLoader = Boolean(options.showPresets) ||
        Boolean(options.showProfiles) ||
        Boolean(options.preset) ||
        Boolean(options.profile);
    if (needsProfileLoader) {
        const loader = new profiles_1.ProfileLoader();
        const allToolNames = registryManager.getAllToolDefinitionsUnfiltered().map((t) => t.name);
        if (options.showPresets) {
            await printPresetsList(loader, allToolNames, options.format === 'json' ? 'json' : 'markdown');
            return;
        }
        if (options.showProfiles) {
            await printProfilesList(loader, options.format === 'json' ? 'json' : 'markdown');
            return;
        }
        if (options.preset && options.compare) {
            await comparePresets(loader, options.preset, options.compare, allToolNames, options.format === 'json' ? 'json' : 'markdown');
            return;
        }
        if (options.preset) {
            await printPresetDetails(loader, options.preset, allToolNames, options.format === 'json' ? 'json' : 'markdown', options.validate ?? false);
            return;
        }
        if (options.profile) {
            await printProfileDetails(loader, options.profile, options.format === 'json' ? 'json' : 'markdown', options.validate ?? false);
            return;
        }
    }
    const toolDefinitions = options.format === 'export'
        ? registryManager.getAllToolDefinitionsUnfiltered()
        : registryManager.getAllToolDefinitionsTierless();
    const tools = toolDefinitions.map((def) => ({
        name: def.name,
        description: def.description,
        inputSchema: def.inputSchema,
        requirements: def.requirements,
    }));
    let filteredTools = tools;
    if (options.entity) {
        const grouped = groupToolsByEntity(tools);
        const entityKey = Array.from(grouped.keys()).find((k) => k.toLowerCase().replace(/ /g, '') === options.entity.toLowerCase().replace(/ /g, ''));
        filteredTools = entityKey ? (grouped.get(entityKey) ?? []) : [];
        if (filteredTools.length === 0) {
            console.error(`No tools found for entity: ${options.entity}`);
            process.exit(1);
        }
    }
    if (options.tool) {
        filteredTools = filteredTools.filter((t) => t.name === options.tool);
        if (filteredTools.length === 0) {
            console.error(`Tool not found: ${options.tool}`);
            process.exit(1);
        }
    }
    switch (options.format) {
        case 'json':
            const output = filteredTools.map((tool) => ({
                name: tool.name,
                description: tool.description,
                tier: tool.requirements ? (tool.requirements.default.tier ?? 'free') : 'unknown',
                minVersion: tool.requirements ? (tool.requirements.default.minVersion ?? '8.0') : undefined,
                parameters: tool.inputSchema,
            }));
            console.log(JSON.stringify(output, null, 2));
            break;
        case 'simple':
            filteredTools.forEach((tool) => {
                console.log(tool.name);
            });
            break;
        case 'export':
            const markdown = generateExportMarkdown(filteredTools, {
                noExamples: options.noExamples,
                toc: options.toc,
            });
            console.log(markdown);
            break;
        case 'markdown':
        default:
            if (!options.entity && !options.tool) {
                console.log('# GitLab MCP Tools\n');
                console.log(`Total tools available: ${filteredTools.length}\n`);
                const grouped = groupToolsByEntity(filteredTools);
                console.log('## Categories\n');
                for (const [entity, entityTools] of grouped) {
                    console.log(`- **${entity}**: ${entityTools.length} tools`);
                }
                console.log();
                for (const [entity, entityTools] of grouped) {
                    console.log(`## ${entity}\n`);
                    for (const tool of entityTools) {
                        const tierInfo = getToolTierInfo(tool.requirements);
                        const tierDisplay = tierInfo ? ` ${tierInfo}` : '';
                        console.log(`### ${tool.name}${tierDisplay}`);
                        console.log(`**Description**: ${tool.description}\n`);
                        if ((options.verbose || options.detail) && tool.inputSchema) {
                            console.log('**Parameters**:');
                            const params = getParameterDescription(tool.inputSchema);
                            if (params.length > 0) {
                                params.forEach((p) => console.log(p));
                            }
                            else {
                                console.log('  (no parameters)');
                            }
                            console.log();
                        }
                    }
                }
            }
            else {
                for (const tool of filteredTools) {
                    const tierInfo = getToolTierInfo(tool.requirements);
                    const tierDisplay = tierInfo ? ` ${tierInfo}` : '';
                    console.log(`## ${tool.name}${tierDisplay}\n`);
                    console.log(`**Description**: ${tool.description}\n`);
                    if (tool.inputSchema) {
                        console.log('**Parameters**:\n');
                        const params = getParameterDescription(tool.inputSchema);
                        if (params.length > 0) {
                            params.forEach((p) => console.log(p));
                        }
                        else {
                            console.log('(no parameters)');
                        }
                    }
                    console.log();
                }
            }
            break;
    }
    if (options.showEnv && options.format === 'markdown') {
        console.log('\n---\n');
        console.log('*Note: Tool availability may be affected by environment variables shown above.*');
    }
}
if (!process.env.NODE_ENV || process.env.NODE_ENV !== 'test') {
    main().catch((error) => {
        console.error('Error:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=list-tools.js.map