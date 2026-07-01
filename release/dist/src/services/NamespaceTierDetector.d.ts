import { NamespaceTierInfo } from '../oauth/types.js';
export declare function getFeaturesForTier(tier: 'free' | 'premium' | 'ultimate'): Record<string, boolean>;
export declare function clearNamespaceTierCache(sessionId?: string): void;
export declare function getNamespaceTier(namespacePath: string): Promise<NamespaceTierInfo>;
export declare function isFeatureAvailable(namespacePath: string, feature: string): Promise<boolean>;
export declare function getNamespaceTierCacheMetrics(): {
    totalEntries: number;
    entriesBySession: Map<string, number>;
};
