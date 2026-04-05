import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";

import routes from "./routes.js";
import { startSendMailConsumer } from "./consumer.js";
import { httpRequestDuration, logger, register } from "./monitoring.js";

dotenv.config();

startSendMailConsumer();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const route = req.route?.path || req.path;

    // 1. Record Metrics (Prometheus)
    httpRequestDuration.observe(
      {
        method: req.method,
        route: route,
        status_code: res.statusCode,
      },
      duration,
    );

    logger.info(`HTTP ${req.method} ${route}`, {
      status: res.statusCode,
      duration: `${duration}ms`,
      url: req.originalUrl,
    });
  });

  next();
});

app.use("/api/utils", routes);

app.get("/metrics", async (_req: Request, res: Response) => {
  try {
    res.setHeader("Content-Type", register.contentType);
    res.send(await register.metrics());
  } catch (err) {
    res.status(500).send(err);
  }
});

app.listen(process.env.PORT, () => {
  logger.info(`Utils service is running on PORT ${process.env.PORT}`);
});
