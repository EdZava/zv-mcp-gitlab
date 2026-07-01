"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderDashboard = exports.InstanceStatusSchema = exports.DashboardMetricsSchema = exports.determineInstanceStatus = exports.formatUptime = exports.collectMetrics = exports.getMetrics = exports.dashboardHandler = void 0;
var handler_js_1 = require("./handler.js");
Object.defineProperty(exports, "dashboardHandler", { enumerable: true, get: function () { return handler_js_1.dashboardHandler; } });
Object.defineProperty(exports, "getMetrics", { enumerable: true, get: function () { return handler_js_1.getMetrics; } });
var metrics_js_1 = require("./metrics.js");
Object.defineProperty(exports, "collectMetrics", { enumerable: true, get: function () { return metrics_js_1.collectMetrics; } });
Object.defineProperty(exports, "formatUptime", { enumerable: true, get: function () { return metrics_js_1.formatUptime; } });
Object.defineProperty(exports, "determineInstanceStatus", { enumerable: true, get: function () { return metrics_js_1.determineInstanceStatus; } });
Object.defineProperty(exports, "DashboardMetricsSchema", { enumerable: true, get: function () { return metrics_js_1.DashboardMetricsSchema; } });
Object.defineProperty(exports, "InstanceStatusSchema", { enumerable: true, get: function () { return metrics_js_1.InstanceStatusSchema; } });
var html_template_js_1 = require("./html-template.js");
Object.defineProperty(exports, "renderDashboard", { enumerable: true, get: function () { return html_template_js_1.renderDashboard; } });
//# sourceMappingURL=index.js.map