"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidRedirectUri = exports.getRegisteredClient = exports.registerHandler = exports.tokenHandler = exports.callbackHandler = exports.pollHandler = exports.authorizeHandler = exports.getBaseUrl = exports.protectedResourceHandler = exports.metadataHandler = void 0;
var metadata_1 = require("./metadata");
Object.defineProperty(exports, "metadataHandler", { enumerable: true, get: function () { return metadata_1.metadataHandler; } });
Object.defineProperty(exports, "protectedResourceHandler", { enumerable: true, get: function () { return metadata_1.protectedResourceHandler; } });
Object.defineProperty(exports, "getBaseUrl", { enumerable: true, get: function () { return metadata_1.getBaseUrl; } });
var authorize_1 = require("./authorize");
Object.defineProperty(exports, "authorizeHandler", { enumerable: true, get: function () { return authorize_1.authorizeHandler; } });
Object.defineProperty(exports, "pollHandler", { enumerable: true, get: function () { return authorize_1.pollHandler; } });
var callback_1 = require("./callback");
Object.defineProperty(exports, "callbackHandler", { enumerable: true, get: function () { return callback_1.callbackHandler; } });
var token_1 = require("./token");
Object.defineProperty(exports, "tokenHandler", { enumerable: true, get: function () { return token_1.tokenHandler; } });
var register_1 = require("./register");
Object.defineProperty(exports, "registerHandler", { enumerable: true, get: function () { return register_1.registerHandler; } });
Object.defineProperty(exports, "getRegisteredClient", { enumerable: true, get: function () { return register_1.getRegisteredClient; } });
Object.defineProperty(exports, "isValidRedirectUri", { enumerable: true, get: function () { return register_1.isValidRedirectUri; } });
//# sourceMappingURL=index.js.map