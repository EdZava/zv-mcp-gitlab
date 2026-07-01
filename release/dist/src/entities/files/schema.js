"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManageFilesSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
const projectIdField = utils_1.requiredId.describe('Project ID or URL-encoded path');
const BatchFileActionSchema = zod_1.z.object({
    file_path: zod_1.z.string().describe('Path to the file'),
    content: zod_1.z.string().describe('File content'),
    encoding: zod_1.z.enum(['text', 'base64']).optional().describe('Content encoding'),
    execute_filemode: utils_1.flexibleBoolean.optional().describe('Set executable permission'),
});
const SingleActionSchema = zod_1.z.object({
    action: zod_1.z.literal('single').describe('Create or update a single file'),
    project_id: projectIdField,
    file_path: zod_1.z.string().describe('Path to the file'),
    content: zod_1.z.string().describe('File content (text or base64 encoded)'),
    commit_message: zod_1.z.string().describe('Commit message'),
    branch: zod_1.z.string().describe('Target branch name'),
    overwrite: utils_1.flexibleBoolean
        .optional()
        .describe('If true, automatically update existing file or create new one (requires pre-check via GET request). If false or omitted, only create new file (fails if file exists). Use true when unsure if file exists. Note: Non-404 errors (403, 500, etc.) during pre-check will fail the operation.'),
    start_branch: zod_1.z.string().optional().describe('Base branch to start from'),
    encoding: zod_1.z.enum(['text', 'base64']).optional().describe('Content encoding (default: text)'),
    author_email: zod_1.z.string().optional().describe('Commit author email'),
    author_name: zod_1.z.string().optional().describe('Commit author name'),
    last_commit_id: zod_1.z.string().optional().describe('Last known commit ID for conflict detection'),
    execute_filemode: utils_1.flexibleBoolean.optional().describe('Set executable permission'),
});
const BatchActionSchema = zod_1.z.object({
    action: zod_1.z.literal('batch').describe('Commit multiple files atomically'),
    project_id: projectIdField,
    branch: zod_1.z.string().describe('Target branch name'),
    commit_message: zod_1.z.string().describe('Commit message'),
    files: zod_1.z.array(BatchFileActionSchema).min(1).describe('Files to commit (at least one required)'),
    overwrite: utils_1.flexibleBoolean
        .optional()
        .describe('If true, automatically detect which files exist and update them, create others (requires pre-check for each file via GET requests). If false or omitted, only create new files (fails if any file exists). Use true when batch includes mix of new and existing files. Note: Non-404 errors during any pre-check will fail the entire batch.'),
    start_branch: zod_1.z.string().optional().describe('Base branch to start from'),
    author_email: zod_1.z.string().optional().describe('Commit author email'),
    author_name: zod_1.z.string().optional().describe('Commit author name'),
});
const UploadActionSchema = zod_1.z.object({
    action: zod_1.z.literal('upload').describe('Upload a file as markdown attachment'),
    project_id: projectIdField,
    file: zod_1.z.string().describe('Base64 encoded file content'),
    filename: zod_1.z.string().describe('Name of the file'),
});
exports.ManageFilesSchema = zod_1.z.discriminatedUnion('action', [
    SingleActionSchema,
    BatchActionSchema,
    UploadActionSchema,
]);
//# sourceMappingURL=schema.js.map