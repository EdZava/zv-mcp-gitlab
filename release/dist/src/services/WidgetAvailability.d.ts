import { WorkItemWidgetType } from '../graphql/workItems';
import { GitLabTier } from './GitLabVersionDetector';
interface WidgetRequirement {
    tier: GitLabTier;
    minVersion: string;
}
export interface WidgetValidationFailure {
    parameter: string;
    widget: WorkItemWidgetType;
    requiredVersion: string;
    detectedVersion: string;
    requiredTier: GitLabTier;
    currentTier: GitLabTier;
}
export declare class WidgetAvailability {
    private static widgetRequirements;
    static isWidgetAvailable(widget: WorkItemWidgetType, instanceUrl?: string): boolean;
    static getAvailableWidgets(instanceUrl?: string): WorkItemWidgetType[];
    static getWidgetRequirement(widget: WorkItemWidgetType): WidgetRequirement | undefined;
    static validateWidgetParams(params: Record<string, unknown>, instanceUrl?: string): WidgetValidationFailure | null;
    static getParameterWidgetMap(): Record<string, WorkItemWidgetType>;
}
export {};
