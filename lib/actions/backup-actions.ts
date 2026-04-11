'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ENCRYPTION_ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = process.env.BACKUP_SECRET || 'sees_v2_ultra_secure_local_dev_secret_1024';
const IV_LENGTH = 16;

/**
 * Trigger a JSON-based database snapshot (Portability focus for FR7.2c)
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

    // Fetch all core tables
    const data = {
        users: await prisma.user.findMany(),
        students: await prisma.student.findMany(),
        grades: await prisma.grade.findMany(),
        modules: await prisma.module.findMany(),
        settings: await prisma.systemSetting.findMany(),
        programs: await prisma.degreeProgram.findMany(),
        semesters: await prisma.semester.findMany()
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

    const filePath = path.join(process.cwd(), 'backups', filename);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    return { success: true };
}
