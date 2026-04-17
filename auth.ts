import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { prisma } from "@/lib/db";
import { compare } from "bcryptjs";
import Credentials from "next-auth/providers/credentials";
import { headers } from "next/headers";
import { clientIpFromHeaders, writeAuditLog } from "@/lib/audit/write-audit-log";

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    events: {
        async signIn({ user }) {
            const userId = user?.id ?? (user as { user_id?: string } | undefined)?.user_id;
            if (!userId) return;
            const h = await headers();
            await writeAuditLog({
                adminId: userId,
                action: "AUTH_LOGIN_SUCCESS",
                entityType: "AUTH",
                entityId: "login",
                category: "AUTH",
                metadata: { email: user.email ?? undefined },
                ipAddress: clientIpFromHeaders(h),
                userAgent: h.get("user-agent"),
            });
        },
    },
    providers: [
        Credentials({
            async authorize(credentials) {
                const { email, password } = credentials ?? {};
                const h = await headers();
                const ip = clientIpFromHeaders(h);
                const ua = h.get("user-agent");

                if (!email || !password) return null;

                const emailInput = String(email).trim();

                const user = await prisma.user.findUnique({
                    where: { email: emailInput },
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

                if (!user) {
                    await writeAuditLog({
                        adminId: null,
                        action: "AUTH_LOGIN_FAILED",
                        entityType: "AUTH",
                        entityId: "login",
                        category: "AUTH",
                        metadata: { email: emailInput, reason: "user_not_found" },
                        ipAddress: ip,
                        userAgent: ua,
                    });
                    return null;
                }

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

                    // Determine role (prefer persisted User.role, then infer from relations)
                    let role: string = (user as any).role ?? 'student';
                    const staff = (user as any).staff;

                    if (role !== 'admin') {
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
                    }

                    const firstName = user.firstName || 'User';
                    const lastName = user.lastName || '';

                    return {
                        ...user,
                        id: user.user_id,
                        role,
                        firstName,
                        lastName,
                        name: `${firstName} ${lastName}`.trim(),
                    };
                }

                await writeAuditLog({
                    adminId: user.user_id,
                    action: "AUTH_LOGIN_FAILED",
                    entityType: "AUTH",
                    entityId: "login",
                    category: "AUTH",
                    metadata: { email: user.email, reason: "invalid_credentials" },
                    ipAddress: ip,
                    userAgent: ua,
                });
                return null;
            },
        }),
    ],
});
