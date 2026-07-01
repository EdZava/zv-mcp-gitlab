import { Request, Response } from 'express';
interface RegisteredClient {
    client_id: string;
    client_secret?: string;
    redirect_uris: string[];
    client_name?: string;
    token_endpoint_auth_method: string;
    grant_types: string[];
    response_types: string[];
    created_at: number;
}
export declare function registerHandler(req: Request, res: Response): Promise<void>;
export declare function getRegisteredClient(clientId: string): RegisteredClient | undefined;
export declare function isValidRedirectUri(clientId: string, redirectUri: string): boolean;
export {};
