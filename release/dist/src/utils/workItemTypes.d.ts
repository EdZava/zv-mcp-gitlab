interface WorkItemType {
    id: string;
    name: string;
}
export declare function getWorkItemTypes(namespace: string): Promise<WorkItemType[]>;
export {};
