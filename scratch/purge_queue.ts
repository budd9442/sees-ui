
import amqp from 'amqplib';

async function purgeQueue() {
    const RABBITMQ_URL = 'amqp://guest:guest@localhost:5672';
    const QUEUE_NAME = 'lms_import';
    
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();
        
        console.log(`Purging queue: ${QUEUE_NAME}`);
        const result = await channel.purgeQueue(QUEUE_NAME);
        console.log(`Purged ${result.messageCount} messages.`);
        
        await connection.close();
    } catch (e) {
        console.error('Error:', e);
    }
}

purgeQueue();
