"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaIntrospector = void 0;
const graphql_tag_1 = require("graphql-tag");
const logger_1 = require("../logger");
const INTROSPECTION_QUERY = (0, graphql_tag_1.gql) `
  query IntrospectSchema {
    __schema {
      types {
        name
        kind
        fields {
          name
          type {
            name
            kind
            ofType {
              name
              kind
            }
          }
        }
        enumValues {
          name
          description
        }
      }
    }
  }
`;
class SchemaIntrospector {
    client;
    cachedSchema = null;
    constructor(client) {
        this.client = client;
    }
    async introspectSchema() {
        if (this.cachedSchema) {
            return this.cachedSchema;
        }
        try {
            (0, logger_1.logDebug)('Introspecting GitLab GraphQL schema...');
            const result = await this.client.request(INTROSPECTION_QUERY);
            const types = result.__schema.types;
            const workItemWidgetType = types.find((type) => type.name === 'WorkItemWidgetType');
            const workItemWidgetTypes = workItemWidgetType?.enumValues?.map((value) => value.name) ?? [];
            const typeDefinitions = new Map();
            const relevantTypes = types.filter((type) => type.name &&
                (type.name.startsWith('WorkItem') ||
                    type.name.includes('Widget') ||
                    type.name === 'AwardEmoji' ||
                    type.name === 'Milestone' ||
                    type.name === 'User' ||
                    type.name === 'Label'));
            for (const type of relevantTypes) {
                typeDefinitions.set(type.name, {
                    name: type.name,
                    fields: type.fields ?? null,
                    enumValues: type.enumValues ?? null,
                });
            }
            const availableFeatures = new Set();
            for (const widgetType of workItemWidgetTypes) {
                availableFeatures.add(widgetType);
            }
            this.cachedSchema = {
                workItemWidgetTypes,
                typeDefinitions,
                availableFeatures,
            };
            (0, logger_1.logInfo)('GraphQL schema introspection completed', {
                widgetTypes: workItemWidgetTypes.length,
                typeDefinitions: typeDefinitions.size,
                features: availableFeatures.size,
            });
            return this.cachedSchema;
        }
        catch (error) {
            (0, logger_1.logWarn)('Schema introspection failed, using fallback schema info', {
                err: error,
            });
            this.cachedSchema = {
                workItemWidgetTypes: [
                    'ASSIGNEES',
                    'LABELS',
                    'MILESTONE',
                    'DESCRIPTION',
                    'START_AND_DUE_DATE',
                    'WEIGHT',
                    'TIME_TRACKING',
                    'HEALTH_STATUS',
                    'COLOR',
                    'NOTIFICATIONS',
                    'NOTES',
                ],
                typeDefinitions: new Map(),
                availableFeatures: new Set(['workItems', 'epics', 'issues']),
            };
            return this.cachedSchema;
        }
    }
    isWidgetTypeAvailable(widgetType) {
        if (!this.cachedSchema) {
            throw new Error('Schema not introspected yet. Call introspectSchema() first.');
        }
        return this.cachedSchema.availableFeatures.has(widgetType);
    }
    getFieldsForType(typeName) {
        if (!this.cachedSchema) {
            throw new Error('Schema not introspected yet. Call introspectSchema() first.');
        }
        const typeInfo = this.cachedSchema.typeDefinitions.get(typeName);
        if (typeInfo?.fields) {
            return typeInfo.fields;
        }
        if (typeName === 'WorkItemWidgetAssignees') {
            return [{ name: 'assignees', type: { name: 'UserConnection', kind: 'OBJECT' } }];
        }
        if (typeName === 'WorkItemWidgetLabels') {
            return [{ name: 'labels', type: { name: 'LabelConnection', kind: 'OBJECT' } }];
        }
        if (typeName === 'WorkItemWidgetMilestone') {
            return [{ name: 'milestone', type: { name: 'Milestone', kind: 'OBJECT' } }];
        }
        return [];
    }
    hasField(typeName, fieldName) {
        const fields = this.getFieldsForType(typeName);
        return fields.some((field) => field.name === fieldName);
    }
    getAvailableWidgetTypes() {
        if (!this.cachedSchema) {
            throw new Error('Schema not introspected yet. Call introspectSchema() first.');
        }
        return this.cachedSchema.workItemWidgetTypes;
    }
    generateSafeWidgetQuery(requestedWidgets) {
        if (!this.cachedSchema) {
            throw new Error('Schema not introspected yet. Call introspectSchema() first.');
        }
        const safeWidgets = [];
        for (const widget of requestedWidgets) {
            if (this.isWidgetTypeAvailable(widget)) {
                const widgetTypeName = `WorkItemWidget${widget.charAt(0) +
                    widget
                        .slice(1)
                        .toLowerCase()
                        .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())}`;
                const fields = this.getFieldsForType(widgetTypeName);
                const safeFields = this.generateSafeFieldSelections(fields);
                if (safeFields.length > 0) {
                    safeWidgets.push(`
            ... on ${widgetTypeName} {
              ${safeFields.join('\n              ')}
            }
          `);
                }
            }
        }
        return safeWidgets.join('\n');
    }
    generateSafeFieldSelections(fields) {
        const safeFields = [];
        for (const field of fields) {
            if (field.type.kind === 'SCALAR' || field.type.kind === 'ENUM') {
                safeFields.push(field.name);
            }
            else if (field.type.kind === 'OBJECT' && field.name !== 'type') {
                if (field.name === 'milestone') {
                    safeFields.push(`${field.name} { id title state }`);
                }
                else if (field.name === 'assignees' || field.name === 'participants') {
                    safeFields.push(`${field.name} { nodes { id username } }`);
                }
                else if (field.name === 'labels') {
                    safeFields.push(`${field.name} { nodes { id title color } }`);
                }
            }
        }
        return safeFields;
    }
    rehydrate(schema) {
        this.cachedSchema = schema;
    }
    getCachedSchema() {
        return this.cachedSchema;
    }
    clearCache() {
        this.cachedSchema = null;
    }
}
exports.SchemaIntrospector = SchemaIntrospector;
//# sourceMappingURL=SchemaIntrospector.js.map