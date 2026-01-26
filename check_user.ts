
import { PrismaClient } from "@prisma/client";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import fs from 'fs';
import path from 'path';

// Load .env manually
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach(line => {
        const [key, ...values] = line.split('=');
        const value = values.join('=');
        if (key && value) {
            process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
        }
    });
}

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function check() {
    const email = 'student@sees.com';
    const user = await prisma.user.findUnique({
        where: { email },
        include: { student: true }
    });

    if (user) {
        console.log(`Current DB User ID for ${email}: ${user.user_id}`);
        console.log(`Has Student Profile: ${!!user.student}`);
    } else {
        console.log(`User ${email} not found in DB.`);
    }
}

check()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
