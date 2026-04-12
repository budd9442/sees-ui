import { prisma } from '/Users/budd/dev/sees-ui/lib/db';
import { hash } from 'bcryptjs';

async function main() {
    const email = 'admin@sees.com';
    const newPassword = 'admin123';
    const passwordHash = await hash(newPassword, 10);
    
    console.log(`Resetting/Creating user ${email}...`);
    
    try {
        const user = await prisma.user.upsert({
            where: { email },
            update: { password_hash: passwordHash },
            create: {
                email,
                username: 'admin_sees',
                password_hash: passwordHash,
                status: 'ACTIVE',
                firstName: 'Super',
                lastName: 'Admin',
                staff: {
                    create: {
                        staff_number: 'ADM_SEES',
                        staff_type: 'ADMIN',
                        department: 'Registry'
                    }
                }
            }
        });
        console.log(`Successfully reset password for ${user.email} to '${newPassword}'`);
        
        // Also reset admin@kln.ac.lk just in case
        await prisma.user.update({
            where: { email: 'admin@kln.ac.lk' },
            data: { password_hash: passwordHash }
        }).catch(() => console.log('admin@kln.ac.lk not found, skipping.'));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
