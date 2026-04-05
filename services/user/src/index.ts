import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import cors from 'cors';

import userRoutes from "./routes/user.js";
import { httpRequestDuration, logger, register } from "./utils/monitoring.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    // Record Metrics
    httpRequestDuration.observe(
      {
        method: req.method,
        route: req.route?.path || req.path,
        status_code: res.statusCode,
      },
      duration,
    );

    // Log the event
    logger.info(`HTTP ${req.method} ${req.path}`, {
      status: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
});

app.use("/api/user", userRoutes);

app.get("/metrics", async (_req: Request, res: Response) => {
  res.setHeader("Content-Type", register.contentType);
  res.send(await register.metrics());
});

app.listen(process.env.PORT, () => {
  logger.info(`User service started on port ${PORT}`, {
    service: "user-service",
    port: PORT,
  });
});
