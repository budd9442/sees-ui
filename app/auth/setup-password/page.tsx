'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, AlertCircle, Loader2, Key } from 'lucide-react';
import { toast } from 'sonner';
import { completeStudentSetup } from '@/lib/actions/enrollment-bulk-actions';

function SetupPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isValid, setIsValid] = useState(true);

    useEffect(() => {
        if (!token) {
            setIsValid(false);
            toast.error("Invalid setup link. Please check your email.");
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        if (password.length < 8) {
            toast.error("Password must be at least 8 characters long.");
            return;
        }

        setLoading(true);
        try {
            const res = await completeStudentSetup(token!, password);
            if (res.success) {
                toast.success("Account setup successful! Redirecting to login...");
                setTimeout(() => router.push('/login'), 2000);
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isValid) {
        return (
            <Card className="w-full max-w-md border-red-200 bg-red-50/10">
                <CardHeader>
                    <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                        <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <CardTitle className="text-center text-red-600">Invalid Token</CardTitle>
                    <CardDescription className="text-center">
                        This setup link is invalid or has expired. Please contact the administrator.
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => router.push('/login')}>Go to Login</Button>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md shadow-2xl border-primary/10">
            <CardHeader className="space-y-1">
                <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <Key className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold text-center">Activate Account</CardTitle>
                <CardDescription className="text-center">
                    Set a secure password to complete your SEES registration.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <Input 
                            id="password" 
                            type="password" 
                            placeholder="••••••••" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                        <p className="text-[10px] text-muted-foreground italic">Minimum 8 characters.</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input 
                            id="confirmPassword" 
                            type="password" 
                            placeholder="••••••••" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required 
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Complete Setup
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}

export default function SetupPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/50 p-6">
            <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-primary" />}>
                <SetupPasswordForm />
            </Suspense>
        </div>
    );
}
