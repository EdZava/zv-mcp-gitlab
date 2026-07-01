"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseWriteTimeoutMiddleware = responseWriteTimeoutMiddleware;
const zod_1 = require("zod");
const config_1 = require("../config");
const logger_1 = require("../logger");
const mcpSessionIdSchema = zod_1.z
    .union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())])
    .optional()
    .transform((value) => (Array.isArray(value) ? value[0] : value));
function normalizeContentType(value) {
    if (typeof value === 'string')
        return value.toLowerCase();
    if (Array.isArray(value))
        return value.join(',').toLowerCase();
    return '';
}
function responseWriteTimeoutMiddleware() {
    return (req, res, next) => {
        if (config_1.RESPONSE_WRITE_TIMEOUT_MS <= 0) {
            next();
            return;
        }
        let writeTimer;
        const originalWriteHead = res.writeHead.bind(res);
        res.writeHead = (...args) => {
            const result = originalWriteHead(...args);
            if (!writeTimer) {
                const isSSE = normalizeContentType(res.getHeader('content-type')).includes('text/event-stream');
                if (!isSSE) {
                    writeTimer = setTimeout(() => {
                        if (!res.writableFinished && !res.destroyed) {
                            res.locals = res.locals ?? {};
                            res.locals.writeTimedOut = true;
                            const parsedSessionId = mcpSessionIdSchema.safeParse(req.headers['mcp-session-id']);
                            const sessionId = parsedSessionId.success ? parsedSessionId.data : undefined;
                            (0, logger_1.logWarn)('Response write timeout — destroying zombie connection', {
                                method: req.method,
                                path: req.path,
                                timeoutMs: config_1.RESPONSE_WRITE_TIMEOUT_MS,
                                sessionId,
                                reason: 'write_timeout',
                            });
                            res.destroy();
                        }
                    }, config_1.RESPONSE_WRITE_TIMEOUT_MS);
                }
            }
            return result;
        };
        const cleanup = () => {
            if (writeTimer) {
                clearTimeout(writeTimer);
                writeTimer = undefined;
            }
        };
        res.on('finish', cleanup);
        res.on('close', cleanup);
        next();
    };
}
//# sourceMappingURL=response-write-timeout.js.map