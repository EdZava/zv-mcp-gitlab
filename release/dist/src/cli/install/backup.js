"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBackupFilename = generateBackupFilename;
exports.createBackup = createBackup;
exports.restoreBackup = restoreBackup;
const fs_1 = require("fs");
const path_1 = require("path");
function generateBackupFilename(originalPath) {
    const dir = (0, path_1.dirname)(originalPath);
    const name = (0, path_1.basename)(originalPath);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return (0, path_1.join)(dir, `${name}.backup-${timestamp}`);
}
function createBackup(options) {
    const { configPath, backupDir } = options;
    if (!(0, fs_1.existsSync)(configPath)) {
        return {
            created: false,
            error: 'Config file does not exist, no backup needed',
        };
    }
    try {
        let backupPath;
        if (backupDir) {
            if (!(0, fs_1.existsSync)(backupDir)) {
                (0, fs_1.mkdirSync)(backupDir, { recursive: true });
            }
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            backupPath = (0, path_1.join)(backupDir, `${(0, path_1.basename)(configPath)}.backup-${timestamp}`);
        }
        else {
            backupPath = generateBackupFilename(configPath);
        }
        (0, fs_1.copyFileSync)(configPath, backupPath);
        return {
            created: true,
            backupPath,
        };
    }
    catch (error) {
        return {
            created: false,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}
function restoreBackup(backupPath, targetPath) {
    try {
        if (!(0, fs_1.existsSync)(backupPath)) {
            return false;
        }
        const targetDir = (0, path_1.dirname)(targetPath);
        if (!(0, fs_1.existsSync)(targetDir)) {
            (0, fs_1.mkdirSync)(targetDir, { recursive: true });
        }
        (0, fs_1.copyFileSync)(backupPath, targetPath);
        return true;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=backup.js.map