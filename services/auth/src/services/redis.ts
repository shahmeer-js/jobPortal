import { createClient } from "redis";
import { logger } from "../utils/monitoring.js";

export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

export async function connectRedis() {
  try {
    await redisClient.connect();
    logger.info("Redis Connected");
  } catch (error) {
    logger.error("Failed to connect to Redis:", { error });
  }
}
