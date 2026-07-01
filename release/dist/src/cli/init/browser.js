"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._setImportOpen = _setImportOpen;
exports._resetImportOpen = _resetImportOpen;
exports.openUrl = openUrl;
async function dynamicImport() {
    const importFn = (0, eval)('m => import(m)');
    return importFn('open');
}
let importOpen = dynamicImport;
function _setImportOpen(fn) {
    importOpen = fn;
}
function _resetImportOpen() {
    importOpen = dynamicImport;
}
async function openUrl(url) {
    try {
        const openModule = await importOpen();
        await openModule.default(url);
        return true;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=browser.js.map