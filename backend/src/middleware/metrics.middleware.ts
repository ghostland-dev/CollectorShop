import { Request, Response, NextFunction } from 'express';
import { metricsService } from '../services/metrics.service';

export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  const route = req.route?.path || req.path;

  // Increment active connections
  metricsService.incrementActiveConnections();

  // Override res.end to capture response status and duration
  const originalEnd = res.end;
  res.end = function (chunk?: unknown, encoding?: BufferEncoding) {
    const duration = Date.now() - startTime;
    const method = req.method;
    const status = res.statusCode;

    // Record metrics
    metricsService.recordHttpRequest(method, route, status, duration);

    // Decrement active connections
    metricsService.decrementActiveConnections();

    // Call original end
    originalEnd.call(this, chunk, encoding);
  };

  next();
}
