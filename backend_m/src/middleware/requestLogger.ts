import type { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";

// Generate simple request ID for tracing
function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 8);
}

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  // Add request ID to request object for potential use in other middleware
  (req as any).requestId = requestId;
  
  // Log request start (optional, can be noisy)
  if (process.env.NODE_ENV !== 'production') {
    logger.debug(`Request started: ${req.method} ${req.originalUrl}`, { requestId });
  }
  
  // Override res.end to capture response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any, cb?: () => void) {
    const duration = Date.now() - startTime;
    
    // Log the completed request
    logger.request(req.method, req.originalUrl, res.statusCode, duration, requestId);
    
    // Call original end and return the result
    return originalEnd.call(this, chunk, encoding, cb);
  };
  
  next();
}
