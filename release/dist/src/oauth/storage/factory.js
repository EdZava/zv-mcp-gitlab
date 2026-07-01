"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStorageBackend = createStorageBackend;
exports.getStorageType = getStorageType;
exports.validateStorageConfig = validateStorageConfig;
const memory_1 = require("./memory");
const file_1 = require("./file");
const logger_1 = require("../../logger");
function createStorageBackend(config) {
    const storageType = config?.type ?? getEnvStorageType();
    switch (storageType) {
        case 'file':
            return createFileBackend(config);
        case 'postgresql':
            return createPostgreSQLBackend();
        case 'memory':
        default:
            return createMemoryBackend();
    }
}
function getEnvStorageType() {
    const type = process.env.OAUTH_STORAGE_TYPE?.toLowerCase();
    if (type === 'file' || type === 'postgresql') {
        return type;
    }
    return 'memory';
}
function createMemoryBackend() {
    (0, logger_1.logInfo)('Using in-memory session storage (sessions will be lost on restart)');
    return new memory_1.MemoryStorageBackend();
}
function createFileBackend(config) {
    const filePath = config?.file?.path ?? process.env.OAUTH_STORAGE_FILE_PATH ?? './data/oauth-sessions.json';
    const saveInterval = config?.file?.saveInterval ?? parseInt(process.env.OAUTH_STORAGE_SAVE_INTERVAL ?? '30000', 10);
    (0, logger_1.logInfo)('Using file-based session storage', { filePath, saveInterval });
    return new file_1.FileStorageBackend({
        filePath,
        saveInterval,
    });
}
function createPostgreSQLBackend() {
    const connectionString = process.env.OAUTH_STORAGE_POSTGRESQL_URL ?? process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error('PostgreSQL storage requires a connection string. ' +
            'Set OAUTH_STORAGE_POSTGRESQL_URL or DATABASE_URL environment variable');
    }
    let mod;
    try {
        mod = require('@structured-world/gitlab-mcp-db');
    }
    catch {
        throw new Error("PostgreSQL storage requires the optional '@structured-world/gitlab-mcp-db' package. " +
            'Install it with: npm install @structured-world/gitlab-mcp-db');
    }
    (0, logger_1.logInfo)('Using PostgreSQL session storage (via @structured-world/gitlab-mcp-db)');
    return new mod.PostgreSQLStorageBackend();
}
function getStorageType(config) {
    return config?.type ?? getEnvStorageType();
}
function validateStorageConfig(config) {
    const errors = [];
    const type = getStorageType(config);
    if (type === 'postgresql') {
        const connectionString = process.env.OAUTH_STORAGE_POSTGRESQL_URL ?? process.env.DATABASE_URL;
        if (!connectionString) {
            errors.push('PostgreSQL storage requires OAUTH_STORAGE_POSTGRESQL_URL or DATABASE_URL environment variable');
        }
    }
    if (type === 'file') {
        const filePath = config?.file?.path ?? process.env.OAUTH_STORAGE_FILE_PATH;
        if (filePath) {
            if (filePath.includes('..')) {
                errors.push("File storage path must not contain '..'");
            }
        }
    }
    return errors;
}
//# sourceMappingURL=factory.js.map