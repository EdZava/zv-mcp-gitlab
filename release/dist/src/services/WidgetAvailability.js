"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WidgetAvailability = void 0;
const workItems_1 = require("../graphql/workItems");
const ConnectionManager_1 = require("./ConnectionManager");
const version_1 = require("../utils/version");
const logger_1 = require("../logger");
const TIER_HIERARCHY = {
    free: 0,
    premium: 1,
    ultimate: 2,
};
const PARAMETER_WIDGET_MAP = {
    assigneeIds: workItems_1.WorkItemWidgetTypes.ASSIGNEES,
    labelIds: workItems_1.WorkItemWidgetTypes.LABELS,
    addLabelIds: workItems_1.WorkItemWidgetTypes.LABELS,
    removeLabelIds: workItems_1.WorkItemWidgetTypes.LABELS,
    milestoneId: workItems_1.WorkItemWidgetTypes.MILESTONE,
    description: workItems_1.WorkItemWidgetTypes.DESCRIPTION,
    startDate: workItems_1.WorkItemWidgetTypes.START_AND_DUE_DATE,
    dueDate: workItems_1.WorkItemWidgetTypes.START_AND_DUE_DATE,
    isFixed: workItems_1.WorkItemWidgetTypes.START_AND_DUE_DATE,
    parentId: workItems_1.WorkItemWidgetTypes.HIERARCHY,
    childrenIds: workItems_1.WorkItemWidgetTypes.HIERARCHY,
    timeEstimate: workItems_1.WorkItemWidgetTypes.TIME_TRACKING,
    timeSpent: workItems_1.WorkItemWidgetTypes.TIME_TRACKING,
    linkType: workItems_1.WorkItemWidgetTypes.LINKED_ITEMS,
    targetId: workItems_1.WorkItemWidgetTypes.LINKED_ITEMS,
    weight: workItems_1.WorkItemWidgetTypes.WEIGHT,
    iterationId: workItems_1.WorkItemWidgetTypes.ITERATION,
    progressCurrentValue: workItems_1.WorkItemWidgetTypes.PROGRESS,
    healthStatus: workItems_1.WorkItemWidgetTypes.HEALTH_STATUS,
    color: workItems_1.WorkItemWidgetTypes.COLOR,
    verificationStatus: workItems_1.WorkItemWidgetTypes.VERIFICATION_STATUS,
};
class WidgetAvailability {
    static widgetRequirements = {
        [workItems_1.WorkItemWidgetTypes.ASSIGNEES]: { tier: 'free', minVersion: '15.0' },
        [workItems_1.WorkItemWidgetTypes.DESCRIPTION]: { tier: 'free', minVersion: '15.0' },
        [workItems_1.WorkItemWidgetTypes.HIERARCHY]: { tier: 'free', minVersion: '15.0' },
        [workItems_1.WorkItemWidgetTypes.LABELS]: { tier: 'free', minVersion: '15.0' },
        [workItems_1.WorkItemWidgetTypes.MILESTONE]: { tier: 'free', minVersion: '15.0' },
        [workItems_1.WorkItemWidgetTypes.NOTES]: { tier: 'free', minVersion: '15.0' },
        [workItems_1.WorkItemWidgetTypes.START_AND_DUE_DATE]: { tier: 'free', minVersion: '15.0' },
        [workItems_1.WorkItemWidgetTypes.STATUS]: { tier: 'free', minVersion: '15.0' },
        [workItems_1.WorkItemWidgetTypes.NOTIFICATIONS]: { tier: 'free', minVersion: '15.0' },
        [workItems_1.WorkItemWidgetTypes.CURRENT_USER_TODOS]: { tier: 'free', minVersion: '15.0' },
        [workItems_1.WorkItemWidgetTypes.AWARD_EMOJI]: { tier: 'free', minVersion: '15.0' },
        [workItems_1.WorkItemWidgetTypes.PARTICIPANTS]: { tier: 'free', minVersion: '15.0' },
        [workItems_1.WorkItemWidgetTypes.DESIGNS]: { tier: 'free', minVersion: '15.0' },
        [workItems_1.WorkItemWidgetTypes.DEVELOPMENT]: { tier: 'free', minVersion: '15.0' },
        [workItems_1.WorkItemWidgetTypes.TIME_TRACKING]: { tier: 'free', minVersion: '15.0' },
        [workItems_1.WorkItemWidgetTypes.ERROR_TRACKING]: { tier: 'free', minVersion: '15.0' },
        [workItems_1.WorkItemWidgetTypes.LINKED_ITEMS]: { tier: 'free', minVersion: '15.0' },
        [workItems_1.WorkItemWidgetTypes.WEIGHT]: { tier: 'premium', minVersion: '15.0' },
        [workItems_1.WorkItemWidgetTypes.ITERATION]: { tier: 'premium', minVersion: '15.0' },
        [workItems_1.WorkItemWidgetTypes.PROGRESS]: { tier: 'premium', minVersion: '15.0' },
        [workItems_1.WorkItemWidgetTypes.CRM_CONTACTS]: { tier: 'premium', minVersion: '16.0' },
        [workItems_1.WorkItemWidgetTypes.EMAIL_PARTICIPANTS]: { tier: 'premium', minVersion: '16.0' },
        [workItems_1.WorkItemWidgetTypes.LINKED_RESOURCES]: { tier: 'premium', minVersion: '16.5' },
        [workItems_1.WorkItemWidgetTypes.HEALTH_STATUS]: { tier: 'ultimate', minVersion: '15.0' },
        [workItems_1.WorkItemWidgetTypes.COLOR]: { tier: 'ultimate', minVersion: '15.0' },
        [workItems_1.WorkItemWidgetTypes.CUSTOM_FIELDS]: { tier: 'ultimate', minVersion: '17.0' },
        [workItems_1.WorkItemWidgetTypes.VULNERABILITIES]: { tier: 'ultimate', minVersion: '15.0' },
        [workItems_1.WorkItemWidgetTypes.REQUIREMENT_LEGACY]: { tier: 'ultimate', minVersion: '13.1' },
        [workItems_1.WorkItemWidgetTypes.TEST_REPORTS]: { tier: 'ultimate', minVersion: '13.6' },
        [workItems_1.WorkItemWidgetTypes.VERIFICATION_STATUS]: { tier: 'ultimate', minVersion: '13.1' },
    };
    static isWidgetAvailable(widget, instanceUrl) {
        const connectionManager = ConnectionManager_1.ConnectionManager.getInstance();
        try {
            const instanceInfo = connectionManager.getInstanceInfo(instanceUrl);
            const requirement = this.widgetRequirements[widget];
            if (!requirement) {
                return false;
            }
            const version = (0, version_1.parseVersion)(instanceInfo.version);
            const minVersion = (0, version_1.parseVersion)(requirement.minVersion);
            if (version < minVersion) {
                return false;
            }
            if (requirement.tier === 'free') {
                return true;
            }
            const requiredTierLevel = TIER_HIERARCHY[requirement.tier];
            const actualTierLevel = TIER_HIERARCHY[instanceInfo.tier];
            return actualTierLevel >= requiredTierLevel;
        }
        catch {
            return false;
        }
    }
    static getAvailableWidgets(instanceUrl) {
        return Object.values(workItems_1.WorkItemWidgetTypes).filter((widget) => typeof widget === 'string' && this.isWidgetAvailable(widget, instanceUrl));
    }
    static getWidgetRequirement(widget) {
        return this.widgetRequirements[widget];
    }
    static validateWidgetParams(params, instanceUrl) {
        const connectionManager = ConnectionManager_1.ConnectionManager.getInstance();
        let instanceVersion;
        let instanceTier;
        try {
            const instanceInfo = connectionManager.getInstanceInfo(instanceUrl);
            instanceVersion = instanceInfo.version;
            instanceTier = instanceInfo.tier;
        }
        catch {
            return null;
        }
        const parsedVersion = (0, version_1.parseVersion)(instanceVersion);
        if (parsedVersion === 0) {
            (0, logger_1.logDebug)('Widget param validation skipped: version could not be parsed', { instanceVersion });
            return null;
        }
        for (const [paramName, paramValue] of Object.entries(params)) {
            if (paramValue === undefined || paramValue === null)
                continue;
            const widgetType = PARAMETER_WIDGET_MAP[paramName];
            if (!widgetType)
                continue;
            const requirement = this.widgetRequirements[widgetType];
            if (!requirement)
                continue;
            const minVersion = (0, version_1.parseVersion)(requirement.minVersion);
            if (parsedVersion < minVersion) {
                return {
                    parameter: paramName,
                    widget: widgetType,
                    requiredVersion: requirement.minVersion,
                    detectedVersion: instanceVersion,
                    requiredTier: requirement.tier,
                    currentTier: instanceTier,
                };
            }
            if (requirement.tier !== 'free') {
                const requiredTierLevel = TIER_HIERARCHY[requirement.tier];
                const actualTierLevel = TIER_HIERARCHY[instanceTier];
                if (actualTierLevel < requiredTierLevel) {
                    return {
                        parameter: paramName,
                        widget: widgetType,
                        requiredVersion: requirement.minVersion,
                        detectedVersion: instanceVersion,
                        requiredTier: requirement.tier,
                        currentTier: instanceTier,
                    };
                }
            }
        }
        return null;
    }
    static getParameterWidgetMap() {
        return { ...PARAMETER_WIDGET_MAP };
    }
}
exports.WidgetAvailability = WidgetAvailability;
//# sourceMappingURL=WidgetAvailability.js.map