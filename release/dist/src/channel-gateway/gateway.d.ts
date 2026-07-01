export interface GatewayConfig {
    downstreamCommand: string;
    downstreamArgs: string[];
    downstreamEnv?: Record<string, string>;
    pollMs?: number;
    maxBackoffMs?: number;
    maxQueued?: number;
    connectTimeoutMs?: number;
    name?: string;
    version?: string;
}
export declare class ChannelGateway {
    private readonly config;
    private readonly server;
    private client;
    private transport?;
    private readonly interceptor;
    private connected;
    private reconnecting;
    private closing;
    private pendingWaiters;
    constructor(config: GatewayConfig);
    start(): Promise<void>;
    stop(): Promise<void>;
    private newClient;
    private registerHandlers;
    private connectDownstream;
    private handleDownstreamClose;
    private waitForConnection;
    private forward;
    private callDownstream;
    private emit;
    private notifyLink;
    private sleep;
}
