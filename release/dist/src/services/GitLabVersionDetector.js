"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitLabVersionDetector = void 0;
const graphql_tag_1 = require("graphql-tag");
const fetch_1 = require("../utils/fetch");
const logger_1 = require("../logger");
const version_1 = require("../utils/version");
const VERSION_QUERY = (0, graphql_tag_1.gql) `
  query GetVersionInfo {
    metadata {
      version
      revision
      kas {
        enabled
        version
      }
      enterprise
    }
    currentUser {
      id
      username
      name
    }
  }
`;
const LICENSE_QUERY = (0, graphql_tag_1.gql) `
  query GetLicenseInfo {
    currentLicense {
      id
      type
      plan
      expiresAt
      activatedAt
      lastSync
      billableUsersCount
      maximumUserCount
      usersInLicenseCount
    }
  }
`;
const FEATURE_DETECTION_QUERY = (0, graphql_tag_1.gql) `
  query DetectFeatures($groupPath: String!) {
    group(fullPath: $groupPath) {
      id
      epicsEnabled
      iterationsEnabled: iterationCadences(first: 1) {
        nodes {
          id
        }
      }
      workItemTypesEnabled: workItemTypes {
        nodes {
          id
          name
        }
      }
    }
  }
`;
class GitLabVersionDetector {
    client;
    cachedInfo = null;
    testGroupPath = 'test';
    constructor(client) {
        this.client = client;
    }
    getCachedInfo() {
        return this.cachedInfo;
    }
    async detectInstance() {
        if (this.cachedInfo && this.isRecentCache(this.cachedInfo.detectedAt)) {
            return this.cachedInfo;
        }
        const version = await this.detectVersion();
        const tier = await this.detectTier();
        const features = this.determineFeatures(version, tier);
        this.cachedInfo = {
            version,
            tier,
            features,
            detectedAt: new Date(),
        };
        return this.cachedInfo;
    }
    async detectVersion() {
        try {
            const response = await this.client.request(VERSION_QUERY);
            return response.metadata.version;
        }
        catch (error) {
            (0, logger_1.logWarn)('Failed to detect GitLab version via GraphQL, trying alternative methods', {
                error: error instanceof Error ? error.message : String(error),
            });
            return await this.detectVersionFallback();
        }
    }
    async detectVersionFallback() {
        try {
            const baseUrl = this.client.endpoint.replace('/api/graphql', '');
            const response = await (0, fetch_1.enhancedFetch)(`${baseUrl}/api/v4/version`);
            if (response.ok) {
                const data = (await response.json());
                return data.version;
            }
        }
        catch (error) {
            (0, logger_1.logWarn)('Failed to detect version via REST API', {
                error: error instanceof Error ? error.message : String(error),
            });
        }
        return 'unknown';
    }
    async detectTier() {
        try {
            const response = await this.client.request(LICENSE_QUERY);
            if (response.currentLicense) {
                const plan = response.currentLicense.plan?.toLowerCase() ?? '';
                if (plan.includes('ultimate') || plan.includes('gold')) {
                    return 'ultimate';
                }
                else if (plan.includes('premium') || plan.includes('silver')) {
                    return 'premium';
                }
            }
        }
        catch (error) {
            (0, logger_1.logDebug)('License query not available, attempting feature detection', {
                error: error instanceof Error ? error.message : String(error),
            });
        }
        return await this.detectTierByFeatures();
    }
    async detectTierByFeatures() {
        try {
            const response = await this.client.request(FEATURE_DETECTION_QUERY, {
                groupPath: this.testGroupPath,
            });
            const group = response.group;
            if (group?.epicsEnabled) {
                const hasIterations = (group.iterationsEnabled?.nodes?.length ?? 0) > 0;
                const hasAdvancedWorkItems = group.workItemTypesEnabled?.nodes?.some((type) => ['OBJECTIVE', 'KEY_RESULT', 'REQUIREMENT'].includes(type.name)) ?? false;
                if (hasAdvancedWorkItems) {
                    return 'ultimate';
                }
                else if (hasIterations) {
                    return 'premium';
                }
                else {
                    return 'premium';
                }
            }
        }
        catch (error) {
            (0, logger_1.logDebug)('Feature detection failed, assuming free tier', {
                error: error instanceof Error ? error.message : String(error),
            });
        }
        return 'free';
    }
    determineFeatures(version, tier) {
        const v = (0, version_1.parseVersion)(version);
        const features = {
            workItems: v >= (0, version_1.parseVersion)('15.0'),
            epics: tier !== 'free' && v >= (0, version_1.parseVersion)('10.2'),
            iterations: tier !== 'free' && v >= (0, version_1.parseVersion)('13.1'),
            roadmaps: tier !== 'free' && v >= (0, version_1.parseVersion)('10.8'),
            portfolioManagement: tier === 'ultimate' && v >= (0, version_1.parseVersion)('12.0'),
            advancedSearch: tier !== 'free' && v >= (0, version_1.parseVersion)('11.0'),
            codeReview: tier !== 'free' && v >= (0, version_1.parseVersion)('11.0'),
            securityDashboard: tier === 'ultimate' && v >= (0, version_1.parseVersion)('11.1'),
            complianceFramework: tier === 'ultimate' && v >= (0, version_1.parseVersion)('13.0'),
            valueStreamAnalytics: tier !== 'free' && v >= (0, version_1.parseVersion)('12.3'),
            customFields: tier === 'ultimate' && v >= (0, version_1.parseVersion)('17.0'),
            okrs: tier === 'ultimate' && v >= (0, version_1.parseVersion)('15.7'),
            healthStatus: tier === 'ultimate' && v >= (0, version_1.parseVersion)('13.1'),
            weight: tier !== 'free' && v >= (0, version_1.parseVersion)('12.0'),
            multiLevelEpics: tier === 'ultimate' && v >= (0, version_1.parseVersion)('11.7'),
            serviceDesk: tier !== 'free' && v >= (0, version_1.parseVersion)('9.1'),
            requirements: tier === 'ultimate' && v >= (0, version_1.parseVersion)('13.1'),
            qualityManagement: tier === 'ultimate' && v >= (0, version_1.parseVersion)('13.0'),
            timeTracking: tier !== 'free' && v >= (0, version_1.parseVersion)('8.14'),
            crmContacts: tier === 'ultimate' && v >= (0, version_1.parseVersion)('14.0'),
            vulnerabilities: tier === 'ultimate' && v >= (0, version_1.parseVersion)('12.5'),
            errorTracking: tier === 'ultimate' && v >= (0, version_1.parseVersion)('12.7'),
            designManagement: tier !== 'free' && v >= (0, version_1.parseVersion)('12.2'),
            linkedResources: tier !== 'free' && v >= (0, version_1.parseVersion)('16.5'),
            emailParticipants: tier !== 'free' && v >= (0, version_1.parseVersion)('16.0'),
        };
        return features;
    }
    isRecentCache(detectedAt) {
        const cacheLifetime = 24 * 60 * 60 * 1000;
        return Date.now() - detectedAt.getTime() < cacheLifetime;
    }
    isFeatureAvailable(feature) {
        if (!this.cachedInfo) {
            throw new Error('Instance info not detected yet. Call detectInstance() first.');
        }
        return this.cachedInfo.features[feature];
    }
    getTier() {
        if (!this.cachedInfo) {
            throw new Error('Instance info not detected yet. Call detectInstance() first.');
        }
        return this.cachedInfo.tier;
    }
    getVersion() {
        if (!this.cachedInfo) {
            throw new Error('Instance info not detected yet. Call detectInstance() first.');
        }
        return this.cachedInfo.version;
    }
}
exports.GitLabVersionDetector = GitLabVersionDetector;
//# sourceMappingURL=GitLabVersionDetector.js.map