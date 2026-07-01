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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToolsListChangedNotification = sendToolsListChangedNotification;
exports.startServer = startServer;
const sse_js_1 = require("@modelcontextprotocol/sdk/server/sse.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const streamableHttp_js_1 = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
const express_1 = __importDefault(require("express"));
const crypto = __importStar(require("crypto"));
const http = __importStar(require("http"));
const https = __importStar(require("https"));
const fs = __importStar(require("fs"));
const config_1 = require("./config");
const logger_1 = require("./logger");
const session_manager_1 = require("./session-manager");
const index_1 = require("./oauth/index");
const index_2 = require("./middleware/index");
const index_js_1 = require("./dashboard/index.js");
const request_logger_1 = require("./utils/request-logger");
const index_3 = require("./logging/index");
function resolveCloseReason(socketError, res) {
    if (socketError)
        return `peer_reset:${socketError}`;
    if (res.writableFinished)
        return 'normal_close';
    if (res.locals?.writeTimedOut)
        return 'write_timeout';
    if (res.locals?.heartbeatFailed)
        return 'heartbeat_failed';
    if (res.destroyed)
        return 'destroyed';
    return 'client_disconnect';
}
const KEEP_ALIVE_TIMEOUT_MS = Math.min(config_1.HTTP_KEEPALIVE_TIMEOUT_MS, config_1.MAX_SAFE_TIMEOUT_MS - 5000);
async function sendToolsListChangedNotification() {
    try {
        const sessionManager = (0, session_manager_1.getSessionManager)();
        await sessionManager.broadcastToolsListChanged();
    }
    catch (error) {
        (0, logger_1.logError)('Failed to broadcast tools/list_changed notification', { err: error });
    }
}
function registerOAuthEndpoints(app) {
    app.get('/.well-known/oauth-authorization-server', index_1.metadataHandler);
    app.get('/.well-known/oauth-protected-resource', index_1.protectedResourceHandler);
    app.get('/authorize', index_1.authorizeHandler);
    app.get('/oauth/poll', index_1.pollHandler);
    app.get('/oauth/callback', index_1.callbackHandler);
    app.post('/token', express_1.default.urlencoded({ extended: true }), index_1.tokenHandler);
    app.post('/register', express_1.default.json(), index_1.registerHandler);
    (0, logger_1.logInfo)('OAuth endpoints registered');
}
function isTLSEnabled() {
    return !!(config_1.SSL_CERT_PATH && config_1.SSL_KEY_PATH);
}
function loadTLSOptions() {
    if (!config_1.SSL_CERT_PATH || !config_1.SSL_KEY_PATH) {
        return undefined;
    }
    try {
        const options = {
            cert: fs.readFileSync(config_1.SSL_CERT_PATH),
            key: fs.readFileSync(config_1.SSL_KEY_PATH),
        };
        if (config_1.SSL_CA_PATH) {
            options.ca = fs.readFileSync(config_1.SSL_CA_PATH);
            (0, logger_1.logInfo)('CA certificate loaded', { path: config_1.SSL_CA_PATH });
        }
        if (config_1.SSL_PASSPHRASE) {
            options.passphrase = config_1.SSL_PASSPHRASE;
        }
        (0, logger_1.logInfo)('TLS certificates loaded', { path: config_1.SSL_CERT_PATH });
        return options;
    }
    catch (error) {
        (0, logger_1.logError)('Failed to load TLS certificates', { err: error });
        throw new Error(`Failed to load TLS certificates: ${String(error)}`, { cause: error });
    }
}
function configureTrustProxy(app) {
    if (!config_1.TRUST_PROXY) {
        return;
    }
    let trustValue = config_1.TRUST_PROXY;
    if (config_1.TRUST_PROXY === 'true' || config_1.TRUST_PROXY === '1') {
        trustValue = true;
    }
    else if (config_1.TRUST_PROXY === 'false' || config_1.TRUST_PROXY === '0') {
        trustValue = false;
    }
    else if (!isNaN(Number(config_1.TRUST_PROXY))) {
        trustValue = Number(config_1.TRUST_PROXY);
    }
    app.set('trust proxy', trustValue);
    (0, logger_1.logInfo)('Trust proxy configured', { trustValue: String(trustValue) });
}
function configureServerTimeouts(server) {
    server.keepAliveTimeout = KEEP_ALIVE_TIMEOUT_MS;
    server.headersTimeout = KEEP_ALIVE_TIMEOUT_MS + 5000;
    server.timeout = 0;
    server.on('connection', (socket) => {
        socket.setKeepAlive(true, 30000);
        socket.setNoDelay(true);
    });
    (0, logger_1.logInfo)('HTTP server timeouts configured for SSE streaming', {
        keepAliveTimeout: server.keepAliveTimeout,
        headersTimeout: server.headersTimeout,
        timeout: server.timeout,
    });
}
function startHttpServer(app, callback) {
    const tlsOptions = loadTLSOptions();
    if (tlsOptions) {
        const httpsServer = https.createServer(tlsOptions, app);
        configureServerTimeouts(httpsServer);
        httpsServer.listen(Number(config_1.PORT), config_1.HOST, callback);
    }
    else {
        const httpServer = http.createServer(app);
        configureServerTimeouts(httpServer);
        httpServer.listen(Number(config_1.PORT), config_1.HOST, callback);
    }
}
function getProtocol() {
    return isTLSEnabled() ? 'https' : 'http';
}
const HEARTBEAT_DRAIN_TIMEOUT_MS = 10000;
function startSseHeartbeat(res, sessionId) {
    let waitingForDrain = false;
    let pendingDrainTimeout;
    const drainListener = () => {
        if (pendingDrainTimeout) {
            clearTimeout(pendingDrainTimeout);
            pendingDrainTimeout = undefined;
        }
        waitingForDrain = false;
        (0, logger_1.logDebug)('SSE heartbeat drain recovered', { sessionId });
    };
    const interval = setInterval(() => {
        if (waitingForDrain)
            return;
        try {
            if (res.writableEnded || res.destroyed) {
                clearInterval(interval);
                if (pendingDrainTimeout) {
                    clearTimeout(pendingDrainTimeout);
                    pendingDrainTimeout = undefined;
                }
                res.removeListener('drain', drainListener);
                return;
            }
            const ok = res.write(': ping\n\n');
            if (!ok) {
                waitingForDrain = true;
                pendingDrainTimeout = setTimeout(() => {
                    pendingDrainTimeout = undefined;
                    waitingForDrain = false;
                    res.removeListener('drain', drainListener);
                    (0, logger_1.logWarn)('SSE heartbeat drain timeout — destroying dead connection', {
                        sessionId,
                        drainTimeoutMs: HEARTBEAT_DRAIN_TIMEOUT_MS,
                        reason: 'heartbeat_drain_timeout',
                    });
                    clearInterval(interval);
                    res.locals = res.locals ?? {};
                    res.locals.heartbeatFailed = true;
                    if (!res.destroyed) {
                        res.destroy();
                    }
                }, HEARTBEAT_DRAIN_TIMEOUT_MS);
                res.once('drain', drainListener);
            }
        }
        catch (err) {
            const errMsg = err instanceof Error ? err.message : String(err);
            (0, logger_1.logWarn)('SSE heartbeat write error — connection likely dead', {
                sessionId,
                error: errMsg,
                reason: 'heartbeat_write_error',
            });
            clearInterval(interval);
            if (pendingDrainTimeout) {
                clearTimeout(pendingDrainTimeout);
                pendingDrainTimeout = undefined;
            }
            res.removeListener('drain', drainListener);
        }
    }, config_1.SSE_HEARTBEAT_MS);
    (0, logger_1.logDebug)('SSE heartbeat started', { sessionId, intervalMs: config_1.SSE_HEARTBEAT_MS });
    return () => {
        clearInterval(interval);
        if (pendingDrainTimeout) {
            clearTimeout(pendingDrainTimeout);
            pendingDrainTimeout = undefined;
        }
        res.removeListener('drain', drainListener);
        (0, logger_1.logDebug)('SSE heartbeat stopped', { sessionId });
    };
}
function determineTransportMode() {
    const args = process.argv.slice(2);
    (0, logger_1.logInfo)('Transport mode detection', { args, PORT: config_1.PORT });
    if (args.includes('stdio')) {
        (0, logger_1.logInfo)('Selected stdio mode (explicit argument)');
        return 'stdio';
    }
    if (process.env.PORT) {
        (0, logger_1.logInfo)('Selected dual transport mode (SSE + StreamableHTTP) - PORT environment variable detected');
        return 'dual';
    }
    (0, logger_1.logInfo)('Selected stdio mode (no PORT environment variable)');
    return 'stdio';
}
async function startServer() {
    const oauthConfig = (0, index_1.loadOAuthConfig)();
    if (oauthConfig) {
        (0, logger_1.logInfo)('Starting in OAuth mode (per-user authentication)');
        (0, logger_1.logInfo)('OAuth client ID configured', { clientId: oauthConfig.gitlabClientId });
    }
    else if (process.env.GITLAB_TOKEN) {
        (0, logger_1.logInfo)('Starting in static token mode (shared GITLAB_TOKEN)');
    }
    else {
        (0, logger_1.logInfo)('Starting without authentication - tools/list will work, but tool calls require GITLAB_TOKEN');
    }
    (0, logger_1.logInfo)('Authentication mode', { mode: (0, index_1.getAuthModeDescription)() });
    if (oauthConfig) {
        await index_1.sessionStore.initialize();
    }
    const sessionManager = (0, session_manager_1.getSessionManager)();
    sessionManager.start();
    const requestTracker = (0, index_3.getRequestTracker)();
    const connectionTracker = (0, index_3.getConnectionTracker)();
    const useCondensedLogging = config_1.LOG_FORMAT === 'condensed';
    requestTracker.setEnabled(useCondensedLogging);
    connectionTracker.setEnabled(useCondensedLogging);
    (0, logger_1.logInfo)('Access log format', { logFormat: config_1.LOG_FORMAT });
    if (config_1.LOG_FILTER.length > 0) {
        (0, logger_1.logInfo)('Access log filter rules active', { count: config_1.LOG_FILTER.length });
    }
    const transportMode = determineTransportMode();
    switch (transportMode) {
        case 'stdio': {
            const transport = new stdio_js_1.StdioServerTransport();
            await sessionManager.createSession(session_manager_1.STDIO_SESSION_ID, transport);
            (0, logger_1.logInfo)('GitLab MCP Server running on stdio');
            break;
        }
        case 'dual': {
            (0, logger_1.logInfo)('Setting up dual transport mode (SSE + StreamableHTTP)...');
            const app = (0, express_1.default)();
            app.use((0, index_2.responseWriteTimeoutMiddleware)());
            app.use(express_1.default.json());
            configureTrustProxy(app);
            app.get('/health', (_req, res) => {
                res.status(200).json({ status: 'ok' });
            });
            app.use((req, res, next) => {
                if (!useCondensedLogging) {
                    next();
                    return;
                }
                if ((0, config_1.shouldSkipAccessLogRequest)(req)) {
                    next();
                    return;
                }
                const requestId = crypto.randomUUID();
                const clientIp = (0, request_logger_1.getIpAddress)(req);
                const sessionId = req.headers['mcp-session-id'];
                res.locals.accessLogRequestId = requestId;
                requestTracker.openStack(requestId, clientIp, req.method, req.path, sessionId);
                res.on('finish', () => {
                    requestTracker.closeStack(requestId, res.statusCode);
                });
                res.on('close', () => {
                    if (res.writableFinished) {
                        return;
                    }
                    if (!res.headersSent) {
                        requestTracker.closeStackWithError(requestId, 'connection_closed');
                        return;
                    }
                    if (res.locals?.writeTimedOut) {
                        requestTracker.closeStackWithError(requestId, 'write_timeout');
                        return;
                    }
                    requestTracker.closeStack(requestId, res.statusCode);
                });
                next();
            });
            app.use((0, index_2.rateLimiterMiddleware)());
            if ((0, index_1.isOAuthEnabled)()) {
                registerOAuthEndpoints(app);
            }
            if (config_1.DASHBOARD_ENABLED) {
                app.get('/', index_js_1.dashboardHandler);
                (0, logger_1.logInfo)('Dashboard enabled at GET /');
            }
            app.use(['/', '/mcp'], (req, res, next) => {
                const accept = req.headers.accept ?? '';
                if (req.method === 'POST' && !accept.includes('text/event-stream')) {
                    req.headers.accept = accept
                        ? `${accept}, text/event-stream`
                        : 'application/json, text/event-stream';
                    (0, logger_1.logDebug)('Modified Accept header for MCP compatibility', {
                        originalAccept: accept,
                        newAccept: req.headers.accept,
                    });
                }
                next();
            });
            if ((0, index_1.isOAuthEnabled)()) {
                app.use(['/', '/mcp'], index_2.oauthAuthMiddleware);
            }
            const sseTransports = {};
            const streamableTransports = {};
            app.get('/sse', async (req, res) => {
                (0, logger_1.logDebug)('SSE endpoint hit!');
                const transport = new sse_js_1.SSEServerTransport('/messages', res);
                const sessionId = transport.sessionId;
                const clientIp = (0, request_logger_1.getIpAddress)(req);
                const accessLogRequestId = res.locals?.accessLogRequestId;
                if (accessLogRequestId) {
                    requestTracker.setSessionId(accessLogRequestId, sessionId);
                }
                try {
                    await sessionManager.createSession(sessionId, transport);
                    sseTransports[sessionId] = transport;
                    (0, logger_1.logDebug)('SSE transport created with session', { sessionId });
                    connectionTracker.openConnection(sessionId, clientIp);
                    connectionTracker.incrementRequests(sessionId);
                }
                catch (error) {
                    (0, logger_1.logError)('Failed to create SSE session', { err: error, sessionId });
                    if (!res.headersSent) {
                        res.status(500).end();
                    }
                    return;
                }
                const stopHeartbeat = startSseHeartbeat(res, sessionId);
                let socketError;
                const socket = res.socket;
                if (socket) {
                    socket.on('error', (err) => {
                        socketError = err.code ?? err.message;
                        (0, logger_1.logWarn)('SSE socket error', {
                            sessionId,
                            error: err.message,
                            code: err.code,
                            reason: 'socket_error',
                        });
                    });
                }
                res.on('close', () => {
                    stopHeartbeat();
                    delete sseTransports[sessionId];
                    const reason = resolveCloseReason(socketError, res);
                    (0, logger_1.logInfo)('SSE session disconnected', { sessionId, reason });
                    connectionTracker.closeConnection(sessionId, reason);
                    sessionManager.removeSession(sessionId).catch((error) => {
                        (0, logger_1.logDebug)('Error removing SSE session on disconnect', { err: error, sessionId });
                    });
                });
            });
            app.post('/messages', async (req, res) => {
                (0, logger_1.logDebug)('SSE messages endpoint hit!');
                const sessionId = req.query.sessionId;
                if (!sessionId || !sseTransports[sessionId]) {
                    res.status(404).json({ error: 'Session not found' });
                    return;
                }
                connectionTracker.incrementRequests(sessionId);
                const accessLogRequestId = res.locals?.accessLogRequestId;
                if (accessLogRequestId) {
                    requestTracker.setSessionId(accessLogRequestId, sessionId);
                }
                try {
                    sessionManager.touchSession(sessionId);
                    const transport = sseTransports[sessionId];
                    const doHandle = async () => {
                        await transport.handlePostMessage(req, res, req.body);
                    };
                    if (accessLogRequestId) {
                        await (0, index_3.runWithRequestContextAsync)(accessLogRequestId, doHandle);
                    }
                    else {
                        await doHandle();
                    }
                }
                catch (error) {
                    (0, logger_1.logError)('Error handling SSE message', { err: error });
                    if (!res.headersSent) {
                        res.status(500).json({ error: 'Internal server error' });
                    }
                }
            });
            app.all(['/', '/mcp'], async (req, res) => {
                const sessionId = req.headers['mcp-session-id'];
                const accessLogRequestId = res.locals.accessLogRequestId;
                const clientIp = (0, request_logger_1.getIpAddress)(req);
                const oauthSessionId = res.locals.oauthSessionId;
                const gitlabToken = res.locals.gitlabToken;
                const gitlabUserId = res.locals.gitlabUserId;
                const gitlabUsername = res.locals.gitlabUsername;
                const gitlabApiUrl = res.locals.gitlabApiUrl;
                const instanceLabel = res.locals.instanceLabel;
                if (!useCondensedLogging) {
                    const requestContext = (0, request_logger_1.getRequestContext)(req, res);
                    (0, logger_1.logInfo)('MCP endpoint request received', {
                        event: 'mcp_request',
                        ...requestContext,
                        hasToken: !!gitlabToken,
                    });
                }
                const handleWithContext = async (transport) => {
                    const doHandle = async () => {
                        if (gitlabToken && oauthSessionId && gitlabUserId && gitlabUsername) {
                            await (0, index_1.runWithTokenContext)({
                                gitlabToken,
                                gitlabUserId,
                                gitlabUsername,
                                sessionId: oauthSessionId,
                                apiUrl: gitlabApiUrl ?? config_1.GITLAB_BASE_URL,
                                instanceLabel,
                            }, async () => {
                                await transport.handleRequest(req, res, req.body);
                            });
                        }
                        else {
                            await transport.handleRequest(req, res, req.body);
                        }
                    };
                    if (accessLogRequestId) {
                        await (0, index_3.runWithRequestContextAsync)(accessLogRequestId, doHandle);
                    }
                    else {
                        await doHandle();
                    }
                };
                try {
                    let transport;
                    let effectiveSessionId;
                    if (sessionId && Object.hasOwn(streamableTransports, sessionId)) {
                        effectiveSessionId = sessionId;
                        sessionManager.touchSession(sessionId);
                        connectionTracker.incrementRequests(sessionId);
                        transport = streamableTransports[sessionId];
                        await handleWithContext(transport);
                    }
                    else {
                        if (sessionId) {
                            res.status(404).json({
                                error: 'Session not found',
                                message: 'Your session has expired. Please reconnect.',
                            });
                            return;
                        }
                        const newSessionId = crypto.randomUUID();
                        effectiveSessionId = newSessionId;
                        transport = new streamableHttp_js_1.StreamableHTTPServerTransport({
                            sessionIdGenerator: () => newSessionId,
                            onsessioninitialized: (initializedSessionId) => {
                                streamableTransports[initializedSessionId] = transport;
                                (0, logger_1.logInfo)('MCP session initialized', {
                                    sessionId: initializedSessionId,
                                    method: req.method,
                                });
                                connectionTracker.openConnection(initializedSessionId, clientIp);
                                connectionTracker.incrementRequests(initializedSessionId);
                                requestTracker.setSessionIdForCurrentRequest(initializedSessionId);
                                if (oauthSessionId) {
                                    index_1.sessionStore.associateMcpSession(initializedSessionId, oauthSessionId);
                                }
                            },
                            onsessionclosed: (closedSessionId) => {
                                delete streamableTransports[closedSessionId];
                                index_1.sessionStore.removeMcpSessionAssociation(closedSessionId);
                                connectionTracker.closeConnection(closedSessionId, 'session_closed');
                                sessionManager.removeSession(closedSessionId).catch((err) => {
                                    (0, logger_1.logDebug)('Error removing closed session', { err, sessionId: closedSessionId });
                                });
                                (0, logger_1.logInfo)('StreamableHTTP session closed', {
                                    sessionId: closedSessionId,
                                    reason: 'session_closed',
                                });
                            },
                        });
                        await sessionManager.createSession(newSessionId, transport);
                        await handleWithContext(transport);
                    }
                    if (req.method === 'GET' && !res.writableEnded) {
                        const stopHeartbeat = startSseHeartbeat(res, effectiveSessionId);
                        let socketError;
                        const socket = res.socket;
                        if (socket) {
                            socket.on('error', (err) => {
                                socketError = err.code ?? err.message;
                                (0, logger_1.logWarn)('StreamableHTTP GET socket error', {
                                    sessionId: effectiveSessionId,
                                    error: err.message,
                                    code: err.code,
                                    reason: 'socket_error',
                                });
                            });
                        }
                        res.on('close', () => {
                            stopHeartbeat();
                            const reason = resolveCloseReason(socketError, res);
                            (0, logger_1.logInfo)('StreamableHTTP GET stream disconnected', {
                                sessionId: effectiveSessionId,
                                reason,
                            });
                        });
                    }
                }
                catch (error) {
                    (0, logger_1.logError)('Error in StreamableHTTP transport', { err: error });
                    if (!res.headersSent) {
                        res.status(500).json({ error: 'Internal server error' });
                    }
                }
            });
            startHttpServer(app, () => {
                const url = `${getProtocol()}://${config_1.HOST}:${config_1.PORT}`;
                (0, logger_1.logInfo)('GitLab MCP Server running', { url });
                if (isTLSEnabled()) {
                    (0, logger_1.logInfo)('TLS/HTTPS enabled');
                }
                (0, logger_1.logInfo)('Dual Transport Mode Active');
                (0, logger_1.logInfo)('SSE endpoint', { endpoint: `${url}/sse`, note: 'backwards compatibility' });
                (0, logger_1.logInfo)('StreamableHTTP endpoint', {
                    endpoint: `${url}/mcp`,
                    note: 'modern, supports SSE + JSON-RPC',
                });
                if ((0, index_1.isOAuthEnabled)()) {
                    (0, logger_1.logInfo)('OAuth Mode Active');
                    (0, logger_1.logInfo)('OAuth metadata', { endpoint: `${url}/.well-known/oauth-authorization-server` });
                    (0, logger_1.logInfo)('Authorization endpoint', { endpoint: `${url}/authorize` });
                    (0, logger_1.logInfo)('Token exchange endpoint', { endpoint: `${url}/token` });
                }
                (0, logger_1.logInfo)('SSE keepalive configured for proxy chain compatibility', {
                    heartbeatMs: config_1.SSE_HEARTBEAT_MS,
                    keepAliveTimeoutMs: KEEP_ALIVE_TIMEOUT_MS,
                });
                if (config_1.RESPONSE_WRITE_TIMEOUT_MS > 0) {
                    (0, logger_1.logInfo)('Response write timeout enabled (zombie connection detection)', {
                        responseWriteTimeoutMs: config_1.RESPONSE_WRITE_TIMEOUT_MS,
                    });
                }
                (0, logger_1.logInfo)('Clients can use either transport as needed');
            });
            break;
        }
    }
}
async function gracefulShutdown(signal) {
    (0, logger_1.logInfo)('Shutting down GitLab MCP Server...', { signal });
    try {
        const connTracker = (0, index_3.getConnectionTracker)();
        connTracker.closeAllConnections('server_shutdown');
        (0, logger_1.logInfo)('All connections closed for shutdown');
    }
    catch (error) {
        (0, logger_1.logError)('Error closing connections', { err: error });
    }
    try {
        const { HealthMonitor } = await Promise.resolve().then(() => __importStar(require('./services/HealthMonitor')));
        HealthMonitor.getInstance().shutdown();
        (0, logger_1.logInfo)('Health monitor shut down successfully');
    }
    catch (error) {
        (0, logger_1.logError)('Error shutting down health monitor', { err: error });
    }
    try {
        const sm = (0, session_manager_1.getSessionManager)();
        await sm.shutdown();
        (0, logger_1.logInfo)('Session manager shut down successfully');
    }
    catch (error) {
        (0, logger_1.logError)('Error shutting down session manager', { err: error });
    }
    try {
        await index_1.sessionStore.close();
        (0, logger_1.logInfo)('Session store closed successfully');
    }
    catch (error) {
        (0, logger_1.logError)('Error closing session store', { err: error });
    }
    process.exit(0);
}
process.on('SIGINT', () => {
    gracefulShutdown('SIGINT').catch((err) => {
        (0, logger_1.logError)('Error during graceful shutdown', { err });
        process.exit(1);
    });
});
process.on('SIGTERM', () => {
    gracefulShutdown('SIGTERM').catch((err) => {
        (0, logger_1.logError)('Error during graceful shutdown', { err });
        process.exit(1);
    });
});
//# sourceMappingURL=server.js.map