import { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { SchemaIntrospector } from '../services/SchemaIntrospector';
export interface DynamicWorkItem {
    id: string;
    iid: string;
    title: string;
    description?: string;
    state: string;
    workItemType: {
        id: string;
        name: string;
    };
    createdAt: string;
    updatedAt: string;
    closedAt?: string;
    webUrl: string;
    widgets: Array<{
        type: string;
        [key: string]: unknown;
    }>;
}
export declare class DynamicWorkItemsQueryBuilder {
    private schemaIntrospector;
    constructor(schemaIntrospector: SchemaIntrospector);
    buildWorkItemsQuery(requestedWidgets?: string[]): TypedDocumentNode<{
        group: {
            workItems: {
                nodes: DynamicWorkItem[];
            };
        };
    }, {
        groupPath: string;
        types?: string[];
        first?: number;
        after?: string;
    }>;
    private buildWidgetFragments;
    private buildWidgetFragment;
    private getWidgetTypeName;
    private buildSafeFields;
    private buildAssigneesFields;
    private buildLabelsFields;
    private buildMilestoneFields;
    private buildDescriptionFields;
    buildMinimalQuery(): TypedDocumentNode<{
        group: {
            workItems: {
                nodes: DynamicWorkItem[];
            };
        };
    }, {
        groupPath: string;
        first?: number;
        after?: string;
    }>;
}
