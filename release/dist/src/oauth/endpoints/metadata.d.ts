import { Request, Response } from 'express';
export declare const MCP_PROTOCOL_VERSION = "2025-03-26";
export declare function getBaseUrl(req: Request): string;
export declare function metadataHandler(req: Request, res: Response): void;
export declare function protectedResourceHandler(req: Request, res: Response): void;
