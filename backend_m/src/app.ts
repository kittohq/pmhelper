import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import routes from "./routes/index.js";
import { initDb } from "./config/database.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { logger } from "./utils/logger.js";

dotenv.config({ path: ".env.local" });

const PORT = Number(process.env.PORT) || 4000;
const app = express();

// Request logging (before other middleware)
app.use(requestLogger);

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  logger.info("Health check requested");
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api", routes);

// Error handler (must be last)
app.use(errorHandler);

async function start() {
  try {
    logger.server(`Starting server on port ${PORT}...`);
    await initDb();
    logger.success("Database initialized successfully");
    
    app.listen(PORT, () => {
      logger.server(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
      logger.info(`API base: http://localhost:${PORT}/api`);
    });
  } catch (err) {
    logger.error("Failed to initialize database", err);
    process.exit(1);
  }
}

start();
