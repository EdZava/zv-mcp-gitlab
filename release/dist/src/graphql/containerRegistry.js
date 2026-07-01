"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DESTROY_CONTAINER_REPOSITORY_TAGS = exports.DESTROY_CONTAINER_REPOSITORY = exports.LIST_CONTAINER_REPOSITORY_TAGS = exports.GET_CONTAINER_REPOSITORY = exports.LIST_CONTAINER_REPOSITORIES = void 0;
const graphql_tag_1 = require("graphql-tag");
const REPOSITORY_LIST_FIELDS = `
  id
  name
  path
  location
  status
  tagsCount
  createdAt
  updatedAt
`;
const REPOSITORY_DETAIL_FIELDS = `
  ${REPOSITORY_LIST_FIELDS}
  lastPublishedAt
`;
const TAG_FIELDS = `
  name
  path
  location
  digest
  revision
  shortRevision
  totalSize
  createdAt
  publishedAt
  mediaType
`;
exports.LIST_CONTAINER_REPOSITORIES = (0, graphql_tag_1.gql) `
  query ListContainerRepositories($fullPath: ID!, $name: String, $first: Int, $after: String) {
    project(fullPath: $fullPath) {
      containerRepositories(name: $name, first: $first, after: $after) {
        nodes {
          ${REPOSITORY_LIST_FIELDS}
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;
exports.GET_CONTAINER_REPOSITORY = (0, graphql_tag_1.gql) `
    query GetContainerRepository($id: ContainerRepositoryID!) {
      containerRepository(id: $id) {
        ${REPOSITORY_DETAIL_FIELDS}
      }
    }
  `;
exports.LIST_CONTAINER_REPOSITORY_TAGS = (0, graphql_tag_1.gql) `
  query ListContainerRepositoryTags(
    $id: ContainerRepositoryID!
    $name: String
    $first: Int
    $after: String
  ) {
    containerRepository(id: $id) {
      id
      tags(name: $name, first: $first, after: $after) {
        nodes {
          ${TAG_FIELDS}
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;
exports.DESTROY_CONTAINER_REPOSITORY = (0, graphql_tag_1.gql) `
  mutation DestroyContainerRepository($id: ContainerRepositoryID!) {
    destroyContainerRepository(input: { id: $id }) {
      containerRepository {
        id
        status
      }
      errors
    }
  }
`;
exports.DESTROY_CONTAINER_REPOSITORY_TAGS = (0, graphql_tag_1.gql) `
  mutation DestroyContainerRepositoryTags($id: ContainerRepositoryID!, $tagNames: [String!]!) {
    destroyContainerRepositoryTags(input: { id: $id, tagNames: $tagNames }) {
      deletedTagNames
      errors
    }
  }
`;
//# sourceMappingURL=containerRegistry.js.map