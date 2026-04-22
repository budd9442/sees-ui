'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { writeAuditLog } from '@/lib/audit/write-audit-log';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ENCRYPTION_ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = process.env.BACKUP_SECRET || 'sees_v2_ultra_secure_local_dev_secret_1024';
const IV_LENGTH = 16;

/**
 * Trigger a JSON-based database snapshot (Portability focus for FR7.2c)
 */
/**
 * @swagger
 * /action/backup/triggerBackup:
 *   post:
 *     summary: "[Server Action] Create Database Snapshot"
 *     description: Triggers an encrypted JSON backup of the entire database, including users, programs, modules, and grades.
 *     tags:
 *       - Backup Actions
 *     responses:
 *       200:
 *         description: Successfully created backup
 */
export async function triggerBackup() {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== 'admin') {
        throw new Error("Unauthorized: Admin access required.");
    }

    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `sees_backup_${timestamp}.json`;
    const filePath = path.join(backupDir, filename);

    const data = {
        snapshotVersion: 2 as const,
        users: await prisma.user.findMany(),
        students: await prisma.student.findMany(),
        moduleRegistrations: await prisma.moduleRegistration.findMany(),
        grades: await prisma.grade.findMany(),
        modules: await prisma.module.findMany(),
        settings: await prisma.systemSetting.findMany(),
        programs: await prisma.degreeProgram.findMany(),
        semesters: await prisma.semester.findMany(),
    };

    // JSON Serialization
    const serializedData = JSON.stringify(data, null, 2);

    // AES-256 Encryption
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, Buffer.from(SECRET_KEY.slice(0, 32)), iv);
    let encrypted = cipher.update(serializedData);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    // Store IV with encrypted data (Standard practice: first 16 bytes)
    const storeBuffer = Buffer.concat([iv, encrypted]);
    fs.writeFileSync(filePath, storeBuffer);

    // Post-Backup Cleanup (Retention Policy)
    await cleanupOldBackups();

    return { 
        success: true, 
        filename, 
        size: storeBuffer.length,
        timestamp: new Date()
    };
}

/**
 * Retention Policy: Remove backups older than 30 days
 */
export async function cleanupOldBackups() {
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) return;

    const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json'));
    const now = new Date();
    const expiryDays = 30;

    for (const file of files) {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        const ageInDays = (now.getTime() - stats.birthtime.getTime()) / (1000 * 60 * 60 * 24);

        if (ageInDays > expiryDays) {
            fs.unlinkSync(filePath);
        }
    }
}

/**
 * List all available backups
 */
export async function getBackupsList() {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== 'admin') {
        throw new Error("Unauthorized");
    }

    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) return [];

    const files = fs.readdirSync(backupDir)
        .filter(f => f.endsWith('.json'))
        .map(f => {
            const stats = fs.statSync(path.join(backupDir, f));
            return {
                filename: f,
                size: stats.size,
                createdAt: stats.birthtime
            };
        })
        .sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());

    return files;
}

/**
 * Delete a backup
 */
export async function deleteBackup(filename: string) {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== 'admin') {
        throw new Error("Unauthorized");
    }

    const safe = assertSafeBackupFilename(filename);
    const filePath = path.join(process.cwd(), 'backups', safe);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    return { success: true };
}

function backupDir() {
    return path.join(process.cwd(), 'backups');
}

function assertSafeBackupFilename(filename: string): string {
    const base = path.basename(filename);
    if (!/^[\w.\-]+\.json$/i.test(base) || base.includes('..')) {
        throw new Error('Invalid backup filename');
    }
    return base;
}

function decryptBackupFileToData(filePath: string): BackupSnapshot {
    const storeBuffer = fs.readFileSync(filePath);
    if (storeBuffer.length < IV_LENGTH + 1) throw new Error('Corrupt backup file');
    const iv = storeBuffer.subarray(0, IV_LENGTH);
    const encrypted = storeBuffer.subarray(IV_LENGTH);
    const decipher = crypto.createDecipheriv(
        ENCRYPTION_ALGORITHM,
        Buffer.from(SECRET_KEY.slice(0, 32)),
        iv
    );
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return JSON.parse(decrypted.toString('utf8')) as BackupSnapshot;
}

type BackupSnapshot = {
    snapshotVersion?: number;
    users: any[];
    students: any[];
    moduleRegistrations?: any[];
    grades: any[];
    modules: any[];
    settings: any[];
    programs: any[];
    semesters: any[];
};

/**
 * Admin UI: list backups as Dashboard `Backup` rows.
 */
export async function getAdminBackupsData() {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== 'admin') {
        throw new Error('Unauthorized');
    }
    const list = await getBackupsList();
    const backups = list.map((f) => ({
        id: f.filename,
        name: f.filename.replace(/\.json$/i, ''),
        description: 'Encrypted JSON snapshot (users, programs, modules, grades)',
        type: 'manual' as const,
        status: 'completed' as const,
        size: f.size,
        createdAt: f.createdAt.toISOString(),
        completedAt: f.createdAt.toISOString(),
    }));
    return { backups };
}

/**
 * Download encrypted snapshot (client builds Blob from base64).
 */
export async function downloadBackupAsBase64(filename: string) {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== 'admin') {
        throw new Error('Unauthorized');
    }
    const safe = assertSafeBackupFilename(filename);
    const filePath = path.join(backupDir(), safe);
    if (!fs.existsSync(filePath)) throw new Error('Backup not found');
    const buf = fs.readFileSync(filePath);
    return {
        filename: safe,
        base64: buf.toString('base64'),
        mimeType: 'application/octet-stream' as const,
    };
}

/**
 * @swagger
 * /action/backup/createAdminBackup:
 *   post:
 *     summary: "[Server Action] Manual Backup Creation"
 *     description: Creates an encrypted snapshot of the current database state for administrative archiving.
 *     tags:
 *       - Backup Actions
 *     responses:
 *       200:
 *         description: Successfully created backup
 */
export async function createAdminBackup() {
    const r = await triggerBackup();
    return {
        success: true as const,
        backup: {
            id: r.filename,
            name: r.filename.replace(/\.json$/i, ''),
            type: 'manual' as const,
            status: 'completed' as const,
            size: r.size,
            createdAt: r.timestamp.toISOString(),
            completedAt: r.timestamp.toISOString(),
        },
    };
}

export async function deleteAdminBackup(backupId: string) {
    await deleteBackup(backupId);
    return { success: true as const };
}

/**
 * Merge snapshot rows into the database (upsert by primary keys). Destructive to matching keys.
 * Requires snapshotVersion 2+ (includes moduleRegistrations). Older files skip grades if registrations missing.
 */
export async function restoreAdminBackup(filename: string) {
    const session = await auth();
    if (!session?.user?.id || (session.user as any).role !== 'admin') {
        throw new Error('Unauthorized');
    }
    const safe = assertSafeBackupFilename(filename);
    const filePath = path.join(backupDir(), safe);
    if (!fs.existsSync(filePath)) throw new Error('Backup not found');

    const data = decryptBackupFileToData(filePath);
    const modRegs = data.moduleRegistrations ?? [];

    await prisma.$transaction(
        async (tx) => {
            for (const u of data.users) {
                await tx.user.upsert({
                    where: { user_id: u.user_id },
                    create: u,
                    update: u,
                });
            }
            for (const p of data.programs) {
                await tx.degreeProgram.upsert({
                    where: { program_id: p.program_id },
                    create: p,
                    update: p,
                });
            }
            for (const s of data.semesters) {
                await tx.semester.upsert({
                    where: { semester_id: s.semester_id },
                    create: s,
                    update: s,
                });
            }
            for (const m of data.modules) {
                await tx.module.upsert({
                    where: { module_id: m.module_id },
                    create: m,
                    update: m,
                });
            }
            for (const st of data.students) {
                await tx.student.upsert({
                    where: { student_id: st.student_id },
                    create: st,
                    update: st,
                });
            }
            for (const r of modRegs) {
                await tx.moduleRegistration.upsert({
                    where: { reg_id: r.reg_id },
                    create: r,
                    update: r,
                });
            }
            if (data.grades?.length && modRegs.length === 0) {
                console.warn(
                    '[restore] Skipping grades: snapshot has no moduleRegistrations (re-save backup with v2 collector).'
                );
            } else {
                for (const g of data.grades ?? []) {
                    await tx.grade.upsert({
                        where: { grade_id: g.grade_id },
                        create: g,
                        update: g,
                    });
                }
            }
            for (const s of data.settings) {
                await tx.systemSetting.upsert({
                    where: { key: s.key },
                    create: s,
                    update: {
                        value: s.value,
                        description: s.description,
                        category: s.category,
                        updated_at: s.updated_at,
                    },
                });
            }
        },
        { maxWait: 60000, timeout: 120000 }
    );

    await writeAuditLog({
        adminId: session.user.id,
        action: 'ADMIN_BACKUP_RESTORE',
        entityType: 'BACKUP_FILE',
        entityId: safe,
        category: 'ADMIN',
    });

    return { success: true as const };
}
