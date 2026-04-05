import { createLogger, format, transports, Logger } from "winston";
import LokiTransport from "winston-loki";
import client, { Registry, Histogram } from "prom-client";

const register: Registry = new client.Registry();
client.collectDefaultMetrics({ register });

interface HttpLabels {
  method: string;
  route: string;
  status_code: string | number;
}

const httpRequestDuration: Histogram<string> = new client.Histogram({
  name: "http_request_duration_ms",
  help: "Duration of HTTP requests in ms",
  labelNames: ["method", "route", "status_code"],
  buckets: [50, 100, 300, 500, 1000],
});
register.registerMetric(httpRequestDuration);

const logger: Logger = createLogger({
  level: "info",
  format: format.combine(format.timestamp(), format.json()),
  defaultMeta: { service: process.env.SERVICE_NAME || "job-service" },
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
    new LokiTransport({
      host: process.env.LOKI_URL as string,
      labels: { app: process.env.SERVICE_NAME },
      json: true,
      replaceTimestamp: true,
      onConnectionError: (err) => console.error("Loki Connection Error:", err),
    }),
  ],
});

export { logger, register, httpRequestDuration };
