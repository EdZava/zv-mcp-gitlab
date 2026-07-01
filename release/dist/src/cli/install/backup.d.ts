import { BackupOptions, BackupResult } from './types';
export declare function generateBackupFilename(originalPath: string): string;
export declare function createBackup(options: BackupOptions): BackupResult;
export declare function restoreBackup(backupPath: string, targetPath: string): boolean;
