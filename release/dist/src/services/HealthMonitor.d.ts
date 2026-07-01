export type ConnectionState = 'connecting' | 'healthy' | 'degraded' | 'disconnected' | 'failed';
export interface InstanceHealthSnapshot {
    state: ConnectionState;
    consecutiveFailures: number;
    reconnectAttempt: number;
    lastSuccessAt: number | null;
    lastFailureAt: number | null;
    lastError: string | null;
}
export declare class InitializationTimeoutError extends Error {
    constructor(timeoutMs: number);
}
export declare function calculateBackoffDelay(attempt: number): number;
type StateChangeCallback = (instanceUrl: string, from: ConnectionState, to: ConnectionState) => void;
export declare class HealthMonitor {
    private static instance;
    private readonly actors;
    private readonly previousStates;
    private stateChangeCallbacks;
    private readonly subscriptions;
    private constructor();
    static getInstance(): HealthMonitor;
    onStateChange(callback: StateChangeCallback): void;
    initialize(instanceUrl?: string): Promise<void>;
    private waitForInitialState;
    private handleStateChange;
    private extractState;
    private getActorState;
    private resolveUrl;
    private getActor;
    getState(instanceUrl?: string): ConnectionState;
    getSnapshot(instanceUrl?: string): InstanceHealthSnapshot;
    isAnyInstanceHealthy(): boolean;
    isInstanceReachable(instanceUrl?: string): boolean;
    reportSuccess(instanceUrl?: string): void;
    reportError(instanceUrl?: string, error?: Error): void;
    forceReconnect(instanceUrl?: string): void;
    getMonitoredInstances(): string[];
    shutdown(): void;
    static resetInstance(): void;
}
export {};
