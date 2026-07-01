type OpenModule = {
    default: (url: string) => Promise<unknown>;
};
export declare function _setImportOpen(fn: () => Promise<OpenModule>): void;
export declare function _resetImportOpen(): void;
export declare function openUrl(url: string): Promise<boolean>;
export {};
