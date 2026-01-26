'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}

export async function logoutAction() {
    // Determine the redirect URL based on the current environment or default to login
    // In strict mode or production, signOut handles the redirect.
    await import('@/auth').then(({ signOut }) => signOut({ redirectTo: '/login' }));
}
