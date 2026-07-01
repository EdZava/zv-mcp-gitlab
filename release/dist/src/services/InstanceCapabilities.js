"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveRequirement = resolveRequirement;
exports.meetsRequirement = meetsRequirement;
exports.isToolAvailable = isToolAvailable;
exports.getRestrictedParameters = getRestrictedParameters;
exports.getUnmetReason = getUnmetReason;
exports.getHighestTier = getHighestTier;
const version_1 = require("../utils/version");
const TIER_ORDER = { free: 0, premium: 1, ultimate: 2 };
const DEFAULT_TIER = 'free';
const DEFAULT_MIN_VERSION = '8.0';
const UNKNOWN_TOOL_MIN_VERSION = '15.0';
function isTierSufficient(actual, required) {
    const actualLevel = TIER_ORDER[actual] ?? 0;
    const requiredLevel = TIER_ORDER[required ?? DEFAULT_TIER] ?? 0;
    return actualLevel >= requiredLevel;
}
function resolveRequirement(reqs, action) {
    const override = action ? reqs.actions?.[action] : undefined;
    return override ?? reqs.default;
}
function meetsRequirement(req, caps) {
    if (req.requiresAdmin && caps.adminModeActive === false)
        return false;
    if (caps.version === 'unknown')
        return true;
    if ((0, version_1.parseVersion)(caps.version) < (0, version_1.parseVersion)(req.minVersion ?? DEFAULT_MIN_VERSION)) {
        return false;
    }
    if (!isTierSufficient(caps.tier, req.tier))
        return false;
    return true;
}
function isToolAvailable(reqs, caps, action) {
    if (!reqs) {
        return caps.version === 'unknown'
            ? true
            : (0, version_1.parseVersion)(caps.version) >= (0, version_1.parseVersion)(UNKNOWN_TOOL_MIN_VERSION);
    }
    return meetsRequirement(resolveRequirement(reqs, action), caps);
}
function getRestrictedParameters(reqs, caps) {
    if (!reqs?.parameters)
        return [];
    return Object.entries(reqs.parameters)
        .filter(([, req]) => !meetsRequirement(req, caps))
        .map(([name]) => name);
}
function getUnmetReason(reqs, caps, action) {
    if (reqs && resolveRequirement(reqs, action).requiresAdmin && caps.adminModeActive === false) {
        return 'Requires administrator privileges (admin mode must be active)';
    }
    if (caps.version === 'unknown')
        return null;
    if (!reqs) {
        return (0, version_1.parseVersion)(caps.version) >= (0, version_1.parseVersion)(UNKNOWN_TOOL_MIN_VERSION)
            ? null
            : `Requires GitLab ${UNKNOWN_TOOL_MIN_VERSION}+, current version is ${caps.version}`;
    }
    const req = resolveRequirement(reqs, action);
    if ((0, version_1.parseVersion)(caps.version) < (0, version_1.parseVersion)(req.minVersion ?? DEFAULT_MIN_VERSION)) {
        return `Requires GitLab ${req.minVersion ?? DEFAULT_MIN_VERSION}+, current version is ${caps.version}`;
    }
    if (!isTierSufficient(caps.tier, req.tier)) {
        return `Requires GitLab ${req.tier ?? DEFAULT_TIER} tier or higher, current tier is ${caps.tier}`;
    }
    return null;
}
function getHighestTier(reqs) {
    if (!reqs)
        return 'free';
    let highest = reqs.default.tier ?? 'free';
    if (reqs.actions) {
        for (const req of Object.values(reqs.actions)) {
            const tier = req.tier ?? 'free';
            if ((TIER_ORDER[tier] ?? 0) > (TIER_ORDER[highest] ?? 0)) {
                highest = tier;
            }
        }
    }
    return highest;
}
//# sourceMappingURL=InstanceCapabilities.js.map