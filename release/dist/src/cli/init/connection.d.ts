import { ConnectionTestResult } from './types';
export declare function testConnection(instanceUrl: string, token: string): Promise<ConnectionTestResult>;
export declare function validateGitLabUrl(url: string): {
    valid: boolean;
    error?: string;
};
export declare function isGitLabSaas(url: string): boolean;
export declare function getPatCreationUrl(instanceUrl: string, readOnly?: boolean): string;
