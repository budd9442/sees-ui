import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Initialize pool and adapter exactly as in auth.ts
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
    
    // Force reload for new schema models: AcademicCreditRule
    // Auto-start RabbitMQ Worker in background for development
    import('@/lib/queue/email-worker').then(worker => {
        worker.startEmailWorker().catch(err => {
            console.error('[QUEUE] Failed to auto-start worker:', err);
        });
    });

    import('@/lib/queue/lms-import-worker').then(worker => {
        worker.startLmsImportWorker().catch(err => {
            console.error('[QUEUE] Failed to auto-start LMS import worker:', err);
        });
    });

    import('@/lib/queue/gpa-worker').then(worker => {
        worker.startGPAWorker().catch(err => {
            console.error('[QUEUE] Failed to auto-start GPA worker:', err);
        });
    });
}
