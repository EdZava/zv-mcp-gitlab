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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileStorageBackend = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const types_1 = require("./types");
const memory_1 = require("./memory");
const logger_1 = require("../../logger");
class FileStorageBackend {
    type = 'file';
    memory;
    filePath;
    saveInterval;
    saveDebounce;
    saveIntervalId = null;
    saveDebounceId = null;
    pendingSave = false;
    initialized = false;
    constructor(options) {
        this.memory = new memory_1.MemoryStorageBackend({ silent: true });
        this.filePath = options.filePath;
        this.saveInterval = options.saveInterval ?? 30000;
        this.saveDebounce = options.saveDebounce ?? 1000;
    }
    async initialize() {
        const dir = path.dirname(this.filePath);
        let dirCreated = false;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            dirCreated = true;
            (0, logger_1.logInfo)('Created storage directory', { dir });
        }
        const fileExists = fs.existsSync(this.filePath);
        if (fileExists) {
            const stats = fs.statSync(this.filePath);
            (0, logger_1.logInfo)('Found existing session file', {
                filePath: this.filePath,
                size: stats.size,
                mtime: stats.mtime.toISOString(),
            });
            await this.loadFromFile();
        }
        else {
            (0, logger_1.logInfo)('No existing session file, will create on first save', {
                filePath: this.filePath,
            });
        }
        try {
            const testPath = `${this.filePath}.test`;
            fs.writeFileSync(testPath, 'test', 'utf-8');
            fs.unlinkSync(testPath);
            (0, logger_1.logDebug)('Write access verified', { filePath: this.filePath });
        }
        catch (error) {
            (0, logger_1.logError)('Cannot write to storage file path - sessions will NOT persist!', {
                err: error,
                filePath: this.filePath,
            });
            throw new Error(`File storage path not writable: ${this.filePath}`, { cause: error });
        }
        await this.memory.initialize();
        this.startSaveInterval();
        this.initialized = true;
        (0, logger_1.logInfo)('File storage backend initialized', {
            filePath: this.filePath,
            dirCreated,
            fileExisted: fileExists,
        });
    }
    async loadFromFile() {
        try {
            const content = fs.readFileSync(this.filePath, 'utf-8');
            const data = JSON.parse(content);
            if (data.version !== types_1.STORAGE_DATA_VERSION) {
                (0, logger_1.logWarn)('Storage file version mismatch, migrating data', {
                    fileVersion: data.version,
                    currentVersion: types_1.STORAGE_DATA_VERSION,
                });
            }
            const now = Date.now();
            const validSessions = data.sessions.filter((s) => {
                const maxAge = 7 * 24 * 60 * 60 * 1000;
                return s.createdAt + maxAge > now;
            });
            const validDeviceFlows = data.deviceFlows.filter((d) => d.flow.expiresAt > now);
            const validAuthCodeFlows = data.authCodeFlows.filter((a) => a.flow.expiresAt > now);
            const validAuthCodes = data.authCodes.filter((a) => a.expiresAt > now);
            this.memory.importData({
                sessions: validSessions,
                deviceFlows: validDeviceFlows,
                authCodeFlows: validAuthCodeFlows,
                authCodes: validAuthCodes,
                mcpSessionMappings: data.mcpSessionMappings,
            });
            const stats = await this.memory.getStats();
            (0, logger_1.logInfo)('Loaded sessions from file', {
                loadedSessions: stats.sessions,
                expiredSessions: data.sessions.length - validSessions.length,
                loadedDeviceFlows: stats.deviceFlows,
                loadedAuthCodes: stats.authCodes,
            });
        }
        catch (error) {
            (0, logger_1.logError)('Failed to load sessions from file', {
                err: error,
                filePath: this.filePath,
            });
        }
    }
    async saveToFile() {
        if (!this.initialized)
            return;
        try {
            const exportedData = this.memory.exportData();
            const data = {
                version: types_1.STORAGE_DATA_VERSION,
                exportedAt: Date.now(),
                sessions: exportedData.sessions,
                deviceFlows: exportedData.deviceFlows,
                authCodeFlows: exportedData.authCodeFlows,
                authCodes: exportedData.authCodes,
                mcpSessionMappings: exportedData.mcpSessionMappings,
            };
            const tempPath = `${this.filePath}.tmp`;
            const content = JSON.stringify(data);
            fs.writeFileSync(tempPath, content, 'utf-8');
            fs.renameSync(tempPath, this.filePath);
            (0, logger_1.logDebug)('Saved sessions to file', {
                sessions: data.sessions.length,
                deviceFlows: data.deviceFlows.length,
                authCodes: data.authCodes.length,
            });
        }
        catch (error) {
            (0, logger_1.logError)('Failed to save sessions to file', {
                err: error,
                filePath: this.filePath,
            });
        }
    }
    scheduleSave() {
        this.pendingSave = true;
        if (this.saveDebounceId) {
            clearTimeout(this.saveDebounceId);
        }
        this.saveDebounceId = setTimeout(() => {
            if (this.pendingSave) {
                this.pendingSave = false;
                this.saveToFile().catch((err) => (0, logger_1.logError)('Failed to save to file', { err }));
            }
        }, this.saveDebounce);
    }
    startSaveInterval() {
        this.saveIntervalId = setInterval(() => {
            this.saveToFile().catch((err) => (0, logger_1.logError)('Failed to save to file', { err }));
        }, this.saveInterval);
        if (this.saveIntervalId.unref) {
            this.saveIntervalId.unref();
        }
    }
    async createSession(session) {
        await this.memory.createSession(session);
        this.scheduleSave();
    }
    async getSession(sessionId) {
        return this.memory.getSession(sessionId);
    }
    async getSessionByToken(token) {
        return this.memory.getSessionByToken(token);
    }
    async getSessionByRefreshToken(refreshToken) {
        return this.memory.getSessionByRefreshToken(refreshToken);
    }
    async updateSession(sessionId, updates) {
        const result = await this.memory.updateSession(sessionId, updates);
        if (result)
            this.scheduleSave();
        return result;
    }
    async deleteSession(sessionId) {
        const result = await this.memory.deleteSession(sessionId);
        if (result)
            this.scheduleSave();
        return result;
    }
    async getAllSessions() {
        return this.memory.getAllSessions();
    }
    async storeDeviceFlow(state, flow) {
        await this.memory.storeDeviceFlow(state, flow);
        this.scheduleSave();
    }
    async getDeviceFlow(state) {
        return this.memory.getDeviceFlow(state);
    }
    async getDeviceFlowByDeviceCode(deviceCode) {
        return this.memory.getDeviceFlowByDeviceCode(deviceCode);
    }
    async deleteDeviceFlow(state) {
        const result = await this.memory.deleteDeviceFlow(state);
        if (result)
            this.scheduleSave();
        return result;
    }
    async storeAuthCodeFlow(internalState, flow) {
        await this.memory.storeAuthCodeFlow(internalState, flow);
        this.scheduleSave();
    }
    async getAuthCodeFlow(internalState) {
        return this.memory.getAuthCodeFlow(internalState);
    }
    async deleteAuthCodeFlow(internalState) {
        const result = await this.memory.deleteAuthCodeFlow(internalState);
        if (result)
            this.scheduleSave();
        return result;
    }
    async storeAuthCode(code) {
        await this.memory.storeAuthCode(code);
        this.scheduleSave();
    }
    async getAuthCode(code) {
        return this.memory.getAuthCode(code);
    }
    async deleteAuthCode(code) {
        const result = await this.memory.deleteAuthCode(code);
        if (result)
            this.scheduleSave();
        return result;
    }
    async associateMcpSession(mcpSessionId, oauthSessionId) {
        await this.memory.associateMcpSession(mcpSessionId, oauthSessionId);
        this.scheduleSave();
    }
    async getSessionByMcpSessionId(mcpSessionId) {
        return this.memory.getSessionByMcpSessionId(mcpSessionId);
    }
    async removeMcpSessionAssociation(mcpSessionId) {
        const result = await this.memory.removeMcpSessionAssociation(mcpSessionId);
        if (result)
            this.scheduleSave();
        return result;
    }
    async cleanup() {
        await this.memory.cleanup();
        await this.saveToFile();
    }
    async close() {
        if (this.saveIntervalId) {
            clearInterval(this.saveIntervalId);
            this.saveIntervalId = null;
        }
        if (this.saveDebounceId) {
            clearTimeout(this.saveDebounceId);
            this.saveDebounceId = null;
        }
        await this.saveToFile();
        await this.memory.close();
        (0, logger_1.logInfo)('File storage backend closed');
    }
    async getStats() {
        return this.memory.getStats();
    }
    async forceSave() {
        if (this.saveDebounceId) {
            clearTimeout(this.saveDebounceId);
            this.saveDebounceId = null;
        }
        this.pendingSave = false;
        await this.saveToFile();
    }
}
exports.FileStorageBackend = FileStorageBackend;
//# sourceMappingURL=file.js.map