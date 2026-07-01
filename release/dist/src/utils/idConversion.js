"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractSimpleId = extractSimpleId;
exports.normalizeWorkItemGid = normalizeWorkItemGid;
exports.toGid = toGid;
exports.toGids = toGids;
exports.extractSimpleIds = extractSimpleIds;
exports.cleanGidsFromObject = cleanGidsFromObject;
exports.cleanWorkItemResponse = cleanWorkItemResponse;
exports.convertTypeNamesToGids = convertTypeNamesToGids;
const GID_PREFIXES = {
    WorkItem: 'gid://gitlab/WorkItem/',
    User: 'gid://gitlab/User/',
    Project: 'gid://gitlab/Project/',
    Group: 'gid://gitlab/Group/',
    Label: 'gid://gitlab/ProjectLabel/',
    Milestone: 'gid://gitlab/Milestone/',
    Iteration: 'gid://gitlab/Iteration/',
    MergeRequest: 'gid://gitlab/MergeRequest/',
    Pipeline: 'gid://gitlab/Ci::Pipeline/',
    Job: 'gid://gitlab/Ci::Build/',
    Variable: 'gid://gitlab/Ci::Variable/',
    Wiki: 'gid://gitlab/Wiki/',
    Note: 'gid://gitlab/Note/',
    Discussion: 'gid://gitlab/Discussion/',
    Timelog: 'gid://gitlab/Timelog/',
};
function extractSimpleId(gid) {
    if (!gid || typeof gid !== 'string') {
        return gid;
    }
    if (gid.startsWith('gid://gitlab/')) {
        const parts = gid.split('/');
        return parts[parts.length - 1];
    }
    return gid;
}
function normalizeWorkItemGid(gid) {
    if (!gid || typeof gid !== 'string') {
        return gid;
    }
    const legacyTypes = ['Issue', 'Epic', 'Task', 'Incident', 'TestCase', 'Requirement'];
    for (const type of legacyTypes) {
        const prefix = `gid://gitlab/${type}/`;
        if (gid.startsWith(prefix)) {
            return gid.replace(prefix, 'gid://gitlab/WorkItem/');
        }
    }
    return gid;
}
function toGid(id, entityType) {
    if (id.startsWith('gid://gitlab/')) {
        if (entityType === 'WorkItem') {
            return normalizeWorkItemGid(id);
        }
        return id;
    }
    return GID_PREFIXES[entityType] + id;
}
function toGids(ids, entityType) {
    return ids.map((id) => toGid(id, entityType));
}
function extractSimpleIds(gids) {
    return gids.map((gid) => extractSimpleId(gid));
}
function cleanGidsFromObject(obj) {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }
    if (Array.isArray(obj)) {
        const cleanedArray = obj.map((item) => cleanGidsFromObject(item));
        return cleanedArray;
    }
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string' && value.startsWith('gid://gitlab/')) {
            cleaned[key] = extractSimpleId(value);
        }
        else if (typeof value === 'object' && value !== null) {
            cleaned[key] = cleanGidsFromObject(value);
        }
        else {
            cleaned[key] = value;
        }
    }
    return cleaned;
}
function normalizeLinkType(linkType) {
    if (!linkType)
        return linkType;
    const mapping = {
        is_blocked_by: 'BLOCKED_BY',
        blocks: 'BLOCKS',
        related: 'RELATED',
        BLOCKED_BY: 'BLOCKED_BY',
        BLOCKS: 'BLOCKS',
        RELATED: 'RELATED',
    };
    return mapping[linkType] ?? linkType;
}
function cleanWorkItemResponse(workItem) {
    if (!workItem)
        return workItem;
    const result = {
        ...workItem,
        id: extractSimpleId(workItem.id),
    };
    if (workItem.workItemType) {
        if (typeof workItem.workItemType === 'string') {
            result.workItemType = workItem.workItemType;
        }
        else if (workItem.workItemType.name) {
            result.workItemType = workItem.workItemType.name;
        }
        else if (workItem.workItemType.id) {
            result.workItemType = {
                ...workItem.workItemType,
                id: extractSimpleId(workItem.workItemType.id),
            };
        }
    }
    if (workItem.widgets) {
        result.widgets = workItem.widgets.map((widget) => {
            const cleanedWidget = { ...widget };
            if (widget.type === 'ASSIGNEES' && widget.assignees?.nodes) {
                cleanedWidget.assignees = {
                    ...widget.assignees,
                    nodes: widget.assignees.nodes.map((assignee) => ({
                        ...assignee,
                        id: extractSimpleId(assignee.id),
                    })),
                };
            }
            if (widget.type === 'LABELS' && widget.labels?.nodes) {
                cleanedWidget.labels = {
                    ...widget.labels,
                    nodes: widget.labels.nodes.map((label) => ({
                        ...label,
                        id: extractSimpleId(label.id),
                    })),
                };
            }
            if (widget.type === 'MILESTONE' && widget.milestone?.id) {
                cleanedWidget.milestone = {
                    ...widget.milestone,
                    id: extractSimpleId(widget.milestone.id),
                };
            }
            if (widget.type === 'HIERARCHY' && widget.parent?.id) {
                cleanedWidget.parent = {
                    ...widget.parent,
                    id: extractSimpleId(widget.parent.id),
                };
            }
            if (widget.type === 'LINKED_ITEMS' && widget.linkedItems?.nodes) {
                cleanedWidget.linkedItems = {
                    ...widget.linkedItems,
                    nodes: widget.linkedItems.nodes.map((node) => ({
                        ...node,
                        linkType: normalizeLinkType(node.linkType),
                        workItem: node.workItem
                            ? { ...node.workItem, id: extractSimpleId(node.workItem.id) }
                            : node.workItem,
                    })),
                };
            }
            return cleanedWidget;
        });
    }
    return result;
}
async function convertTypeNamesToGids(typeNames, namespacePath, getWorkItemTypes) {
    if (!typeNames || typeNames.length === 0) {
        return [];
    }
    const workItemTypes = await getWorkItemTypes(namespacePath);
    const resolvedTypes = [];
    for (const typeName of typeNames) {
        const workItemTypeObj = workItemTypes.find((t) => t.name.toUpperCase() === typeName.toUpperCase());
        if (workItemTypeObj) {
            resolvedTypes.push(workItemTypeObj.id);
        }
        else {
            console.warn(`Work item type "${typeName}" not found in namespace "${namespacePath}". Available types: ${workItemTypes.map((t) => t.name).join(', ')}`);
        }
    }
    if (resolvedTypes.length === 0) {
        console.warn('No valid work item types found for filtering. Using no type filter.');
        return [];
    }
    return resolvedTypes;
}
//# sourceMappingURL=idConversion.js.map