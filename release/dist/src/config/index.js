"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSampleConfig = exports.isKnownInstance = exports.getInstanceByUrl = exports.loadInstancesConfig = exports.applyInstanceDefaults = exports.validateInstancesConfig = exports.parseInstanceUrlString = exports.ConnectionStatusSchema = exports.InstancesConfigFileSchema = exports.InstanceDefaultsSchema = exports.GitLabInstanceConfigSchema = exports.InstanceRateLimitConfigSchema = exports.InstanceOAuthConfigSchema = void 0;
var instances_schema_js_1 = require("./instances-schema.js");
Object.defineProperty(exports, "InstanceOAuthConfigSchema", { enumerable: true, get: function () { return instances_schema_js_1.InstanceOAuthConfigSchema; } });
Object.defineProperty(exports, "InstanceRateLimitConfigSchema", { enumerable: true, get: function () { return instances_schema_js_1.InstanceRateLimitConfigSchema; } });
Object.defineProperty(exports, "GitLabInstanceConfigSchema", { enumerable: true, get: function () { return instances_schema_js_1.GitLabInstanceConfigSchema; } });
Object.defineProperty(exports, "InstanceDefaultsSchema", { enumerable: true, get: function () { return instances_schema_js_1.InstanceDefaultsSchema; } });
Object.defineProperty(exports, "InstancesConfigFileSchema", { enumerable: true, get: function () { return instances_schema_js_1.InstancesConfigFileSchema; } });
Object.defineProperty(exports, "ConnectionStatusSchema", { enumerable: true, get: function () { return instances_schema_js_1.ConnectionStatusSchema; } });
Object.defineProperty(exports, "parseInstanceUrlString", { enumerable: true, get: function () { return instances_schema_js_1.parseInstanceUrlString; } });
Object.defineProperty(exports, "validateInstancesConfig", { enumerable: true, get: function () { return instances_schema_js_1.validateInstancesConfig; } });
Object.defineProperty(exports, "applyInstanceDefaults", { enumerable: true, get: function () { return instances_schema_js_1.applyInstanceDefaults; } });
var instances_loader_js_1 = require("./instances-loader.js");
Object.defineProperty(exports, "loadInstancesConfig", { enumerable: true, get: function () { return instances_loader_js_1.loadInstancesConfig; } });
Object.defineProperty(exports, "getInstanceByUrl", { enumerable: true, get: function () { return instances_loader_js_1.getInstanceByUrl; } });
Object.defineProperty(exports, "isKnownInstance", { enumerable: true, get: function () { return instances_loader_js_1.isKnownInstance; } });
Object.defineProperty(exports, "generateSampleConfig", { enumerable: true, get: function () { return instances_loader_js_1.generateSampleConfig; } });
//# sourceMappingURL=index.js.map