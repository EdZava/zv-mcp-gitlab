"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCP_PROTOCOL_VERSION = void 0;
exports.getBaseUrl = getBaseUrl;
exports.metadataHandler = metadataHandler;
exports.protectedResourceHandler = protectedResourceHandler;
const config_1 = require("../../config");
exports.MCP_PROTOCOL_VERSION = '2025-03-26';
function getBaseUrl(req) {
    const forwardedProto = req.get('x-forwarded-proto');
    const protocol = forwardedProto ?? req.protocol ?? 'http';
    const forwardedHost = req.get('x-forwarded-host');
    const host = forwardedHost ?? req.get('host') ?? `${config_1.HOST}:${config_1.PORT}`;
    return `${protocol}://${host}`;
}
function metadataHandler(req, res) {
    const baseUrl = getBaseUrl(req);
    const metadata = {
        issuer: baseUrl,
        authorization_endpoint: `${baseUrl}/authorize`,
        token_endpoint: `${baseUrl}/token`,
        response_types_supported: ['code'],
        grant_types_supported: ['authorization_code', 'refresh_token'],
        code_challenge_methods_supported: ['S256'],
        token_endpoint_auth_methods_supported: ['none'],
        scopes_supported: ['mcp:tools', 'mcp:resources'],
        registration_endpoint: `${baseUrl}/register`,
        mcp_version: exports.MCP_PROTOCOL_VERSION,
    };
    res.json(metadata);
}
function protectedResourceHandler(req, res) {
    const baseUrl = getBaseUrl(req);
    const metadata = {
        resource: baseUrl,
        authorization_servers: [baseUrl],
        scopes_supported: ['mcp:tools', 'mcp:resources'],
        bearer_methods_supported: ['header'],
    };
    res.json(metadata);
}
//# sourceMappingURL=metadata.js.map