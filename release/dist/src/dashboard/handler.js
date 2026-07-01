"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardHandler = dashboardHandler;
exports.getMetrics = getMetrics;
const metrics_js_1 = require("./metrics.js");
const html_template_js_1 = require("./html-template.js");
const logger_js_1 = require("../logger.js");
function prefersHtml(req) {
    const accept = req.headers.accept ?? '*/*';
    if (accept.includes('application/json') && !accept.includes('text/html')) {
        return false;
    }
    return accept.includes('text/html') || accept.includes('*/*');
}
function dashboardHandler(req, res) {
    try {
        const metrics = (0, metrics_js_1.collectMetrics)();
        (0, logger_js_1.logDebug)('Dashboard request', {
            accept: req.headers.accept,
            prefersHtml: prefersHtml(req),
        });
        if (prefersHtml(req)) {
            res.type('text/html').send((0, html_template_js_1.renderDashboard)(metrics));
        }
        else {
            res.json(metrics);
        }
    }
    catch (error) {
        (0, logger_js_1.logError)('Dashboard error', { err: error });
        res.status(500).json({ error: 'Failed to generate dashboard' });
    }
}
function getMetrics() {
    return (0, metrics_js_1.collectMetrics)();
}
//# sourceMappingURL=handler.js.map