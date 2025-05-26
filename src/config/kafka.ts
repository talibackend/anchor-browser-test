import { Kafka } from "kafkajs";
import env from "./env";

console.log(env.KAFKA_BROKERS.split(","));

const kafka = new Kafka({
  brokers: env.KAFKA_BROKERS.split(","),
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: env.APP_NAME });
export const kafkaAdmin = kafka.admin();


