'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema, CreateUserSchema } from '@/lib/validations/user';
import { createUser, updateUser } from '@/lib/actions/user-actions';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface UserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user?: any | null;
    degreePrograms?: any[];
}

export function UserDialog({ open, onOpenChange, user, degreePrograms }: UserDialogProps) {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<CreateUserSchema>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            role: 'student',
            admissionYear: new Date().getFullYear(),
            degreePathId: '',
            staffNumber: '',
            department: '',
            staffType: 'ACADEMIC'
        },
    });

    const { reset, watch, setValue } = form;
    const selectedRole = watch('role');
    const emailValue = watch('email');

    // Auto-populate fields based on email for Students
    useEffect(() => {
        if (selectedRole === 'student' && emailValue) {
            // Format: lastname-deptYearNo@domain (e.g., bandara-im22053@...)
            const emailPrefix = emailValue.split('@')[0];
            const parts = emailPrefix.split('-');

            if (parts.length >= 2) {
                const idPart = parts[parts.length - 1]; // im22053
                const namePart = parts[0]; // bandara

                // Check if last part contains numbers (likely the ID)
                if (/\d+/.test(idPart)) {
                    // Extract Year: assumes 2 digits inside the alphanumeric string (e.g. 22 in im22053)
                    // We look for the first sequence of 2 digits
                    const yearMatch = idPart.match(/\d{2}/);

                    if (yearMatch) {
                        const shortYear = parseInt(yearMatch[0], 10);
                        const fullYear = 2000 + shortYear;
                        setValue('admissionYear', fullYear);
                    }

                    // Set Last Name
                    if (namePart) {
                        const capitalized = namePart.charAt(0).toUpperCase() + namePart.slice(1);
                        setValue('lastName', capitalized);
                    }
                }
            }
        }
    }, [emailValue, selectedRole, setValue]);

    // Reset form when user changes or dialog opens
    useEffect(() => {
        if (open) {
            if (user) {
                reset({
                    firstName: user.first_name || '',
                    lastName: user.last_name || '',
                    email: user.email || '',
                    role: (['student', 'staff', 'admin'].includes(user.role) ? user.role : 'student') as any,
                    studentId: user.studentId || '',
                    admissionYear: user.admissionYear || new Date().getFullYear(),
                    currentLevel: user.level || '',
                    degreePathId: user.degreeId || '', // Check if user object has degreeId from flattening
                    staffNumber: user.staffNumber || '',
                    department: user.department || '',
                    staffType: user.type || 'ACADEMIC'
                });
            } else {
                reset({
                    firstName: '',
                    lastName: '',
                    email: '',
                    role: 'student',
                    admissionYear: new Date().getFullYear(),
                    degreePathId: '',
                    staffNumber: '',
                    department: '',
                    staffType: 'ACADEMIC'
                });
            }
        }
    }, [open, user, reset]);

    async function onSubmit(data: CreateUserSchema) {
        setIsLoading(true);
        try {
            let result;
            if (user) {
                result = await updateUser({ ...data, id: user.user_id });
            } else {
                result = await createUser(data);
            }

            if (result.success) {
                toast.success(user ? "User updated successfully" : "User created successfully");
                onOpenChange(false);
                if (!user) form.reset();
            } else {
                toast.error(typeof result.error === 'string' ? result.error : "Failed to save user");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{user ? 'Edit User' : 'Create New User'}</DialogTitle>
                    <DialogDescription>
                        {user ? "Update user details." : "Add a new user to the system."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }: { field: any }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="john.doe@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }: { field: any }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="student">Student</SelectItem>
                                            <SelectItem value="staff">Staff</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {selectedRole === 'student' && (
                            <div className="space-y-4 border-t pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="admissionYear"
                                        render={({ field }: { field: any }) => (
                                            <FormItem>
                                                <FormLabel>Admission Year</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="2025"
                                                        {...field}
                                                        onChange={e => {
                                                            const val = e.target.valueAsNumber;
                                                            field.onChange(isNaN(val) ? undefined : val);
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="currentLevel"
                                        render={({ field }: { field: any }) => (
                                            <FormItem>
                                                <FormLabel>Level</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Level" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="L1">L1</SelectItem>
                                                        <SelectItem value="L2">L2</SelectItem>
                                                        <SelectItem value="L3">L3</SelectItem>
                                                        <SelectItem value="L4">L4</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="degreePathId"
                                    render={({ field }: { field: any }) => (
                                        <FormItem>
                                            <FormLabel>Degree Program</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select Program" className="truncate" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {degreePrograms?.map((prog: any) => (
                                                        <SelectItem key={prog.program_id} value={prog.program_id}>
                                                            <span className="truncate block max-w-[300px]">
                                                                {prog.code} - {prog.name}
                                                            </span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {selectedRole === 'staff' && (
                            <div className="space-y-4 border-t pt-2">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="staffNumber"
                                        render={({ field }: { field: any }) => (
                                            <FormItem>
                                                <FormLabel>Staff Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="STF001" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="staffType"
                                        render={({ field }: { field: any }) => (
                                            <FormItem>
                                                <FormLabel>Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="ACADEMIC">Academic</SelectItem>
                                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="department"
                                    render={({ field }: { field: any }) => (
                                        <FormItem>
                                            <FormLabel>Department</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Computing" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}



                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Saving...' : 'Save changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
