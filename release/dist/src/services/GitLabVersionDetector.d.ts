import { GraphQLClient } from '../graphql/client';
export type GitLabTier = 'free' | 'premium' | 'ultimate';
export interface GitLabFeatures {
    workItems: boolean;
    epics: boolean;
    iterations: boolean;
    roadmaps: boolean;
    portfolioManagement: boolean;
    advancedSearch: boolean;
    codeReview: boolean;
    securityDashboard: boolean;
    complianceFramework: boolean;
    valueStreamAnalytics: boolean;
    customFields: boolean;
    okrs: boolean;
    healthStatus: boolean;
    weight: boolean;
    multiLevelEpics: boolean;
    serviceDesk: boolean;
    requirements: boolean;
    qualityManagement: boolean;
    timeTracking: boolean;
    crmContacts: boolean;
    vulnerabilities: boolean;
    errorTracking: boolean;
    designManagement: boolean;
    linkedResources: boolean;
    emailParticipants: boolean;
}
export interface GitLabInstanceInfo {
    version: string;
    tier: GitLabTier;
    features: GitLabFeatures;
    detectedAt: Date;
}
export declare class GitLabVersionDetector {
    private client;
    private cachedInfo;
    private testGroupPath;
    constructor(client: GraphQLClient);
    getCachedInfo(): GitLabInstanceInfo | null;
    detectInstance(): Promise<GitLabInstanceInfo>;
    private detectVersion;
    private detectVersionFallback;
    private detectTier;
    private detectTierByFeatures;
    private determineFeatures;
    private isRecentCache;
    isFeatureAvailable(feature: keyof GitLabFeatures): boolean;
    getTier(): GitLabTier;
    getVersion(): string;
}
