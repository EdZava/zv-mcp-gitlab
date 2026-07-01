import { ToolConfig } from '../types';
export declare function applyManualCategories(selectedCategories: string[], env: Record<string, string>): void;
export declare function runToolSelectionFlow(): Promise<ToolConfig | null>;
