import { redirect } from 'next/navigation';
import { validateRegistrationToken } from '@/lib/actions/user-actions';
import RegistrationForm from './registration-form';
import Link from 'next/link';

export default async function RegisterPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { token } = await searchParams;

    if (!token || typeof token !== 'string') {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center p-4">
                <div className="w-full max-w-md space-y-4 text-center">
                    <h1 className="text-2xl font-bold text-red-600">Invalid Invitation link</h1>
                    <p className="text-gray-600">This registration link is invalid or missing.</p>
                    <Link href="/login" className="text-blue-600 hover:underline">Return to Login</Link>
                </div>
            </div>
        );
    }

    const validation = await validateRegistrationToken(token);

    if (!validation.success) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center p-4">
                <div className="w-full max-w-md space-y-4 text-center">
                    <h1 className="text-2xl font-bold text-red-600">Invitation Expired or Invalid</h1>
                    <p className="text-gray-600">{validation.error}</p>
                    <p className="text-sm text-gray-500">Please ask your administrator for a new invitation.</p>
                    <Link href="/login" className="text-blue-600 hover:underline">Return to Login</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-lg">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Complete Registration</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Welcome, <strong>{validation.data?.firstName}</strong>!
                        <br />
                        Please set a password to activate your account.
                    </p>
                </div>

                <RegistrationForm token={token} username={validation.data?.username || ''} />
            </div>
        </div>
    );
}
