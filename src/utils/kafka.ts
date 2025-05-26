import { kafka_topics } from './consts';
import { producer, consumer, kafkaAdmin } from '../config/kafka';

export const publishMessageToTopic = async (topic: kafka_topics, message: any): Promise<void> => {
    console.log(`Publishing message to topic: ${topic}`, message);
    await producer.connect();
    await producer.send({ topic, messages: [
        { value: JSON.stringify(message) }
    ] });
}

export const createConsumer = async (topic: kafka_topics, worker: Function): Promise<void> => {
    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ message }) => {
            return await worker(JSON.parse(message.value?.toString() || "{}"));
        }
    })
}

export const createTopic = async (topic: kafka_topics): Promise<void> => {
    await kafkaAdmin.connect();

    const topics = await kafkaAdmin.listTopics();

    if (!topics.includes(topic)) {
        await kafkaAdmin.createTopics({
            topics: [
                {
                    topic
                },
            ],
        });
    }

    await kafkaAdmin.disconnect();
}