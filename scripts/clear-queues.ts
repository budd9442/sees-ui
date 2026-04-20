import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
const QUEUES = ['lms_import', 'enrollment_invites', 'gpa_recalculation'];

async function clearQueues() {
    console.log(`[QUEUE] Connecting to RabbitMQ at ${RABBITMQ_URL}...`);
    let connection;
    try {
        connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        for (const queue of QUEUES) {
            try {
                console.log(`[QUEUE] Purging queue: ${queue}...`);
                const result = await channel.purgeQueue(queue);
                console.log(`[QUEUE] Successfully purged ${queue}. Messages removed: ${result.messageCount}`);
            } catch (err: any) {
                if (err.message.includes('NOT_FOUND')) {
                    console.warn(`[QUEUE] Queue ${queue} does not exist. Skipping.`);
                } else {
                    console.error(`[QUEUE] Failed to purge ${queue}:`, err.message);
                }
            }
        }

        await channel.close();
        await connection.close();
        console.log('[QUEUE] Done.');
    } catch (err: any) {
        console.error('[QUEUE] CRITICAL: Failed to connect to RabbitMQ:', err.message);
        process.exit(1);
    }
}

clearQueues();
