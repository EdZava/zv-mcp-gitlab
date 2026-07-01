"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerHandler = registerHandler;
exports.getRegisteredClient = getRegisteredClient;
exports.isValidRedirectUri = isValidRedirectUri;
const crypto_1 = require("crypto");
const logger_1 = require("../../logger");
const registeredClients = new Map();
async function registerHandler(req, res) {
    try {
        const body = req.body;
        const { redirect_uris, client_name, token_endpoint_auth_method = 'none', grant_types = ['authorization_code', 'refresh_token'], response_types = ['code'], } = body;
        if (!redirect_uris || !Array.isArray(redirect_uris) || redirect_uris.length === 0) {
            res.status(400).json({
                error: 'invalid_client_metadata',
                error_description: 'redirect_uris is required and must be a non-empty array',
            });
            return;
        }
        for (const uri of redirect_uris) {
            try {
                new URL(uri);
            }
            catch {
                res.status(400).json({
                    error: 'invalid_redirect_uri',
                    error_description: `Invalid redirect URI: ${uri}`,
                });
                return;
            }
        }
        const client_id = (0, crypto_1.randomUUID)();
        let client_secret;
        if (token_endpoint_auth_method !== 'none') {
            client_secret = (0, crypto_1.randomUUID)() + (0, crypto_1.randomUUID)();
        }
        const clientData = {
            client_id,
            client_secret,
            redirect_uris,
            client_name,
            token_endpoint_auth_method,
            grant_types,
            response_types,
            created_at: Date.now(),
        };
        registeredClients.set(client_id, clientData);
        (0, logger_1.logInfo)('New OAuth client registered via DCR', {
            client_id,
            client_name,
            redirect_uris,
            token_endpoint_auth_method,
        });
        const response = {
            client_id,
            redirect_uris,
            client_name,
            token_endpoint_auth_method,
            grant_types,
            response_types,
        };
        if (client_secret) {
            response.client_secret = client_secret;
        }
        res.status(201).json(response);
    }
    catch (error) {
        (0, logger_1.logError)('Error in dynamic client registration', { err: error });
        res.status(500).json({
            error: 'server_error',
            error_description: 'Failed to register client',
        });
    }
}
function getRegisteredClient(clientId) {
    return registeredClients.get(clientId);
}
function isValidRedirectUri(clientId, redirectUri) {
    const client = registeredClients.get(clientId);
    if (!client) {
        return true;
    }
    return client.redirect_uris.includes(redirectUri);
}
//# sourceMappingURL=register.js.map