import { Profile, Preset, ProfileInfo, ProfileValidationResult } from './types';
export declare class ProfileLoader {
    private userConfigPath;
    private builtinDir;
    private profileCache;
    private presetCache;
    private configCache;
    constructor(userConfigPath?: string, builtinDir?: string);
    loadProfile(name: string): Promise<Profile>;
    loadPreset(name: string): Promise<Preset>;
    loadAny(name: string): Promise<{
        type: 'profile';
        data: Profile;
    } | {
        type: 'preset';
        data: Preset;
    }>;
    getDefaultProfileName(): Promise<string | undefined>;
    private loadUserConfig;
    private loadUserProfile;
    private loadBuiltinPreset;
    listProfiles(): Promise<ProfileInfo[]>;
    private validateDeniedActions;
    validateProfile(profile: Profile): Promise<ProfileValidationResult>;
    validatePreset(preset: Preset): Promise<ProfileValidationResult>;
    static ensureConfigDir(): void;
    static getUserConfigPath(): string;
    clearCache(): void;
}
export declare function loadProfile(name: string): Promise<Profile>;
export declare function loadPreset(name: string): Promise<Preset>;
export declare function getProfileNameFromEnv(): string | undefined;
