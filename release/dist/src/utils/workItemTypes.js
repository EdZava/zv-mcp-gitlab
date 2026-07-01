"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkItemTypes = getWorkItemTypes;
const ConnectionManager_1 = require("../services/ConnectionManager");
const workItems_1 = require("../graphql/workItems");
async function getWorkItemTypes(namespace) {
    const connectionManager = ConnectionManager_1.ConnectionManager.getInstance();
    const client = connectionManager.getClient();
    const response = await client.request(workItems_1.GET_WORK_ITEM_TYPES, {
        namespacePath: namespace,
    });
    return response.namespace?.workItemTypes?.nodes ?? [];
}
//# sourceMappingURL=workItemTypes.js.map