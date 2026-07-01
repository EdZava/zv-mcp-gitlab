"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveRelatedReferences = resolveRelatedReferences;
exports.stripRelatedSection = stripRelatedSection;
function resolveRelatedReferences(description, availableTools) {
    const relatedMatch = description.match(/\s*Related:\s*(.+?)\.?\s*$/);
    if (!relatedMatch)
        return description;
    const matchIndex = relatedMatch.index ?? description.length;
    const baseDescription = description.substring(0, matchIndex);
    const relatedContent = relatedMatch[1];
    const items = relatedContent.split(',').map((s) => s.trim());
    const available = items.filter((item) => {
        const toolRef = item.match(/^((?:browse|manage)_\w+)\b/);
        return toolRef && availableTools.has(toolRef[1]);
    });
    if (available.length === 0) {
        return baseDescription.trimEnd();
    }
    return `${baseDescription.trimEnd()} Related: ${available.join(', ')}.`;
}
function stripRelatedSection(description) {
    return description.replace(/\s*Related:\s*(.+?)\.?\s*$/, '').trimEnd();
}
//# sourceMappingURL=description-utils.js.map