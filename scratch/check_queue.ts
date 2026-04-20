
import amqp from 'amqplib';

async function checkQueue() {
    const RABBITMQ_URL = 'amqp://guest:guest@localhost:5672';
    const QUEUE_NAME = 'lms_import';
    
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();
        
        const q = await channel.assertQueue(QUEUE_NAME, { durable: true });
        console.log(`Queue: ${QUEUE_NAME}`);
        console.log(`Message Count: ${q.messageCount}`);
        console.log(`Consumer Count: ${q.consumerCount}`);
        
        await connection.close();
    } catch (e) {
        console.error('Error:', e);
    }
}

checkQueue();
