"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectAdminStatus = detectAdminStatus;
const zod_1 = require("zod");
const config_1 = require("../config");
const logger_1 = require("../logger");
const url_1 = require("../utils/url");
const fetch_1 = require("../utils/fetch");
const UserAdminSchema = zod_1.z.object({ is_admin: zod_1.z.boolean().optional() });
async function detectAdminStatus(baseUrl) {
    const url = (0, url_1.normalizeInstanceUrl)(baseUrl ?? config_1.GITLAB_BASE_URL);
    if (!url || !config_1.GITLAB_TOKEN) {
        return null;
    }
    try {
        const userResponse = await (0, fetch_1.enhancedFetch)(`${url}/api/v4/user`, {
            headers: { 'PRIVATE-TOKEN': config_1.GITLAB_TOKEN, Accept: 'application/json' },
            retry: false,
        });
        if (!userResponse.ok) {
            (0, logger_1.logDebug)('Admin detection: /user request failed', { status: userResponse.status, url });
            await userResponse.body?.cancel().catch(() => { });
            return null;
        }
        const parsed = UserAdminSchema.safeParse(await userResponse.json());
        if (!parsed.success || parsed.data.is_admin === undefined) {
            (0, logger_1.logDebug)('Admin detection: /user response missing or malformed is_admin', { url });
            return null;
        }
        if (!parsed.data.is_admin) {
            return { isAdmin: false, adminModeActive: false };
        }
        const probe = await (0, fetch_1.enhancedFetch)(`${url}/api/v4/projects?include_pending_delete=true&per_page=1`, { headers: { 'PRIVATE-TOKEN': config_1.GITLAB_TOKEN, Accept: 'application/json' }, retry: false });
        const status = probe.status;
        await probe.body?.cancel().catch(() => { });
        if (probe.ok) {
            return { isAdmin: true, adminModeActive: true };
        }
        if (status === 403) {
            return { isAdmin: true, adminModeActive: false };
        }
        (0, logger_1.logDebug)('Admin detection: elevation probe returned an unexpected status', { status, url });
        return null;
    }
    catch (error) {
        (0, logger_1.logDebug)('Admin detection failed', {
            error: error instanceof Error ? error.message : String(error),
        });
        return null;
    }
}
//# sourceMappingURL=AdminDetector.js.map