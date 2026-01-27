'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { setPasswordSchema, SetPasswordSchema } from '@/lib/validations/user';
import { completeRegistration } from '@/lib/actions/user-actions';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface RegistrationFormProps {
    token: string;
    username: string;
}

export default function RegistrationForm({ token, username }: RegistrationFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<SetPasswordSchema>({
        resolver: zodResolver(setPasswordSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });

    async function onSubmit(data: SetPasswordSchema) {
        setIsLoading(true);
        try {
            const result = await completeRegistration(token, data.password);

            if (result.success) {
                toast.success('Registration successful! Redirecting to login...');
                // Allow toast to show before redirecting
                setTimeout(() => {
                    router.push('/login');
                }, 1500);
            } else {
                toast.error('error' in result && typeof result.error === 'string' ? result.error : 'Registration failed');
                setIsLoading(false);
            }
        } catch (error) {
            toast.error('Something went wrong. Please try again.');
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2 text-sm text-muted-foreground p-3 bg-blue-50 text-blue-800 rounded-md">
                    <p>Username: <span className="font-semibold">{username}</span></p>
                </div>

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Completing Registration...' : 'Set Password and Login'}
                </Button>
            </form>
        </Form>
    );
}
