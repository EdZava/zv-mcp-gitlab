import { ProjectConfig, ProjectPreset, ProjectProfile, ProfileValidationResult } from './types';
export declare const PROJECT_CONFIG_DIR = ".gitlab-mcp";
export declare const PROJECT_PRESET_FILE = "preset.yaml";
export declare const PROJECT_PROFILE_FILE = "profile.yaml";
export declare function loadProjectConfig(repoPath: string): Promise<ProjectConfig | null>;
export declare function findProjectConfig(startPath: string): Promise<ProjectConfig | null>;
export declare function validateProjectPreset(preset: ProjectPreset): ProfileValidationResult;
export declare function validateProjectProfile(profile: ProjectProfile, availablePresets: string[]): ProfileValidationResult;
export declare function getProjectConfigSummary(config: ProjectConfig): {
    presetSummary: string | null;
    profileSummary: string | null;
};
