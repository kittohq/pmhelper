import type { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const status =
    typeof err?.status === "number" && Number.isInteger(err.status) ? err.status : 500;

  const isSqlite = typeof err?.code === "string" && err.code.startsWith("SQLITE");
  const requestId = (req as any).requestId;

  // Log the error with context
  const errorContext = {
    method: req.method,
    url: req.originalUrl,
    status,
    requestId,
    userAgent: req.get('User-Agent'),
    ...(isSqlite && { sqliteCode: err.code }),
  };

  if (status >= 500) {
    logger.error(`Server Error: ${err?.message || 'Internal Server Error'}`, err, errorContext);
  } else if (status >= 400) {
    logger.warn(`Client Error: ${err?.message || 'Bad Request'}`, errorContext);
  }

  const payload: Record<string, any> = {
    error: err?.name || "Error",
    message: err?.message || "Internal Server Error",
    ...(requestId && { requestId }),
  };

  if (isSqlite) {
    payload.sqlite = {
      code: err.code,
    };
    logger.error(`SQLite Error: ${err.code}`, err);
  }

  if (process.env.NODE_ENV !== "production" && err?.stack) {
    payload.stack = err.stack;
  }

  res.status(status).json(payload);
}
