"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contextToolRegistry = exports.contextReadOnlyTools = exports.contextTools = void 0;
__exportStar(require("../shared"), exports);
__exportStar(require("./types"), exports);
__exportStar(require("./schema"), exports);
__exportStar(require("./context-manager"), exports);
__exportStar(require("./handlers"), exports);
__exportStar(require("./registry"), exports);
const registry_1 = require("./registry");
Object.defineProperty(exports, "contextToolRegistry", { enumerable: true, get: function () { return registry_1.contextToolRegistry; } });
const isReadOnly = process.env.GITLAB_READ_ONLY_MODE === 'true';
const contextToolsFromRegistry = (0, registry_1.getFilteredContextTools)(isReadOnly);
exports.contextTools = contextToolsFromRegistry.map((tool) => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
}));
exports.contextReadOnlyTools = (0, registry_1.getContextReadOnlyToolNames)();
//# sourceMappingURL=index.js.map