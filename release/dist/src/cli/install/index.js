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
exports.buildServerConfigFromEnv = exports.parseInstallFlags = exports.runInstallCommand = exports.runInstallWizard = void 0;
__exportStar(require("./types"), exports);
__exportStar(require("./detector"), exports);
__exportStar(require("./backup"), exports);
__exportStar(require("./installers"), exports);
var install_command_1 = require("./install-command");
Object.defineProperty(exports, "runInstallWizard", { enumerable: true, get: function () { return install_command_1.runInstallWizard; } });
Object.defineProperty(exports, "runInstallCommand", { enumerable: true, get: function () { return install_command_1.runInstallCommand; } });
Object.defineProperty(exports, "parseInstallFlags", { enumerable: true, get: function () { return install_command_1.parseInstallFlags; } });
Object.defineProperty(exports, "buildServerConfigFromEnv", { enumerable: true, get: function () { return install_command_1.buildServerConfigFromEnv; } });
//# sourceMappingURL=index.js.map