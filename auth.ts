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
                    include: { 
                        student: true, 
                        staff: {
                            include: {
                                advisor: true,
                                hod: true
                            }
                        } 
                    }
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
                    const staff = (user as any).staff;
                    
                    if (staff?.staff_type === 'ADMIN' || staff?.staff_type === 'REGISTRAR') {
                        role = 'admin';
                    } else if (staff?.hod) {
                        role = 'hod';
                    } else if (staff?.advisor) {
                        role = 'advisor';
                    } else if (staff) {
                        role = 'staff';
                    } else if ((user as any).student) {
                        role = 'student';
                    }

                    const firstName = user.first_name || 'User';
                    const lastName = user.last_name || '';

                    return {
                        ...user,
                        id: user.user_id,
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
