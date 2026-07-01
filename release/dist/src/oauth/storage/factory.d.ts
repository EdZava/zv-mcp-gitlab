import { SessionStorageBackend, StorageConfig } from './types';
export declare function createStorageBackend(config?: StorageConfig): SessionStorageBackend;
export declare function getStorageType(config?: StorageConfig): 'memory' | 'file' | 'postgresql';
export declare function validateStorageConfig(config?: StorageConfig): string[];
