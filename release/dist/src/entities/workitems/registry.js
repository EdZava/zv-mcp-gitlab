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
exports.workitemsToolRegistry = void 0;
exports.getWorkitemsReadOnlyToolNames = getWorkitemsReadOnlyToolNames;
exports.getWorkitemsToolDefinitions = getWorkitemsToolDefinitions;
exports.getFilteredWorkitemsTools = getFilteredWorkitemsTools;
const z = __importStar(require("zod"));
const schema_readonly_1 = require("./schema-readonly");
const schema_1 = require("./schema");
const ConnectionManager_1 = require("../../services/ConnectionManager");
const utils_1 = require("../utils");
const workItemTypes_1 = require("../../utils/workItemTypes");
const idConversion_1 = require("../../utils/idConversion");
const WidgetAvailability_1 = require("../../services/WidgetAvailability");
const token_context_1 = require("../../oauth/token-context");
const error_handler_1 = require("../../utils/error-handler");
const workItems_1 = require("../../graphql/workItems");
const simplifyWorkItem = (workItem, simple) => {
    if (!simple)
        return workItem;
    const simplified = {
        id: workItem.id,
        iid: workItem.iid,
        title: workItem.title,
        state: workItem.state,
        workItemType: typeof workItem.workItemType === 'string'
            ? workItem.workItemType
            : workItem.workItemType?.name || 'Unknown',
        webUrl: workItem.webUrl,
        createdAt: workItem.createdAt,
        updatedAt: workItem.updatedAt,
    };
    if (workItem.description && typeof workItem.description === 'string') {
        simplified.description =
            workItem.description.length > 200
                ? workItem.description.substring(0, 200) + '...'
                : workItem.description;
    }
    if (workItem.widgets && Array.isArray(workItem.widgets)) {
        const essentialWidgets = [];
        for (const widget of workItem.widgets) {
            const flexWidget = widget;
            switch (flexWidget.type) {
                case 'ASSIGNEES':
                    if (flexWidget.assignees?.nodes && flexWidget.assignees.nodes.length > 0) {
                        essentialWidgets.push({
                            type: 'ASSIGNEES',
                            assignees: flexWidget.assignees.nodes.map((assignee) => ({
                                id: assignee.id,
                                username: assignee.username,
                                name: assignee.name,
                            })),
                        });
                    }
                    break;
                case 'LABELS':
                    if (flexWidget.labels?.nodes && flexWidget.labels.nodes.length > 0) {
                        essentialWidgets.push({
                            type: 'LABELS',
                            labels: flexWidget.labels.nodes.map((label) => ({
                                id: label.id,
                                title: label.title,
                                color: label.color,
                            })),
                        });
                    }
                    break;
                case 'MILESTONE':
                    if (flexWidget.milestone) {
                        essentialWidgets.push({
                            type: 'MILESTONE',
                            milestone: {
                                id: flexWidget.milestone.id,
                                title: flexWidget.milestone.title,
                                state: flexWidget.milestone.state,
                            },
                        });
                    }
                    break;
                case 'HIERARCHY':
                    if (flexWidget.parent || flexWidget.hasChildren) {
                        essentialWidgets.push({
                            type: 'HIERARCHY',
                            parent: flexWidget.parent
                                ? {
                                    id: flexWidget.parent.id,
                                    iid: flexWidget.parent.iid,
                                    title: flexWidget.parent.title,
                                    workItemType: flexWidget.parent.workItemType,
                                }
                                : null,
                            hasChildren: flexWidget.hasChildren,
                        });
                    }
                    break;
                case 'TIME_TRACKING':
                    if (flexWidget.timeEstimate !== undefined || flexWidget.totalTimeSpent !== undefined) {
                        essentialWidgets.push({
                            type: 'TIME_TRACKING',
                            timeEstimate: flexWidget.timeEstimate,
                            totalTimeSpent: flexWidget.totalTimeSpent,
                        });
                    }
                    break;
                case 'VERIFICATION_STATUS':
                    if (flexWidget.verificationStatus) {
                        essentialWidgets.push({
                            type: 'VERIFICATION_STATUS',
                            verificationStatus: flexWidget.verificationStatus,
                        });
                    }
                    break;
                case 'TEST_REPORTS':
                    if (flexWidget.testReports?.nodes && flexWidget.testReports.nodes.length > 0) {
                        essentialWidgets.push({
                            type: 'TEST_REPORTS',
                            testReports: flexWidget.testReports.nodes.map((report) => ({
                                id: report.id,
                                state: report.state,
                                createdAt: report.createdAt,
                                author: report.author?.username,
                            })),
                        });
                    }
                    break;
            }
        }
        if (essentialWidgets && essentialWidgets.length > 0) {
            simplified.widgets = essentialWidgets;
        }
    }
    return simplified;
};
exports.workitemsToolRegistry = new Map([
    [
        'browse_work_items',
        {
            name: 'browse_work_items',
            description: 'Find and inspect issues, epics, tasks, and other work items. Actions: list (groups return epics, projects return issues/tasks, filter by type/state/labels), get (by numeric ID or namespace+iid from URL path). Related: manage_work_item to create/update/delete.',
            inputSchema: z.toJSONSchema(schema_readonly_1.BrowseWorkItemsSchema),
            requirements: { default: { tier: 'free', minVersion: '15.0' } },
            gate: { envVar: 'USE_WORKITEMS', defaultValue: true },
            handler: async (args) => {
                const input = schema_readonly_1.BrowseWorkItemsSchema.parse(args);
                (0, utils_1.assertActionAllowed)('browse_work_items', input.action);
                switch (input.action) {
                    case 'list': {
                        const { namespace, types, state, first, after, simple } = input;
                        const namespacePath = namespace;
                        const connectionManager = ConnectionManager_1.ConnectionManager.getInstance();
                        const client = connectionManager.getClient((0, token_context_1.getGitLabApiUrlFromContext)());
                        const resolvedTypes = types;
                        const workItemsResponse = await client.request(workItems_1.GET_NAMESPACE_WORK_ITEMS, {
                            namespacePath,
                            types: resolvedTypes,
                            first: first || 20,
                            after: after,
                        });
                        const workItemsData = workItemsResponse.namespace?.workItems;
                        const allItems = workItemsData?.nodes ?? [];
                        const pageInfo = {
                            hasNextPage: workItemsData?.pageInfo?.hasNextPage ?? false,
                            endCursor: workItemsData?.pageInfo?.endCursor ?? null,
                        };
                        const filteredItems = allItems.filter((item) => {
                            return state.includes(item.state);
                        });
                        const finalResults = filteredItems.map((item) => {
                            const cleanedItem = (0, idConversion_1.cleanWorkItemResponse)(item);
                            return simplifyWorkItem(cleanedItem, simple);
                        });
                        return {
                            items: finalResults,
                            hasMore: pageInfo.hasNextPage ?? false,
                            endCursor: pageInfo.endCursor ?? null,
                        };
                    }
                    case 'get': {
                        const { namespace, iid, id } = input;
                        const connectionManager = ConnectionManager_1.ConnectionManager.getInstance();
                        const client = connectionManager.getClient((0, token_context_1.getGitLabApiUrlFromContext)());
                        if (namespace !== undefined && iid !== undefined) {
                            const response = await client.request(workItems_1.GET_WORK_ITEM_BY_IID, {
                                namespacePath: namespace,
                                iid: iid,
                            });
                            if (!response.namespace?.workItem) {
                                throw new Error(`Work item with IID "${iid}" not found in namespace "${namespace}"`);
                            }
                            return (0, idConversion_1.cleanWorkItemResponse)(response.namespace.workItem);
                        }
                        else if (id !== undefined) {
                            const workItemGid = (0, idConversion_1.toGid)(id, 'WorkItem');
                            const response = await client.request(workItems_1.GET_WORK_ITEM, { id: workItemGid });
                            if (!response.workItem) {
                                throw new Error(`Work item with ID "${id}" not found`);
                            }
                            return (0, idConversion_1.cleanWorkItemResponse)(response.workItem);
                        }
                        else {
                            throw new Error("Either 'id' (global ID) or both 'namespace' and 'iid' (from URL) must be provided");
                        }
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
    [
        'manage_work_item',
        {
            name: 'manage_work_item',
            description: 'Create, update, delete, or link work items (issues, epics, tasks). Actions: create (epics need GROUP namespace, issues/tasks need PROJECT), update (widgets: dates, time tracking, weight, iterations, health, progress, hierarchy), delete (permanent), delete_timelog (remove a time tracking entry by its global ID), add_link/remove_link (BLOCKS/BLOCKED_BY/RELATED). Related: browse_work_items for discovery.',
            inputSchema: z.toJSONSchema(schema_1.ManageWorkItemSchema),
            requirements: {
                default: { tier: 'free', minVersion: '15.0' },
                parameters: {
                    weight: { tier: 'premium', minVersion: '15.0', notes: 'Work item weight widget' },
                    iterationId: { tier: 'premium', minVersion: '15.0', notes: 'Iteration widget' },
                    healthStatus: { tier: 'ultimate', minVersion: '15.0', notes: 'Health status widget' },
                },
            },
            gate: { envVar: 'USE_WORKITEMS', defaultValue: true },
            handler: async (args) => {
                const input = schema_1.ManageWorkItemSchema.parse(args);
                (0, utils_1.assertActionAllowed)('manage_work_item', input.action);
                switch (input.action) {
                    case 'create': {
                        const { namespace, title, workItemType, description, assigneeIds, labelIds, milestoneId, startDate, dueDate, parentId, childrenIds, timeEstimate, isFixed, weight, iterationId, progressCurrentValue, healthStatus, color, } = input;
                        const namespacePath = namespace;
                        const workItemTitle = title;
                        const workItemTypeName = workItemType;
                        const widgetParams = {
                            description,
                            milestoneId,
                            startDate,
                            dueDate,
                            parentId,
                            childrenIds,
                            timeEstimate,
                            isFixed,
                            weight,
                            iterationId,
                            progressCurrentValue,
                            healthStatus,
                            color,
                        };
                        if (assigneeIds && assigneeIds.length > 0) {
                            widgetParams.assigneeIds = assigneeIds;
                        }
                        if (labelIds && labelIds.length > 0) {
                            widgetParams.labelIds = labelIds;
                        }
                        const validationFailure = WidgetAvailability_1.WidgetAvailability.validateWidgetParams(widgetParams, (0, token_context_1.getGitLabApiUrlFromContext)());
                        if (validationFailure) {
                            throw new error_handler_1.StructuredToolError((0, error_handler_1.createVersionRestrictedError)('manage_work_item', 'create', validationFailure.widget, validationFailure.parameter, validationFailure.requiredVersion, validationFailure.detectedVersion, (0, error_handler_1.normalizeTier)(validationFailure.requiredTier), (0, error_handler_1.normalizeTier)(validationFailure.currentTier)));
                        }
                        const connectionManager = ConnectionManager_1.ConnectionManager.getInstance();
                        const client = connectionManager.getClient((0, token_context_1.getGitLabApiUrlFromContext)());
                        const workItemTypes = await (0, workItemTypes_1.getWorkItemTypes)(namespacePath);
                        const workItemTypeObj = workItemTypes.find((t) => t.name.toUpperCase().replace(/\s+/g, '_') ===
                            workItemTypeName.toUpperCase().replace(/\s+/g, '_'));
                        if (!workItemTypeObj) {
                            throw new Error(`Work item type "${workItemTypeName}" not found in namespace "${namespacePath}". Available types: ${workItemTypes.map((t) => t.name).join(', ')}`);
                        }
                        const createInput = {
                            namespacePath,
                            title: workItemTitle,
                            workItemTypeId: workItemTypeObj.id,
                        };
                        if (description !== undefined) {
                            createInput.description = description;
                        }
                        if (assigneeIds !== undefined && assigneeIds.length > 0) {
                            createInput.assigneesWidget = { assigneeIds: (0, idConversion_1.toGids)(assigneeIds, 'User') };
                        }
                        if (labelIds !== undefined && labelIds.length > 0) {
                            createInput.labelsWidget = { labelIds: (0, idConversion_1.toGids)(labelIds, 'Label') };
                        }
                        if (milestoneId !== undefined) {
                            createInput.milestoneWidget = { milestoneId: (0, idConversion_1.toGid)(milestoneId, 'Milestone') };
                        }
                        if (startDate !== undefined || dueDate !== undefined || isFixed !== undefined) {
                            createInput.startAndDueDateWidget = {};
                            if (startDate !== undefined)
                                createInput.startAndDueDateWidget.startDate = startDate;
                            if (dueDate !== undefined)
                                createInput.startAndDueDateWidget.dueDate = dueDate;
                            if (isFixed !== undefined)
                                createInput.startAndDueDateWidget.isFixed = isFixed;
                        }
                        if (parentId !== undefined || (childrenIds !== undefined && childrenIds.length > 0)) {
                            createInput.hierarchyWidget = {};
                            if (parentId !== undefined) {
                                createInput.hierarchyWidget.parentId = (0, idConversion_1.toGid)(parentId, 'WorkItem');
                            }
                            if (childrenIds !== undefined && childrenIds.length > 0) {
                                createInput.hierarchyWidget.childrenIds = (0, idConversion_1.toGids)(childrenIds, 'WorkItem');
                            }
                        }
                        if (weight !== undefined) {
                            createInput.weightWidget = { weight };
                        }
                        if (iterationId !== undefined) {
                            createInput.iterationWidget = {
                                iterationId: (0, idConversion_1.toGid)(iterationId, 'Iteration'),
                            };
                        }
                        if (healthStatus !== undefined) {
                            createInput.healthStatusWidget = { healthStatus };
                        }
                        if (progressCurrentValue !== undefined) {
                            createInput.progressWidget = { currentValue: progressCurrentValue };
                        }
                        if (color !== undefined) {
                            createInput.colorWidget = { color };
                        }
                        const response = await client.request(workItems_1.CREATE_WORK_ITEM_WITH_WIDGETS, {
                            input: createInput,
                        });
                        if (response.workItemCreate?.errors?.length &&
                            response.workItemCreate.errors.length > 0) {
                            throw new Error(`GitLab GraphQL errors: ${response.workItemCreate.errors.join(', ')}`);
                        }
                        if (!response.workItemCreate?.workItem) {
                            throw new Error('Work item creation failed - no work item returned');
                        }
                        const createdWorkItem = response.workItemCreate.workItem;
                        if (timeEstimate !== undefined) {
                            try {
                                const updateInput = {
                                    id: createdWorkItem.id,
                                    timeTrackingWidget: { timeEstimate },
                                };
                                const updateResponse = await client.request(workItems_1.UPDATE_WORK_ITEM, {
                                    input: updateInput,
                                });
                                if (updateResponse.workItemUpdate?.errors?.length &&
                                    updateResponse.workItemUpdate.errors.length > 0) {
                                    const cleanedResult = (0, idConversion_1.cleanWorkItemResponse)(createdWorkItem);
                                    return {
                                        ...cleanedResult,
                                        _warning: {
                                            message: 'Work item created successfully, but some properties could not be applied',
                                            failedProperties: {
                                                timeEstimate: {
                                                    requestedValue: timeEstimate,
                                                    error: updateResponse.workItemUpdate.errors.join(', '),
                                                },
                                            },
                                        },
                                    };
                                }
                                if (updateResponse.workItemUpdate?.workItem) {
                                    return (0, idConversion_1.cleanWorkItemResponse)(updateResponse.workItemUpdate.workItem);
                                }
                                const cleanedResult = (0, idConversion_1.cleanWorkItemResponse)(createdWorkItem);
                                return {
                                    ...cleanedResult,
                                    _warning: {
                                        message: 'Work item created successfully, but some properties could not be applied',
                                        failedProperties: {
                                            timeEstimate: {
                                                requestedValue: timeEstimate,
                                                error: 'Time estimate update returned no work item',
                                            },
                                        },
                                    },
                                };
                            }
                            catch (updateError) {
                                const cleanedResult = (0, idConversion_1.cleanWorkItemResponse)(createdWorkItem);
                                return {
                                    ...cleanedResult,
                                    _warning: {
                                        message: 'Work item created successfully, but some properties could not be applied',
                                        failedProperties: {
                                            timeEstimate: {
                                                requestedValue: timeEstimate,
                                                error: updateError instanceof Error
                                                    ? updateError.message
                                                    : 'Unknown error applying time estimate',
                                            },
                                        },
                                    },
                                };
                            }
                        }
                        return (0, idConversion_1.cleanWorkItemResponse)(createdWorkItem);
                    }
                    case 'update': {
                        const { id, title, description, state, assigneeIds, labelIds, addLabelIds, removeLabelIds, milestoneId, startDate, dueDate, parentId, childrenIds, timeEstimate, timeSpent, timeSpentAt, timeSpentSummary, isFixed, weight, iterationId, progressCurrentValue, healthStatus, color, verificationStatus, linkType, targetId, } = input;
                        const workItemId = id;
                        if ((linkType !== undefined) !== (targetId !== undefined)) {
                            throw new Error('Both linkType and targetId must be provided together to create a linked item relationship');
                        }
                        if (labelIds !== undefined &&
                            (addLabelIds !== undefined || removeLabelIds !== undefined)) {
                            throw new Error('labelIds (replace all) cannot be used together with addLabelIds or removeLabelIds. ' +
                                'Use labelIds to set exact labels, or use addLabelIds/removeLabelIds for incremental changes.');
                        }
                        const widgetParams = {
                            description,
                            assigneeIds,
                            labelIds,
                            addLabelIds,
                            removeLabelIds,
                            milestoneId,
                            startDate,
                            dueDate,
                            parentId,
                            childrenIds,
                            timeEstimate,
                            timeSpent,
                            isFixed,
                            weight,
                            iterationId,
                            progressCurrentValue,
                            healthStatus,
                            color,
                            verificationStatus,
                            linkType,
                            targetId,
                        };
                        const validationFailure = WidgetAvailability_1.WidgetAvailability.validateWidgetParams(widgetParams, (0, token_context_1.getGitLabApiUrlFromContext)());
                        if (validationFailure) {
                            throw new error_handler_1.StructuredToolError((0, error_handler_1.createVersionRestrictedError)('manage_work_item', 'update', validationFailure.widget, validationFailure.parameter, validationFailure.requiredVersion, validationFailure.detectedVersion, (0, error_handler_1.normalizeTier)(validationFailure.requiredTier), (0, error_handler_1.normalizeTier)(validationFailure.currentTier)));
                        }
                        const connectionManager = ConnectionManager_1.ConnectionManager.getInstance();
                        const client = connectionManager.getClient((0, token_context_1.getGitLabApiUrlFromContext)());
                        const workItemGid = (0, idConversion_1.toGid)(workItemId, 'WorkItem');
                        const updateInput = { id: workItemGid };
                        if (title !== undefined)
                            updateInput.title = title;
                        if (state !== undefined)
                            updateInput.stateEvent = state;
                        if (description !== undefined) {
                            updateInput.descriptionWidget = { description };
                        }
                        if (assigneeIds !== undefined) {
                            updateInput.assigneesWidget = { assigneeIds: (0, idConversion_1.toGids)(assigneeIds, 'User') };
                        }
                        if (labelIds !== undefined) {
                            const currentWorkItem = await client.request(workItems_1.GET_WORK_ITEM, { id: workItemGid });
                            const currentLabels = (currentWorkItem.workItem?.widgets || [])
                                .find((w) => w.type === 'LABELS')
                                ?.labels?.nodes?.map((l) => l.id) ?? [];
                            const newLabelGids = (0, idConversion_1.toGids)(labelIds, 'Label');
                            const labelsToRemove = currentLabels.filter((id) => !newLabelGids.includes(id));
                            const labelsToAdd = newLabelGids.filter((id) => !currentLabels.includes(id));
                            if (labelsToRemove.length > 0 || labelsToAdd.length > 0) {
                                updateInput.labelsWidget = {};
                                if (labelsToRemove.length > 0) {
                                    updateInput.labelsWidget.removeLabelIds = labelsToRemove;
                                }
                                if (labelsToAdd.length > 0) {
                                    updateInput.labelsWidget.addLabelIds = labelsToAdd;
                                }
                            }
                        }
                        else if (addLabelIds !== undefined || removeLabelIds !== undefined) {
                            updateInput.labelsWidget = {};
                            if (addLabelIds !== undefined && addLabelIds.length > 0) {
                                updateInput.labelsWidget.addLabelIds = (0, idConversion_1.toGids)(addLabelIds, 'Label');
                            }
                            if (removeLabelIds !== undefined && removeLabelIds.length > 0) {
                                updateInput.labelsWidget.removeLabelIds = (0, idConversion_1.toGids)(removeLabelIds, 'Label');
                            }
                        }
                        if (updateInput.labelsWidget?.addLabelIds && updateInput.labelsWidget?.removeLabelIds) {
                            const addSet = new Set(updateInput.labelsWidget.addLabelIds);
                            const removeSet = new Set(updateInput.labelsWidget.removeLabelIds);
                            const intersection = [...addSet].filter((id) => removeSet.has(id));
                            if (intersection.length > 0) {
                                throw new Error(`Invalid label operation: cannot add and remove the same labels simultaneously: ${intersection.join(', ')}`);
                            }
                        }
                        if (milestoneId !== undefined) {
                            updateInput.milestoneWidget = { milestoneId: (0, idConversion_1.toGid)(milestoneId, 'Milestone') };
                        }
                        if (startDate !== undefined || dueDate !== undefined || isFixed !== undefined) {
                            updateInput.startAndDueDateWidget = {};
                            if (startDate !== undefined)
                                updateInput.startAndDueDateWidget.startDate = startDate;
                            if (dueDate !== undefined)
                                updateInput.startAndDueDateWidget.dueDate = dueDate;
                            if (isFixed !== undefined)
                                updateInput.startAndDueDateWidget.isFixed = isFixed;
                        }
                        if (parentId !== undefined || (childrenIds !== undefined && childrenIds.length > 0)) {
                            updateInput.hierarchyWidget = {};
                            if (parentId !== undefined) {
                                updateInput.hierarchyWidget.parentId =
                                    parentId === null ? null : (0, idConversion_1.toGid)(parentId, 'WorkItem');
                            }
                            if (childrenIds !== undefined && childrenIds.length > 0) {
                                updateInput.hierarchyWidget.childrenIds = (0, idConversion_1.toGids)(childrenIds, 'WorkItem');
                            }
                        }
                        if ((timeSpentAt !== undefined || timeSpentSummary !== undefined) &&
                            timeSpent === undefined) {
                            throw new Error('timeSpentAt and timeSpentSummary require timeSpent to be specified (they are timelog entry properties)');
                        }
                        if (timeEstimate !== undefined || timeSpent !== undefined) {
                            updateInput.timeTrackingWidget = {};
                            if (timeEstimate !== undefined) {
                                updateInput.timeTrackingWidget.timeEstimate = timeEstimate;
                            }
                            if (timeSpent !== undefined) {
                                updateInput.timeTrackingWidget.timelog = {
                                    timeSpent,
                                    ...(timeSpentAt !== undefined && { spentAt: timeSpentAt }),
                                    ...(timeSpentSummary !== undefined && { summary: timeSpentSummary }),
                                };
                            }
                        }
                        if (weight !== undefined) {
                            updateInput.weightWidget = { weight };
                        }
                        if (iterationId !== undefined) {
                            updateInput.iterationWidget = {
                                iterationId: iterationId === null ? null : (0, idConversion_1.toGid)(iterationId, 'Iteration'),
                            };
                        }
                        if (healthStatus !== undefined) {
                            updateInput.healthStatusWidget = { healthStatus };
                        }
                        if (progressCurrentValue !== undefined) {
                            updateInput.progressWidget = { currentValue: progressCurrentValue };
                        }
                        if (color !== undefined) {
                            updateInput.colorWidget = { color };
                        }
                        if (verificationStatus !== undefined) {
                            updateInput.verificationStatusWidget = { verificationStatus };
                        }
                        const response = await client.request(workItems_1.UPDATE_WORK_ITEM, { input: updateInput });
                        if (response.workItemUpdate?.errors?.length &&
                            response.workItemUpdate.errors.length > 0) {
                            throw new Error(`GitLab GraphQL errors: ${response.workItemUpdate.errors.join(', ')}`);
                        }
                        if (!response.workItemUpdate?.workItem) {
                            throw new Error('Work item update failed - no work item returned');
                        }
                        const updatedWorkItem = response.workItemUpdate.workItem;
                        if (linkType !== undefined && targetId !== undefined) {
                            try {
                                const linkResponse = await client.request(workItems_1.WORK_ITEM_ADD_LINKED_ITEMS, {
                                    input: {
                                        id: workItemGid,
                                        workItemsIds: [(0, idConversion_1.toGid)(targetId, 'WorkItem')],
                                        linkType,
                                    },
                                });
                                if (linkResponse.workItemAddLinkedItems?.errors?.length &&
                                    linkResponse.workItemAddLinkedItems.errors.length > 0) {
                                    const cleanedResult = (0, idConversion_1.cleanWorkItemResponse)(updatedWorkItem);
                                    return {
                                        ...cleanedResult,
                                        _warning: {
                                            message: 'Work item updated successfully, but linked item could not be added',
                                            failedProperties: {
                                                linkedItem: {
                                                    targetId,
                                                    linkType,
                                                    error: linkResponse.workItemAddLinkedItems.errors.join(', '),
                                                },
                                            },
                                        },
                                    };
                                }
                                if (linkResponse.workItemAddLinkedItems?.workItem) {
                                    return (0, idConversion_1.cleanWorkItemResponse)(linkResponse.workItemAddLinkedItems.workItem);
                                }
                                const cleanedResult = (0, idConversion_1.cleanWorkItemResponse)(updatedWorkItem);
                                return {
                                    ...cleanedResult,
                                    _warning: {
                                        message: 'Work item updated successfully, but linked item could not be added',
                                        failedProperties: {
                                            linkedItem: {
                                                targetId,
                                                linkType,
                                                error: 'Add linked item returned no work item',
                                            },
                                        },
                                    },
                                };
                            }
                            catch (linkError) {
                                const cleanedResult = (0, idConversion_1.cleanWorkItemResponse)(updatedWorkItem);
                                return {
                                    ...cleanedResult,
                                    _warning: {
                                        message: 'Work item updated successfully, but linked item could not be added',
                                        failedProperties: {
                                            linkedItem: {
                                                targetId,
                                                linkType,
                                                error: linkError instanceof Error
                                                    ? linkError.message
                                                    : 'Unknown error adding linked item',
                                            },
                                        },
                                    },
                                };
                            }
                        }
                        return (0, idConversion_1.cleanWorkItemResponse)(updatedWorkItem);
                    }
                    case 'delete': {
                        const workItemId = input.id;
                        const connectionManager = ConnectionManager_1.ConnectionManager.getInstance();
                        const client = connectionManager.getClient((0, token_context_1.getGitLabApiUrlFromContext)());
                        const workItemGid = (0, idConversion_1.toGid)(workItemId, 'WorkItem');
                        const response = await client.request(workItems_1.DELETE_WORK_ITEM, { id: workItemGid });
                        if (response.workItemDelete?.errors?.length &&
                            response.workItemDelete.errors.length > 0) {
                            throw new Error(`GitLab GraphQL errors: ${response.workItemDelete.errors.join(', ')}`);
                        }
                        return { deleted: true };
                    }
                    case 'delete_timelog': {
                        const { timelogId } = input;
                        const connectionManager = ConnectionManager_1.ConnectionManager.getInstance();
                        const client = connectionManager.getClient((0, token_context_1.getGitLabApiUrlFromContext)());
                        const timelogGid = (0, idConversion_1.toGid)(timelogId, 'Timelog');
                        const response = await client.request(workItems_1.TIMELOG_DELETE, { id: timelogGid });
                        if (response.timelogDelete?.errors?.length &&
                            response.timelogDelete.errors.length > 0) {
                            throw new Error(`GitLab GraphQL errors: ${response.timelogDelete.errors.join(', ')}`);
                        }
                        return {
                            deleted: true,
                            timelog: response.timelogDelete?.timelog ?? null,
                        };
                    }
                    case 'add_link': {
                        const { id, targetId, linkType } = input;
                        const connectionManager = ConnectionManager_1.ConnectionManager.getInstance();
                        const client = connectionManager.getClient((0, token_context_1.getGitLabApiUrlFromContext)());
                        const response = await client.request(workItems_1.WORK_ITEM_ADD_LINKED_ITEMS, {
                            input: {
                                id: (0, idConversion_1.toGid)(id, 'WorkItem'),
                                workItemsIds: [(0, idConversion_1.toGid)(targetId, 'WorkItem')],
                                linkType,
                            },
                        });
                        if (response.workItemAddLinkedItems?.errors?.length &&
                            response.workItemAddLinkedItems.errors.length > 0) {
                            throw new Error(`GitLab GraphQL errors: ${response.workItemAddLinkedItems.errors.join(', ')}`);
                        }
                        if (!response.workItemAddLinkedItems?.workItem) {
                            throw new Error('Add linked item failed - no work item returned');
                        }
                        return (0, idConversion_1.cleanWorkItemResponse)(response.workItemAddLinkedItems.workItem);
                    }
                    case 'remove_link': {
                        const { id, targetId } = input;
                        const connectionManager = ConnectionManager_1.ConnectionManager.getInstance();
                        const client = connectionManager.getClient((0, token_context_1.getGitLabApiUrlFromContext)());
                        const response = await client.request(workItems_1.WORK_ITEM_REMOVE_LINKED_ITEMS, {
                            input: {
                                id: (0, idConversion_1.toGid)(id, 'WorkItem'),
                                workItemsIds: [(0, idConversion_1.toGid)(targetId, 'WorkItem')],
                            },
                        });
                        if (response.workItemRemoveLinkedItems?.errors?.length &&
                            response.workItemRemoveLinkedItems.errors.length > 0) {
                            throw new Error(`GitLab GraphQL errors: ${response.workItemRemoveLinkedItems.errors.join(', ')}`);
                        }
                        if (!response.workItemRemoveLinkedItems?.workItem) {
                            throw new Error('Remove linked item failed - no work item returned');
                        }
                        return (0, idConversion_1.cleanWorkItemResponse)(response.workItemRemoveLinkedItems.workItem);
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
]);
function getWorkitemsReadOnlyToolNames() {
    return ['browse_work_items'];
}
function getWorkitemsToolDefinitions() {
    return Array.from(exports.workitemsToolRegistry.values());
}
function getFilteredWorkitemsTools(readOnlyMode = false) {
    if (readOnlyMode) {
        const readOnlyNames = getWorkitemsReadOnlyToolNames();
        return Array.from(exports.workitemsToolRegistry.values()).filter((tool) => readOnlyNames.includes(tool.name));
    }
    return getWorkitemsToolDefinitions();
}
//# sourceMappingURL=registry.js.map