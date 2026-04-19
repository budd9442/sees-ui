'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export async function authenticate(
    prevState: any,
    formData: FormData,
) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
        await signIn('credentials', formData);
    } catch (error) {
        // Robust check for 2FA messages in case of nested errors or bundling issues
        const errorMsg = (error as any).cause?.err?.message || (error as any).message;
        
        if (errorMsg === '2FA_REQUIRED') {
            return { error: '2FA_REQUIRED', email, password };
        }
        if (errorMsg === 'INVALID_2FA_CODE') {
            return { error: 'INVALID_2FA_CODE', email, password };
        }

        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                case 'CallbackRouteError':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        
        // Re-throw if it's a Next.js redirect or unknown error
        throw error;
    }
}

export async function logoutAction() {
    // Determine the redirect URL based on the current environment or default to login
    // In strict mode or production, signOut handles the redirect.
    await import('@/auth').then(({ signOut }) => signOut({ redirectTo: '/login' }));
}
