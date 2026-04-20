import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { prisma } from "@/lib/db";
import { compare } from "bcryptjs";
import Credentials from "next-auth/providers/credentials";
import { headers } from "next/headers";
import { clientIpFromHeaders, writeAuditLog } from "@/lib/audit/write-audit-log";
import { verifyTwoFactorCode } from "@/lib/auth/two-factor";

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
            credentials: {
                identifier: { label: "Identifier", type: "text" },
                password: { label: "Password", type: "password" },
                code: { label: "Code", type: "text" }
            },
            async authorize(credentials) {
                const { identifier, password } = credentials ?? {};
                const h = await headers();
                const ip = clientIpFromHeaders(h);
                const ua = h.get("user-agent");

                if (!identifier || !password) return null;

                const identifierInput = String(identifier).trim();

                // We'll search by email, username, or user_id (which acts as student_id/staff_number)
                const user = await prisma.user.findFirst({
                    where: {
                        OR: [
                            { email: { equals: identifierInput, mode: 'insensitive' } },
                            { username: { equals: identifierInput, mode: 'insensitive' } },
                            { user_id: { equals: identifierInput, mode: 'insensitive' } }
                        ]
                    },
                    include: { 
                        student: true, 
                        staff: {
                            select: {
                                staff_id: true,
                                staff_number: true,
                                staff_type: true,
                                department: true,
                                advisor_profile: true,
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
                        metadata: { identifier: identifierInput, reason: "user_not_found" },
                        ipAddress: ip,
                        userAgent: ua,
                    });
                    return null;
                }

                // Explicitly cast to any to bypass potential type mismatch during password check
                const passwordsMatch = await compare(String(password), (user as any).password_hash);

                if (passwordsMatch) {
                    // Check for 2FA enforcement
                    const enforce2FASetting = await prisma.systemSetting.findUnique({
                        where: { key: 'ENFORCE_STAFF_2FA' }
                    });
                    
                    let userRole = (user as any).role ?? 'student';
                    const isStaffOrAdmin = userRole === 'admin' || !!(user as any).staff;
                    const is2FARequired = (enforce2FASetting?.value === 'true' && isStaffOrAdmin) || user.isTwoFactorEnabled;

                    if (is2FARequired) {
                        const code = (credentials as any).code;
                        
                        if (!code) {
                            throw new Error("2FA_REQUIRED");
                        }

                        const isValid = await verifyTwoFactorCode(code, user.twoFactorSecret || "");
                        
                        if (!isValid) {
                            const isBackupValid = user.twoFactorBackupCodes.includes(code);
                            if (!isBackupValid) {
                                throw new Error("INVALID_2FA_CODE");
                            }
                            
                            // Remove used backup code
                            await prisma.user.update({
                                where: { user_id: user.user_id },
                                data: {
                                    twoFactorBackupCodes: user.twoFactorBackupCodes.filter(c => c !== code)
                                }
                            });
                        }
                    }

                    const now = new Date();
                    try {
                        await prisma.user.update({
                            where: { user_id: (user as any).user_id },
                            data: { last_login_date: now },
                        });
                    } catch (e) {
                        console.error("Failed to update last login:", e);
                    }

                    // Determine role
                    let role: string = (user as any).role ?? 'student';
                    const staff = (user as any).staff;

                    if (role !== 'admin') {
                        if (staff?.staff_type === 'ADMIN' || staff?.staff_type === 'REGISTRAR') {
                            role = 'admin';
                        } else if (staff?.hod) {
                            role = 'hod';
                        } else if (staff?.advisor_profile) {
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
                        last_login_date: now,
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
