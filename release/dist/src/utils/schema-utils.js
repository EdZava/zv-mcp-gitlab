"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDetectedSchemaMode = setDetectedSchemaMode;
exports.clearDetectedSchemaMode = clearDetectedSchemaMode;
exports.filterDiscriminatedUnionActions = filterDiscriminatedUnionActions;
exports.flattenDiscriminatedUnion = flattenDiscriminatedUnion;
exports.applyDescriptionOverrides = applyDescriptionOverrides;
exports.transformToolSchema = transformToolSchema;
exports.stripTierRestrictedParameters = stripTierRestrictedParameters;
exports.shouldRemoveTool = shouldRemoveTool;
exports.extractActionsFromSchema = extractActionsFromSchema;
const config_1 = require("../config");
const logger_1 = require("../logger");
let detectedSchemaMode = null;
function setDetectedSchemaMode(clientName) {
    if (config_1.GITLAB_SCHEMA_MODE !== 'auto') {
        return;
    }
    detectedSchemaMode = (0, config_1.detectSchemaMode)(clientName);
    (0, logger_1.logInfo)('Auto-detected schema mode from client', {
        clientName,
        detectedMode: detectedSchemaMode,
    });
}
function clearDetectedSchemaMode() {
    detectedSchemaMode = null;
}
function filterDiscriminatedUnionActions(schema, toolName) {
    const deniedActions = config_1.GITLAB_DENIED_ACTIONS.get(toolName.toLowerCase());
    if (!schema.oneOf || !deniedActions || deniedActions.size === 0) {
        return schema;
    }
    const result = JSON.parse(JSON.stringify(schema));
    const originalOneOf = result.oneOf ?? [];
    result.oneOf = originalOneOf.filter((branch) => {
        const actionProp = branch.properties?.action;
        if (!actionProp)
            return true;
        if (actionProp.const) {
            const isAllowed = !deniedActions.has(actionProp.const.toLowerCase());
            if (!isAllowed) {
                (0, logger_1.logDebug)(`Tool '${toolName}': filtered out action '${actionProp.const}' from schema`);
            }
            return isAllowed;
        }
        if (actionProp.enum?.[0]) {
            const isAllowed = !deniedActions.has(actionProp.enum[0].toLowerCase());
            if (!isAllowed) {
                (0, logger_1.logDebug)(`Tool '${toolName}': filtered out action '${actionProp.enum[0]}' from schema`);
            }
            return isAllowed;
        }
        return true;
    });
    if (result.oneOf.length === 0) {
        (0, logger_1.logWarn)(`Tool '${toolName}': all actions filtered out!`);
        return { type: 'object', properties: {} };
    }
    return result;
}
function flattenDiscriminatedUnion(schema) {
    if (!schema.oneOf || schema.oneOf.length === 0) {
        return schema;
    }
    const allProperties = {};
    const propertyBranches = new Map();
    const actionValues = [];
    const totalBranches = schema.oneOf.length;
    const requiredInAllBranches = new Set();
    let firstBranch = true;
    for (const branch of schema.oneOf) {
        if (!branch.properties)
            continue;
        const branchRequired = new Set(branch.required ?? []);
        for (const [propName, propDef] of Object.entries(branch.properties)) {
            if (propName === 'action') {
                if (propDef.const) {
                    actionValues.push(propDef.const);
                }
                else if (propDef.enum) {
                    actionValues.push(...propDef.enum);
                }
                continue;
            }
            if (!allProperties[propName]) {
                allProperties[propName] = { ...propDef };
                propertyBranches.set(propName, 1);
            }
            else {
                propertyBranches.set(propName, (propertyBranches.get(propName) ?? 0) + 1);
                const existingDesc = allProperties[propName].description ?? '';
                if (propDef.description && propDef.description.length > existingDesc.length) {
                    allProperties[propName].description = propDef.description;
                }
            }
            if (firstBranch) {
                if (branchRequired.has(propName)) {
                    requiredInAllBranches.add(propName);
                }
            }
            else {
                if (!branchRequired.has(propName)) {
                    requiredInAllBranches.delete(propName);
                }
            }
        }
        firstBranch = false;
    }
    const flatSchema = {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: [...new Set(actionValues)],
                description: `Action to perform: ${[...new Set(actionValues)].join(', ')}`,
            },
            ...allProperties,
        },
        required: ['action', ...Array.from(requiredInAllBranches)],
    };
    for (const [propName, count] of propertyBranches) {
        if (count < totalBranches && allProperties[propName]) {
            const actionsUsingProp = [];
            for (const branch of schema.oneOf) {
                if (branch.properties?.[propName]) {
                    const actionProp = branch.properties.action;
                    if (actionProp?.const) {
                        actionsUsingProp.push(actionProp.const);
                    }
                    else if (actionProp?.enum?.[0]) {
                        actionsUsingProp.push(actionProp.enum[0]);
                    }
                }
            }
            const propRef = flatSchema.properties?.[propName];
            if (propRef) {
                const currentDesc = propRef.description ?? '';
                if (actionsUsingProp.length > 0 && !currentDesc.includes('Required for')) {
                    const actionList = actionsUsingProp.map((a) => `'${a}'`).join(', ');
                    propRef.description =
                        currentDesc + (currentDesc ? ' ' : '') + `Required for ${actionList} action(s).`;
                }
            }
        }
    }
    if (schema.$schema) {
        flatSchema.$schema = schema.$schema;
    }
    return flatSchema;
}
function applyOverridesToProperties(properties, toolName, paramOverrides, actionOverrides) {
    const lowerToolName = toolName.toLowerCase();
    for (const [propName, prop] of Object.entries(properties)) {
        const paramKey = `${lowerToolName}:${propName.toLowerCase()}`;
        const override = paramOverrides.get(paramKey);
        if (override) {
            prop.description = override;
            (0, logger_1.logDebug)(`Applied param override for '${toolName}.${propName}': "${override}"`);
        }
        if (propName === 'action') {
            const actionKey = `${lowerToolName}:action`;
            const actionOverride = actionOverrides.get(actionKey);
            if (actionOverride) {
                prop.description = actionOverride;
                (0, logger_1.logDebug)(`Applied action override for '${toolName}': "${actionOverride}"`);
            }
        }
    }
}
function applyDescriptionOverrides(schema, toolName) {
    const actionOverrides = (0, config_1.getActionDescriptionOverrides)();
    const paramOverrides = (0, config_1.getParamDescriptionOverrides)();
    const lowerToolName = toolName.toLowerCase();
    const hasOverrides = [...paramOverrides.keys(), ...actionOverrides.keys()].some((key) => key.startsWith(`${lowerToolName}:`));
    if (!hasOverrides) {
        return schema;
    }
    const result = JSON.parse(JSON.stringify(schema));
    if (result.oneOf) {
        for (const branch of result.oneOf) {
            if (branch.properties) {
                applyOverridesToProperties(branch.properties, toolName, paramOverrides, actionOverrides);
            }
        }
        return result;
    }
    if (result.properties) {
        applyOverridesToProperties(result.properties, toolName, paramOverrides, actionOverrides);
    }
    return result;
}
function getSchemaMode() {
    if (config_1.GITLAB_SCHEMA_MODE === 'auto') {
        return detectedSchemaMode ?? 'flat';
    }
    return config_1.GITLAB_SCHEMA_MODE;
}
function transformToolSchema(toolName, inputSchema) {
    let schema = inputSchema;
    if (schema.oneOf) {
        schema = filterDiscriminatedUnionActions(schema, toolName);
    }
    else if (schema.properties?.action?.enum) {
        schema = filterFlatSchemaActions(schema, toolName);
    }
    schema = applyDescriptionOverrides(schema, toolName);
    const schemaMode = getSchemaMode();
    if (schemaMode === 'flat' && schema.oneOf) {
        schema = flattenDiscriminatedUnion(schema);
    }
    return schema;
}
function filterFlatSchemaActions(schema, toolName) {
    const deniedActions = config_1.GITLAB_DENIED_ACTIONS.get(toolName.toLowerCase());
    if (!deniedActions || deniedActions.size === 0) {
        return schema;
    }
    const result = JSON.parse(JSON.stringify(schema));
    if (result.properties?.action?.enum) {
        const originalActions = result.properties.action.enum;
        const filteredActions = originalActions.filter((action) => !deniedActions.has(action.toLowerCase()));
        if (filteredActions.length === 0) {
            (0, logger_1.logWarn)(`Tool '${toolName}': all actions filtered out from flat schema!`);
        }
        else if (filteredActions.length < originalActions.length) {
            result.properties.action.enum = filteredActions;
            result.properties.action.description = `Action to perform: ${filteredActions.join(', ')}`;
            (0, logger_1.logDebug)(`Tool '${toolName}': filtered flat schema actions [${originalActions.join(', ')}] -> [${filteredActions.join(', ')}]`);
        }
    }
    return result;
}
function stripTierRestrictedParameters(schema, restrictedParams) {
    if (restrictedParams.length === 0) {
        return schema;
    }
    const result = JSON.parse(JSON.stringify(schema));
    const restrictedSet = new Set(restrictedParams);
    if (result.oneOf) {
        for (const branch of result.oneOf) {
            stripFromProperties(branch, restrictedSet);
        }
    }
    else {
        stripFromProperties(result, restrictedSet);
    }
    return result;
}
function stripFromProperties(schema, restrictedParams) {
    if (schema.properties) {
        for (const paramName of restrictedParams) {
            if (paramName in schema.properties) {
                delete schema.properties[paramName];
            }
        }
    }
    if (schema.required) {
        schema.required = schema.required.filter((name) => !restrictedParams.has(name));
    }
}
function shouldRemoveTool(toolName, allActions) {
    const deniedActions = config_1.GITLAB_DENIED_ACTIONS.get(toolName.toLowerCase());
    if (!deniedActions || deniedActions.size === 0) {
        return false;
    }
    const allowedActions = allActions.filter((action) => !deniedActions.has(action.toLowerCase()));
    return allowedActions.length === 0;
}
function extractActionsFromSchema(inputSchema) {
    if (inputSchema.properties?.action?.enum) {
        return inputSchema.properties.action.enum;
    }
    if (inputSchema.oneOf) {
        const actions = [];
        for (const branch of inputSchema.oneOf) {
            const actionProp = branch.properties?.action;
            if (actionProp?.const) {
                actions.push(actionProp.const);
            }
            else if (actionProp?.enum?.[0]) {
                actions.push(actionProp.enum[0]);
            }
        }
        return actions;
    }
    return [];
}
//# sourceMappingURL=schema-utils.js.map