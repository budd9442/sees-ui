'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function TestPage() {
  const router = useRouter();
  const { user, isAuthenticated, login, logout } = useAuthStore();
  const [loginStatus, setLoginStatus] = useState<string>('');

  const testLogin = (email: string) => {
    setLoginStatus(`Attempting login with ${email}...`);
    const success = login(email, 'password');
    if (success) {
      const user = useAuthStore.getState().user;
      setLoginStatus(`Login successful! User: ${JSON.stringify(user, null, 2)}`);
      // Direct redirect
      if (user) {
        router.push(`/dashboard/${user.role}`);
      }
    } else {
      setLoginStatus(`Login failed for ${email}`);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Test Page</h1>

      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold">Current Auth State:</h2>
          <pre className="text-sm mt-2">
            isAuthenticated: {String(isAuthenticated)}
            {'\n'}
            user: {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div className="space-y-2">
          <h2 className="font-semibold">Test Logins:</h2>
          <Button onClick={() => testLogin('alice@university.edu')}>
            Login as Alice (Student)
          </Button>
          <Button onClick={() => testLogin('sarah.wilson@university.edu')}>
            Login as Sarah (Staff)
          </Button>
          <Button onClick={() => testLogin('michael.smith@university.edu')}>
            Login as Michael (Advisor)
          </Button>
          <Button onClick={() => testLogin('john.anderson@university.edu')}>
            Login as John (HOD)
          </Button>
          <Button onClick={() => testLogin('admin@university.edu')}>
            Login as Admin
          </Button>
        </div>

        {loginStatus && (
          <div className="p-4 border rounded bg-gray-50">
            <h2 className="font-semibold">Login Status:</h2>
            <pre className="text-sm mt-2">{loginStatus}</pre>
          </div>
        )}

        <div className="space-x-2">
          <Button variant="destructive" onClick={logout}>
            Logout
          </Button>
          <Button onClick={() => router.push('/')}>
            Go to Home
          </Button>
          <Button onClick={() => router.push('/login')}>
            Go to Login
          </Button>
          {user && (
            <Button
              variant="default"
              onClick={() => router.push(`/dashboard/${user.role}`)}
              className="bg-green-600 hover:bg-green-700"
            >
              Go to My Dashboard ({user.role})
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}