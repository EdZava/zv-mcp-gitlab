"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processProjectIdentifier = processProjectIdentifier;
exports.safeEncodeProjectId = safeEncodeProjectId;
exports.normalizeProjectId = normalizeProjectId;
exports.validateProjectIdentifier = validateProjectIdentifier;
function isUrlEncoded(str) {
    return /%[0-9A-Fa-f]{2}/.test(str);
}
function isNumericId(str) {
    return /^\d+$/.test(str.trim());
}
function processProjectIdentifier(input) {
    const trimmedInput = input.trim();
    if (isNumericId(trimmedInput)) {
        return {
            identifier: trimmedInput,
            isNumericId: true,
            originalValue: input,
        };
    }
    let identifier;
    if (isUrlEncoded(trimmedInput)) {
        identifier = trimmedInput;
    }
    else {
        identifier = encodeURIComponent(trimmedInput);
    }
    return {
        identifier,
        isNumericId: false,
        originalValue: input,
    };
}
function safeEncodeProjectId(projectId) {
    const processed = processProjectIdentifier(projectId);
    return processed.identifier;
}
function normalizeProjectId(projectId) {
    return safeEncodeProjectId(projectId);
}
function validateProjectIdentifier(input) {
    if (!input || typeof input !== 'string') {
        return 'Project identifier is required and must be a string';
    }
    const trimmed = input.trim();
    if (trimmed.length === 0) {
        return 'Project identifier cannot be empty';
    }
    if (isNumericId(trimmed)) {
        return null;
    }
    const decoded = isUrlEncoded(trimmed) ? decodeURIComponent(trimmed) : trimmed;
    if (!/^[a-zA-Z0-9\-_./]+$/.test(decoded)) {
        return 'Invalid project identifier format. Use numeric ID or namespace/project path.';
    }
    return null;
}
//# sourceMappingURL=projectIdentifier.js.map