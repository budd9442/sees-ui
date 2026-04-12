import amqp from 'amqplib';

let connection: amqp.Connection | null = null;
let channel: amqp.Channel | null = null;

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';

/**
 * Initialize RabbitMQ Connection and Channel
 */
async function getChannel() {
    if (channel) return channel;

    try {
        if (!connection) {
            connection = await amqp.connect(RABBITMQ_URL);
            
            connection.on('error', (err) => {
                console.error('RabbitMQ Connection Error:', err);
                connection = null;
                channel = null;
            });

            connection.on('close', () => {
                console.warn('RabbitMQ Connection Closed');
                connection = null;
                channel = null;
            });
        }

        channel = await connection.createChannel();
        return channel;
    } catch (error) {
        console.error('Failed to connect to RabbitMQ:', error);
        throw error;
    }
}

/**
 * Push data to a specific queue
 */
export async function pushToQueue(queueName: string, data: any) {
    try {
        const chan = await getChannel();
        await chan.assertQueue(queueName, { durable: true });
        
        const message = Buffer.from(JSON.stringify(data));
        chan.sendToQueue(queueName, message, { persistent: true });
        
        return true;
    } catch (error) {
        console.error(`Failed to push to queue ${queueName}:`, error);
        return false;
    }
}
