import { Request, Response } from 'express';
import { DashboardMetrics } from './metrics.js';
export declare function dashboardHandler(req: Request, res: Response): void;
export declare function getMetrics(): DashboardMetrics;
