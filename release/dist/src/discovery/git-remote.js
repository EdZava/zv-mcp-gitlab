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
exports.parseRemoteUrl = parseRemoteUrl;
exports.parseGitConfig = parseGitConfig;
exports.selectBestRemote = selectBestRemote;
exports.parseGitRemote = parseGitRemote;
exports.listGitRemotes = listGitRemotes;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const logger_1 = require("../logger");
function parseRemoteUrl(url) {
    const normalizedUrl = url.trim();
    const sshMatch = normalizedUrl.match(/^git@([^:]+):(.+?)(?:\.git)?$/);
    if (sshMatch) {
        return {
            host: sshMatch[1],
            projectPath: normalizeProjectPath(sshMatch[2]),
            protocol: 'ssh',
            url: normalizedUrl,
        };
    }
    const sshProtocolMatch = normalizedUrl.match(/^ssh:\/\/git@([^/:]+)(?::(\d+))?\/(.+?)(?:\.git)?$/);
    if (sshProtocolMatch) {
        const sshHost = sshProtocolMatch[2]
            ? `${sshProtocolMatch[1]}:${sshProtocolMatch[2]}`
            : sshProtocolMatch[1];
        return {
            host: sshHost,
            projectPath: normalizeProjectPath(sshProtocolMatch[3]),
            protocol: 'ssh',
            url: normalizedUrl,
        };
    }
    const httpsMatch = normalizedUrl.match(/^https?:\/\/([^/:]+)(?::(\d+))?\/(.+?)(?:\.git)?$/);
    if (httpsMatch) {
        const httpsHost = httpsMatch[2] ? `${httpsMatch[1]}:${httpsMatch[2]}` : httpsMatch[1];
        return {
            host: httpsHost,
            projectPath: normalizeProjectPath(httpsMatch[3]),
            protocol: 'https',
            url: normalizedUrl,
        };
    }
    (0, logger_1.logDebug)('Could not parse remote URL', { url: normalizedUrl });
    return null;
}
function normalizeProjectPath(projectPath) {
    return projectPath.replace(/^\/+|\/+$/g, '');
}
function parseGitConfig(content) {
    const remotes = new Map();
    const lines = content.split(/\r?\n/);
    let currentRemote = null;
    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (line.length === 0) {
            continue;
        }
        const remoteHeaderMatch = line.match(/^\[remote\s+"([^"]+)"\]\s*$/);
        if (remoteHeaderMatch) {
            currentRemote = remoteHeaderMatch[1];
            continue;
        }
        if (line.startsWith('[') && line.endsWith(']')) {
            currentRemote = null;
            continue;
        }
        if (currentRemote === null) {
            continue;
        }
        const urlMatch = line.match(/^url\s*=\s*(.+)$/);
        if (urlMatch) {
            const url = urlMatch[1].trim();
            if (url !== '') {
                remotes.set(currentRemote, url);
            }
        }
    }
    return remotes;
}
function selectBestRemote(remotes, preferredRemote) {
    if (remotes.size === 0) {
        return null;
    }
    if (preferredRemote) {
        const url = remotes.get(preferredRemote);
        if (url !== undefined) {
            return { name: preferredRemote, url };
        }
    }
    const originUrl = remotes.get('origin');
    if (originUrl !== undefined) {
        return { name: 'origin', url: originUrl };
    }
    const firstEntry = remotes.entries().next();
    if (firstEntry.done) {
        return null;
    }
    const [name, url] = firstEntry.value;
    return { name, url };
}
async function parseGitRemote(options = {}) {
    const repoPath = options.repoPath ?? process.cwd();
    const gitConfigPath = path.join(repoPath, '.git', 'config');
    try {
        await fs.access(gitConfigPath);
    }
    catch {
        (0, logger_1.logDebug)('No .git/config found - not a git repository', { path: repoPath });
        return null;
    }
    let content;
    try {
        content = await fs.readFile(gitConfigPath, 'utf-8');
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        (0, logger_1.logWarn)('Failed to read git config', { error: message, path: gitConfigPath });
        return null;
    }
    const remotes = parseGitConfig(content);
    if (remotes.size === 0) {
        (0, logger_1.logDebug)('No remotes found in git config', { path: repoPath });
        return null;
    }
    const selected = selectBestRemote(remotes, options.remoteName);
    if (!selected) {
        return null;
    }
    const parsed = parseRemoteUrl(selected.url);
    if (!parsed) {
        (0, logger_1.logWarn)('Could not parse remote URL format', { remote: selected.name, url: selected.url });
        return null;
    }
    (0, logger_1.logDebug)('Parsed git remote', {
        remote: selected.name,
        host: parsed.host,
        projectPath: parsed.projectPath,
        protocol: parsed.protocol,
    });
    return {
        ...parsed,
        remoteName: selected.name,
    };
}
async function listGitRemotes(repoPath) {
    const gitConfigPath = path.join(repoPath ?? process.cwd(), '.git', 'config');
    try {
        const content = await fs.readFile(gitConfigPath, 'utf-8');
        const remotes = parseGitConfig(content);
        const result = [];
        for (const [name, url] of remotes) {
            const parsed = parseRemoteUrl(url);
            if (parsed) {
                result.push({ ...parsed, remoteName: name });
            }
        }
        return result;
    }
    catch {
        return [];
    }
}
//# sourceMappingURL=git-remote.js.map