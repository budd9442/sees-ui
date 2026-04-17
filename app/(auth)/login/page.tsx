'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { authenticate } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, GraduationCap, Loader2, ShieldCheck, Sparkles } from 'lucide-react';
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
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative min-h-screen overflow-hidden bg-background">
            <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-6 py-8 lg:grid-cols-2 lg:px-10">
                <section className="hidden lg:block">
                    <div className="max-w-xl space-y-8">
                        <div className="inline-flex items-center gap-3 rounded-2xl border bg-card/70 px-4 py-3 shadow-sm backdrop-blur">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                                <GraduationCap className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-lg font-semibold leading-none">SEES</p>
                                <p className="text-sm text-muted-foreground">Student Enrollment & Evaluation System</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-4xl font-bold tracking-tight">
                                Welcome back to your academic workspace
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                Access dashboards, monitor progress, and manage academic workflows securely from one place.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-xl border bg-card p-4 shadow-sm">
                                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    Real-time Insights
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Track GPA trends, module outcomes, and academic milestones.
                                </p>
                            </div>
                            <div className="rounded-xl border bg-card p-4 shadow-sm">
                                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                                    <ShieldCheck className="h-4 w-4 text-primary" />
                                    Secure Access
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Role-based authorization and protected institutional workflows.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto w-full max-w-md">
                    <div className="mb-6 flex items-center justify-center gap-2 lg:hidden">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                            <GraduationCap className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xl font-bold leading-none">SEES</p>
                            <p className="text-xs text-muted-foreground">Sign in to continue</p>
                        </div>
                    </div>

                    <Card className="border-border/60 shadow-xl">
                        <CardHeader className="space-y-2">
                            <CardTitle className="text-2xl">Sign In</CardTitle>
                            <CardDescription>
                                Enter your institutional credentials to continue.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form action={dispatch} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        placeholder="name@sees.edu"
                                        autoComplete="email"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">Password</Label>
                                        <Link
                                            href="/forgot-password"
                                            className="text-sm font-medium text-primary hover:underline"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            placeholder="Enter your password"
                                            autoComplete="current-password"
                                            required
                                            minLength={6}
                                            className="pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((s) => !s)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
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
                </section>
            </div>
        </div>
    );
}
