export declare function truncateId(id: string): string;
export declare const LOG_JSON: boolean;
export declare const LOG_FORMAT: string;
export declare const createLogger: (name?: string) => import("pino").Logger<never, boolean>;
export declare const logger: import("pino").Logger<never, boolean>;
export declare function logInfo(message: string, data?: Record<string, unknown>): void;
export declare function logWarn(message: string, data?: Record<string, unknown>): void;
export declare function logError(message: string, data?: Record<string, unknown>): void;
export declare function logDebug(message: string, data?: Record<string, unknown>): void;
