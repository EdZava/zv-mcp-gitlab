"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paths = exports.gitlab = void 0;
exports.toQuery = toQuery;
const fetch_1 = require("./fetch");
const idConversion_1 = require("./idConversion");
function buildQueryString(params) {
    if (!params)
        return '';
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null)
            continue;
        if (Array.isArray(value)) {
            for (const item of value) {
                searchParams.append(`${key}[]`, String(item));
            }
        }
        else {
            searchParams.set(key, String(value));
        }
    }
    const str = searchParams.toString();
    return str ? `?${str}` : '';
}
function encodeBody(body, contentType) {
    if (!body) {
        return { headers: {} };
    }
    if (body instanceof URLSearchParams) {
        return {
            body: body.toString(),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        };
    }
    if (body != null &&
        typeof body === 'object' &&
        typeof body.append === 'function' &&
        typeof body.getAll === 'function') {
        return {
            body: body,
            headers: {},
        };
    }
    if (contentType === 'json') {
        return {
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        };
    }
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(body)) {
        if (value !== undefined && value !== null) {
            params.set(key, String(value));
        }
    }
    return {
        body: params.toString(),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    };
}
async function request(method, path, options = {}) {
    const baseUrl = process.env.GITLAB_API_URL ?? 'https://gitlab.com';
    const queryString = buildQueryString(options.query);
    const url = `${baseUrl}/api/v4/${path}${queryString}`;
    const { body, headers } = encodeBody(options.body, options.contentType ?? 'form');
    const hasBody = !!body;
    const hasHeaders = Object.keys(headers).length > 0;
    let response;
    if (method === 'GET' && !hasBody && !hasHeaders) {
        response = await (0, fetch_1.enhancedFetch)(url);
    }
    else {
        const fetchOptions = {
            method,
            ...(hasBody && { body }),
            ...(hasHeaders && { headers }),
        };
        response = await (0, fetch_1.enhancedFetch)(url, fetchOptions);
    }
    if (!response.ok) {
        let errorDetails = '';
        try {
            if (typeof response.text === 'function') {
                const text = await response.text();
                if (text.trim()) {
                    const errorResponse = JSON.parse(text);
                    const parts = [];
                    if (errorResponse.message) {
                        if (typeof errorResponse.message === 'string') {
                            parts.push(errorResponse.message);
                        }
                        else if (typeof errorResponse.message === 'object' &&
                            'value' in errorResponse.message &&
                            Array.isArray(errorResponse.message.value)) {
                            parts.push(errorResponse.message.value.join(', '));
                        }
                        else {
                            parts.push(JSON.stringify(errorResponse.message));
                        }
                    }
                    if (errorResponse.error) {
                        parts.push(errorResponse.error);
                    }
                    errorDetails = parts.join(' - ');
                }
            }
        }
        catch {
        }
        throw new Error(`GitLab API error: ${response.status} ${response.statusText}${errorDetails ? ` - ${errorDetails}` : ''}`);
    }
    if (response.status === 204) {
        return undefined;
    }
    const data = (await response.json());
    return options.rawResponse ? data : (0, idConversion_1.cleanGidsFromObject)(data);
}
exports.gitlab = {
    get: (path, options) => request('GET', path, options),
    post: (path, options) => request('POST', path, options),
    put: (path, options) => request('PUT', path, options),
    delete: (path, options) => request('DELETE', path, options),
    patch: (path, options) => request('PATCH', path, options),
};
exports.paths = {
    encode: (path) => encodeURIComponent(path),
    project: (id) => `projects/${typeof id === 'number' ? id : encodeURIComponent(id)}`,
    group: (id) => `groups/${typeof id === 'number' ? id : encodeURIComponent(id)}`,
    namespace: (path, entityType) => `${entityType}/${encodeURIComponent(path)}`,
};
function toQuery(options, exclude = []) {
    const result = {};
    for (const [key, value] of Object.entries(options)) {
        if (!exclude.includes(key) && value !== undefined) {
            result[key] = value;
        }
    }
    return result;
}
exports.default = exports.gitlab;
//# sourceMappingURL=gitlab-api.js.map