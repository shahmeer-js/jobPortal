import { Kafka } from "kafkajs";
import nodemailer from "nodemailer";
import { logger } from "./monitoring.js";

export const startSendMailConsumer = async () => {
  try {
    const kafka = new Kafka({
      clientId: "mail-service",
      brokers: [process.env.Kafka_Broker || "localhost:9092"],
    });

    const consumer = kafka.consumer({ groupId: "mail-service-group" });
    await consumer.connect();

    const topicName = "send-mail";

    await consumer.subscribe({ topic: topicName, fromBeginning: false });

    logger.info("✔ Kafka: Mail service consumer started, listening for sending mail");

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const { to, subject, html } = JSON.parse(
            message.value?.toString() || "{}",
          );

          const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
              user: process.env.MAIL_USER,
              pass: process.env.MAIL_PASS,
            },
          });

          await transporter.sendMail({
            from: "Jobz Mela <no-reply>",
            to,
            subject,
            html,
          });

          logger.info(`Mail has been sent to ${to}`);
        } catch (error) {
          logger.error("Failed to send mail", { error });
        }
      },
    });
  } catch (error) {
    logger.error("❌ Failed to start kafka", { error });
  }
};
