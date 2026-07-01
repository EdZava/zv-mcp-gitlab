import { ToolCategory, PresetDefinition } from './types';
export declare const TOOL_CATEGORIES: ToolCategory[];
export declare const PRESET_DEFINITIONS: PresetDefinition[];
export declare function getPresetById(id: string): PresetDefinition | undefined;
export declare function getCategoryById(id: string): ToolCategory | undefined;
export declare function getToolCount(categoryIds: string[]): number;
export declare function getTotalToolCount(): number;
