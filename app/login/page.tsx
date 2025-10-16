'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GraduationCap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const testAccounts = [
    { email: 'alice@university.edu', role: 'Student (L2, MIT, BSE)' },
    { email: 'sarah.wilson@university.edu', role: 'Academic Staff' },
    { email: 'michael.smith@university.edu', role: 'Advisor' },
    { email: 'john.anderson@university.edu', role: 'Head of Department' },
    { email: 'admin@university.edu', role: 'System Administrator' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Synchronous login - no async needed
    const success = login(email, password);

    if (success) {
      toast.success('Login successful! Redirecting...');
      // Direct navigation - no delays
      const user = useAuthStore.getState().user;
      if (user) {
        router.push(`/dashboard/${user.role}`);
      }
    } else {
      setError('Invalid email or password. Please try again.');
      toast.error('Login failed');
      setIsLoading(false);
    }
  };

  const quickLogin = (testEmail: string) => {
    // Direct login without form submission
    const success = login(testEmail, 'password');
    if (success) {
      toast.success('Login successful! Redirecting...');
      const user = useAuthStore.getState().user;
      if (user) {
        router.push(`/dashboard/${user.role}`);
      }
    } else {
      toast.error('Login failed');
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex flex-col justify-center p-12 bg-gradient-to-br from-primary to-primary/80 text-white">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
              <GraduationCap className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">SEES</h1>
              <p className="text-white/80">Student Enrollment & Evaluation System</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold mb-4">
            Welcome to Academic Excellence
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Manage your academic journey with our comprehensive enrollment and
            evaluation platform. Track your progress, register for modules, and
            achieve your academic goals.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                ✓
              </div>
              <div>
                <h3 className="font-semibold">Real-time GPA Tracking</h3>
                <p className="text-sm text-white/80">
                  Monitor your academic performance with live GPA calculations
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                ✓
              </div>
              <div>
                <h3 className="font-semibold">Smart Module Registration</h3>
                <p className="text-sm text-white/80">
                  Automated prerequisite checking and capacity management
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                ✓
              </div>
              <div>
                <h3 className="font-semibold">Pathway Guidance</h3>
                <p className="text-sm text-white/80">
                  Data-driven pathway and specialization selection
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
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
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
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="student@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Test Accounts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Login (Demo)</CardTitle>
              <CardDescription className="text-xs">
                Click any account below to auto-fill credentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {testAccounts.map((account) => (
                  <Button
                    key={account.email}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3"
                    onClick={() => quickLogin(account.email)}
                    disabled={isLoading}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-sm">{account.email}</span>
                      <span className="text-xs text-muted-foreground">
                        {account.role}
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                * Any password works in demo mode
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
