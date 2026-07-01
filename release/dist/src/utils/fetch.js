"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitLabTimeoutError = exports.DEFAULT_HEADERS = void 0;
exports.getGitLabBaseUrl = getGitLabBaseUrl;
exports.getAuthHeaders = getAuthHeaders;
exports.createFetchOptions = createFetchOptions;
exports.extractBaseUrl = extractBaseUrl;
exports.enhancedFetch = enhancedFetch;
exports.resetDispatcherCache = resetDispatcherCache;
const fs = __importStar(require("fs"));
const logger_1 = require("../logger");
const config_1 = require("../config");
const index_1 = require("../oauth/index");
const index_2 = require("../logging/index");
const InstanceRegistry_js_1 = require("../services/InstanceRegistry.js");
const undici = require('undici');
function loadCookieHeader() {
    if (!config_1.GITLAB_AUTH_COOKIE_PATH) {
        return null;
    }
    try {
        const cookieString = fs.readFileSync(config_1.GITLAB_AUTH_COOKIE_PATH, 'utf-8');
        const cookies = [];
        cookieString.split('\n').forEach((line) => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const parts = trimmed.split('\t');
                if (parts.length >= 7) {
                    const name = parts[5];
                    const value = parts[6];
                    cookies.push(`${name}=${value}`);
                }
            }
        });
        return cookies.length > 0 ? cookies.join('; ') : null;
    }
    catch (error) {
        (0, logger_1.logWarn)('Failed to load GitLab authentication cookies', { err: error });
        return null;
    }
}
function loadCACertificate() {
    if (!config_1.GITLAB_CA_CERT_PATH) {
        return undefined;
    }
    try {
        const ca = fs.readFileSync(config_1.GITLAB_CA_CERT_PATH);
        (0, logger_1.logInfo)(`Custom CA certificate loaded from ${config_1.GITLAB_CA_CERT_PATH}`);
        return ca;
    }
    catch (error) {
        (0, logger_1.logWarn)(`Failed to load CA certificate from ${config_1.GITLAB_CA_CERT_PATH}`, { err: error });
        return undefined;
    }
}
function isSocksProxy(url) {
    return url.startsWith('socks4://') || url.startsWith('socks5://') || url.startsWith('socks://');
}
function createDispatcher() {
    const proxyUrl = config_1.HTTPS_PROXY ?? config_1.HTTP_PROXY;
    const tlsOptions = {};
    if (config_1.SKIP_TLS_VERIFY || config_1.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
        tlsOptions.rejectUnauthorized = false;
        if (config_1.SKIP_TLS_VERIFY) {
            (0, logger_1.logWarn)('TLS certificate verification disabled via SKIP_TLS_VERIFY');
        }
        if (config_1.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
            (0, logger_1.logWarn)('TLS certificate verification disabled via NODE_TLS_REJECT_UNAUTHORIZED');
        }
    }
    const ca = loadCACertificate();
    if (ca) {
        tlsOptions.ca = ca;
    }
    const hasTlsConfig = Object.keys(tlsOptions).length > 0;
    if (proxyUrl && isSocksProxy(proxyUrl)) {
        (0, logger_1.logInfo)(`Using SOCKS proxy: ${proxyUrl}`);
        (0, logger_1.logWarn)('SOCKS proxy not supported with native fetch. Consider HTTP/HTTPS proxy.');
        return undefined;
    }
    if (proxyUrl) {
        (0, logger_1.logInfo)(`Using proxy: ${proxyUrl}`);
        return new undici.ProxyAgent({
            uri: proxyUrl,
            requestTls: { ...(hasTlsConfig ? tlsOptions : {}), timeout: config_1.CONNECT_TIMEOUT_MS },
            proxyTls: { timeout: config_1.CONNECT_TIMEOUT_MS },
            headersTimeout: config_1.HEADERS_TIMEOUT_MS,
            bodyTimeout: config_1.BODY_TIMEOUT_MS,
        });
    }
    const connectOptions = {
        ...tlsOptions,
        timeout: config_1.CONNECT_TIMEOUT_MS,
        keepAlive: true,
        keepAliveInitialDelay: 30000,
    };
    return new undici.Agent({
        connect: connectOptions,
        headersTimeout: config_1.HEADERS_TIMEOUT_MS,
        bodyTimeout: config_1.BODY_TIMEOUT_MS,
    });
}
let cachedDispatcher;
let dispatcherInitialized = false;
function getDispatcher() {
    if (!dispatcherInitialized) {
        cachedDispatcher = createDispatcher();
        dispatcherInitialized = true;
    }
    return cachedDispatcher;
}
exports.DEFAULT_HEADERS = {
    'User-Agent': 'GitLab MCP Server',
    'Content-Type': 'application/json',
    Accept: 'application/json',
};
function getGitLabToken() {
    if ((0, index_1.isOAuthEnabled)()) {
        const context = (0, index_1.getTokenContext)();
        if (!context) {
            (0, logger_1.logWarn)('OAuth mode: no token context available - API call will fail with 401');
        }
        else if (!context.gitlabToken) {
            (0, logger_1.logWarn)('OAuth mode: token context exists but no gitlabToken set');
        }
        else {
            (0, logger_1.logDebug)('OAuth mode: using token from context', { userId: context.gitlabUserId });
        }
        return context?.gitlabToken;
    }
    return config_1.GITLAB_TOKEN;
}
function getGitLabBaseUrl() {
    if ((0, index_1.isOAuthEnabled)()) {
        const apiUrl = (0, index_1.getGitLabApiUrlFromContext)();
        if (apiUrl) {
            return apiUrl;
        }
        (0, logger_1.logWarn)('OAuth mode: no API URL in context, falling back to global config');
    }
    return config_1.GITLAB_BASE_URL ?? 'https://gitlab.com';
}
function getAuthHeaders() {
    const token = getGitLabToken();
    if (!token)
        return {};
    if ((0, index_1.isOAuthEnabled)()) {
        return { Authorization: `Bearer ${token}` };
    }
    return { 'PRIVATE-TOKEN': token };
}
function createFetchOptions() {
    const dispatcher = getDispatcher();
    return dispatcher ? { dispatcher } : {};
}
class GitLabTimeoutError extends Error {
    phase;
    timeoutMs;
    constructor(phase, timeoutMs, cause) {
        super(`GitLab API timeout after ${timeoutMs}ms (${phase} phase)`);
        this.name = 'GitLabTimeoutError';
        this.phase = phase;
        this.timeoutMs = timeoutMs;
        this.cause = cause;
    }
}
exports.GitLabTimeoutError = GitLabTimeoutError;
function sleep(ms, signal) {
    return new Promise((resolve, reject) => {
        const getAbortError = () => {
            const reason = signal?.reason;
            if (reason instanceof Error) {
                if (reason.name !== 'AbortError') {
                    reason.name = 'AbortError';
                }
                return reason;
            }
            const message = reason !== undefined ? String(reason) : 'Aborted';
            return new DOMException(message, 'AbortError');
        };
        if (signal?.aborted) {
            reject(getAbortError());
            return;
        }
        let abortHandler;
        const timeoutId = setTimeout(() => {
            if (abortHandler) {
                signal?.removeEventListener('abort', abortHandler);
            }
            resolve();
        }, ms);
        if (signal) {
            abortHandler = () => {
                clearTimeout(timeoutId);
                reject(getAbortError());
            };
            signal.addEventListener('abort', abortHandler, { once: true });
        }
    });
}
function redactUrlForLogging(url) {
    try {
        const parsed = new URL(url);
        if (parsed.username)
            parsed.username = '[REDACTED]';
        if (parsed.password)
            parsed.password = '[REDACTED]';
        parsed.pathname = parsed.pathname.replace(/\/uploads\/([^/]+)\//gi, '/uploads/[REDACTED]/');
        parsed.pathname = parsed.pathname.replace(/\/([a-f0-9]{32,})(\/|$)/gi, '/[REDACTED]$2');
        const sensitiveParams = [
            'private_token',
            'access_token',
            'oauth_token',
            'token',
            'secret',
            'key',
            'password',
            'auth',
        ];
        for (const param of sensitiveParams) {
            if (parsed.searchParams.has(param)) {
                parsed.searchParams.set(param, '[REDACTED]');
            }
        }
        return parsed.toString();
    }
    catch {
        const schemeMatch = url.match(/^(https?):\/\//);
        if (!schemeMatch)
            return '[INVALID_URL]';
        const afterScheme = url.slice(schemeMatch[0].length);
        const atIndex = afterScheme.indexOf('@');
        const hostPart = atIndex >= 0 ? afterScheme.slice(atIndex + 1) : afterScheme;
        const hostMatch = hostPart.match(/^([^/:]+)/);
        return hostMatch ? `${schemeMatch[1]}://[REDACTED_HOST]/[URL_PARSE_ERROR]` : '[INVALID_URL]';
    }
}
function isRetryableError(error) {
    if (!(error instanceof Error))
        return false;
    if (error.name === 'AbortError') {
        return false;
    }
    if (error instanceof GitLabTimeoutError) {
        return true;
    }
    const underlying = error.cause instanceof Error ? error.cause : error;
    const message = underlying.message.toLowerCase();
    if (underlying instanceof GitLabTimeoutError) {
        return true;
    }
    if (message.includes('econnrefused') ||
        message.includes('econnreset') ||
        message.includes('etimedout') ||
        message.includes('enotfound') ||
        message.includes('network')) {
        return true;
    }
    return false;
}
function isRetryableStatus(status) {
    return status >= 500 || status === 429;
}
function calculateBackoffDelay(attempt) {
    const delay = config_1.API_RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
    return Math.min(delay, config_1.API_RETRY_MAX_DELAY_MS);
}
function parseRetryAfter(retryAfter) {
    const trimmed = retryAfter.trim();
    if (/^\d+$/.test(trimmed)) {
        const seconds = parseInt(trimmed, 10);
        if (seconds >= 0) {
            return seconds * 1000;
        }
    }
    const dateMs = Date.parse(retryAfter);
    if (!isNaN(dateMs)) {
        const delayMs = dateMs - Date.now();
        return delayMs > 0 ? delayMs : null;
    }
    return null;
}
async function doFetch(url, options = {}, instanceDispatcher, skipAuth = false) {
    const dispatcher = instanceDispatcher ?? getDispatcher();
    const cookieHeader = skipAuth ? null : loadCookieHeader();
    const isFormData = options.body != null &&
        typeof options.body === 'object' &&
        typeof options.body.append === 'function' &&
        typeof options.body.getAll === 'function';
    const baseHeaders = isFormData
        ? { 'User-Agent': exports.DEFAULT_HEADERS['User-Agent'], Accept: exports.DEFAULT_HEADERS.Accept }
        : { ...exports.DEFAULT_HEADERS };
    const h = new Headers(baseHeaders);
    if (!skipAuth) {
        for (const [key, value] of Object.entries(getAuthHeaders())) {
            h.set(key, value);
        }
    }
    if (options.headers) {
        new Headers(options.headers).forEach((value, key) => {
            h.set(key, value);
        });
    }
    if (cookieHeader && !h.has('cookie')) {
        h.set('Cookie', cookieHeader);
    }
    const headers = {};
    h.forEach((value, key) => {
        headers[key] = value;
    });
    const method = (options.method ?? 'GET').toUpperCase();
    const safeUrl = redactUrlForLogging(url);
    (0, logger_1.logDebug)('Starting GitLab API request', { url: safeUrl, method });
    const fetchOptions = {
        ...options,
        headers,
        signal: options.signal,
    };
    if (dispatcher) {
        fetchOptions.dispatcher = dispatcher;
    }
    const startTime = Date.now();
    const requestTracker = (0, index_2.getRequestTracker)();
    try {
        const response = await undici.fetch(url, fetchOptions);
        const duration = Date.now() - startTime;
        (0, logger_1.logDebug)('GitLab API request completed', {
            url: safeUrl,
            method,
            status: response.status,
            duration,
        });
        requestTracker.setGitLabResponseForCurrentRequest(response.status, duration);
        return response;
    }
    catch (error) {
        const duration = Date.now() - startTime;
        if (error instanceof Error && error.name === 'AbortError') {
            (0, logger_1.logDebug)('GitLab API request aborted by caller', {
                url: safeUrl,
                method,
                duration,
            });
            throw error;
        }
        if (error instanceof Error) {
            const underlying = error.cause instanceof Error ? error.cause : error;
            const errName = underlying.constructor?.name ?? '';
            const msg = underlying.message.toLowerCase();
            if (errName === 'HeadersTimeoutError' || msg.includes('headers timeout')) {
                (0, logger_1.logWarn)('GitLab API headers timeout', {
                    url: safeUrl,
                    method,
                    timeout: config_1.HEADERS_TIMEOUT_MS,
                    duration,
                });
                requestTracker.setGitLabResponseForCurrentRequest('timeout', duration);
                throw new GitLabTimeoutError('headers', config_1.HEADERS_TIMEOUT_MS, underlying);
            }
            if (errName === 'BodyTimeoutError' || msg.includes('body timeout')) {
                (0, logger_1.logWarn)('GitLab API body timeout', {
                    url: safeUrl,
                    method,
                    timeout: config_1.BODY_TIMEOUT_MS,
                    duration,
                });
                requestTracker.setGitLabResponseForCurrentRequest('timeout', duration);
                throw new GitLabTimeoutError('body', config_1.BODY_TIMEOUT_MS, underlying);
            }
            if (errName === 'ConnectTimeoutError' || msg.includes('connect timeout')) {
                (0, logger_1.logWarn)('GitLab API connect timeout', {
                    url: safeUrl,
                    method,
                    timeout: config_1.CONNECT_TIMEOUT_MS,
                    duration,
                });
                requestTracker.setGitLabResponseForCurrentRequest('timeout', duration);
                throw new GitLabTimeoutError('connect', config_1.CONNECT_TIMEOUT_MS, underlying);
            }
        }
        (0, logger_1.logWarn)('GitLab API request failed', {
            url: safeUrl,
            method,
            err: error instanceof Error ? error : new Error(String(error)),
            duration,
        });
        requestTracker.setGitLabResponseForCurrentRequest('error', duration);
        throw error;
    }
}
function extractBaseUrl(url) {
    try {
        const parsed = new URL(url);
        let basePath = parsed.pathname || '/';
        const apiSuffixes = ['/api/v4', '/api/graphql'];
        outerLoop: for (const suffix of apiSuffixes) {
            let searchPos = 0;
            while (searchPos < basePath.length) {
                const suffixIndex = basePath.indexOf(suffix, searchPos);
                if (suffixIndex === -1)
                    break;
                const afterSuffix = basePath.charAt(suffixIndex + suffix.length);
                if (afterSuffix === '' || afterSuffix === '/') {
                    basePath = suffixIndex === 0 ? '/' : basePath.slice(0, suffixIndex);
                    break outerLoop;
                }
                searchPos = suffixIndex + 1;
            }
        }
        if (!basePath.startsWith('/')) {
            basePath = `/${basePath}`;
        }
        if (basePath.length > 1 && basePath.endsWith('/')) {
            basePath = basePath.slice(0, -1);
        }
        const origin = `${parsed.protocol}//${parsed.host}`;
        return basePath === '/' ? origin : `${origin}${basePath}`;
    }
    catch {
        return undefined;
    }
}
async function enhancedFetch(url, options = {}) {
    const method = (options.method ?? 'GET').toUpperCase();
    const isIdempotent = method === 'GET' || method === 'HEAD' || method === 'OPTIONS';
    const safeUrl = redactUrlForLogging(url);
    const shouldRetry = options.retry ?? (config_1.API_RETRY_ENABLED && isIdempotent);
    const maxRetries = options.maxRetries ?? config_1.API_RETRY_MAX_ATTEMPTS;
    const shouldRateLimit = options.rateLimit !== false;
    const { retry: _retry, maxRetries: _maxRetries, rateLimit: _rateLimit, rateLimitBaseUrl: _rateLimitBaseUrl, skipAuth: _skipAuth, ...fetchOptions } = options;
    let releaseSlot;
    let instanceDispatcher;
    const registry = InstanceRegistry_js_1.InstanceRegistry.getInstance();
    if (registry.isInitialized()) {
        const baseUrl = options.rateLimitBaseUrl ?? extractBaseUrl(url) ?? getGitLabBaseUrl();
        instanceDispatcher = registry.getDispatcher(baseUrl);
        if (instanceDispatcher &&
            typeof instanceDispatcher === 'object' &&
            'stats' in instanceDispatcher) {
            const stats = instanceDispatcher.stats;
            if (stats.queued > 0) {
                (0, logger_1.logWarn)('Connection pool pressure: requests queuing', {
                    queued: stats.queued,
                    running: stats.running,
                    size: stats.size,
                    url: safeUrl,
                });
            }
        }
        if (shouldRateLimit) {
            releaseSlot = await registry.acquireSlot(baseUrl);
        }
    }
    try {
        const unauthenticated = _skipAuth === true;
        if (!shouldRetry || maxRetries <= 0) {
            return await doFetch(url, fetchOptions, instanceDispatcher, unauthenticated);
        }
        let lastError = null;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const response = await doFetch(url, fetchOptions, instanceDispatcher, unauthenticated);
                if (isRetryableStatus(response.status) && attempt < maxRetries) {
                    let retryDelay = calculateBackoffDelay(attempt);
                    const retryAfter = response.headers.get('Retry-After');
                    if (retryAfter && response.status === 429) {
                        const parsedDelay = parseRetryAfter(retryAfter);
                        if (parsedDelay !== null) {
                            retryDelay = Math.min(parsedDelay, config_1.API_RETRY_MAX_DELAY_MS);
                        }
                    }
                    (0, logger_1.logWarn)('Retrying request after server error', {
                        url: safeUrl,
                        method,
                        status: response.status,
                        attempt: attempt + 1,
                        maxRetries,
                        retryDelay,
                    });
                    try {
                        await response.body?.cancel();
                    }
                    catch {
                    }
                    await sleep(retryDelay, fetchOptions.signal ?? undefined);
                    continue;
                }
                return response;
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                if (isRetryableError(error) && attempt < maxRetries) {
                    const retryDelay = calculateBackoffDelay(attempt);
                    (0, logger_1.logWarn)('Retrying request after error', {
                        url: safeUrl,
                        method,
                        error: lastError.message,
                        attempt: attempt + 1,
                        maxRetries,
                        retryDelay,
                    });
                    await sleep(retryDelay, fetchOptions.signal ?? undefined);
                    continue;
                }
                throw lastError;
            }
        }
        throw lastError ?? new Error('Unexpected: retry loop exited without result');
    }
    finally {
        if (releaseSlot) {
            releaseSlot();
        }
    }
}
function resetDispatcherCache() {
    cachedDispatcher = undefined;
    dispatcherInitialized = false;
}
//# sourceMappingURL=fetch.js.map