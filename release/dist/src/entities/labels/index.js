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
exports.labelsReadOnlyTools = exports.labelsTools = void 0;
__exportStar(require("../shared"), exports);
__exportStar(require("./schema-readonly"), exports);
__exportStar(require("./schema"), exports);
__exportStar(require("./registry"), exports);
const registry_1 = require("./registry");
const isReadOnly = process.env.GITLAB_READONLY === 'true';
const labelsToolsFromRegistry = (0, registry_1.getFilteredLabelsTools)(isReadOnly);
exports.labelsTools = labelsToolsFromRegistry.map((tool) => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
}));
exports.labelsReadOnlyTools = (0, registry_1.getLabelsReadOnlyToolNames)();
//# sourceMappingURL=index.js.map