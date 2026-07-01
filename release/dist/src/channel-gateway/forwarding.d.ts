export interface ForwardPolicy {
    isRead: (name: string) => boolean;
    isConnected: () => boolean;
    waitForConnection: () => Promise<void>;
    call: (name: string, args: unknown) => Promise<unknown>;
}
export declare function forwardWithPolicy(policy: ForwardPolicy, name: string, args: unknown): Promise<unknown>;
export declare function isReadCall(name: string): boolean;
