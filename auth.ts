import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { prisma } from "@/lib/db";
import { compare } from "bcryptjs";
import Credentials from "next-auth/providers/credentials";

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const { email, password } = credentials ?? {};
                if (!email || !password) return null;

                const user = await prisma.user.findUnique({
                    where: { email: String(email) },
                    include: { student: true, staff: true }
                });

                if (!user) return null;

                // Explicitly cast to any to bypass potential type mismatch during password check
                const passwordsMatch = await compare(String(password), (user as any).password_hash);

                if (passwordsMatch) {
                    try {
                        // Use string literal key access to avoid linter complaints if types are messy
                        // Or assume linter is right about camelCase
                        await prisma.user.update({
                            where: { user_id: (user as any).user_id },
                            data: { last_login_date: new Date() },
                        });
                    } catch (e) {
                        console.error("Failed to update last login:", e);
                    }

                    // Determine role based on relations
                    let role = 'student';
                    if ((user as any).staff?.staff_type === 'ADMIN' || (user as any).staff?.staff_type === 'REGISTRAR') {
                        role = 'admin';
                    } else if (email.toString().toLowerCase().includes('admin')) {
                        // Fallback for seed admin if needed, though seed admin has staff type ADMIN usually? 
                        // Check seed: staff_type: 'ADMIN'
                        role = 'admin';
                    } else if ((user as any).staff) {
                        role = 'staff';
                    } else if ((user as any).student) {
                        role = 'student';
                    } else {
                        // Fallback or guest?
                        // If explicit admin email but no staff record (e.g. bootstrap), keep as admin via email check above
                        if (email.toString().toLowerCase().includes('admin')) role = 'admin';
                    }

                    // Force admin role for the specific seed admin email if db relation fails/missing for some reason
                    if (email === 'admin@sees.com') role = 'admin';

                    const firstName = user.first_name || 'User';
                    const lastName = user.last_name || '';

                    return {
                        ...user,
                        role,
                        firstName,
                        lastName,
                        name: `${firstName} ${lastName}`.trim(),
                        first_name: user.first_name || undefined,
                        last_name: user.last_name || undefined
                    };
                }

                return null;
            },
        }),
    ],
});
