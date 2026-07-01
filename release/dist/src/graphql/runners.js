"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RUNNER_DELETE = exports.RUNNER_UPDATE = exports.RUNNER_CREATE = exports.RESOLVE_PROJECT_ID = exports.RESOLVE_GROUP_ID = exports.LIST_RUNNER_JOBS = exports.GET_RUNNER = exports.LIST_PROJECT_RUNNERS = exports.LIST_GROUP_RUNNERS = exports.LIST_OWNED_RUNNERS = exports.LIST_RUNNERS = void 0;
const graphql_tag_1 = require("graphql-tag");
const RUNNER_FIELDS = `
  id
  description
  runnerType
  status
  paused
  locked
  runUntagged
  tagList
  accessLevel
  maximumTimeout
  jobExecutionStatus
  jobCount
  contactedAt
  createdAt
`;
const LIST_ARG_DECLS = `
  $type: CiRunnerType
  $status: CiRunnerStatus
  $paused: Boolean
  $tagList: [String!]
  $search: String
  $first: Int
  $after: String
`;
const LIST_ARG_USE = `
  type: $type
  status: $status
  paused: $paused
  tagList: $tagList
  search: $search
  first: $first
  after: $after
`;
exports.LIST_RUNNERS = (0, graphql_tag_1.gql) `
  query ListRunners(${LIST_ARG_DECLS}) {
    runners(${LIST_ARG_USE}) {
      nodes { ${RUNNER_FIELDS} }
      pageInfo { hasNextPage endCursor }
    }
  }
`;
exports.LIST_OWNED_RUNNERS = (0, graphql_tag_1.gql) `
  query ListOwnedRunners(${LIST_ARG_DECLS}) {
    currentUser {
      runners(${LIST_ARG_USE}) {
        nodes { ${RUNNER_FIELDS} }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;
exports.LIST_GROUP_RUNNERS = (0, graphql_tag_1.gql) `
  query ListGroupRunners($fullPath: ID!, ${LIST_ARG_DECLS}) {
    group(fullPath: $fullPath) {
      runners(${LIST_ARG_USE}) {
        nodes { ${RUNNER_FIELDS} }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;
exports.LIST_PROJECT_RUNNERS = (0, graphql_tag_1.gql) `
  query ListProjectRunners($fullPath: ID!, ${LIST_ARG_DECLS}) {
    project(fullPath: $fullPath) {
      runners(${LIST_ARG_USE}) {
        nodes { ${RUNNER_FIELDS} }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;
exports.GET_RUNNER = (0, graphql_tag_1.gql) `
  query GetRunner($id: CiRunnerID!) {
    runner(id: $id) { ${RUNNER_FIELDS} }
  }
`;
exports.LIST_RUNNER_JOBS = (0, graphql_tag_1.gql) `
  query ListRunnerJobs($id: CiRunnerID!, $statuses: [CiJobStatus!], $first: Int, $after: String) {
    runner(id: $id) {
      id
      jobs(statuses: $statuses, first: $first, after: $after) {
        nodes {
          id
          name
          status
          createdAt
          finishedAt
          duration
          webPath
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;
exports.RESOLVE_GROUP_ID = (0, graphql_tag_1.gql) `
  query ResolveGroupId($fullPath: ID!) {
    group(fullPath: $fullPath) {
      id
    }
  }
`;
exports.RESOLVE_PROJECT_ID = (0, graphql_tag_1.gql) `
  query ResolveProjectId($fullPath: ID!) {
    project(fullPath: $fullPath) {
      id
    }
  }
`;
exports.RUNNER_CREATE = (0, graphql_tag_1.gql) `
  mutation RunnerCreate($input: RunnerCreateInput!) {
    runnerCreate(input: $input) {
      runner {
        ${RUNNER_FIELDS}
        ephemeralAuthenticationToken
      }
      errors
    }
  }
`;
exports.RUNNER_UPDATE = (0, graphql_tag_1.gql) `
  mutation RunnerUpdate($input: RunnerUpdateInput!) {
    runnerUpdate(input: $input) {
      runner { ${RUNNER_FIELDS} }
      errors
    }
  }
`;
exports.RUNNER_DELETE = (0, graphql_tag_1.gql) `
  mutation RunnerDelete($input: RunnerDeleteInput!) {
    runnerDelete(input: $input) {
      errors
    }
  }
`;
//# sourceMappingURL=runners.js.map