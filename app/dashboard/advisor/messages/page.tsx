import { Suspense } from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getMyMessages } from '@/lib/actions/message-actions';
import DirectMessagesClient from '@/components/messaging/direct-messages-client';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdvisorMessagesPage() {
  const session = await auth();
  if (!session?.user?.id || !['staff', 'advisor', 'hod'].includes(session.user.role)) {
    redirect('/login');
  }

  const { messages, nextCursor } = await getMyMessages({ limit: 100 });

  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <DirectMessagesClient
        initialMessages={messages}
        initialNextCursor={nextCursor}
        currentUserId={session.user.id}
        currentUserName={session.user.name || 'You'}
        listDescription="Message students and colleagues. New messages appear instantly."
      />
    </Suspense>
  );
}
