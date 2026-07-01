"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIG_PATHS = exports.DEFAULT_DOCKER_CONFIG = void 0;
exports.getConfigDir = getConfigDir;
exports.DEFAULT_DOCKER_CONFIG = {
    port: 3333,
    oauthEnabled: false,
    instances: [],
    containerName: 'gitlab-mcp',
    image: 'ghcr.io/structured-world/gitlab-mcp:latest',
};
exports.CONFIG_PATHS = {
    darwin: '~/.config/gitlab-mcp',
    win32: '%APPDATA%/gitlab-mcp',
    linux: '~/.config/gitlab-mcp',
};
function getConfigDir() {
    const platform = process.platform;
    return exports.CONFIG_PATHS[platform] ?? exports.CONFIG_PATHS.linux;
}
//# sourceMappingURL=types.js.map