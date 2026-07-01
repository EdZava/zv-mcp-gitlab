"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleShowContext = handleShowContext;
exports.handleListPresets = handleListPresets;
exports.handleListProfiles = handleListProfiles;
exports.handleSwitchPreset = handleSwitchPreset;
exports.handleSwitchProfile = handleSwitchProfile;
exports.handleSetScope = handleSetScope;
exports.handleResetContext = handleResetContext;
exports.handleWhoami = handleWhoami;
exports.handleManageContext = handleManageContext;
const context_manager_1 = require("./context-manager");
const whoami_1 = require("./whoami");
async function handleShowContext(_input) {
    const manager = (0, context_manager_1.getContextManager)();
    return manager.getContext();
}
async function handleListPresets(_input) {
    const manager = (0, context_manager_1.getContextManager)();
    return manager.listPresets();
}
async function handleListProfiles(_input) {
    const manager = (0, context_manager_1.getContextManager)();
    return manager.listProfiles();
}
async function handleSwitchPreset(input) {
    const manager = (0, context_manager_1.getContextManager)();
    return manager.switchPreset(input.preset);
}
async function handleSwitchProfile(input) {
    const manager = (0, context_manager_1.getContextManager)();
    return manager.switchProfile(input.profile);
}
async function handleSetScope(input) {
    const manager = (0, context_manager_1.getContextManager)();
    return manager.setScope(input.namespace, input.includeSubgroups);
}
async function handleResetContext(_input) {
    const manager = (0, context_manager_1.getContextManager)();
    return manager.reset();
}
async function handleWhoami(_input) {
    return (0, whoami_1.executeWhoami)();
}
async function handleManageContext(input) {
    switch (input.action) {
        case 'show':
            return handleShowContext(input);
        case 'list_presets':
            return handleListPresets(input);
        case 'list_profiles':
            return handleListProfiles(input);
        case 'switch_preset':
            return handleSwitchPreset(input);
        case 'switch_profile':
            return handleSwitchProfile(input);
        case 'set_scope':
            return handleSetScope(input);
        case 'reset':
            return handleResetContext(input);
        case 'whoami':
            return handleWhoami(input);
        default:
            throw new Error(`Unknown action: ${input.action}`);
    }
}
//# sourceMappingURL=handlers.js.map