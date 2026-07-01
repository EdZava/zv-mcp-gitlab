import { GitRemoteInfo } from './git-remote';
import { ProfileMatchResult } from './profile-matcher';
import { ProjectConfig } from '../profiles';
export interface AutoDiscoveryOptions {
    repoPath?: string;
    remoteName?: string;
    noProjectConfig?: boolean;
    dryRun?: boolean;
}
export interface AutoDiscoveryResult {
    host: string;
    projectPath: string;
    remote: GitRemoteInfo;
    matchedProfile: ProfileMatchResult | null;
    projectConfig: ProjectConfig | null;
    apiUrl: string;
    profileApplied: boolean;
    projectConfigApplied: boolean;
    availableRemotes: GitRemoteInfo[];
}
export declare function autoDiscover(options?: AutoDiscoveryOptions): Promise<AutoDiscoveryResult | null>;
export declare function formatDiscoveryResult(result: AutoDiscoveryResult): string;
