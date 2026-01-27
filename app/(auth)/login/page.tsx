'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { authenticate } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GraduationCap, Loader2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';

function LoginButton() {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                </>
            ) : (
                'Sign In'
            )}
        </Button>
    );
}

export default function LoginPage() {
    const [errorMessage, dispatch] = useActionState(authenticate, undefined);

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex flex-col justify-center p-12 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                <div className="max-w-md">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-foreground/10 backdrop-blur">
                            <GraduationCap className="h-10 w-10" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold">SEES</h1>
                            <p className="text-primary-foreground/80">Student Enrollment & Evaluation System</p>
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold mb-4">
                        Welcome to Academic Excellence
                    </h2>
                    <p className="text-lg text-primary-foreground/90 mb-8">
                        Manage your academic journey with our comprehensive enrollment and
                        evaluation platform. Track your progress, register for modules, and
                        achieve your academic goals.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/20">
                                ✓
                            </div>
                            <div>
                                <h3 className="font-semibold">Real-time GPA Tracking</h3>
                                <p className="text-sm text-primary-foreground/80">
                                    Monitor your academic performance with live GPA calculations
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/20">
                                ✓
                            </div>
                            <div>
                                <h3 className="font-semibold">Smart Module Registration</h3>
                                <p className="text-sm text-primary-foreground/80">
                                    Automated prerequisite checking and capacity management
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md space-y-8">
                    {/* Mobile Logo */}
                    <div className="flex lg:hidden items-center justify-center gap-2 mb-8">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                            <GraduationCap className="h-7 w-7" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">SEES</h1>
                            <p className="text-sm text-muted-foreground">Login to continue</p>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Sign In</CardTitle>
                            <CardDescription>
                                Enter your credentials to access your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form action={dispatch} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        placeholder="student@example.com"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">Password</Label>
                                        <Link
                                            href="/forgot-password"
                                            className="text-sm text-primary hover:underline"
                                            tabIndex={-1}
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        name="password"
                                        placeholder="Enter your password"
                                        required
                                        minLength={6}
                                    />
                                </div>

                                {errorMessage && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{errorMessage}</AlertDescription>
                                    </Alert>
                                )}

                                <LoginButton />
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
