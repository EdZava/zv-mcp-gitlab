"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectContainerRuntime = detectContainerRuntime;
exports.getContainerRuntime = getContainerRuntime;
exports.resetRuntimeCache = resetRuntimeCache;
const child_process_1 = require("child_process");
let cachedRuntime = null;
function commandSucceeds(cmd, args) {
    try {
        const result = (0, child_process_1.spawnSync)(cmd, args, {
            stdio: 'pipe',
            encoding: 'utf8',
        });
        return result.status === 0;
    }
    catch {
        return false;
    }
}
function commandOutput(cmd, args) {
    try {
        const result = (0, child_process_1.spawnSync)(cmd, args, {
            stdio: 'pipe',
            encoding: 'utf8',
        });
        if (result.status === 0 && result.stdout) {
            return result.stdout.trim();
        }
        return undefined;
    }
    catch {
        return undefined;
    }
}
function parseVersion(output) {
    const match = output.match(/(\d+\.\d+\.\d+)/);
    return match?.[1];
}
function detectComposeCmd(runtime) {
    const runtimeCmd = runtime;
    if (commandSucceeds(runtimeCmd, ['compose', 'version'])) {
        return [runtimeCmd, 'compose'];
    }
    const standaloneCompose = `${runtimeCmd}-compose`;
    if (commandSucceeds(standaloneCompose, ['--version'])) {
        return [standaloneCompose];
    }
    if (commandSucceeds('docker-compose', ['--version'])) {
        return ['docker-compose'];
    }
    return null;
}
function detectContainerRuntime() {
    const runtimes = ['docker', 'podman'];
    for (const runtime of runtimes) {
        const versionOutput = commandOutput(runtime, ['--version']);
        if (versionOutput) {
            const runtimeAvailable = commandSucceeds(runtime, ['info']);
            const composeCmd = detectComposeCmd(runtime);
            const runtimeVersion = parseVersion(versionOutput);
            return {
                runtime,
                runtimeCmd: runtime,
                runtimeAvailable,
                composeCmd,
                runtimeVersion,
            };
        }
    }
    return {
        runtime: 'docker',
        runtimeCmd: 'docker',
        runtimeAvailable: false,
        composeCmd: null,
        runtimeVersion: undefined,
    };
}
function getContainerRuntime() {
    cachedRuntime ??= detectContainerRuntime();
    return cachedRuntime;
}
function resetRuntimeCache() {
    cachedRuntime = null;
}
//# sourceMappingURL=container-runtime.js.map