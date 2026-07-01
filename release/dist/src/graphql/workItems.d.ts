import { TypedDocumentNode } from '@graphql-typed-document-node/core';
export interface WorkItem {
    id: string;
    iid: string;
    title: string;
    description?: string;
    state: WorkItemState;
    workItemType: {
        id: string;
        name: string;
    };
    widgets: WorkItemWidget[];
    createdAt: string;
    updatedAt: string;
    closedAt?: string;
    webUrl: string;
}
export interface WorkItemUpdateInput {
    id: string;
    title?: string;
    stateEvent?: string;
    descriptionWidget?: {
        description: string;
    };
    assigneesWidget?: {
        assigneeIds: string[];
    };
    labelsWidget?: {
        addLabelIds?: string[];
        removeLabelIds?: string[];
    };
    milestoneWidget?: {
        milestoneId: string;
    };
    startAndDueDateWidget?: {
        startDate?: string | null;
        dueDate?: string | null;
        isFixed?: boolean;
    };
    hierarchyWidget?: {
        parentId?: string | null;
        childrenIds?: string[];
        adjacentWorkItemId?: string;
        relativePosition?: 'BEFORE' | 'AFTER';
    };
    timeTrackingWidget?: {
        timeEstimate?: string;
        timelog?: {
            timeSpent: string;
            spentAt?: string;
            summary?: string;
        };
    };
    weightWidget?: {
        weight?: number | null;
    };
    iterationWidget?: {
        iterationId?: string | null;
    };
    healthStatusWidget?: {
        healthStatus?: string | null;
    };
    progressWidget?: {
        currentValue: number;
    };
    colorWidget?: {
        color: string;
    };
    verificationStatusWidget?: {
        verificationStatus: 'PASSED' | 'FAILED';
    };
}
export type WorkItemState = 'OPEN' | 'CLOSED';
export type WorkItemTypeEnum = 'EPIC' | 'ISSUE' | 'TASK' | 'INCIDENT' | 'TEST_CASE' | 'REQUIREMENT' | 'OBJECTIVE' | 'KEY_RESULT';
export declare const WorkItemWidgetTypes: {
    readonly ASSIGNEES: "ASSIGNEES";
    readonly DESCRIPTION: "DESCRIPTION";
    readonly HIERARCHY: "HIERARCHY";
    readonly LABELS: "LABELS";
    readonly MILESTONE: "MILESTONE";
    readonly NOTES: "NOTES";
    readonly START_AND_DUE_DATE: "START_AND_DUE_DATE";
    readonly HEALTH_STATUS: "HEALTH_STATUS";
    readonly WEIGHT: "WEIGHT";
    readonly ITERATION: "ITERATION";
    readonly PROGRESS: "PROGRESS";
    readonly STATUS: "STATUS";
    readonly REQUIREMENT_LEGACY: "REQUIREMENT_LEGACY";
    readonly TEST_REPORTS: "TEST_REPORTS";
    readonly NOTIFICATIONS: "NOTIFICATIONS";
    readonly CURRENT_USER_TODOS: "CURRENT_USER_TODOS";
    readonly AWARD_EMOJI: "AWARD_EMOJI";
    readonly LINKED_ITEMS: "LINKED_ITEMS";
    readonly COLOR: "COLOR";
    readonly PARTICIPANTS: "PARTICIPANTS";
    readonly DESIGNS: "DESIGNS";
    readonly DEVELOPMENT: "DEVELOPMENT";
    readonly CRM_CONTACTS: "CRM_CONTACTS";
    readonly TIME_TRACKING: "TIME_TRACKING";
    readonly EMAIL_PARTICIPANTS: "EMAIL_PARTICIPANTS";
    readonly CUSTOM_FIELDS: "CUSTOM_FIELDS";
    readonly ERROR_TRACKING: "ERROR_TRACKING";
    readonly LINKED_RESOURCES: "LINKED_RESOURCES";
    readonly VULNERABILITIES: "VULNERABILITIES";
    readonly VERIFICATION_STATUS: "VERIFICATION_STATUS";
};
export type WorkItemWidgetType = (typeof WorkItemWidgetTypes)[keyof typeof WorkItemWidgetTypes];
export interface WorkItemWidget {
    type: WorkItemWidgetType;
}
export interface WorkItemAssigneesWidget extends WorkItemWidget {
    type: 'ASSIGNEES';
    allowsMultipleAssignees: boolean;
    canInviteMembers: boolean;
    assignees: {
        nodes: User[];
    };
}
export interface WorkItemDescriptionWidget extends WorkItemWidget {
    type: 'DESCRIPTION';
    description: string;
    descriptionHtml: string;
    edited: boolean;
    lastEditedAt?: string;
    lastEditedBy?: User;
}
export interface WorkItemHierarchyWidget extends WorkItemWidget {
    type: 'HIERARCHY';
    parent?: WorkItem;
    children: {
        nodes: WorkItem[];
    };
    hasChildren: boolean;
}
export interface WorkItemLabelsWidget extends WorkItemWidget {
    type: 'LABELS';
    allowsScopedLabels: boolean;
    labels: {
        nodes: Label[];
    };
}
export interface User {
    id: string;
    username: string;
    name: string;
    avatarUrl?: string;
    webUrl: string;
}
export interface Label {
    id: string;
    title: string;
    description?: string;
    color: string;
    textColor: string;
}
export interface Milestone {
    id: string;
    title: string;
    description?: string;
    state: MilestoneStateEnum;
    dueDate?: string;
    startDate?: string;
    webUrl: string;
}
export type MilestoneStateEnum = 'active' | 'closed';
export interface WorkItemMilestoneWidget extends WorkItemWidget {
    type: 'MILESTONE';
    milestone?: Milestone;
}
export interface WorkItemNotesWidget extends WorkItemWidget {
    type: 'NOTES';
    discussions: {
        nodes: Discussion[];
    };
}
export interface WorkItemStartAndDueDateWidget extends WorkItemWidget {
    type: 'START_AND_DUE_DATE';
    startDate?: string;
    dueDate?: string;
    isFixed: boolean;
}
export interface WorkItemHealthStatusWidget extends WorkItemWidget {
    type: 'HEALTH_STATUS';
    healthStatus?: HealthStatusEnum;
}
export interface WorkItemWeightWidget extends WorkItemWidget {
    type: 'WEIGHT';
    weight?: number;
}
export interface WorkItemStatusWidget extends WorkItemWidget {
    type: 'STATUS';
    status?: string;
}
export interface WorkItemTimelog {
    id: string;
    timeSpent: number;
    spentAt?: string;
    summary?: string;
    user?: {
        id: string;
        username: string;
    };
    note?: {
        body: string;
    };
}
export interface WorkItemTimeTrackingWidget extends WorkItemWidget {
    type: 'TIME_TRACKING';
    timeEstimate?: number;
    totalTimeSpent?: number;
    humanTimeEstimate?: string;
    humanTotalTimeSpent?: string;
    timelogs?: {
        nodes: WorkItemTimelog[];
    };
}
export interface WorkItemParticipantsWidget extends WorkItemWidget {
    type: 'PARTICIPANTS';
    participants: {
        nodes: User[];
    };
}
export interface WorkItemProgressWidget extends WorkItemWidget {
    type: 'PROGRESS';
    currentValue?: number;
    endValue?: number;
    progress?: number;
    startValue?: number;
}
export interface WorkItemIterationWidget extends WorkItemWidget {
    type: 'ITERATION';
    iteration?: {
        id: string;
        title: string;
        startDate?: string;
        dueDate?: string;
        webUrl?: string;
        iterationCadence?: {
            id: string;
            title: string;
        };
    };
}
export interface WorkItemRequirementLegacyWidget extends WorkItemWidget {
    type: 'REQUIREMENT_LEGACY';
}
export interface WorkItemTestReportsWidget extends WorkItemWidget {
    type: 'TEST_REPORTS';
    testReports?: {
        nodes: TestReport[];
    };
}
export interface WorkItemVerificationStatusWidget extends WorkItemWidget {
    type: 'VERIFICATION_STATUS';
    verificationStatus?: string;
}
export interface WorkItemNotificationsWidget extends WorkItemWidget {
    type: 'NOTIFICATIONS';
    subscribed: boolean;
    emailsDisabled: boolean;
}
export interface WorkItemCurrentUserTodosWidget extends WorkItemWidget {
    type: 'CURRENT_USER_TODOS';
    currentUserTodos: {
        nodes: Todo[];
    };
}
export interface WorkItemAwardEmojiWidget extends WorkItemWidget {
    type: 'AWARD_EMOJI';
    awardEmoji: {
        nodes: AwardEmoji[];
    };
    upvotes: number;
    downvotes: number;
}
export interface WorkItemLinkedItemNode {
    linkType: string;
    workItem: WorkItem;
}
export interface WorkItemLinkedItemsWidget extends WorkItemWidget {
    type: 'LINKED_ITEMS';
    linkedItems: {
        nodes: WorkItemLinkedItemNode[];
    };
}
export interface WorkItemColorWidget extends WorkItemWidget {
    type: 'COLOR';
    color?: string;
}
export interface WorkItemDesignsWidget extends WorkItemWidget {
    type: 'DESIGNS';
    designs: {
        nodes: Design[];
    };
}
export interface WorkItemDevelopmentWidget extends WorkItemWidget {
    type: 'DEVELOPMENT';
    closingMergeRequests: {
        nodes: MergeRequest[];
    };
    featureFlags: {
        nodes: FeatureFlag[];
    };
}
export interface WorkItemCrmContactsWidget extends WorkItemWidget {
    type: 'CRM_CONTACTS';
    contacts: {
        nodes: Contact[];
    };
}
export interface WorkItemEmailParticipantsWidget extends WorkItemWidget {
    type: 'EMAIL_PARTICIPANTS';
    emailParticipants: {
        nodes: Array<{
            email: string;
        }>;
    };
}
export interface WorkItemCustomFieldsWidget extends WorkItemWidget {
    type: 'CUSTOM_FIELDS';
    customFields: {
        nodes: CustomField[];
    };
}
export interface WorkItemErrorTrackingWidget extends WorkItemWidget {
    type: 'ERROR_TRACKING';
    errorTrackingEnabled: boolean;
    errors: {
        nodes: Error[];
    };
}
export interface WorkItemLinkedResourcesWidget extends WorkItemWidget {
    type: 'LINKED_RESOURCES';
    linkedResources: {
        nodes: LinkedResource[];
    };
}
export interface WorkItemVulnerabilitiesWidget extends WorkItemWidget {
    type: 'VULNERABILITIES';
    relatedVulnerabilities: {
        nodes: Vulnerability[];
        pageInfo: {
            hasNextPage: boolean;
            endCursor?: string;
        };
        count: number;
    };
}
export interface Discussion {
    id: string;
    resolvable: boolean;
    resolved: boolean;
    notes: {
        nodes: Note[];
    };
}
export interface Note {
    id: string;
    body: string;
    author: User;
    createdAt: string;
    updatedAt: string;
    system: boolean;
}
export type HealthStatusEnum = 'onTrack' | 'needsAttention' | 'atRisk';
export interface TestReport {
    id: string;
    state: string;
    createdAt: string;
    author?: {
        id: string;
        username: string;
    };
}
export interface Todo {
    id: string;
    action: string;
    author: User;
    createdAt: string;
    state: string;
}
export interface AwardEmoji {
    name: string;
    emoji: string;
    description: string;
    user: User;
}
export interface Design {
    id: string;
    filename: string;
    fullPath: string;
    image: string;
    imageV432x230: string;
}
export interface MergeRequest {
    id: string;
    iid: string;
    title: string;
    state: string;
    webUrl: string;
}
export interface FeatureFlag {
    id: string;
    name: string;
    description?: string;
    active: boolean;
}
export interface Contact {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    organization?: string;
}
export interface CustomField {
    id: string;
    name: string;
    value: string;
    type: string;
}
export interface Error {
    id: string;
    title: string;
    message: string;
    count: number;
    firstSeen: string;
    lastSeen: string;
}
export interface LinkedResource {
    id: string;
    url: string;
    type: string;
    title?: string;
}
export interface Vulnerability {
    id: string;
    state: string;
    severity: string;
    name: string;
    webUrl: string;
}
export declare const GET_GROUP_PROJECTS: TypedDocumentNode<{
    group: {
        projects: {
            nodes: Array<{
                id: string;
                fullPath: string;
                archived: boolean;
            }>;
        };
    };
}, {
    groupPath: string;
    includeSubgroups?: boolean;
}>;
export declare const GET_NAMESPACE_TYPE: TypedDocumentNode<{
    namespace: {
        __typename: string;
        fullPath: string;
    };
}, {
    namespacePath: string;
}>;
export declare const GET_NAMESPACE_WORK_ITEMS: TypedDocumentNode<{
    namespace: {
        __typename: string;
        fullPath: string;
        workItems?: {
            nodes: WorkItem[];
            pageInfo: {
                hasNextPage: boolean;
                endCursor?: string;
            };
        } | null;
    } | null;
}, {
    namespacePath: string;
    types?: string[];
    first?: number;
    after?: string;
}>;
export declare const GET_WORK_ITEMS: TypedDocumentNode<{
    group: {
        workItems: {
            nodes: WorkItem[];
        };
    };
}, {
    groupPath: string;
    types?: string[];
    first?: number;
    after?: string;
}>;
export declare const GET_PROJECT_WORK_ITEMS: TypedDocumentNode<{
    project: {
        workItems: {
            nodes: WorkItem[];
            pageInfo: {
                hasNextPage: boolean;
                endCursor?: string;
            };
        };
    };
}, {
    projectPath: string;
    types?: string[];
    first?: number;
    after?: string;
}>;
export declare const GET_WORK_ITEM_BY_IID: TypedDocumentNode<{
    namespace: {
        workItem: WorkItem | null;
    } | null;
}, {
    namespacePath: string;
    iid: string;
}>;
export declare const GET_WORK_ITEM: TypedDocumentNode<{
    workItem: WorkItem;
}, {
    id: string;
}>;
export declare const CREATE_WORK_ITEM: TypedDocumentNode<{
    workItemCreate: {
        workItem: WorkItem;
        errors: string[];
    };
}, {
    namespacePath: string;
    title: string;
    workItemTypeId: string;
}>;
export declare const CREATE_WORK_ITEM_WITH_DESCRIPTION: TypedDocumentNode<{
    workItemCreate: {
        workItem: WorkItem;
        errors: string[];
    };
}, {
    namespacePath: string;
    title: string;
    workItemTypeId: string;
    description: string;
}>;
export declare const UPDATE_WORK_ITEM: TypedDocumentNode<{
    workItemUpdate: {
        workItem: WorkItem;
        errors: string[];
    };
}, {
    input: WorkItemUpdateInput;
}>;
export declare const DELETE_WORK_ITEM: TypedDocumentNode<{
    workItemDelete: {
        errors: string[];
    };
}, {
    id: string;
}>;
export declare const TIMELOG_DELETE: TypedDocumentNode<{
    timelogDelete: {
        timelog: {
            id: string;
            timeSpent: number;
            spentAt: string;
            summary: string | null;
        } | null;
        errors: string[];
    };
}, {
    id: string;
}>;
export declare const GET_WORK_ITEM_TYPES: TypedDocumentNode<{
    namespace: {
        workItemTypes: {
            nodes: {
                id: string;
                name: string;
            }[];
        };
    };
}, {
    namespacePath: string;
}>;
export interface WorkItemCreateInput {
    namespacePath: string;
    title: string;
    workItemTypeId: string;
    description?: string;
    assigneesWidget?: {
        assigneeIds: string[];
    };
    labelsWidget?: {
        labelIds: string[];
    };
    milestoneWidget?: {
        milestoneId: string;
    };
    startAndDueDateWidget?: {
        startDate?: string | null;
        dueDate?: string | null;
        isFixed?: boolean;
    };
    hierarchyWidget?: {
        parentId?: string | null;
        childrenIds?: string[];
    };
    weightWidget?: {
        weight?: number | null;
    };
    iterationWidget?: {
        iterationId?: string | null;
    };
    healthStatusWidget?: {
        healthStatus?: string | null;
    };
    progressWidget?: {
        currentValue: number;
    };
    colorWidget?: {
        color: string;
    };
}
export declare const CREATE_WORK_ITEM_WITH_WIDGETS: TypedDocumentNode<{
    workItemCreate: {
        workItem: WorkItem;
        errors: string[];
    };
}, {
    input: WorkItemCreateInput;
}>;
export type WorkItemLinkType = 'RELATED' | 'BLOCKS' | 'BLOCKED_BY';
export interface WorkItemAddLinkedItemsInput {
    id: string;
    workItemsIds: string[];
    linkType: WorkItemLinkType;
}
export interface WorkItemRemoveLinkedItemsInput {
    id: string;
    workItemsIds: string[];
}
export declare const WORK_ITEM_ADD_LINKED_ITEMS: TypedDocumentNode<{
    workItemAddLinkedItems: {
        workItem: WorkItem;
        errors: string[];
        message?: string;
    };
}, {
    input: WorkItemAddLinkedItemsInput;
}>;
export declare const WORK_ITEM_REMOVE_LINKED_ITEMS: TypedDocumentNode<{
    workItemRemoveLinkedItems: {
        workItem: WorkItem;
        errors: string[];
        message?: string;
    };
}, {
    input: WorkItemRemoveLinkedItemsInput;
}>;
