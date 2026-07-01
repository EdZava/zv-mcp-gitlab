"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowseFilesSchema = exports.GitLabTreeSchema = exports.GitLabCreateUpdateFileResponseSchema = exports.GitLabContentSchema = exports.GitLabDirectoryContentSchema = exports.GitLabFileContentSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
exports.GitLabFileContentSchema = zod_1.z.object({
    file_name: zod_1.z.string(),
    file_path: zod_1.z.string(),
    size: zod_1.z.number(),
    encoding: zod_1.z.string(),
    content_sha256: zod_1.z.string().optional(),
    ref: zod_1.z.string().optional(),
    blob_id: zod_1.z.string(),
    commit_id: zod_1.z.string(),
    last_commit_id: zod_1.z.string(),
    content: zod_1.z.string().optional(),
});
exports.GitLabDirectoryContentSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    type: zod_1.z.enum(['tree', 'blob']),
    path: zod_1.z.string(),
    mode: zod_1.z.string(),
});
exports.GitLabContentSchema = zod_1.z.union([exports.GitLabFileContentSchema, exports.GitLabDirectoryContentSchema]);
exports.GitLabCreateUpdateFileResponseSchema = zod_1.z.object({
    file_path: zod_1.z.string(),
    branch: zod_1.z.string(),
});
exports.GitLabTreeSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    type: zod_1.z.enum(['tree', 'blob']),
    path: zod_1.z.string(),
    mode: zod_1.z.string(),
});
const projectIdField = utils_1.requiredId.describe('Project ID or URL-encoded path');
const refField = zod_1.z.string().optional().describe('Branch, tag, or commit SHA');
const TreeActionSchema = zod_1.z.object({
    action: zod_1.z.literal('tree').describe('List files and folders in a directory'),
    project_id: projectIdField,
    ref: refField,
    path: zod_1.z.string().optional().describe('Directory path to list'),
    recursive: utils_1.flexibleBoolean.optional().describe('Include nested directories'),
    ...(0, utils_1.paginationFields)(),
});
const ContentActionSchema = zod_1.z.object({
    action: zod_1.z.literal('content').describe('Read file contents'),
    project_id: projectIdField,
    ref: refField,
    file_path: zod_1.z.string().describe('Path to the file to read'),
});
const DownloadAttachmentActionSchema = zod_1.z.object({
    action: zod_1.z.literal('download_attachment').describe('Download a file attachment from issues/MRs'),
    project_id: projectIdField,
    secret: zod_1.z.string().describe('Security token from the attachment URL.'),
    filename: zod_1.z.string().describe('Original filename of the attachment.'),
});
exports.BrowseFilesSchema = zod_1.z.discriminatedUnion('action', [
    TreeActionSchema,
    ContentActionSchema,
    DownloadAttachmentActionSchema,
]);
//# sourceMappingURL=schema-readonly.js.map