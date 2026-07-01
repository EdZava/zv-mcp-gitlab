"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeInstanceUrl = normalizeInstanceUrl;
function normalizeInstanceUrl(url) {
    if (!url)
        return url;
    const trimTrailingSlashes = (value) => {
        let end = value.length - 1;
        while (end >= 0 && value.codePointAt(end) === 47) {
            end -= 1;
        }
        return end < value.length - 1 ? value.slice(0, end + 1) : value;
    };
    let normalized = trimTrailingSlashes(url);
    if (normalized.endsWith('/api/v4')) {
        normalized = normalized.slice(0, -7);
    }
    else if (normalized.endsWith('/api/graphql')) {
        normalized = normalized.slice(0, -12);
    }
    normalized = trimTrailingSlashes(normalized);
    try {
        const u = new URL(normalized);
        let pathname = trimTrailingSlashes(u.pathname);
        if (pathname.endsWith('/api/v4')) {
            pathname = pathname.slice(0, -7);
        }
        else if (pathname.endsWith('/api/graphql')) {
            pathname = pathname.slice(0, -12);
        }
        pathname = trimTrailingSlashes(pathname);
        return `${u.origin}${pathname}`;
    }
    catch {
        return normalized;
    }
}
//# sourceMappingURL=url.js.map