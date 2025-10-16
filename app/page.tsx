'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // Check authentication status
    if (!isAuthenticated || !user) {
      // Not authenticated, redirect to login
      router.replace('/login');
    } else if (user && user.role) {
      // Authenticated with valid role, redirect to appropriate dashboard
      const dashboardPath = `/dashboard/${user.role}`;
      router.replace(dashboardPath);
    }
  }, [isAuthenticated, user, router]);

  // Show loading spinner while checking auth
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
