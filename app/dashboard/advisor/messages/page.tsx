import { Suspense } from 'react';
import { getAdvisorMessagesData } from '@/lib/actions/advisor-subactions';
import MessagesClient from './_components/messages-client';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdvisorMessagesPage() {
  const session = await auth();
  if (!session?.user?.id || !['staff', 'advisor', 'hod'].includes(session.user.role)) {
    redirect('/login');
  }

  const data = await getAdvisorMessagesData();

  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <MessagesClient initialData={data} currentUserId={session.user.id} currentUserName={session.user.name || 'Advisor'} />
    </Suspense>
  );
}
