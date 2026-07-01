"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REVERT_VULN = exports.RESOLVE_VULN = exports.CONFIRM_VULN = exports.DISMISS_VULN = exports.GET_VULN = exports.LIST_INSTANCE_VULNS = exports.LIST_GROUP_VULNS = exports.LIST_PROJECT_VULNS = void 0;
const graphql_tag_1 = require("graphql-tag");
const VULN_FIELDS = `
  id
  title
  description
  state
  severity
  reportType
  resolvedOnDefaultBranch
  detectedAt
  confirmedAt
  resolvedAt
  dismissedAt
  vulnerabilityPath
  webUrl
`;
const LIST_ARG_DECLS = `
  $state: [VulnerabilityState!]
  $severity: [VulnerabilitySeverity!]
  $reportType: [VulnerabilityReportType!]
  $sort: VulnerabilitySort
  $first: Int
  $after: String
`;
const LIST_ARG_USE = `
  state: $state
  severity: $severity
  reportType: $reportType
  sort: $sort
  first: $first
  after: $after
`;
exports.LIST_PROJECT_VULNS = (0, graphql_tag_1.gql) `
  query ListProjectVulnerabilities($fullPath: ID!, ${LIST_ARG_DECLS}) {
    project(fullPath: $fullPath) {
      vulnerabilities(${LIST_ARG_USE}) {
        nodes { ${VULN_FIELDS} }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;
exports.LIST_GROUP_VULNS = (0, graphql_tag_1.gql) `
  query ListGroupVulnerabilities($fullPath: ID!, ${LIST_ARG_DECLS}) {
    group(fullPath: $fullPath) {
      vulnerabilities(${LIST_ARG_USE}) {
        nodes { ${VULN_FIELDS} }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;
exports.LIST_INSTANCE_VULNS = (0, graphql_tag_1.gql) `
  query ListInstanceVulnerabilities($projectId: [ID!], ${LIST_ARG_DECLS}) {
    vulnerabilities(projectId: $projectId, ${LIST_ARG_USE}) {
      nodes { ${VULN_FIELDS} }
      pageInfo { hasNextPage endCursor }
    }
  }
`;
exports.GET_VULN = (0, graphql_tag_1.gql) `
  query GetVulnerability($id: VulnerabilityID!) {
    vulnerability(id: $id) { ${VULN_FIELDS} }
  }
`;
exports.DISMISS_VULN = (0, graphql_tag_1.gql) `
  mutation DismissVulnerability(
    $id: VulnerabilityID!
    $comment: String
    $dismissalReason: VulnerabilityDismissalReason
  ) {
    vulnerabilityDismiss(input: { id: $id, comment: $comment, dismissalReason: $dismissalReason }) {
      vulnerability { ${VULN_FIELDS} }
      errors
    }
  }
`;
exports.CONFIRM_VULN = (0, graphql_tag_1.gql) `
  mutation ConfirmVulnerability($id: VulnerabilityID!) {
    vulnerabilityConfirm(input: { id: $id }) {
      vulnerability { ${VULN_FIELDS} }
      errors
    }
  }
`;
exports.RESOLVE_VULN = (0, graphql_tag_1.gql) `
  mutation ResolveVulnerability($id: VulnerabilityID!) {
    vulnerabilityResolve(input: { id: $id }) {
      vulnerability { ${VULN_FIELDS} }
      errors
    }
  }
`;
exports.REVERT_VULN = (0, graphql_tag_1.gql) `
  mutation RevertVulnerabilityToDetected($id: VulnerabilityID!) {
    vulnerabilityRevertToDetected(input: { id: $id }) {
      vulnerability { ${VULN_FIELDS} }
      errors
    }
  }
`;
//# sourceMappingURL=vulnerabilities.js.map