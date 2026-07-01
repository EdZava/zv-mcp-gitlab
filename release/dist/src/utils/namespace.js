"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractNamespaceFromPath = extractNamespaceFromPath;
exports.isLikelyProjectPath = isLikelyProjectPath;
exports.detectNamespaceType = detectNamespaceType;
exports.resolveNamespaceForAPI = resolveNamespaceForAPI;
const fetch_1 = require("./fetch");
function extractNamespaceFromPath(projectPath) {
    if (!projectPath) {
        return undefined;
    }
    const pathParts = projectPath.split('/');
    if (pathParts.length === 1) {
        return projectPath;
    }
    return pathParts.slice(0, -1).join('/');
}
function isLikelyProjectPath(namespacePath) {
    return namespacePath.includes('/');
}
async function detectNamespaceType(namespacePath) {
    if (isLikelyProjectPath(namespacePath)) {
        const isProject = await verifyNamespaceType(namespacePath, 'project');
        if (isProject)
            return 'project';
        const isGroup = await verifyNamespaceType(namespacePath, 'group');
        if (isGroup)
            return 'group';
        return 'project';
    }
    else {
        const isGroup = await verifyNamespaceType(namespacePath, 'group');
        if (isGroup)
            return 'group';
        const isProject = await verifyNamespaceType(namespacePath, 'project');
        if (isProject)
            return 'project';
        return 'group';
    }
}
async function verifyNamespaceType(namespacePath, type) {
    try {
        const entityType = type === 'project' ? 'projects' : 'groups';
        const apiUrl = `${process.env.GITLAB_API_URL}/api/v4/${entityType}/${encodeURIComponent(namespacePath)}`;
        const response = await (0, fetch_1.enhancedFetch)(apiUrl);
        return response.ok;
    }
    catch {
        return false;
    }
}
async function resolveNamespaceForAPI(namespacePath) {
    const namespaceType = await detectNamespaceType(namespacePath);
    return {
        entityType: namespaceType === 'project' ? 'projects' : 'groups',
        encodedPath: encodeURIComponent(namespacePath),
    };
}
//# sourceMappingURL=namespace.js.map