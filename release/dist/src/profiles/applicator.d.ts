import { Profile, Preset, ProfileValidationResult } from './types';
export interface ApplyProfileResult {
    success: boolean;
    profileName: string;
    host: string;
    appliedSettings: string[];
    validation: ProfileValidationResult;
}
export interface ApplyPresetResult {
    success: boolean;
    presetName: string;
    appliedSettings: string[];
    validation: ProfileValidationResult;
}
export declare function applyProfile(profile: Profile, profileName: string): Promise<ApplyProfileResult>;
export declare function applyPreset(preset: Preset, presetName: string): Promise<ApplyPresetResult>;
export declare function loadAndApplyProfile(profileName: string): Promise<ApplyProfileResult>;
export declare function loadAndApplyPreset(presetName: string): Promise<ApplyPresetResult>;
export declare function tryApplyProfileFromEnv(cliProfileName?: string): Promise<ApplyProfileResult | ApplyPresetResult | undefined>;
