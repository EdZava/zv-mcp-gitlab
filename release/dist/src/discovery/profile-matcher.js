"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchProfileByHost = matchProfileByHost;
exports.findProfileByHost = findProfileByHost;
const profiles_1 = require("../profiles");
const logger_1 = require("../logger");
function matchProfileByHost(host, profiles) {
    const normalizedHost = host.toLowerCase();
    const userProfiles = profiles.filter((p) => typeof p.host === 'string' && !p.isPreset);
    for (const profile of userProfiles) {
        const profileHost = profile.host.toLowerCase();
        if (normalizedHost === profileHost) {
            (0, logger_1.logDebug)('Matched profile by exact host', {
                host,
                profile: profile.name,
                matchType: 'exact',
            });
            return {
                profileName: profile.name,
                profile,
                matchType: 'exact',
            };
        }
    }
    for (const profile of userProfiles) {
        const profileHost = profile.host.toLowerCase();
        if (normalizedHost.endsWith(`.${profileHost}`)) {
            (0, logger_1.logDebug)('Matched profile by subdomain', {
                host,
                profile: profile.name,
                matchType: 'subdomain',
            });
            return {
                profileName: profile.name,
                profile,
                matchType: 'subdomain',
            };
        }
    }
    (0, logger_1.logDebug)('No profile match found', { host, availableHosts: userProfiles.map((p) => p.host) });
    return null;
}
async function findProfileByHost(host, loader) {
    const profileLoader = loader ?? new profiles_1.ProfileLoader();
    const profiles = await profileLoader.listProfiles();
    return matchProfileByHost(host, profiles);
}
//# sourceMappingURL=profile-matcher.js.map