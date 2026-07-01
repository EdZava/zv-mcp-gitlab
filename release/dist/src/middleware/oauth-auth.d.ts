import { Request, Response, NextFunction } from 'express';
export declare function oauthAuthMiddleware(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function createOAuthMiddleware(): typeof oauthAuthMiddleware;
export declare function optionalOAuthMiddleware(req: Request, res: Response, next: NextFunction): Promise<void>;
