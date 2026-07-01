"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transliterateText = transliterateText;
exports.hasNonLatin = hasNonLatin;
exports.analyzeQuery = analyzeQuery;
exports.smartUserSearch = smartUserSearch;
const fetch_1 = require("./fetch");
const transliteration_1 = require("transliteration");
function transliterateText(text) {
    return (0, transliteration_1.transliterate)(text);
}
function hasNonLatin(text) {
    return /[^\u0000-\u007F\u0080-\u00FF]/.test(text);
}
function analyzeQuery(query) {
    const trimmedQuery = query.trim();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedQuery)) {
        return {
            type: 'email',
            hasTransliteration: false,
            originalQuery: trimmedQuery,
        };
    }
    if (trimmedQuery.length >= 3 && trimmedQuery.length <= 30 && !/\s/.test(trimmedQuery)) {
        const hasTransliterationNeeded = hasNonLatin(trimmedQuery);
        return {
            type: 'username',
            hasTransliteration: hasTransliterationNeeded,
            originalQuery: trimmedQuery,
            transliteratedQuery: hasTransliterationNeeded ? transliterateText(trimmedQuery) : undefined,
        };
    }
    const hasTransliterationNeeded = hasNonLatin(trimmedQuery);
    return {
        type: 'name',
        hasTransliteration: hasTransliterationNeeded,
        originalQuery: trimmedQuery,
        transliteratedQuery: hasTransliterationNeeded ? transliterateText(trimmedQuery) : undefined,
    };
}
async function callUsersAPI(params) {
    const queryParams = new URLSearchParams();
    const defaultParams = {
        active: true,
        humans: true,
        ...params,
    };
    Object.entries(defaultParams).forEach(([key, value]) => {
        if (value !== undefined) {
            queryParams.set(key, String(value));
        }
    });
    const apiUrl = `${process.env.GITLAB_API_URL}/api/v4/users?${queryParams}`;
    const response = await (0, fetch_1.enhancedFetch)(apiUrl);
    if (!response.ok) {
        throw new Error(`GitLab API error: ${response.status} ${response.statusText}`);
    }
    const users = (await response.json());
    return Array.isArray(users) ? users : [];
}
async function smartUserSearch(query, additionalParams = {}) {
    const pattern = analyzeQuery(query);
    const searchPhases = [];
    let users = [];
    let totalApiCalls = 0;
    let targetParams;
    switch (pattern.type) {
        case 'email':
            targetParams = { public_email: pattern.originalQuery, ...additionalParams };
            break;
        case 'username':
            targetParams = { username: pattern.originalQuery, ...additionalParams };
            break;
        case 'name':
            targetParams = { search: pattern.originalQuery, ...additionalParams };
            break;
    }
    try {
        users = await callUsersAPI(targetParams);
        totalApiCalls++;
        searchPhases.push({
            phase: `targeted-${pattern.type}`,
            params: targetParams,
            resultCount: users.length,
        });
        if (users.length > 0) {
            return {
                users,
                searchMetadata: {
                    query,
                    pattern,
                    searchPhases,
                    totalApiCalls,
                },
            };
        }
        if (pattern.type !== 'name') {
            const broadParams = { search: pattern.originalQuery, ...additionalParams };
            users = await callUsersAPI(broadParams);
            totalApiCalls++;
            searchPhases.push({
                phase: 'broad-search',
                params: broadParams,
                resultCount: users.length,
            });
            if (users.length > 0) {
                return {
                    users,
                    searchMetadata: {
                        query,
                        pattern,
                        searchPhases,
                        totalApiCalls,
                    },
                };
            }
        }
        if (pattern.hasTransliteration && pattern.transliteratedQuery) {
            const translitParams = { search: pattern.transliteratedQuery, ...additionalParams };
            users = await callUsersAPI(translitParams);
            totalApiCalls++;
            searchPhases.push({
                phase: 'transliteration',
                params: translitParams,
                resultCount: users.length,
            });
        }
    }
    catch (error) {
        console.error('Smart user search error:', error);
    }
    return {
        users,
        searchMetadata: {
            query,
            pattern,
            searchPhases,
            totalApiCalls,
        },
    };
}
//# sourceMappingURL=smart-user-search.js.map