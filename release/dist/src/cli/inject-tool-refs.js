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
exports.extractActions = extractActions;
exports.generateActionsTable = generateActionsTable;
exports.findMarkers = findMarkers;
exports.processFile = processFile;
exports.replacePlaceholders = replacePlaceholders;
exports.countEntities = countEntities;
exports.getVersion = getVersion;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const registry_manager_js_1 = require("../registry-manager.js");
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
    cancel: 'Cancel a running operation',
    retry: 'Retry a failed operation',
    play: 'Run a manual job',
    publish: 'Publish draft notes',
    resolve: 'Resolve a discussion thread',
    disable: 'Disable the integration',
    test: 'Test a webhook',
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
function generateActionsTable(actions) {
    const lines = [];
    lines.push('| Action | Description |');
    lines.push('|--------|-------------|');
    for (const action of actions) {
        const desc = action.description.replace(/\\/g, '\\\\').replace(/\|/g, '\\|');
        lines.push(`| \`${action.name}\` | ${desc} |`);
    }
    return lines.join('\n');
}
function findMarkers(content) {
    const markers = [];
    const startPattern = /<!-- @autogen:tool (\S+) -->/g;
    const endPattern = '<!-- @autogen:end -->';
    let match;
    while ((match = startPattern.exec(content)) !== null) {
        const toolName = match[1];
        const startIdx = match.index;
        const afterStart = startIdx + match[0].length;
        const endIdx = content.indexOf(endPattern, afterStart);
        if (endIdx === -1) {
            throw new Error(`Missing <!-- @autogen:end --> for tool "${toolName}"`);
        }
        markers.push({
            toolName,
            startIdx,
            endIdx: endIdx + endPattern.length,
        });
    }
    return markers;
}
function processFile(filePath, toolSchemas, content) {
    const fileContent = content ?? fs.readFileSync(filePath, 'utf8');
    const markers = findMarkers(fileContent);
    if (markers.length === 0)
        return false;
    let result = fileContent;
    for (let i = markers.length - 1; i >= 0; i--) {
        const marker = markers[i];
        const schema = toolSchemas.get(marker.toolName);
        if (!schema) {
            throw new Error(`Unknown tool "${marker.toolName}" in ${filePath}. ` +
                `Available tools: ${Array.from(toolSchemas.keys()).sort().join(', ')}`);
        }
        const actions = extractActions(schema);
        if (actions.length === 0) {
            throw new Error(`Tool "${marker.toolName}" has no extractable actions in ${filePath}`);
        }
        const table = generateActionsTable(actions);
        const startTag = `<!-- @autogen:tool ${marker.toolName} -->`;
        const endTag = '<!-- @autogen:end -->';
        const replacement = `${startTag}\n${table}\n${endTag}`;
        result = result.slice(0, marker.startIdx) + replacement + result.slice(marker.endIdx);
    }
    if (result !== fileContent) {
        fs.writeFileSync(filePath, result, 'utf8');
        return true;
    }
    return false;
}
function replacePlaceholders(filePath, placeholders) {
    const content = fs.readFileSync(filePath, 'utf8');
    const result = content
        .replace(/__TOOL_COUNT__/g, String(placeholders.toolCount))
        .replace(/__ACTION_COUNT__/g, String(placeholders.actionCount))
        .replace(/__ENTITY_COUNT__/g, String(placeholders.entityCount))
        .replace(/__READONLY_TOOL_COUNT__/g, String(placeholders.readonlyToolCount))
        .replace(/__VERSION__/g, placeholders.version);
    if (result !== content) {
        fs.writeFileSync(filePath, result, 'utf8');
        return true;
    }
    return false;
}
function countEntities(projectRoot) {
    const entitiesDir = path.join(projectRoot, 'src', 'entities');
    if (!fs.existsSync(entitiesDir))
        return 0;
    return fs
        .readdirSync(entitiesDir, { withFileTypes: true })
        .filter((d) => d.isDirectory() && fs.existsSync(path.join(entitiesDir, d.name, 'registry.ts')))
        .length;
}
function getVersion(projectRoot) {
    if (process.env.RELEASE_VERSION) {
        return process.env.RELEASE_VERSION;
    }
    const packageJsonPath = path.join(projectRoot, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        return packageJson.version ?? '0.0.0';
    }
    return '0.0.0';
}
function main() {
    let projectRoot = process.cwd();
    while (!fs.existsSync(path.join(projectRoot, 'package.json'))) {
        const parent = path.dirname(projectRoot);
        if (parent === projectRoot)
            break;
        projectRoot = parent;
    }
    const docsToolsDir = path.join(projectRoot, 'docs', 'tools');
    if (!fs.existsSync(docsToolsDir)) {
        console.error(`Error: docs/tools/ directory not found at ${docsToolsDir}`);
        process.exit(1);
    }
    const registryManager = registry_manager_js_1.RegistryManager.getInstance();
    const allTools = registryManager.getAllToolDefinitionsUnfiltered();
    const toolSchemas = new Map();
    for (const tool of allTools) {
        toolSchemas.set(tool.name, tool.inputSchema);
    }
    const toolCount = allTools.length;
    const entityCount = countEntities(projectRoot);
    const readonlyToolCount = allTools.filter((t) => t.name.startsWith('browse_') || t.name === 'manage_context').length;
    const actionCount = allTools.reduce((sum, t) => sum + extractActions(t.inputSchema).length, 0);
    const version = getVersion(projectRoot);
    console.log(`  Tool count: ${toolCount}, Entity count: ${entityCount}, Read-only: ${readonlyToolCount}, Actions: ${actionCount}, Version: ${version}`);
    const placeholders = {
        toolCount,
        entityCount,
        readonlyToolCount,
        actionCount,
        version,
    };
    const docsDir = path.join(projectRoot, 'docs');
    let templateCount = 0;
    if (fs.existsSync(docsDir)) {
        function processTemplates(dir) {
            for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory() && !['node_modules', '.vitepress', 'dist'].includes(entry.name)) {
                    processTemplates(fullPath);
                }
                else if (entry.isFile() &&
                    (entry.name.endsWith('.md.in') || entry.name.endsWith('.txt.in'))) {
                    const outputPath = fullPath.replace(/\.in$/, '');
                    fs.copyFileSync(fullPath, outputPath);
                    replacePlaceholders(outputPath, placeholders);
                    templateCount++;
                    const relPath = path.relative(projectRoot, outputPath);
                    console.log(`  Generated: ${relPath} (from ${entry.name})`);
                }
            }
        }
        processTemplates(docsDir);
        if (templateCount > 0) {
            console.log(`  Generated ${templateCount} file(s) from .in templates`);
        }
    }
    const mdFiles = fs
        .readdirSync(docsToolsDir)
        .filter((f) => f.endsWith('.md'))
        .map((f) => path.join(docsToolsDir, f));
    let modifiedCount = 0;
    let markerCount = 0;
    for (const filePath of mdFiles) {
        const content = fs.readFileSync(filePath, 'utf8');
        const markers = findMarkers(content);
        markerCount += markers.length;
        if (markers.length > 0) {
            const modified = processFile(filePath, toolSchemas, content);
            if (modified) {
                modifiedCount++;
                const relPath = path.relative(projectRoot, filePath);
                console.log(`  Updated: ${relPath} (${markers.length} marker(s))`);
            }
        }
    }
    console.log(`inject-tool-refs: ${markerCount} marker(s) in ${mdFiles.length} file(s), ${modifiedCount} updated.`);
}
if (process.env.NODE_ENV !== 'test') {
    main();
}
//# sourceMappingURL=inject-tool-refs.js.map