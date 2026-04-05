import { Kafka, Producer, Admin } from "kafkajs";
import { logger } from "./utils/monitoring.js";

let producer: Producer;
let admin: Admin;

export const connectKafka = async () => {
  try {
    const kafka = new Kafka({
      clientId: "auth-service",
      brokers: [process.env.Kafka_Broker || "localhost:9092"],
    });

    admin = kafka.admin();
    await admin.connect();

    const topics = await admin.listTopics();

    if (!topics.includes("send-mail")) {
      await admin.createTopics({
        topics: [
          {
            topic: "send-mail",
            numPartitions: 1,
            replicationFactor: 1,
          },
        ],
      });
      logger.info("✔ Topic 'send-mail' created");
    }
    await admin.disconnect();

    producer = kafka.producer();

    await producer.connect();

    logger.info("✔ Connected to kafka producer");
  } catch (error) {
    logger.error("❌ failed to connect to kafka", { error });
  }
};

export const publishToTopic = async (topic: string, message: any) => {
  if (!producer) {
    logger.error("❌ Kafka producer is not intilized!");
  }

  try {
    await producer.send({
      topic: topic,
      messages: [
        {
          value: JSON.stringify(message),
        },
      ],
    });
  } catch (error) {
    logger.error("❌ Failed to publish message to kafka", { error });
  }
};

export const disconnectKafka = async () => {
  if (producer) {
    await producer.disconnect();
  }
};
