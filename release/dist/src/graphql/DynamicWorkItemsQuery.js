"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicWorkItemsQueryBuilder = void 0;
const graphql_tag_1 = require("graphql-tag");
const logger_1 = require("../logger");
class DynamicWorkItemsQueryBuilder {
    schemaIntrospector;
    constructor(schemaIntrospector) {
        this.schemaIntrospector = schemaIntrospector;
    }
    buildWorkItemsQuery(requestedWidgets) {
        const widgets = requestedWidgets ?? this.schemaIntrospector.getAvailableWidgetTypes();
        const availableWidgets = widgets.filter((widget) => this.schemaIntrospector.isWidgetTypeAvailable(widget));
        (0, logger_1.logInfo)('Building dynamic WorkItems query', {
            requested: widgets.length,
            available: availableWidgets.length,
            widgetTypes: availableWidgets.slice(0, 5),
        });
        const widgetFragments = this.buildWidgetFragments(availableWidgets);
        const query = (0, graphql_tag_1.gql) `
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
                ${widgetFragments}
              }
            }
          }
        }
      }
    `;
        return query;
    }
    buildWidgetFragments(widgetTypes) {
        const fragments = [];
        for (const widgetType of widgetTypes) {
            const fragment = this.buildWidgetFragment(widgetType);
            if (fragment) {
                fragments.push(fragment);
            }
        }
        return fragments.join('\n');
    }
    buildWidgetFragment(widgetType) {
        const typeName = this.getWidgetTypeName(widgetType);
        const fields = this.schemaIntrospector.getFieldsForType(typeName);
        if (fields.length === 0) {
            return null;
        }
        const safeFields = this.buildSafeFields(widgetType, fields);
        if (safeFields.length === 0) {
            return null;
        }
        return `
      ... on ${typeName} {
        ${safeFields.join('\n        ')}
      }
    `;
    }
    getWidgetTypeName(widgetType) {
        const pascalCase = widgetType
            .split('_')
            .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
            .join('');
        return `WorkItemWidget${pascalCase}`;
    }
    buildSafeFields(widgetType, fields) {
        const safeFields = [];
        const widgetFieldMappings = {
            ASSIGNEES: () => this.buildAssigneesFields(),
            LABELS: () => this.buildLabelsFields(),
            MILESTONE: () => this.buildMilestoneFields(),
            DESCRIPTION: () => this.buildDescriptionFields(),
            START_AND_DUE_DATE: () => ['startDate', 'dueDate'],
            WEIGHT: () => ['weight'],
            TIME_TRACKING: () => ['timeEstimate', 'totalTimeSpent'],
            HEALTH_STATUS: () => ['healthStatus'],
            COLOR: () => ['color'],
            NOTIFICATIONS: () => ['subscribed'],
        };
        const mapper = widgetFieldMappings[widgetType];
        if (mapper) {
            return mapper();
        }
        for (const field of fields) {
            if (field.name === 'type')
                continue;
            if (field.type?.kind === 'SCALAR' || field.type?.kind === 'ENUM') {
                safeFields.push(field.name);
            }
        }
        return safeFields;
    }
    buildAssigneesFields() {
        if (this.schemaIntrospector.hasField('WorkItemWidgetAssignees', 'assignees')) {
            return [
                'assignees {',
                '  nodes {',
                '    id',
                '    username',
                '    name',
                '    avatarUrl',
                '  }',
                '}',
            ];
        }
        return [];
    }
    buildLabelsFields() {
        if (this.schemaIntrospector.hasField('WorkItemWidgetLabels', 'labels')) {
            return [
                'labels {',
                '  nodes {',
                '    id',
                '    title',
                '    color',
                '    description',
                '  }',
                '}',
            ];
        }
        return [];
    }
    buildMilestoneFields() {
        if (this.schemaIntrospector.hasField('WorkItemWidgetMilestone', 'milestone')) {
            return [
                'milestone {',
                '  id',
                '  title',
                '  state',
                '  dueDate',
                '  startDate',
                '  webPath',
                '}',
            ];
        }
        return [];
    }
    buildDescriptionFields() {
        const fields = ['description'];
        if (this.schemaIntrospector.hasField('WorkItemWidgetDescription', 'descriptionHtml')) {
            fields.push('descriptionHtml');
        }
        if (this.schemaIntrospector.hasField('WorkItemWidgetDescription', 'edited')) {
            fields.push('edited');
        }
        return fields;
    }
    buildMinimalQuery() {
        const query = (0, graphql_tag_1.gql) `
      query GetWorkItemsMinimal($groupPath: ID!, $first: Int, $after: String) {
        group(fullPath: $groupPath) {
          workItems(first: $first, after: $after) {
            nodes {
              id
              iid
              title
              state
              workItemType {
                id
                name
              }
              widgets {
                type
              }
            }
          }
        }
      }
    `;
        return query;
    }
}
exports.DynamicWorkItemsQueryBuilder = DynamicWorkItemsQueryBuilder;
//# sourceMappingURL=DynamicWorkItemsQuery.js.map