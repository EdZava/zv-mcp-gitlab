"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManageRefSchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
const projectIdField = utils_1.requiredId.describe("Project ID or URL-encoded path (e.g., 'my-group/my-project')");
const accessLevelField = zod_1.z
    .number()
    .int()
    .describe('Access level: 0=No access, 30=Developers, 40=Maintainers, 60=Admins');
const CreateBranchSchema = zod_1.z.object({
    action: zod_1.z.literal('create_branch').describe('Create a new branch from an existing ref'),
    project_id: projectIdField,
    branch: zod_1.z.string().describe('Name for the new branch'),
    ref: zod_1.z.string().describe('Source branch name, tag, or commit SHA to create from'),
});
const DeleteBranchSchema = zod_1.z.object({
    action: zod_1.z.literal('delete_branch').describe('Delete a branch from the repository'),
    project_id: projectIdField,
    branch: zod_1.z.string().describe('Branch name to delete'),
});
const ProtectBranchSchema = zod_1.z.object({
    action: zod_1.z.literal('protect_branch').describe('Add protection rules to a branch or pattern'),
    project_id: projectIdField,
    name: zod_1.z.string().describe("Branch name or wildcard pattern (e.g., 'main', 'release-*')"),
    push_access_level: accessLevelField.optional().describe('Who can push (default: 40=Maintainers)'),
    merge_access_level: accessLevelField
        .optional()
        .describe('Who can merge (default: 40=Maintainers)'),
    unprotect_access_level: accessLevelField
        .optional()
        .describe('Who can unprotect (default: 40=Maintainers)'),
    allow_force_push: zod_1.z
        .boolean()
        .optional()
        .describe('Allow force push to protected branch (default: false)'),
    allowed_to_push: zod_1.z
        .array(zod_1.z.object({
        user_id: zod_1.z.number().optional().describe('User ID'),
        group_id: zod_1.z.number().optional().describe('Group ID'),
        access_level: accessLevelField.optional().describe('Access level'),
    }))
        .optional()
        .describe('Granular push access (Premium feature)'),
    allowed_to_merge: zod_1.z
        .array(zod_1.z.object({
        user_id: zod_1.z.number().optional().describe('User ID'),
        group_id: zod_1.z.number().optional().describe('Group ID'),
        access_level: accessLevelField.optional().describe('Access level'),
    }))
        .optional()
        .describe('Granular merge access (Premium feature)'),
    allowed_to_unprotect: zod_1.z
        .array(zod_1.z.object({
        user_id: zod_1.z.number().optional().describe('User ID'),
        group_id: zod_1.z.number().optional().describe('Group ID'),
        access_level: accessLevelField.optional().describe('Access level'),
    }))
        .optional()
        .describe('Granular unprotect access (Premium feature)'),
    code_owner_approval_required: zod_1.z
        .boolean()
        .optional()
        .describe('Require code owner approval (Premium feature)'),
});
const UnprotectBranchSchema = zod_1.z.object({
    action: zod_1.z.literal('unprotect_branch').describe('Remove protection from a branch'),
    project_id: projectIdField,
    name: zod_1.z.string().describe('Branch name or wildcard pattern to unprotect'),
});
const UpdateBranchProtectionSchema = zod_1.z.object({
    action: zod_1.z.literal('update_branch_protection').describe('Update protection rules for a branch'),
    project_id: projectIdField,
    name: zod_1.z.string().describe('Branch name or wildcard pattern'),
    allow_force_push: zod_1.z.boolean().optional().describe('Allow force push to protected branch'),
    allowed_to_push: zod_1.z
        .array(zod_1.z.object({
        user_id: zod_1.z.number().optional().describe('User ID'),
        group_id: zod_1.z.number().optional().describe('Group ID'),
        access_level: accessLevelField.optional().describe('Access level'),
    }))
        .optional()
        .describe('Granular push access (Premium feature)'),
    allowed_to_merge: zod_1.z
        .array(zod_1.z.object({
        user_id: zod_1.z.number().optional().describe('User ID'),
        group_id: zod_1.z.number().optional().describe('Group ID'),
        access_level: accessLevelField.optional().describe('Access level'),
    }))
        .optional()
        .describe('Granular merge access (Premium feature)'),
    allowed_to_unprotect: zod_1.z
        .array(zod_1.z.object({
        user_id: zod_1.z.number().optional().describe('User ID'),
        group_id: zod_1.z.number().optional().describe('Group ID'),
        access_level: accessLevelField.optional().describe('Access level'),
    }))
        .optional()
        .describe('Granular unprotect access (Premium feature)'),
    code_owner_approval_required: zod_1.z
        .boolean()
        .optional()
        .describe('Require code owner approval (Premium feature)'),
});
const CreateTagSchema = zod_1.z.object({
    action: zod_1.z.literal('create_tag').describe('Create a new tag in the repository'),
    project_id: projectIdField,
    tag_name: zod_1.z.string().describe("Name for the new tag (e.g., 'v1.0.0')"),
    ref: zod_1.z.string().describe('Source branch name or commit SHA to create tag from'),
    message: zod_1.z.string().optional().describe('Annotation message (creates annotated tag if provided)'),
});
const DeleteTagSchema = zod_1.z.object({
    action: zod_1.z.literal('delete_tag').describe('Delete a tag from the repository'),
    project_id: projectIdField,
    tag_name: zod_1.z.string().describe('Tag name to delete'),
});
const ProtectTagSchema = zod_1.z.object({
    action: zod_1.z.literal('protect_tag').describe('Add protection rules to a tag pattern (Premium)'),
    project_id: projectIdField,
    name: zod_1.z.string().describe("Tag name or wildcard pattern (e.g., 'v*', 'release-*')"),
    create_access_level: accessLevelField
        .optional()
        .describe('Who can create matching tags (default: 40=Maintainers)'),
    allowed_to_create: zod_1.z
        .array(zod_1.z.object({
        user_id: zod_1.z.number().optional().describe('User ID'),
        group_id: zod_1.z.number().optional().describe('Group ID'),
        access_level: accessLevelField.optional().describe('Access level'),
    }))
        .optional()
        .describe('Granular create access (Premium feature)'),
});
const UnprotectTagSchema = zod_1.z.object({
    action: zod_1.z.literal('unprotect_tag').describe('Remove protection from a tag pattern (Premium)'),
    project_id: projectIdField,
    name: zod_1.z.string().describe('Tag name or wildcard pattern to unprotect'),
});
exports.ManageRefSchema = zod_1.z.discriminatedUnion('action', [
    CreateBranchSchema,
    DeleteBranchSchema,
    ProtectBranchSchema,
    UnprotectBranchSchema,
    UpdateBranchProtectionSchema,
    CreateTagSchema,
    DeleteTagSchema,
    ProtectTagSchema,
    UnprotectTagSchema,
]);
//# sourceMappingURL=schema.js.map