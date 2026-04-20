import amqp from 'amqplib';
import { prisma } from '../db';
import { sendEmail } from '../email/brevo';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
const QUEUE_NAME = 'enrollment_invites';

// Global guard to prevent multiple worker loops in development/HMR
let isWorkerRunning = false;

/**
 * Background worker to consume email tasks from RabbitMQ
 */
export async function startEmailWorker() {
    if (isWorkerRunning) {
        console.log('[QUEUE] Email Worker is already running. Skipping initialization.');
        return;
    }

    try {
        console.log('[QUEUE] Connecting to RabbitMQ...');
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        await channel.assertQueue(QUEUE_NAME, { durable: true });
        channel.prefetch(1); 

        isWorkerRunning = true;
        console.log(`[QUEUE] Worker initialized successfully. Listening on "${QUEUE_NAME}"`);

        channel.consume(QUEUE_NAME, async (msg) => {
            if (msg !== null) {
                const content = JSON.parse(msg.content.toString());
                const { recordId, email, firstName, lastName, setupLink } = content;

                console.log(`[EMAIL] >>> Detected task in queue for: ${email}`);

                try {
                    console.log(`[EMAIL] Invoking Brevo API for ${email}...`);

                    await sendEmail(
                        {
                            to: email,
                            toName: `${firstName} ${lastName}`,
                            subject: 'Welcome to SEES! Setup your academic account',
                            htmlContent: `
                            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                                <h1 style="color: #1e3a8a;">Welcome to SEES Platform</h1>
                                <p>Hi ${firstName},</p>
                                <p>An academic account has been created for you at SEES. Please click the button below to set your password and activate your profile.</p>
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="${setupLink}" style="display: inline-block; padding: 14px 28px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">Setup My Account</a>
                                </div>
                                <p style="color: #64748b; font-size: 0.875rem;">This link will expire in 7 days. If you did not expect this email, please ignore it.</p>
                            </div>
                        `,
                        },
                        {
                            actorUserId: null,
                            action: 'EMAIL_BULK_ENROLLMENT_INVITE',
                            entityType: 'BULK_ENROLLMENT',
                            entityId: recordId,
                            category: 'EMAIL',
                            metadata: { source: 'bulk_enrollment_worker' },
                        }
                    );

                    console.log(`[EMAIL] Brevo response for ${email}: SUCCESS`);

                    // Update Record Status in DB
                    await prisma.bulkEnrollmentRecord.update({
                        where: { record_id: recordId },
                        data: { email_sent: true, email_sent_at: new Date() }
                    });

                    console.log(`[QUEUE] Record ${recordId} updated and message ACKed.`);
                    channel.ack(msg);
                } catch (err: any) {
                    console.error(`[EMAIL] !!! FAILED to send email to ${email}:`, err.message);
                    
                    // Update error message in DB for visibility
                    await prisma.bulkEnrollmentRecord.update({
                        where: { record_id: recordId },
                        data: { error_message: `Email sending failed: ${err.message}` }
                    });

                    // Negative ACK: Re-queue the message if it's a transient failure
                    // In a production app, we'd check if error is 4xx or 5xx
                    console.warn(`[QUEUE] Re-queuing message for ${email} due to error.`);
                    channel.nack(msg, false, true);
                }
            }
        });

        // Handle connection closure
        connection.on('close', () => {
            console.warn('[QUEUE] RabbitMQ Connection closed. Resetting worker status.');
            isWorkerRunning = false;
        });

    } catch (error: any) {
        console.error('[QUEUE] CRITICAL: Failed to start Email Worker:', error.message);
        isWorkerRunning = false;
        
        // Retry connection after 5 seconds
        setTimeout(startEmailWorker, 5000);
    }
}

// Support for manual startup (legacy or CLI)
if (require.main === module) {
    startEmailWorker();
}
