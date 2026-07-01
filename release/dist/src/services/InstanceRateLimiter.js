"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstanceRateLimiter = exports.DEFAULT_RATE_LIMIT_CONFIG = void 0;
const logger_js_1 = require("../logger.js");
exports.DEFAULT_RATE_LIMIT_CONFIG = {
    maxConcurrent: 100,
    queueSize: 500,
    queueTimeout: 60000,
};
class InstanceRateLimiter {
    config;
    activeRequests = 0;
    queue = [];
    requestsTotal = 0;
    requestsQueued = 0;
    requestsRejected = 0;
    totalQueueWaitMs = 0;
    queuedRequestsCompleted = 0;
    constructor(config = {}) {
        this.config = {
            ...exports.DEFAULT_RATE_LIMIT_CONFIG,
            ...config,
        };
    }
    async acquire() {
        this.requestsTotal++;
        if (this.activeRequests < this.config.maxConcurrent) {
            this.activeRequests++;
            (0, logger_js_1.logDebug)('Rate limiter: slot acquired immediately', {
                active: this.activeRequests,
                max: this.config.maxConcurrent,
            });
            return this.createIdempotentRelease();
        }
        if (this.queue.length >= this.config.queueSize) {
            this.requestsRejected++;
            throw new Error(`Rate limit exceeded: ${this.activeRequests} active, ` +
                `${this.queue.length} queued (max: ${this.config.queueSize})`);
        }
        this.requestsQueued++;
        (0, logger_js_1.logDebug)('Rate limiter: request queued', {
            active: this.activeRequests,
            queued: this.queue.length + 1,
            queueSize: this.config.queueSize,
        });
        return new Promise((resolve, reject) => {
            const enqueuedAt = Date.now();
            const timeoutId = setTimeout(() => {
                const idx = this.queue.findIndex((e) => e.timeoutId === timeoutId);
                if (idx !== -1) {
                    this.queue.splice(idx, 1);
                    (0, logger_js_1.logWarn)('Rate limiter: request timed out in queue', {
                        timeout: this.config.queueTimeout,
                        waitedMs: Date.now() - enqueuedAt,
                    });
                    reject(new Error(`Request queued for ${this.config.queueTimeout}ms, timing out. ` +
                        `Active: ${this.activeRequests}, Queued: ${this.queue.length}`));
                }
            }, this.config.queueTimeout);
            const entry = {
                resolve,
                reject,
                enqueuedAt,
                timeoutId,
            };
            this.queue.push(entry);
        });
    }
    release() {
        this.activeRequests = Math.max(0, this.activeRequests - 1);
        if (this.queue.length > 0 && this.activeRequests < this.config.maxConcurrent) {
            const next = this.queue.shift();
            if (!next)
                return;
            clearTimeout(next.timeoutId);
            const waitMs = Date.now() - next.enqueuedAt;
            this.totalQueueWaitMs += waitMs;
            this.queuedRequestsCompleted++;
            (0, logger_js_1.logDebug)('Rate limiter: processing queued request', {
                waitMs,
                active: this.activeRequests + 1,
                remainingQueue: this.queue.length,
            });
            this.activeRequests++;
            next.resolve(this.createIdempotentRelease());
        }
    }
    createIdempotentRelease() {
        let released = false;
        return () => {
            if (released) {
                (0, logger_js_1.logWarn)('Rate limiter: release() called multiple times, ignoring');
                return;
            }
            released = true;
            this.release();
        };
    }
    getMetrics() {
        return {
            activeRequests: this.activeRequests,
            maxConcurrent: this.config.maxConcurrent,
            queuedRequests: this.queue.length,
            queueSize: this.config.queueSize,
            requestsTotal: this.requestsTotal,
            requestsQueued: this.requestsQueued,
            requestsRejected: this.requestsRejected,
            avgQueueWaitMs: this.queuedRequestsCompleted > 0
                ? Math.round(this.totalQueueWaitMs / this.queuedRequestsCompleted)
                : 0,
        };
    }
    getConfig() {
        return { ...this.config };
    }
    isAtCapacity() {
        return this.activeRequests >= this.config.maxConcurrent;
    }
    isQueueFull() {
        return this.queue.length >= this.config.queueSize;
    }
    resetMetrics() {
        this.requestsTotal = 0;
        this.requestsQueued = 0;
        this.requestsRejected = 0;
        this.totalQueueWaitMs = 0;
        this.queuedRequestsCompleted = 0;
    }
}
exports.InstanceRateLimiter = InstanceRateLimiter;
//# sourceMappingURL=InstanceRateLimiter.js.map