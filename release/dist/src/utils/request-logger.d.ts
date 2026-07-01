import { Request, Response } from 'express';
export interface RequestContext {
    requestId: string;
    ip: string;
    method: string;
    path: string;
    userAgent?: string;
    hasOAuthSession: boolean;
    hasMcpSessionHeader: boolean;
    oauthSessionId?: string;
    mcpSessionId?: string;
}
export interface RateLimitInfo {
    type: 'ip' | 'session';
    key: string;
    used: number;
    limit: number;
    resetInSec: number;
}
export declare function getIpAddress(req: Request): string;
export declare function truncateId(id: string | undefined): string | undefined;
export declare function getRequestContext(req: Request, res: Response): RequestContext;
export declare function getMinimalRequestContext(req: Request): Pick<RequestContext, 'requestId' | 'ip' | 'method' | 'path' | 'userAgent'>;
export declare function buildRateLimitInfo(type: 'ip' | 'session', key: string, used: number, limit: number, resetAt: number): RateLimitInfo;
