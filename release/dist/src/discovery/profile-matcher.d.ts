import { ProfileLoader, ProfileInfo } from '../profiles';
export interface ProfileMatchResult {
    profileName: string;
    profile: ProfileInfo;
    matchType: 'exact' | 'subdomain';
}
export declare function matchProfileByHost(host: string, profiles: ProfileInfo[]): ProfileMatchResult | null;
export declare function findProfileByHost(host: string, loader?: ProfileLoader): Promise<ProfileMatchResult | null>;
