'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';

export default function DashboardContent({
  children,
  featureFlags,
}: {
  children: React.ReactNode;
  featureFlags?: Record<string, boolean>;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  // Client-side auth check is redundant as middleware handles protection
  // and creates a race condition with server session
  /*
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  */

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar featureFlags={featureFlags} />
      <main className="pl-72 pt-16">
        <div className="container mx-auto p-8 lg:p-10">{children}</div>
      </main>
    </div>
  );
}
