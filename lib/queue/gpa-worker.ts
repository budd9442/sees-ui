import amqp from 'amqplib';
import { prisma } from '../db';
import { AcademicEngine } from '../services/academic-engine';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
const QUEUE_NAME = 'gpa_recalculation';

let isWorkerRunning = false;

/**
 * Background worker to recalculate and store student GPA and Academic Class.
 * Triggered whenever grades are released to keep denormalized fields in sync.
 */
export async function startGPAWorker() {
    if (isWorkerRunning) {
        console.log('[QUEUE] GPA Worker is already running. Skipping initialization.');
        return;
    }

    try {
        console.log('[QUEUE] Connecting to RabbitMQ for GPA Worker...');
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        await channel.assertQueue(QUEUE_NAME, { durable: true });
        channel.prefetch(5); // Process up to 5 students concurrently

        isWorkerRunning = true;
        console.log(`[QUEUE] GPA Worker initialized successfully. Listening on "${QUEUE_NAME}"`);

        channel.consume(QUEUE_NAME, async (msg) => {
            if (msg !== null) {
                const content = JSON.parse(msg.content.toString());
                const { studentIds } = content;

                console.log(`[GPA-WORKER] Processing GPA recalculation for ${studentIds?.length || 0} students...`);

                try {
                    for (const studentId of studentIds) {
                        console.log(`[GPA-WORKER] Recalculating for student: ${studentId}`);
                        
                        // 1. Calculate live metrics using the authoritative AcademicEngine
                        const { gpa, academicClass } = await AcademicEngine.calculateStudentGPA(studentId);

                        // 2. Perform transactional update of denormalized fields and history
                        await prisma.$transaction([
                            // Update the main Student record for fast lookup/filtering
                            prisma.student.update({
                                where: { student_id: studentId },
                                data: {
                                    current_gpa: gpa,
                                    academic_class: academicClass
                                }
                            }),
                            // Record the historical snapshot
                            prisma.gPAHistory.create({
                                data: {
                                    student_id: studentId,
                                    gpa: gpa,
                                    academic_class: academicClass,
                                    calculation_date: new Date()
                                }
                            })
                        ]);
                    }

                    console.log(`[GPA-WORKER] Successfully updated ${studentIds.length} students.`);
                    channel.ack(msg);
                } catch (err: any) {
                    console.error(`[GPA-WORKER] !!! FAILED to process GPA recalculation:`, err.message);
                    
                    // In case of failure, we nack and re-queue to retry
                    console.warn(`[QUEUE] Re-queuing GPA task due to error.`);
                    channel.nack(msg, false, true);
                }
            }
        });

        connection.on('close', () => {
            console.warn('[QUEUE] RabbitMQ Connection closed for GPA Worker. Resetting worker status.');
            isWorkerRunning = false;
        });

    } catch (error: any) {
        console.error('[QUEUE] CRITICAL: Failed to start GPA Worker:', error.message);
        isWorkerRunning = false;
        setTimeout(startGPAWorker, 5000);
    }
}

if (require.main === module) {
    startGPAWorker();
}
