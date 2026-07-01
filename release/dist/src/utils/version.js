"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseVersion = parseVersion;
function parseVersion(version) {
    if (!version || version === 'unknown')
        return 0;
    const match = version.match(/^(\d+)\.(\d+)/);
    if (!match)
        return 0;
    const major = parseInt(match[1], 10);
    const minor = parseInt(match[2], 10);
    return major * 100 + minor;
}
//# sourceMappingURL=version.js.map