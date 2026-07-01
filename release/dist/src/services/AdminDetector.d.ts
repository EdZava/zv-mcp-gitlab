export interface AdminInfo {
    isAdmin: boolean;
    adminModeActive: boolean;
}
export declare function detectAdminStatus(baseUrl?: string): Promise<AdminInfo | null>;
