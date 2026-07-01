"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expandPath = void 0;
exports.getConfigPath = getConfigPath;
exports.commandExists = commandExists;
exports.isValidBundleId = isValidBundleId;
exports.isAlreadyConfigured = isAlreadyConfigured;
exports.detectClient = detectClient;
exports.detectAllClients = detectAllClients;
exports.getDetectedClients = getDetectedClients;
exports.getConfiguredClients = getConfiguredClients;
const fs_1 = require("fs");
const child_process_1 = require("child_process");
const types_1 = require("./types");
const path_utils_js_1 = require("../utils/path-utils.js");
var path_utils_js_2 = require("../utils/path-utils.js");
Object.defineProperty(exports, "expandPath", { enumerable: true, get: function () { return path_utils_js_2.expandPath; } });
function getConfigPath(client) {
    const metadata = types_1.CLIENT_METADATA[client];
    const platform = process.platform;
    return metadata.configPaths[platform];
}
function commandExists(command) {
    try {
        const result = (0, child_process_1.spawnSync)(process.platform === 'win32' ? 'where' : 'which', [command], {
            stdio: 'pipe',
            encoding: 'utf8',
        });
        return result.status === 0;
    }
    catch {
        return false;
    }
}
function isValidBundleId(bundleId) {
    return /^[a-zA-Z0-9][a-zA-Z0-9-]*(\.[a-zA-Z0-9][a-zA-Z0-9-]*)+$/.test(bundleId);
}
function appBundleExists(bundleId) {
    if (process.platform !== 'darwin') {
        return false;
    }
    if (!isValidBundleId(bundleId)) {
        return false;
    }
    try {
        const result = (0, child_process_1.spawnSync)('mdfind', [`kMDItemCFBundleIdentifier == "${bundleId}"`], {
            stdio: 'pipe',
            encoding: 'utf8',
        });
        return result.status === 0 && result.stdout.trim().length > 0;
    }
    catch {
        return false;
    }
}
function isAlreadyConfigured(configPath) {
    try {
        const expanded = (0, path_utils_js_1.expandPath)(configPath);
        if (!(0, fs_1.existsSync)(expanded)) {
            return false;
        }
        const content = (0, fs_1.readFileSync)(expanded, 'utf8');
        const config = JSON.parse(content);
        const mcpServers = config.mcpServers;
        if (mcpServers) {
            return 'gitlab' in mcpServers || 'gitlab-mcp' in mcpServers;
        }
        const servers = config.servers;
        if (servers) {
            return 'gitlab' in servers || 'gitlab-mcp' in servers;
        }
        return false;
    }
    catch {
        return false;
    }
}
function detectClient(client) {
    const metadata = types_1.CLIENT_METADATA[client];
    const configPath = getConfigPath(client);
    const expandedPath = configPath ? (0, path_utils_js_1.expandPath)(configPath) : undefined;
    const result = {
        client,
        detected: false,
        method: metadata.detectionMethod,
    };
    if (configPath) {
        result.configPath = expandedPath;
    }
    switch (metadata.detectionMethod) {
        case 'cli-command':
            if (metadata.cliCommand && commandExists(metadata.cliCommand)) {
                result.detected = true;
            }
            break;
        case 'app-bundle':
            if (metadata.appBundleId && appBundleExists(metadata.appBundleId)) {
                result.detected = true;
            }
            if (!result.detected && expandedPath) {
                const configDir = expandedPath.replace(/\/[^/]+$/, '');
                if ((0, fs_1.existsSync)(configDir)) {
                    result.detected = true;
                }
            }
            break;
        case 'config-file':
            if (expandedPath) {
                const configDir = expandedPath.replace(/\/[^/]+$/, '');
                if ((0, fs_1.existsSync)(configDir)) {
                    result.detected = true;
                }
            }
            break;
    }
    if (expandedPath) {
        result.configExists = (0, fs_1.existsSync)(expandedPath);
        if (result.configExists) {
            result.alreadyConfigured = isAlreadyConfigured(expandedPath);
        }
    }
    return result;
}
function detectAllClients() {
    return types_1.INSTALLABLE_CLIENTS.map((client) => detectClient(client));
}
function getDetectedClients() {
    return detectAllClients().filter((result) => result.detected);
}
function getConfiguredClients() {
    return detectAllClients().filter((result) => result.alreadyConfigured);
}
//# sourceMappingURL=detector.js.map