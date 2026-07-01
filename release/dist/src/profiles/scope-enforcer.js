"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScopeEnforcer = exports.ScopeViolationError = void 0;
exports.isInNamespace = isInNamespace;
exports.extractProjectsFromArgs = extractProjectsFromArgs;
exports.extractGroupsFromArgs = extractGroupsFromArgs;
exports.enforceArgsScope = enforceArgsScope;
const logger_1 = require("../logger");
class ScopeViolationError extends Error {
    attemptedTarget;
    allowedScope;
    constructor(attemptedTarget, allowedScope) {
        const scopeDescription = getScopeDescription(allowedScope);
        super(`Operation on '${attemptedTarget}' is outside the allowed scope (${scopeDescription})`);
        this.attemptedTarget = attemptedTarget;
        this.allowedScope = allowedScope;
        this.name = 'ScopeViolationError';
    }
}
exports.ScopeViolationError = ScopeViolationError;
function getScopeDescription(scope) {
    const parts = [];
    if (scope.project) {
        parts.push(`project: ${scope.project}`);
    }
    if (scope.group) {
        const subgroupSuffix = scope.includeSubgroups !== false ? '/*' : '';
        parts.push(`group: ${scope.group}${subgroupSuffix}`);
    }
    if (scope.namespace) {
        parts.push(`namespace: ${scope.namespace}/*`);
    }
    if (scope.projects && scope.projects.length > 0) {
        if (scope.projects.length <= 3) {
            parts.push(`projects: ${scope.projects.join(', ')}`);
        }
        else {
            parts.push(`${scope.projects.length} allowed projects`);
        }
    }
    if (scope.groups && scope.groups.length > 0) {
        if (scope.groups.length <= 3) {
            parts.push(`groups: ${scope.groups.join(', ')}`);
        }
        else {
            parts.push(`${scope.groups.length} allowed groups`);
        }
    }
    return parts.length > 0 ? parts.join('; ') : 'unrestricted';
}
function normalizeProjectPath(path) {
    const trimmed = path.trim().replace(/^\/+|\/+$/g, '');
    if (/^\d+$/.test(trimmed)) {
        return trimmed;
    }
    return trimmed.toLowerCase();
}
function isInNamespace(projectPath, namespace) {
    const normalizedProject = normalizeProjectPath(projectPath);
    const normalizedNamespace = normalizeProjectPath(namespace);
    return (normalizedProject === normalizedNamespace ||
        normalizedProject.startsWith(normalizedNamespace + '/'));
}
class ScopeEnforcer {
    scope;
    allowedProjectsSet;
    allowedGroupsSet;
    includeSubgroups;
    constructor(scope) {
        this.scope = scope;
        this.includeSubgroups = scope.includeSubgroups !== false;
        this.allowedProjectsSet = new Set((scope.projects ?? []).map((p) => normalizeProjectPath(p)));
        if (scope.project) {
            this.allowedProjectsSet.add(normalizeProjectPath(scope.project));
        }
        this.allowedGroupsSet = new Set((scope.groups ?? []).map((g) => normalizeProjectPath(g)));
        if (scope.group) {
            this.allowedGroupsSet.add(normalizeProjectPath(scope.group));
        }
        (0, logger_1.logDebug)('ScopeEnforcer initialized', {
            scope: getScopeDescription(scope),
            allowedProjectsCount: this.allowedProjectsSet.size,
            allowedGroupsCount: this.allowedGroupsSet.size,
            includeSubgroups: this.includeSubgroups,
        });
    }
    static fromPreset(preset) {
        if (!preset.scope) {
            return null;
        }
        return new ScopeEnforcer(preset.scope);
    }
    isAllowed(projectPath) {
        if (!this.hasProjectRestrictions()) {
            return true;
        }
        const normalized = normalizeProjectPath(projectPath);
        if (this.allowedProjectsSet.size > 0 && this.allowedProjectsSet.has(normalized)) {
            return true;
        }
        if (this.scope.namespace && isInNamespace(projectPath, this.scope.namespace)) {
            return true;
        }
        if (this.allowedGroupsSet.size > 0) {
            for (const allowedGroup of this.allowedGroupsSet) {
                if (this.includeSubgroups) {
                    if (isInNamespace(projectPath, allowedGroup)) {
                        return true;
                    }
                }
                else {
                    const parts = normalized.split('/');
                    if (parts.length >= 2) {
                        const projectGroup = parts.slice(0, -1).join('/');
                        if (projectGroup === allowedGroup) {
                            return true;
                        }
                    }
                }
            }
        }
        if (/^\d+$/.test(normalized)) {
            (0, logger_1.logWarn)('Numeric project ID not in allowed scope - denying access', {
                projectId: normalized,
            });
            return false;
        }
        return false;
    }
    isGroupAllowed(groupPath) {
        if (!this.hasGroupRestrictions()) {
            return true;
        }
        const normalized = normalizeProjectPath(groupPath);
        if (this.allowedGroupsSet.size > 0 && this.allowedGroupsSet.has(normalized)) {
            return true;
        }
        if (this.includeSubgroups && this.allowedGroupsSet.size > 0) {
            for (const allowedGroup of this.allowedGroupsSet) {
                if (isInNamespace(groupPath, allowedGroup)) {
                    return true;
                }
            }
        }
        if (this.scope.namespace && isInNamespace(groupPath, this.scope.namespace)) {
            return true;
        }
        if (/^\d+$/.test(normalized)) {
            (0, logger_1.logWarn)('Numeric group ID not in allowed scope - denying access', { groupId: normalized });
            return false;
        }
        return false;
    }
    enforce(projectPath) {
        if (!this.isAllowed(projectPath)) {
            (0, logger_1.logWarn)('Project scope violation attempted', {
                attempted: projectPath,
                scope: getScopeDescription(this.scope),
            });
            throw new ScopeViolationError(projectPath, this.scope);
        }
    }
    enforceGroup(groupPath) {
        if (!this.isGroupAllowed(groupPath)) {
            (0, logger_1.logWarn)('Group scope violation attempted', {
                attempted: groupPath,
                scope: getScopeDescription(this.scope),
            });
            throw new ScopeViolationError(groupPath, this.scope);
        }
    }
    getScope() {
        return this.scope;
    }
    getScopeDescription() {
        return getScopeDescription(this.scope);
    }
    hasProjectRestrictions() {
        const hasProject = Boolean(this.scope.project);
        const hasNamespace = Boolean(this.scope.namespace);
        const hasProjects = Boolean(this.scope.projects && this.scope.projects.length > 0);
        const hasGroup = Boolean(this.scope.group);
        const hasGroups = Boolean(this.scope.groups && this.scope.groups.length > 0);
        return hasProject || hasNamespace || hasProjects || hasGroup || hasGroups;
    }
    hasGroupRestrictions() {
        const hasGroup = Boolean(this.scope.group);
        const hasNamespace = Boolean(this.scope.namespace);
        const hasGroups = Boolean(this.scope.groups && this.scope.groups.length > 0);
        return hasGroup || hasNamespace || hasGroups;
    }
    hasRestrictions() {
        return this.hasProjectRestrictions() || this.hasGroupRestrictions();
    }
}
exports.ScopeEnforcer = ScopeEnforcer;
function extractProjectsFromArgs(args) {
    const projects = [];
    const projectFields = [
        'project_id',
        'projectId',
        'project',
        'namespace',
        'namespacePath',
        'fullPath',
    ];
    for (const field of projectFields) {
        const value = args[field];
        if (typeof value === 'string' && value.trim()) {
            projects.push(value.trim());
        }
    }
    return projects;
}
function extractGroupsFromArgs(args) {
    const groups = [];
    const groupFields = ['group_id', 'groupId', 'group'];
    for (const field of groupFields) {
        const value = args[field];
        if (typeof value === 'string' && value.trim()) {
            groups.push(value.trim());
        }
    }
    return groups;
}
function enforceArgsScope(enforcer, args) {
    const projects = extractProjectsFromArgs(args);
    for (const project of projects) {
        enforcer.enforce(project);
    }
    const groups = extractGroupsFromArgs(args);
    for (const group of groups) {
        enforcer.enforceGroup(group);
    }
}
//# sourceMappingURL=scope-enforcer.js.map