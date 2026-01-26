import { z } from 'zod';

export const userSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    role: z.enum(['student', 'staff', 'admin']),
    // Optional fields specific to roles can be added here
    // For student
    studentId: z.string().optional(),
    admissionYear: z.coerce.number().optional(), // Coerce to handle string input from forms
    degreePathId: z.string().optional(),
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
