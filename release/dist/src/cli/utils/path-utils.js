"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expandPath = expandPath;
const os_1 = require("os");
const path_1 = require("path");
function expandPath(path) {
    let expanded = path;
    if (expanded.startsWith('~/')) {
        expanded = (0, path_1.join)((0, os_1.homedir)(), expanded.slice(2));
    }
    if (process.platform === 'win32') {
        expanded = expanded.replace(/%([^%]+)%/g, (_, varName) => {
            return process.env[varName] ?? '';
        });
    }
    return expanded;
}
//# sourceMappingURL=path-utils.js.map