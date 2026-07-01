export interface GitRemoteInfo {
    host: string;
    projectPath: string;
    protocol: 'ssh' | 'https';
    url: string;
    remoteName: string;
}
export interface ParseGitRemoteOptions {
    remoteName?: string;
    repoPath?: string;
}
export declare function parseRemoteUrl(url: string): Omit<GitRemoteInfo, 'remoteName'> | null;
export declare function parseGitConfig(content: string): Map<string, string>;
export declare function selectBestRemote(remotes: Map<string, string>, preferredRemote?: string): {
    name: string;
    url: string;
} | null;
export declare function parseGitRemote(options?: ParseGitRemoteOptions): Promise<GitRemoteInfo | null>;
export declare function listGitRemotes(repoPath?: string): Promise<GitRemoteInfo[]>;
