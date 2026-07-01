"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphQLClient = void 0;
const graphql_1 = require("graphql");
const http_client_1 = require("../http-client");
const fetch_1 = require("../utils/fetch");
class GraphQLClient {
    _endpoint;
    defaultHeaders;
    constructor(endpoint, options) {
        this._endpoint = endpoint;
        this.defaultHeaders = options?.headers ?? {};
    }
    get endpoint() {
        return this._endpoint;
    }
    setEndpoint(endpoint) {
        this._endpoint = endpoint;
    }
    async request(document, variables, requestHeaders) {
        const query = (0, graphql_1.print)(document);
        const headers = {
            'Content-Type': 'application/json',
            ...http_client_1.DEFAULT_HEADERS,
            ...this.defaultHeaders,
            ...requestHeaders,
        };
        const response = await (0, fetch_1.enhancedFetch)(this.endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                query,
                variables: variables ?? {},
            }),
        });
        if (!response.ok) {
            throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`);
        }
        const result = (await response.json());
        if (result.errors) {
            throw new Error(`GraphQL errors: ${result.errors.map((e) => e.message).join(', ')}`);
        }
        if (!result.data) {
            throw new Error('GraphQL request returned no data');
        }
        return result.data;
    }
    setHeaders(headers) {
        this.defaultHeaders = { ...this.defaultHeaders, ...headers };
    }
    setAuthToken(token) {
        this.setHeaders({ Authorization: `Bearer ${token}` });
    }
}
exports.GraphQLClient = GraphQLClient;
//# sourceMappingURL=client.js.map