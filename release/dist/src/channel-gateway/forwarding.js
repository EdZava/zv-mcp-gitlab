"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forwardWithPolicy = forwardWithPolicy;
exports.isReadCall = isReadCall;
async function forwardWithPolicy(policy, name, args) {
    if (!policy.isConnected()) {
        await policy.waitForConnection();
    }
    try {
        return await policy.call(name, args);
    }
    catch (err) {
        if (policy.isRead(name)) {
            await policy.waitForConnection();
            return await policy.call(name, args);
        }
        throw err;
    }
}
function isReadCall(name) {
    return name.startsWith('browse_') || name.startsWith('get_') || name.startsWith('list_');
}
//# sourceMappingURL=forwarding.js.map