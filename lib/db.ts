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
    
    console.log('[DB] Initializing background workers...');
    import('@/lib/queue/email-worker').then(worker => {
        worker.startEmailWorker().catch(err => {
            console.error('[QUEUE] Failed to auto-start worker:', err);
        });
    });

    import('@/lib/queue/lms-import-worker').then(worker => {
        console.log('[DB] LMS Import worker module loaded.');
        worker.startLmsImportWorker().catch(err => {
            console.error('[QUEUE] Failed to auto-start LMS import worker:', err);
        });
    }).catch(err => {
        console.error('[DB] Failed to load LMS Import worker module:', err);
    });

    import('@/lib/queue/gpa-worker').then(worker => {
        worker.startGPAWorker().catch(err => {
            console.error('[QUEUE] Failed to auto-start GPA worker:', err);
        });
    });
}
