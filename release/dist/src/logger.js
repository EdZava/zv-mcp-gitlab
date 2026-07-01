"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.createLogger = exports.LOG_FORMAT = exports.LOG_JSON = void 0;
exports.truncateId = truncateId;
exports.logInfo = logInfo;
exports.logWarn = logWarn;
exports.logError = logError;
exports.logDebug = logDebug;
const pino_1 = require("pino");
function truncateId(id) {
    if (typeof id !== 'string')
        return String(id);
    if (id.length <= 10)
        return id;
    return id.substring(0, 4) + '..' + id.slice(-4);
}
const isTestEnv = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;
exports.LOG_JSON = process.env.LOG_JSON === 'true';
exports.LOG_FORMAT = process.env.LOG_FORMAT ?? '%msg';
function convertToPinoFormat(format) {
    return format
        .replace(/%time/g, '{time}')
        .replace(/%level/g, '{levelLabel}')
        .replace(/%name/g, '{name}')
        .replace(/%msg/g, '{msg}');
}
function getIgnoredFields(format) {
    const ignored = ['pid', 'hostname'];
    if (!format.includes('%time'))
        ignored.push('time');
    if (!format.includes('%level'))
        ignored.push('level');
    if (!format.includes('%name'))
        ignored.push('name');
    return ignored.join(',');
}
function buildPrettyOptions(format) {
    const baseOptions = {
        destination: 2,
    };
    const hasTime = format.includes('%time');
    const pinoFormat = convertToPinoFormat(format);
    const ignored = getIgnoredFields(format);
    const isMinimal = format.trim() === '%msg';
    return {
        ...baseOptions,
        colorize: !isMinimal,
        translateTime: hasTime ? 'HH:MM:ss.l' : false,
        ignore: ignored,
        messageFormat: pinoFormat,
        hideObject: true,
    };
}
const createLogger = (name) => {
    const options = {
        name,
        level: process.env.LOG_LEVEL ?? 'info',
    };
    if (!isTestEnv && !exports.LOG_JSON) {
        options.transport = {
            target: 'pino-pretty',
            options: buildPrettyOptions(exports.LOG_FORMAT),
        };
    }
    return (0, pino_1.pino)(options);
};
exports.createLogger = createLogger;
exports.logger = (0, exports.createLogger)('gitlab-mcp');
function formatDataPairs(data) {
    return Object.entries(data)
        .map(([k, v]) => {
        if (v instanceof Error) {
            return `${k}=${v.stack ?? v.message}`;
        }
        if (v === null || v === undefined) {
            return `${k}=${String(v)}`;
        }
        if (typeof v === 'object') {
            return `${k}=${JSON.stringify(v)}`;
        }
        return `${k}=${String(v)}`;
    })
        .join(' ');
}
function logInfo(message, data) {
    if (exports.LOG_JSON) {
        exports.logger.info(data ?? {}, message);
    }
    else if (data && Object.keys(data).length > 0) {
        exports.logger.info(`${message} ${formatDataPairs(data)}`);
    }
    else {
        exports.logger.info(message);
    }
}
function logWarn(message, data) {
    if (exports.LOG_JSON) {
        exports.logger.warn(data ?? {}, message);
    }
    else if (data && Object.keys(data).length > 0) {
        exports.logger.warn(`${message} ${formatDataPairs(data)}`);
    }
    else {
        exports.logger.warn(message);
    }
}
function logError(message, data) {
    if (exports.LOG_JSON) {
        exports.logger.error(data ?? {}, message);
    }
    else if (data && Object.keys(data).length > 0) {
        exports.logger.error(`${message} ${formatDataPairs(data)}`);
    }
    else {
        exports.logger.error(message);
    }
}
function logDebug(message, data) {
    if (exports.LOG_JSON) {
        exports.logger.debug(data ?? {}, message);
    }
    else if (data && Object.keys(data).length > 0) {
        exports.logger.debug(`${message} ${formatDataPairs(data)}`);
    }
    else {
        exports.logger.debug(message);
    }
}
//# sourceMappingURL=logger.js.map