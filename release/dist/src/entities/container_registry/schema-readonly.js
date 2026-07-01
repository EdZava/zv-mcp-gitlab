"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowseRegistrySchema = void 0;
const zod_1 = require("zod");
const utils_1 = require("../utils");
const projectPathField = utils_1.requiredId.describe("Project full path (e.g., 'my-group/my-project') - required by the GraphQL project lookup");
const repositoryIdField = zod_1.z.coerce
    .number()
    .int()
    .positive()
    .describe('Numeric ID of the container repository (from list_repositories)');
const tagNameField = zod_1.z
    .string()
    .min(1)
    .describe('Container image tag name (e.g., "latest", "v1.2.0")');
const firstField = zod_1.z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .optional()
    .describe('Max number of items to return (cursor pagination, default 20, max 100)');
const afterField = zod_1.z
    .string()
    .optional()
    .describe('Cursor for the next page (endCursor from a previous response)');
const ListRepositoriesSchema = zod_1.z.object({
    action: zod_1.z
        .literal('list_repositories')
        .describe("List a project's container registry repositories"),
    project_id: projectPathField,
    name: zod_1.z.string().optional().describe('Filter repositories by name (substring match)'),
    first: firstField,
    after: afterField,
});
const GetRepositorySchema = zod_1.z.object({
    action: zod_1.z
        .literal('get_repository')
        .describe('Get a single container repository by its numeric ID'),
    repository_id: repositoryIdField,
});
const ListTagsSchema = zod_1.z.object({
    action: zod_1.z.literal('list_tags').describe('List tags of a container repository'),
    repository_id: repositoryIdField,
    name: zod_1.z.string().optional().describe('Filter tags by name (substring match)'),
    first: firstField,
    after: afterField,
});
const GetTagSchema = zod_1.z.object({
    action: zod_1.z
        .literal('get_tag')
        .describe('Get a single tag with its manifest digest, size, and timestamps'),
    repository_id: repositoryIdField,
    tag_name: tagNameField,
});
exports.BrowseRegistrySchema = zod_1.z.discriminatedUnion('action', [
    ListRepositoriesSchema,
    GetRepositorySchema,
    ListTagsSchema,
    GetTagSchema,
]);
//# sourceMappingURL=schema-readonly.js.map