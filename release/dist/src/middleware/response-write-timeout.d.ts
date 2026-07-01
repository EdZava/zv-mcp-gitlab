import type { Request, Response, NextFunction } from 'express';
export declare function responseWriteTimeoutMiddleware(): (req: Request, res: Response, next: NextFunction) => void;
