import { z } from 'zod';

export const userSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    role: z.enum(['student', 'staff', 'admin']),
    // Optional fields specific to roles can be added here
    // For student
    studentId: z.string().optional(),
    admissionYear: z.number().optional(),
    degreePathId: z.string().optional(),
    currentLevel: z.string().optional(),
    // For staff
    staffNumber: z.string().optional(),
    department: z.string().optional(),
    staffType: z.string().optional(),
});

export type CreateUserSchema = z.infer<typeof userSchema>;

export const updateUserSchema = userSchema.partial().extend({
    id: z.string(),
});

export type UpdateUserSchema = z.infer<typeof updateUserSchema>;

export const setPasswordSchema = z.object({
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export type SetPasswordSchema = z.infer<typeof setPasswordSchema>;
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
