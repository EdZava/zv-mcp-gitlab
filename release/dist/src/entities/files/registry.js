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
exports.filesToolRegistry = void 0;
exports.getFilesReadOnlyToolNames = getFilesReadOnlyToolNames;
exports.getFilesToolDefinitions = getFilesToolDefinitions;
exports.getFilteredFilesTools = getFilteredFilesTools;
const z = __importStar(require("zod"));
const schema_readonly_1 = require("./schema-readonly");
const schema_1 = require("./schema");
const gitlab_api_1 = require("../../utils/gitlab-api");
const projectIdentifier_1 = require("../../utils/projectIdentifier");
const fetch_1 = require("../../utils/fetch");
const utils_1 = require("../utils");
const error_handler_1 = require("../../utils/error-handler");
exports.filesToolRegistry = new Map([
    [
        'browse_files',
        {
            name: 'browse_files',
            description: 'Explore project file structure and read source code. Actions: tree (list directory contents with recursive depth control), content (read file at specific ref/branch), download_attachment (get uploaded file by secret+filename). Related: manage_files to create/update files.',
            inputSchema: z.toJSONSchema(schema_readonly_1.BrowseFilesSchema),
            requirements: { default: { tier: 'free', minVersion: '8.0' } },
            gate: { envVar: 'USE_FILES', defaultValue: true },
            handler: async (args) => {
                const input = schema_readonly_1.BrowseFilesSchema.parse(args);
                (0, utils_1.assertActionAllowed)('browse_files', input.action);
                switch (input.action) {
                    case 'tree': {
                        const query = {};
                        if (input.path)
                            query.path = input.path;
                        if (input.ref)
                            query.ref = input.ref;
                        if (input.recursive !== undefined)
                            query.recursive = input.recursive;
                        if (input.per_page !== undefined)
                            query.per_page = input.per_page;
                        if (input.page !== undefined)
                            query.page = input.page;
                        return gitlab_api_1.gitlab.get(`projects/${(0, projectIdentifier_1.normalizeProjectId)(input.project_id)}/repository/tree`, {
                            query: (0, gitlab_api_1.toQuery)(query, []),
                        });
                    }
                    case 'content': {
                        const queryParams = new URLSearchParams();
                        if (input.ref)
                            queryParams.set('ref', input.ref);
                        const apiUrl = `${process.env.GITLAB_API_URL}/api/v4/projects/${(0, projectIdentifier_1.normalizeProjectId)(input.project_id)}/repository/files/${encodeURIComponent(input.file_path)}/raw?${queryParams}`;
                        const response = await (0, fetch_1.enhancedFetch)(apiUrl);
                        if (!response.ok) {
                            throw new Error(`GitLab API error: ${response.status} ${response.statusText}`);
                        }
                        const content = await response.text();
                        return {
                            file_path: input.file_path,
                            ref: input.ref ?? 'HEAD',
                            size: content.length,
                            content: content,
                            content_type: response.headers.get('content-type') ?? 'text/plain',
                        };
                    }
                    case 'download_attachment': {
                        const apiUrl = `${process.env.GITLAB_API_URL}/api/v4/projects/${(0, projectIdentifier_1.normalizeProjectId)(input.project_id)}/uploads/${input.secret}/${input.filename}`;
                        const response = await (0, fetch_1.enhancedFetch)(apiUrl);
                        if (!response.ok) {
                            throw new Error(`GitLab API error: ${response.status} ${response.statusText}`);
                        }
                        const attachment = await response.arrayBuffer();
                        return {
                            filename: input.filename,
                            content: Buffer.from(attachment).toString('base64'),
                            contentType: response.headers.get('content-type') ?? 'application/octet-stream',
                        };
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
    [
        'manage_files',
        {
            name: 'manage_files',
            description: 'Create, update, or upload repository files. Actions: single (create/update one file with commit message), batch (atomic multi-file commit), upload (add attachment returning markdown link). Related: browse_files to read existing files.',
            inputSchema: z.toJSONSchema(schema_1.ManageFilesSchema),
            requirements: { default: { tier: 'free', minVersion: '8.0' } },
            gate: { envVar: 'USE_FILES', defaultValue: true },
            handler: async (args) => {
                const input = schema_1.ManageFilesSchema.parse(args);
                (0, utils_1.assertActionAllowed)('manage_files', input.action);
                switch (input.action) {
                    case 'single': {
                        const { project_id, file_path, action: _action, overwrite, ...body } = input;
                        const normalizedProjectId = (0, projectIdentifier_1.normalizeProjectId)(project_id);
                        const encodedFilePath = encodeURIComponent(file_path);
                        if (overwrite) {
                            let fileExists = false;
                            try {
                                await gitlab_api_1.gitlab.get(`projects/${normalizedProjectId}/repository/files/${encodedFilePath}`, { query: { ref: body.start_branch ?? body.branch } });
                                fileExists = true;
                            }
                            catch (error) {
                                if (!(error instanceof Error)) {
                                    throw error;
                                }
                                const parsed = (0, error_handler_1.parseGitLabApiError)(error.message);
                                if (!parsed) {
                                    throw error;
                                }
                                if (parsed.status !== 404) {
                                    throw error;
                                }
                                const message = parsed.message.toLowerCase();
                                const isFileMissing = message.includes('file not found') ||
                                    message.includes('file does not exist') ||
                                    message.includes('no such file') ||
                                    (message.includes('not found') && message.includes('file'));
                                if (!isFileMissing) {
                                    throw error;
                                }
                            }
                            const method = fileExists ? 'put' : 'post';
                            return gitlab_api_1.gitlab[method](`projects/${normalizedProjectId}/repository/files/${encodedFilePath}`, {
                                body,
                                contentType: 'form',
                            });
                        }
                        return gitlab_api_1.gitlab.post(`projects/${normalizedProjectId}/repository/files/${encodedFilePath}`, {
                            body,
                            contentType: 'form',
                        });
                    }
                    case 'batch': {
                        const normalizedProjectId = (0, projectIdentifier_1.normalizeProjectId)(input.project_id);
                        let actions;
                        if (input.overwrite) {
                            const fileChecks = await Promise.all(input.files.map(async (file) => {
                                try {
                                    await gitlab_api_1.gitlab.get(`projects/${normalizedProjectId}/repository/files/${encodeURIComponent(file.file_path)}`, { query: { ref: input.start_branch ?? input.branch } });
                                    return { file_path: file.file_path, exists: true };
                                }
                                catch (error) {
                                    if (error instanceof Error) {
                                        const parsed = (0, error_handler_1.parseGitLabApiError)(error.message);
                                        if (parsed) {
                                            if (parsed.status === 404) {
                                                const message = parsed.message.toLowerCase();
                                                const isFileMissing = message.includes('file not found') ||
                                                    message.includes('file does not exist') ||
                                                    message.includes('no such file') ||
                                                    (message.includes('not found') && message.includes('file'));
                                                if (isFileMissing) {
                                                    return { file_path: file.file_path, exists: false };
                                                }
                                                throw error;
                                            }
                                            throw error;
                                        }
                                    }
                                    throw error;
                                }
                            }));
                            const existenceMap = new Map();
                            fileChecks.forEach((result) => {
                                existenceMap.set(result.file_path, result.exists);
                            });
                            actions = input.files.map((file) => ({
                                action: existenceMap.get(file.file_path) ? 'update' : 'create',
                                file_path: file.file_path,
                                content: file.content,
                                encoding: file.encoding ?? 'text',
                                execute_filemode: file.execute_filemode ?? false,
                            }));
                        }
                        else {
                            actions = input.files.map((file) => ({
                                action: 'create',
                                file_path: file.file_path,
                                content: file.content,
                                encoding: file.encoding ?? 'text',
                                execute_filemode: file.execute_filemode ?? false,
                            }));
                        }
                        const body = {
                            branch: input.branch,
                            commit_message: input.commit_message,
                            actions,
                        };
                        if (input.start_branch)
                            body.start_branch = input.start_branch;
                        if (input.author_email)
                            body.author_email = input.author_email;
                        if (input.author_name)
                            body.author_name = input.author_name;
                        return gitlab_api_1.gitlab.post(`projects/${normalizedProjectId}/repository/commits`, {
                            body,
                            contentType: 'json',
                        });
                    }
                    case 'upload': {
                        const formData = new FormData();
                        const buffer = Buffer.from(input.file, 'base64');
                        const fileObj = new File([buffer], input.filename, {
                            type: 'application/octet-stream',
                        });
                        formData.append('file', fileObj);
                        return gitlab_api_1.gitlab.post(`projects/${(0, projectIdentifier_1.normalizeProjectId)(input.project_id)}/uploads`, {
                            body: formData,
                        });
                    }
                    default:
                        throw new Error(`Unknown action: ${input.action}`);
                }
            },
        },
    ],
]);
function getFilesReadOnlyToolNames() {
    return ['browse_files'];
}
function getFilesToolDefinitions() {
    return Array.from(exports.filesToolRegistry.values());
}
function getFilteredFilesTools(readOnlyMode = false) {
    if (readOnlyMode) {
        const readOnlyNames = getFilesReadOnlyToolNames();
        return Array.from(exports.filesToolRegistry.values()).filter((tool) => readOnlyNames.includes(tool.name));
    }
    return getFilesToolDefinitions();
}
//# sourceMappingURL=registry.js.map