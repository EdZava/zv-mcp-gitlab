"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestTracker = void 0;
exports.getCurrentRequestId = getCurrentRequestId;
exports.runWithRequestContext = runWithRequestContext;
exports.runWithRequestContextAsync = runWithRequestContextAsync;
exports.getRequestTracker = getRequestTracker;
exports.resetRequestTracker = resetRequestTracker;
const async_hooks_1 = require("async_hooks");
const access_log_js_1 = require("./access-log.js");
const logger_js_1 = require("../logger.js");
const requestContext = new async_hooks_1.AsyncLocalStorage();
function getCurrentRequestId() {
    return requestContext.getStore()?.requestId;
}
function runWithRequestContext(requestId, fn) {
    return requestContext.run({ requestId }, fn);
}
async function runWithRequestContextAsync(requestId, fn) {
    return requestContext.run({ requestId }, fn);
}
class RequestTracker {
    stacks = new Map();
    enabled;
    constructor(enabled = true) {
        this.enabled = enabled;
    }
    isEnabled() {
        return this.enabled;
    }
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    openStack(requestId, clientIp, method, path, sessionId) {
        if (!this.enabled)
            return;
        const stack = {
            startTime: Date.now(),
            clientIp,
            method,
            path,
            sessionId,
            details: {},
        };
        this.stacks.set(requestId, stack);
        (0, logger_js_1.logDebug)('Request stack opened', { requestId, clientIp, method, path });
    }
    getStack(requestId) {
        return this.stacks.get(requestId);
    }
    setTool(requestId, tool, action) {
        const stack = this.stacks.get(requestId);
        if (!stack)
            return;
        stack.tool = tool;
        if (action) {
            stack.action = action;
        }
        (0, logger_js_1.logDebug)('Tool set on request stack', { requestId, tool, action });
    }
    setGitLabResponse(requestId, status, durationMs) {
        const stack = this.stacks.get(requestId);
        if (!stack)
            return;
        stack.gitlabStatus = status;
        if (durationMs !== undefined) {
            stack.gitlabDuration = durationMs;
        }
        (0, logger_js_1.logDebug)('GitLab response set on request stack', {
            requestId,
            gitlabStatus: status,
            gitlabDuration: durationMs,
        });
    }
    addDetail(requestId, key, value) {
        const stack = this.stacks.get(requestId);
        if (!stack)
            return;
        stack.details[key] = value;
    }
    addDetails(requestId, details) {
        const stack = this.stacks.get(requestId);
        if (!stack)
            return;
        Object.assign(stack.details, details);
    }
    setError(requestId, error) {
        const stack = this.stacks.get(requestId);
        if (!stack)
            return;
        stack.error = error;
        stack.details.err = error;
    }
    setContext(requestId, context) {
        const stack = this.stacks.get(requestId);
        if (!stack)
            return;
        stack.context = context;
    }
    setReadOnly(requestId, readOnly) {
        const stack = this.stacks.get(requestId);
        if (!stack)
            return;
        stack.readOnly = readOnly;
    }
    setSessionId(requestId, sessionId) {
        const stack = this.stacks.get(requestId);
        if (!stack)
            return;
        stack.sessionId = sessionId;
    }
    closeStack(requestId, status) {
        const stack = this.stacks.get(requestId);
        if (!stack) {
            (0, logger_js_1.logDebug)('Request stack not found on close', { requestId });
            return undefined;
        }
        this.stacks.delete(requestId);
        stack.status = status;
        if (!this.enabled) {
            return undefined;
        }
        const entry = (0, access_log_js_1.createAccessLogEntry)(stack);
        const logLine = (0, access_log_js_1.formatAccessLog)(entry);
        if (logger_js_1.LOG_JSON) {
            logger_js_1.logger.info({ accessLog: entry }, logLine);
        }
        else {
            logger_js_1.logger.info(logLine);
        }
        return logLine;
    }
    closeStackWithError(requestId, error) {
        const stack = this.stacks.get(requestId);
        if (!stack)
            return undefined;
        stack.error = error;
        stack.details.err = error;
        return this.closeStack(requestId, 0);
    }
    hasStack(requestId) {
        return this.stacks.has(requestId);
    }
    getOpenStackCount() {
        return this.stacks.size;
    }
    clear() {
        this.stacks.clear();
    }
    setToolForCurrentRequest(tool, action) {
        const requestId = getCurrentRequestId();
        if (requestId) {
            this.setTool(requestId, tool, action);
        }
    }
    setGitLabResponseForCurrentRequest(status, durationMs) {
        const requestId = getCurrentRequestId();
        if (requestId) {
            this.setGitLabResponse(requestId, status, durationMs);
        }
    }
    addDetailForCurrentRequest(key, value) {
        const requestId = getCurrentRequestId();
        if (requestId) {
            this.addDetail(requestId, key, value);
        }
    }
    addDetailsForCurrentRequest(details) {
        const requestId = getCurrentRequestId();
        if (requestId) {
            this.addDetails(requestId, details);
        }
    }
    setErrorForCurrentRequest(error) {
        const requestId = getCurrentRequestId();
        if (requestId) {
            this.setError(requestId, error);
        }
    }
    setContextForCurrentRequest(context) {
        const requestId = getCurrentRequestId();
        if (requestId) {
            this.setContext(requestId, context);
        }
    }
    setReadOnlyForCurrentRequest(readOnly) {
        const requestId = getCurrentRequestId();
        if (requestId) {
            this.setReadOnly(requestId, readOnly);
        }
    }
    setSessionIdForCurrentRequest(sessionId) {
        const requestId = getCurrentRequestId();
        if (requestId) {
            this.setSessionId(requestId, sessionId);
        }
    }
}
exports.RequestTracker = RequestTracker;
let globalTracker = null;
function getRequestTracker() {
    globalTracker ??= new RequestTracker();
    return globalTracker;
}
function resetRequestTracker() {
    globalTracker = null;
}
//# sourceMappingURL=request-tracker.js.map