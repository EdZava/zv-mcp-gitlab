"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFeaturesForTier = getFeaturesForTier;
exports.clearNamespaceTierCache = clearNamespaceTierCache;
exports.getNamespaceTier = getNamespaceTier;
exports.isFeatureAvailable = isFeatureAvailable;
exports.getNamespaceTierCacheMetrics = getNamespaceTierCacheMetrics;
const logger_js_1 = require("../logger.js");
const token_context_js_1 = require("../oauth/token-context.js");
const fetch_js_1 = require("../utils/fetch.js");
const config_1 = require("../config");
const NAMESPACE_TIER_CACHE_TTL_MS = 5 * 60 * 1000;
const namespaceTierCache = new Map();
const NAMESPACE_TIER_QUERY = `
  query GetNamespaceTier($fullPath: ID!) {
    namespace(fullPath: $fullPath) {
      id
      fullPath

      ... on Group {
        plan
      }

      ... on Project {
        group {
          plan
        }
      }
    }
  }
`;
const TIER_FEATURES = {
    free: {
        issues: true,
        mergeRequests: true,
        wiki: true,
        snippets: true,
        epics: false,
        iterations: false,
        roadmaps: false,
        okrs: false,
        healthStatus: false,
        weight: false,
        multiLevelEpics: false,
        portfolioManagement: false,
        requirements: false,
        securityDashboard: false,
        complianceFramework: false,
    },
    premium: {
        issues: true,
        mergeRequests: true,
        wiki: true,
        snippets: true,
        epics: true,
        iterations: true,
        roadmaps: true,
        okrs: false,
        healthStatus: true,
        weight: true,
        multiLevelEpics: true,
        portfolioManagement: true,
        requirements: true,
        securityDashboard: false,
        complianceFramework: true,
    },
    ultimate: {
        issues: true,
        mergeRequests: true,
        wiki: true,
        snippets: true,
        epics: true,
        iterations: true,
        roadmaps: true,
        okrs: true,
        healthStatus: true,
        weight: true,
        multiLevelEpics: true,
        portfolioManagement: true,
        requirements: true,
        securityDashboard: true,
        complianceFramework: true,
    },
};
function normalizeTier(plan) {
    if (!plan)
        return 'free';
    const normalized = plan.toLowerCase();
    if (normalized.includes('ultimate') || normalized.includes('gold')) {
        return 'ultimate';
    }
    if (normalized.includes('premium') || normalized.includes('silver')) {
        return 'premium';
    }
    if (normalized.includes('bronze') || normalized.includes('starter')) {
        return 'premium';
    }
    return 'free';
}
function getFeaturesForTier(tier) {
    return { ...TIER_FEATURES[tier] };
}
function buildCacheKey(sessionId, namespacePath) {
    return `${sessionId}:${namespacePath}`;
}
function getCachedTier(sessionId, namespacePath) {
    const key = buildCacheKey(sessionId, namespacePath);
    const cached = namespaceTierCache.get(key);
    if (!cached)
        return null;
    const age = Date.now() - cached.cachedAt.getTime();
    if (age > NAMESPACE_TIER_CACHE_TTL_MS) {
        namespaceTierCache.delete(key);
        (0, logger_js_1.logDebug)('Namespace tier cache expired', {
            sessionId,
            namespacePath,
            ageMs: age,
        });
        return null;
    }
    return cached;
}
function setCachedTier(sessionId, namespacePath, tierInfo) {
    const key = buildCacheKey(sessionId, namespacePath);
    namespaceTierCache.set(key, tierInfo);
    (0, logger_js_1.logDebug)('Namespace tier cached', {
        sessionId,
        namespacePath,
        tier: tierInfo.tier,
    });
}
function clearNamespaceTierCache(sessionId) {
    if (sessionId) {
        const prefix = `${sessionId}:`;
        for (const key of namespaceTierCache.keys()) {
            if (key.startsWith(prefix)) {
                namespaceTierCache.delete(key);
            }
        }
        (0, logger_js_1.logDebug)('Namespace tier cache cleared for session', { sessionId });
    }
    else {
        namespaceTierCache.clear();
        (0, logger_js_1.logDebug)('All namespace tier caches cleared');
    }
}
async function queryNamespaceTier(namespacePath, token, baseUrl) {
    const graphqlUrl = `${baseUrl}/api/graphql`;
    try {
        const response = await (0, fetch_js_1.enhancedFetch)(graphqlUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                query: NAMESPACE_TIER_QUERY,
                variables: { fullPath: namespacePath },
            }),
            rateLimitBaseUrl: baseUrl,
        });
        if (!response.ok) {
            (0, logger_js_1.logWarn)('Failed to query namespace tier', {
                namespacePath,
                status: response.status,
            });
            return {
                tier: 'free',
                features: getFeaturesForTier('free'),
                cachedAt: new Date(),
            };
        }
        const result = (await response.json());
        if (result.errors?.length) {
            (0, logger_js_1.logWarn)('GraphQL errors querying namespace tier', {
                namespacePath,
                errors: result.errors.map((e) => e.message),
            });
        }
        const namespace = result.data?.namespace;
        const plan = namespace?.plan ?? namespace?.group?.plan ?? null;
        const tier = normalizeTier(plan);
        return {
            tier,
            features: getFeaturesForTier(tier),
            cachedAt: new Date(),
        };
    }
    catch (error) {
        (0, logger_js_1.logWarn)('Error querying namespace tier', {
            namespacePath,
            err: error instanceof Error ? error : new Error(String(error)),
        });
        return {
            tier: 'free',
            features: getFeaturesForTier('free'),
            cachedAt: new Date(),
        };
    }
}
async function getNamespaceTier(namespacePath) {
    const context = (0, token_context_js_1.getTokenContext)();
    if (!context) {
        (0, logger_js_1.logWarn)('No token context available for namespace tier detection');
        return {
            tier: 'free',
            features: getFeaturesForTier('free'),
            cachedAt: new Date(),
        };
    }
    const { sessionId, gitlabToken, apiUrl } = context;
    const baseUrl = apiUrl || config_1.GITLAB_BASE_URL;
    if (!baseUrl) {
        (0, logger_js_1.logWarn)('No base URL available for namespace tier detection');
        return {
            tier: 'free',
            features: getFeaturesForTier('free'),
            cachedAt: new Date(),
        };
    }
    const cached = getCachedTier(sessionId, namespacePath);
    if (cached) {
        (0, logger_js_1.logDebug)('Namespace tier from cache', {
            namespacePath,
            tier: cached.tier,
        });
        return cached;
    }
    const tierInfo = await queryNamespaceTier(namespacePath, gitlabToken, baseUrl);
    setCachedTier(sessionId, namespacePath, tierInfo);
    return tierInfo;
}
async function isFeatureAvailable(namespacePath, feature) {
    const tierInfo = await getNamespaceTier(namespacePath);
    return tierInfo.features[feature] ?? false;
}
function getNamespaceTierCacheMetrics() {
    const entriesBySession = new Map();
    for (const key of namespaceTierCache.keys()) {
        const separatorIndex = key.lastIndexOf(':');
        const sessionId = separatorIndex === -1 ? key : key.slice(0, separatorIndex);
        entriesBySession.set(sessionId, (entriesBySession.get(sessionId) ?? 0) + 1);
    }
    return {
        totalEntries: namespaceTierCache.size,
        entriesBySession,
    };
}
//# sourceMappingURL=NamespaceTierDetector.js.map