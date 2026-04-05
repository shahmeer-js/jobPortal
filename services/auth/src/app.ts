import express, {Request, Response, NextFunction} from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import { connectKafka } from './producer.js';
import { logger, httpRequestDuration, register } from './utils/monitoring.js';

const app = express();

app.use(express.json());
app.use(cors());

connectKafka();

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

app.use("/api/auth", authRoutes);

app.get("/metrics", async (_req: Request, res: Response) => {
  res.setHeader("Content-Type", register.contentType);
  res.send(await register.metrics());
});

export default app;