"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runWithTokenContext = runWithTokenContext;
exports.getTokenContext = getTokenContext;
exports.getGitLabTokenFromContext = getGitLabTokenFromContext;
exports.getGitLabUserIdFromContext = getGitLabUserIdFromContext;
exports.getGitLabUsernameFromContext = getGitLabUsernameFromContext;
exports.getSessionIdFromContext = getSessionIdFromContext;
exports.getGitLabApiUrlFromContext = getGitLabApiUrlFromContext;
exports.getInstanceLabelFromContext = getInstanceLabelFromContext;
exports.isInOAuthContext = isInOAuthContext;
const async_hooks_1 = require("async_hooks");
const asyncLocalStorage = new async_hooks_1.AsyncLocalStorage();
function runWithTokenContext(context, fn) {
    return asyncLocalStorage.run(context, fn);
}
function getTokenContext() {
    return asyncLocalStorage.getStore();
}
function getGitLabTokenFromContext() {
    const context = asyncLocalStorage.getStore();
    if (!context) {
        throw new Error('No OAuth token context available - this code must be called within an authenticated request');
    }
    return context.gitlabToken;
}
function getGitLabUserIdFromContext() {
    const context = asyncLocalStorage.getStore();
    return context?.gitlabUserId;
}
function getGitLabUsernameFromContext() {
    const context = asyncLocalStorage.getStore();
    return context?.gitlabUsername;
}
function getSessionIdFromContext() {
    const context = asyncLocalStorage.getStore();
    return context?.sessionId;
}
function getGitLabApiUrlFromContext() {
    const context = asyncLocalStorage.getStore();
    return context?.apiUrl;
}
function getInstanceLabelFromContext() {
    const context = asyncLocalStorage.getStore();
    return context?.instanceLabel;
}
function isInOAuthContext() {
    return asyncLocalStorage.getStore() !== undefined;
}
//# sourceMappingURL=token-context.js.map