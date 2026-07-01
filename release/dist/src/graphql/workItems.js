"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WORK_ITEM_REMOVE_LINKED_ITEMS = exports.WORK_ITEM_ADD_LINKED_ITEMS = exports.CREATE_WORK_ITEM_WITH_WIDGETS = exports.GET_WORK_ITEM_TYPES = exports.TIMELOG_DELETE = exports.DELETE_WORK_ITEM = exports.UPDATE_WORK_ITEM = exports.CREATE_WORK_ITEM_WITH_DESCRIPTION = exports.CREATE_WORK_ITEM = exports.GET_WORK_ITEM = exports.GET_WORK_ITEM_BY_IID = exports.GET_PROJECT_WORK_ITEMS = exports.GET_WORK_ITEMS = exports.GET_NAMESPACE_WORK_ITEMS = exports.GET_NAMESPACE_TYPE = exports.GET_GROUP_PROJECTS = exports.WorkItemWidgetTypes = void 0;
const graphql_tag_1 = require("graphql-tag");
exports.WorkItemWidgetTypes = {
    ASSIGNEES: 'ASSIGNEES',
    DESCRIPTION: 'DESCRIPTION',
    HIERARCHY: 'HIERARCHY',
    LABELS: 'LABELS',
    MILESTONE: 'MILESTONE',
    NOTES: 'NOTES',
    START_AND_DUE_DATE: 'START_AND_DUE_DATE',
    HEALTH_STATUS: 'HEALTH_STATUS',
    WEIGHT: 'WEIGHT',
    ITERATION: 'ITERATION',
    PROGRESS: 'PROGRESS',
    STATUS: 'STATUS',
    REQUIREMENT_LEGACY: 'REQUIREMENT_LEGACY',
    TEST_REPORTS: 'TEST_REPORTS',
    NOTIFICATIONS: 'NOTIFICATIONS',
    CURRENT_USER_TODOS: 'CURRENT_USER_TODOS',
    AWARD_EMOJI: 'AWARD_EMOJI',
    LINKED_ITEMS: 'LINKED_ITEMS',
    COLOR: 'COLOR',
    PARTICIPANTS: 'PARTICIPANTS',
    DESIGNS: 'DESIGNS',
    DEVELOPMENT: 'DEVELOPMENT',
    CRM_CONTACTS: 'CRM_CONTACTS',
    TIME_TRACKING: 'TIME_TRACKING',
    EMAIL_PARTICIPANTS: 'EMAIL_PARTICIPANTS',
    CUSTOM_FIELDS: 'CUSTOM_FIELDS',
    ERROR_TRACKING: 'ERROR_TRACKING',
    LINKED_RESOURCES: 'LINKED_RESOURCES',
    VULNERABILITIES: 'VULNERABILITIES',
    VERIFICATION_STATUS: 'VERIFICATION_STATUS',
};
exports.GET_GROUP_PROJECTS = (0, graphql_tag_1.gql) `
  query GetGroupProjects($groupPath: ID!, $includeSubgroups: Boolean) {
    group(fullPath: $groupPath) {
      projects(includeSubgroups: $includeSubgroups) {
        nodes {
          id
          fullPath
          archived
        }
      }
    }
  }
`;
exports.GET_NAMESPACE_TYPE = (0, graphql_tag_1.gql) `
  query GetNamespaceType($namespacePath: ID!) {
    namespace(fullPath: $namespacePath) {
      __typename
      fullPath
    }
  }
`;
exports.GET_NAMESPACE_WORK_ITEMS = (0, graphql_tag_1.gql) `
  query GetNamespaceWorkItems(
    $namespacePath: ID!
    $types: [IssueType!]
    $first: Int
    $after: String
  ) {
    namespace(fullPath: $namespacePath) {
      __typename
      fullPath
      workItems(types: $types, first: $first, after: $after) {
        nodes {
          id
          iid
          title
          description
          state
          workItemType {
            id
            name
          }
          createdAt
          updatedAt
          closedAt
          webUrl
          widgets {
            type
            ... on WorkItemWidgetAssignees {
              allowsMultipleAssignees
              canInviteMembers
              assignees {
                nodes {
                  id
                  username
                  name
                  webUrl
                  avatarUrl
                }
              }
            }
            ... on WorkItemWidgetLabels {
              allowsScopedLabels
              labels {
                nodes {
                  id
                  title
                  color
                  textColor
                  description
                }
              }
            }
            ... on WorkItemWidgetMilestone {
              milestone {
                id
                title
                description
                state
              }
            }
            ... on WorkItemWidgetHierarchy {
              hasChildren
              parent {
                id
                iid
                title
                workItemType {
                  id
                  name
                }
              }
            }
            ... on WorkItemWidgetTimeTracking {
              timeEstimate
              totalTimeSpent
            }
            ... on WorkItemWidgetVerificationStatus {
              verificationStatus
            }
            ... on WorkItemWidgetTestReports {
              testReports {
                nodes {
                  id
                  state
                  createdAt
                  author {
                    id
                    username
                  }
                }
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;
exports.GET_WORK_ITEMS = (0, graphql_tag_1.gql) `
  query GetWorkItems($groupPath: ID!, $types: [IssueType!], $first: Int, $after: String) {
    group(fullPath: $groupPath) {
      workItems(types: $types, first: $first, after: $after) {
        nodes {
          id
          iid
          title
          description
          state
          workItemType {
            id
            name
          }
          createdAt
          updatedAt
          closedAt
          webUrl
          widgets {
            type
            ... on WorkItemWidgetAssignees {
              allowsMultipleAssignees
              canInviteMembers
              assignees {
                nodes {
                  id
                  username
                  name
                  avatarUrl
                  webUrl
                }
              }
            }
            ... on WorkItemWidgetDescription {
              description
              descriptionHtml
              edited
              lastEditedAt
              lastEditedBy {
                id
                username
                name
              }
            }
            ... on WorkItemWidgetHierarchy {
              parent {
                id
                iid
                title
                workItemType {
                  name
                }
              }
              children {
                nodes {
                  id
                  iid
                  title
                  workItemType {
                    name
                  }
                }
              }
              hasChildren
            }
            ... on WorkItemWidgetLabels {
              allowsScopedLabels
              labels {
                nodes {
                  id
                  title
                  description
                  color
                  textColor
                }
              }
            }
            ... on WorkItemWidgetMilestone {
              milestone {
                id
                title
                description
                state
                dueDate
                startDate
                webPath
              }
            }
            ... on WorkItemWidgetNotes {
              discussions {
                nodes {
                  id
                  resolvable
                  resolved
                  notes {
                    nodes {
                      id
                      body
                      author {
                        id
                        username
                        name
                      }
                      createdAt
                      updatedAt
                      system
                    }
                  }
                }
              }
            }
            ... on WorkItemWidgetStartAndDueDate {
              startDate
              dueDate
              isFixed
            }
            ... on WorkItemWidgetHealthStatus {
              healthStatus
            }
            ... on WorkItemWidgetWeight {
              weight
            }
            ... on WorkItemWidgetStatus {
              status {
                name
                color
              }
            }
            ... on WorkItemWidgetTimeTracking {
              timeEstimate
              totalTimeSpent
              humanReadableAttributes {
                timeEstimate
                totalTimeSpent
              }
            }
            ... on WorkItemWidgetParticipants {
              participants {
                nodes {
                  id
                  username
                  name
                  avatarUrl
                  webUrl
                }
              }
            }
            ... on WorkItemWidgetProgress {
              currentValue
              endValue
              progress
              startValue
            }
            ... on WorkItemWidgetRequirementLegacy {
              type
            }
            ... on WorkItemWidgetTestReports {
              testReports {
                nodes {
                  id
                  state
                  createdAt
                  author {
                    id
                    username
                  }
                }
              }
            }
            ... on WorkItemWidgetNotifications {
              subscribed
            }
            ... on WorkItemWidgetCurrentUserTodos {
              currentUserTodos {
                nodes {
                  id
                  action
                  author {
                    id
                    username
                    name
                  }
                  createdAt
                  state
                }
              }
            }
            ... on WorkItemWidgetAwardEmoji {
              awardEmoji {
                nodes {
                  name
                  emoji
                  description
                  user {
                    id
                    username
                    name
                  }
                }
              }
              upvotes
              downvotes
            }
            ... on WorkItemWidgetLinkedItems {
              linkedItems {
                nodes {
                  linkType
                  workItem {
                    id
                    iid
                    title
                    state
                    workItemType {
                      name
                    }
                  }
                }
              }
            }
            ... on WorkItemWidgetColor {
              color
            }
            ... on WorkItemWidgetDesigns {
              designCollection {
                designs {
                  nodes {
                    id
                    filename
                    fullPath
                    image
                    imageV432x230
                  }
                }
              }
            }
            ... on WorkItemWidgetDevelopment {
              closingMergeRequests {
                nodes {
                  id
                  mergeRequest {
                    id
                    iid
                    title
                    state
                    webUrl
                  }
                }
              }
              featureFlags {
                nodes {
                  id
                  name
                  path
                  reference
                  active
                }
              }
            }
            ... on WorkItemWidgetCrmContacts {
              contacts {
                nodes {
                  id
                  firstName
                  lastName
                  email
                  phone
                  organization {
                    id
                    name
                    description
                  }
                }
              }
            }
            ... on WorkItemWidgetEmailParticipants {
              emailParticipants {
                nodes {
                  email
                }
              }
            }
            ... on WorkItemWidgetCustomFields {
              type
            }
            ... on WorkItemWidgetErrorTracking {
              type
            }
            ... on WorkItemWidgetLinkedResources {
              linkedResources {
                nodes {
                  url
                }
              }
            }
            ... on WorkItemWidgetVulnerabilities {
              type
              relatedVulnerabilities(first: 25) {
                nodes {
                  id
                  state
                  severity
                  name
                  webUrl
                }
                pageInfo {
                  hasNextPage
                  endCursor
                }
                count
              }
            }
          }
        }
      }
    }
  }
`;
exports.GET_PROJECT_WORK_ITEMS = (0, graphql_tag_1.gql) `
  query GetProjectWorkItems($projectPath: ID!, $types: [IssueType!], $first: Int, $after: String) {
    project(fullPath: $projectPath) {
      workItems(types: $types, first: $first, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          iid
          title
          description
          state
          workItemType {
            id
            name
          }
          createdAt
          updatedAt
          closedAt
          webUrl
          widgets {
            type
            ... on WorkItemWidgetAssignees {
              allowsMultipleAssignees
              canInviteMembers
              assignees {
                nodes {
                  id
                  username
                  name
                  avatarUrl
                  webUrl
                }
              }
            }
            ... on WorkItemWidgetDescription {
              description
              descriptionHtml
              edited
              lastEditedAt
              lastEditedBy {
                id
                username
                name
              }
            }
            ... on WorkItemWidgetHierarchy {
              parent {
                id
                iid
                title
                workItemType {
                  name
                }
              }
              children {
                nodes {
                  id
                  iid
                  title
                  state
                  workItemType {
                    name
                  }
                }
              }
            }
            ... on WorkItemWidgetLabels {
              allowsScopedLabels
              labels {
                nodes {
                  id
                  title
                  description
                  color
                  textColor
                }
              }
            }
            ... on WorkItemWidgetMilestone {
              milestone {
                id
                title
                state
                dueDate
                startDate
                webPath
              }
            }
            ... on WorkItemWidgetNotes {
              discussions {
                nodes {
                  id
                  resolvable
                  resolved
                  notes {
                    nodes {
                      id
                      body
                      author {
                        id
                        username
                        name
                        avatarUrl
                      }
                      createdAt
                      updatedAt
                      system
                    }
                  }
                }
              }
            }
            ... on WorkItemWidgetStartAndDueDate {
              startDate
              dueDate
              isFixed
            }
            ... on WorkItemWidgetHealthStatus {
              healthStatus
            }
            ... on WorkItemWidgetWeight {
              weight
            }
            ... on WorkItemWidgetIteration {
              iteration {
                id
                title
                startDate
                dueDate
                webUrl
                iterationCadence {
                  id
                  title
                }
              }
            }
            ... on WorkItemWidgetProgress {
              currentValue
              endValue
              progress
              startValue
            }
            ... on WorkItemWidgetRequirementLegacy {
              type
            }
            ... on WorkItemWidgetTestReports {
              testReports {
                nodes {
                  id
                  state
                  createdAt
                  author {
                    id
                    username
                  }
                }
              }
            }
            ... on WorkItemWidgetNotifications {
              subscribed
            }
            ... on WorkItemWidgetCurrentUserTodos {
              currentUserTodos {
                nodes {
                  id
                  action
                  author {
                    id
                    username
                  }
                  createdAt
                  state
                }
              }
            }
            ... on WorkItemWidgetAwardEmoji {
              awardEmoji {
                nodes {
                  name
                  emoji
                  description
                  user {
                    id
                    username
                  }
                }
              }
              downvotes
              upvotes
            }
            ... on WorkItemWidgetLinkedItems {
              linkedItems {
                nodes {
                  linkType
                  workItem {
                    id
                    iid
                    title
                    state
                    workItemType {
                      name
                    }
                  }
                }
              }
            }
            ... on WorkItemWidgetColor {
              color
              textColor
            }
            ... on WorkItemWidgetParticipants {
              participants {
                nodes {
                  id
                  username
                  name
                  avatarUrl
                }
              }
            }
            ... on WorkItemWidgetDesigns {
              designCollection {
                designs {
                  nodes {
                    id
                    filename
                    fullPath
                    image
                    imageV432x230
                  }
                }
              }
            }
            ... on WorkItemWidgetDevelopment {
              featureFlags {
                nodes {
                  id
                  name
                  active
                }
              }
              closingMergeRequests {
                nodes {
                  id
                  mergeRequest {
                    id
                    iid
                    title
                    state
                    webUrl
                  }
                }
              }
            }
            ... on WorkItemWidgetCrmContacts {
              contacts {
                nodes {
                  id
                  firstName
                  lastName
                  email
                  organization {
                    id
                    name
                  }
                }
              }
            }
            ... on WorkItemWidgetTimeTracking {
              timeEstimate
              totalTimeSpent
              timelogs {
                nodes {
                  id
                  timeSpent
                  note {
                    body
                  }
                  spentAt
                  user {
                    id
                    username
                  }
                }
              }
            }
            ... on WorkItemWidgetEmailParticipants {
              emailParticipants {
                nodes {
                  email
                }
              }
            }
            ... on WorkItemWidgetCustomFields {
              type
            }
            ... on WorkItemWidgetErrorTracking {
              type
            }
            ... on WorkItemWidgetLinkedResources {
              linkedResources {
                nodes {
                  url
                }
              }
            }
            ... on WorkItemWidgetVulnerabilities {
              relatedVulnerabilities {
                nodes {
                  id
                  state
                  severity
                  name
                  webUrl
                }
                pageInfo {
                  hasNextPage
                  endCursor
                }
                count
              }
            }
          }
        }
      }
    }
  }
`;
exports.GET_WORK_ITEM_BY_IID = (0, graphql_tag_1.gql) `
  query GetWorkItemByIid($namespacePath: ID!, $iid: String!) {
    namespace(fullPath: $namespacePath) {
      workItem(iid: $iid) {
        id
        iid
        title
        description
        state
        workItemType {
          id
          name
        }
        createdAt
        updatedAt
        closedAt
        webUrl
        widgets {
          type
          ... on WorkItemWidgetAssignees {
            allowsMultipleAssignees
            canInviteMembers
            assignees {
              nodes {
                id
                username
                name
                avatarUrl
                webUrl
              }
            }
          }
          ... on WorkItemWidgetDescription {
            description
            descriptionHtml
            edited
            lastEditedAt
            lastEditedBy {
              id
              username
              name
            }
          }
          ... on WorkItemWidgetHierarchy {
            parent {
              id
              iid
              title
              workItemType {
                name
              }
            }
            children {
              nodes {
                id
                iid
                title
                workItemType {
                  name
                }
              }
            }
            hasChildren
          }
          ... on WorkItemWidgetLabels {
            allowsScopedLabels
            labels {
              nodes {
                id
                title
                description
                color
                textColor
              }
            }
          }
          ... on WorkItemWidgetMilestone {
            milestone {
              id
              title
              description
              state
              dueDate
              startDate
              webPath
            }
          }
          ... on WorkItemWidgetLinkedItems {
            linkedItems {
              nodes {
                linkType
                workItem {
                  id
                  iid
                  title
                  state
                  workItemType {
                    name
                  }
                }
              }
            }
          }
          ... on WorkItemWidgetTimeTracking {
            timeEstimate
            totalTimeSpent
            timelogs {
              nodes {
                id
                timeSpent
                spentAt
                summary
                user {
                  id
                  username
                }
              }
            }
          }
          ... on WorkItemWidgetVerificationStatus {
            verificationStatus
          }
          ... on WorkItemWidgetTestReports {
            testReports {
              nodes {
                id
                state
                createdAt
                author {
                  id
                  username
                }
              }
            }
          }
        }
      }
    }
  }
`;
exports.GET_WORK_ITEM = (0, graphql_tag_1.gql) `
  query GetWorkItem($id: WorkItemID!) {
    workItem(id: $id) {
      id
      iid
      title
      description
      state
      workItemType {
        id
        name
      }
      createdAt
      updatedAt
      closedAt
      webUrl
      widgets {
        type
        ... on WorkItemWidgetAssignees {
          allowsMultipleAssignees
          canInviteMembers
          assignees {
            nodes {
              id
              username
              name
              avatarUrl
              webUrl
            }
          }
        }
        ... on WorkItemWidgetDescription {
          description
          descriptionHtml
          edited
          lastEditedAt
          lastEditedBy {
            id
            username
            name
          }
        }
        ... on WorkItemWidgetHierarchy {
          parent {
            id
            iid
            title
            workItemType {
              name
            }
          }
          children {
            nodes {
              id
              iid
              title
              workItemType {
                name
              }
            }
          }
          hasChildren
        }
        ... on WorkItemWidgetLabels {
          allowsScopedLabels
          labels {
            nodes {
              id
              title
              description
              color
              textColor
            }
          }
        }
        ... on WorkItemWidgetLinkedItems {
          linkedItems {
            nodes {
              linkType
              workItem {
                id
                iid
                title
                state
                workItemType {
                  name
                }
              }
            }
          }
        }
        ... on WorkItemWidgetTimeTracking {
          timeEstimate
          totalTimeSpent
          timelogs {
            nodes {
              id
              timeSpent
              spentAt
              summary
              user {
                id
                username
              }
            }
          }
        }
        ... on WorkItemWidgetVerificationStatus {
          verificationStatus
        }
        ... on WorkItemWidgetTestReports {
          testReports {
            nodes {
              id
              state
              createdAt
              author {
                id
                username
              }
            }
          }
        }
      }
    }
  }
`;
exports.CREATE_WORK_ITEM = (0, graphql_tag_1.gql) `
  mutation CreateWorkItem($namespacePath: ID!, $title: String!, $workItemTypeId: WorkItemsTypeID!) {
    workItemCreate(
      input: { namespacePath: $namespacePath, title: $title, workItemTypeId: $workItemTypeId }
    ) {
      workItem {
        id
        iid
        title
        description
        state
        workItemType {
          id
          name
        }
        webUrl
      }
      errors
    }
  }
`;
exports.CREATE_WORK_ITEM_WITH_DESCRIPTION = (0, graphql_tag_1.gql) `
  mutation CreateWorkItemWithDescription(
    $namespacePath: ID!
    $title: String!
    $workItemTypeId: WorkItemsTypeID!
    $description: String!
  ) {
    workItemCreate(
      input: {
        namespacePath: $namespacePath
        title: $title
        workItemTypeId: $workItemTypeId
        descriptionWidget: { description: $description }
      }
    ) {
      workItem {
        id
        iid
        title
        description
        state
        workItemType {
          id
          name
        }
        webUrl
      }
      errors
    }
  }
`;
exports.UPDATE_WORK_ITEM = (0, graphql_tag_1.gql) `
  mutation UpdateWorkItem($input: WorkItemUpdateInput!) {
    workItemUpdate(input: $input) {
      workItem {
        id
        iid
        title
        description
        state
        workItemType {
          id
          name
        }
        webUrl
        widgets {
          type
          ... on WorkItemWidgetAssignees {
            assignees {
              nodes {
                id
                username
                name
                avatarUrl
                webUrl
              }
            }
          }
          ... on WorkItemWidgetLabels {
            labels {
              nodes {
                id
                title
                description
                color
                textColor
              }
            }
          }
          ... on WorkItemWidgetMilestone {
            milestone {
              id
              title
              state
              startDate
              dueDate
              webPath
            }
          }
          ... on WorkItemWidgetStartAndDueDate {
            startDate
            dueDate
            isFixed
          }
          ... on WorkItemWidgetHierarchy {
            parent {
              id
              iid
              title
              workItemType {
                name
              }
            }
            children {
              nodes {
                id
                iid
                title
                workItemType {
                  name
                }
              }
            }
            hasChildren
          }
          ... on WorkItemWidgetTimeTracking {
            timeEstimate
            totalTimeSpent
            timelogs {
              nodes {
                id
                timeSpent
                spentAt
                summary
                user {
                  id
                  username
                }
              }
            }
          }
          ... on WorkItemWidgetWeight {
            weight
          }
          ... on WorkItemWidgetIteration {
            iteration {
              id
              title
              startDate
              dueDate
            }
          }
          ... on WorkItemWidgetHealthStatus {
            healthStatus
          }
          ... on WorkItemWidgetProgress {
            currentValue
            endValue
            progress
            startValue
          }
          ... on WorkItemWidgetColor {
            color
          }
          ... on WorkItemWidgetLinkedItems {
            linkedItems {
              nodes {
                linkType
                workItem {
                  id
                  iid
                  title
                  state
                  workItemType {
                    name
                  }
                }
              }
            }
          }
          ... on WorkItemWidgetVerificationStatus {
            verificationStatus
          }
          ... on WorkItemWidgetTestReports {
            testReports {
              nodes {
                id
                state
                createdAt
                author {
                  id
                  username
                }
              }
            }
          }
        }
      }
      errors
    }
  }
`;
exports.DELETE_WORK_ITEM = (0, graphql_tag_1.gql) `
  mutation DeleteWorkItem($id: WorkItemID!) {
    workItemDelete(input: { id: $id }) {
      errors
    }
  }
`;
exports.TIMELOG_DELETE = (0, graphql_tag_1.gql) `
  mutation TimelogDelete($id: TimelogID!) {
    timelogDelete(input: { id: $id }) {
      timelog {
        id
        timeSpent
        spentAt
        summary
      }
      errors
    }
  }
`;
exports.GET_WORK_ITEM_TYPES = (0, graphql_tag_1.gql) `
  query GetWorkItemTypes($namespacePath: ID!) {
    namespace(fullPath: $namespacePath) {
      workItemTypes {
        nodes {
          id
          name
        }
      }
    }
  }
`;
exports.CREATE_WORK_ITEM_WITH_WIDGETS = (0, graphql_tag_1.gql) `
  mutation CreateWorkItemWithWidgets($input: WorkItemCreateInput!) {
    workItemCreate(input: $input) {
      workItem {
        id
        iid
        title
        description
        state
        workItemType {
          id
          name
        }
        createdAt
        updatedAt
        closedAt
        webUrl
        widgets {
          type
          ... on WorkItemWidgetAssignees {
            allowsMultipleAssignees
            canInviteMembers
            assignees {
              nodes {
                id
                username
                name
                avatarUrl
                webUrl
              }
            }
          }
          ... on WorkItemWidgetLabels {
            allowsScopedLabels
            labels {
              nodes {
                id
                title
                description
                color
                textColor
              }
            }
          }
          ... on WorkItemWidgetDescription {
            description
            descriptionHtml
            edited
            lastEditedAt
            lastEditedBy {
              id
              username
              name
            }
          }
          ... on WorkItemWidgetHierarchy {
            parent {
              id
              iid
              title
              workItemType {
                name
              }
            }
            children {
              nodes {
                id
                iid
                title
                workItemType {
                  name
                }
              }
            }
            hasChildren
          }
          ... on WorkItemWidgetMilestone {
            milestone {
              id
              title
              description
              state
              dueDate
              startDate
              webPath
            }
          }
          ... on WorkItemWidgetStartAndDueDate {
            startDate
            dueDate
          }
          ... on WorkItemWidgetHealthStatus {
            healthStatus
          }
          ... on WorkItemWidgetNotifications {
            subscribed
          }
          ... on WorkItemWidgetCurrentUserTodos {
            currentUserTodos {
              nodes {
                id
                state
              }
            }
          }
          ... on WorkItemWidgetAwardEmoji {
            upvotes
            downvotes
            awardEmoji {
              nodes {
                name
                emoji
                user {
                  id
                  username
                  name
                }
              }
            }
          }
          ... on WorkItemWidgetColor {
            color
          }
          ... on WorkItemWidgetParticipants {
            participants {
              nodes {
                id
                username
                name
                avatarUrl
              }
            }
          }
          ... on WorkItemWidgetWeight {
            weight
          }
          ... on WorkItemWidgetVerificationStatus {
            verificationStatus
          }
          ... on WorkItemWidgetTimeTracking {
            timeEstimate
            totalTimeSpent
          }
          ... on WorkItemWidgetIteration {
            iteration {
              id
              title
              description
              state
              startDate
              dueDate
            }
          }
        }
      }
      errors
    }
  }
`;
exports.WORK_ITEM_ADD_LINKED_ITEMS = (0, graphql_tag_1.gql) `
  mutation WorkItemAddLinkedItems($input: WorkItemAddLinkedItemsInput!) {
    workItemAddLinkedItems(input: $input) {
      workItem {
        id
        iid
        title
        state
        workItemType {
          id
          name
        }
        webUrl
        widgets {
          type
          ... on WorkItemWidgetLinkedItems {
            linkedItems {
              nodes {
                linkType
                workItem {
                  id
                  iid
                  title
                  state
                  workItemType {
                    name
                  }
                }
              }
            }
          }
        }
      }
      errors
      message
    }
  }
`;
exports.WORK_ITEM_REMOVE_LINKED_ITEMS = (0, graphql_tag_1.gql) `
  mutation WorkItemRemoveLinkedItems($input: WorkItemRemoveLinkedItemsInput!) {
    workItemRemoveLinkedItems(input: $input) {
      workItem {
        id
        iid
        title
        state
        workItemType {
          id
          name
        }
        webUrl
        widgets {
          type
          ... on WorkItemWidgetLinkedItems {
            linkedItems {
              nodes {
                linkType
                workItem {
                  id
                  iid
                  title
                  state
                  workItemType {
                    name
                  }
                }
              }
            }
          }
        }
      }
      errors
      message
    }
  }
`;
//# sourceMappingURL=workItems.js.map