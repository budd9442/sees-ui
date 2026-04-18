import { Suspense } from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getMyMessages } from '@/lib/actions/message-actions';
import DirectMessagesClient from '@/components/messaging/direct-messages-client';
import Loading from '../loading';

export const dynamic = 'force-dynamic';

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ openAdvisorModal?: string }>;
}) {
  const params = await searchParams;
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const initialOpenAdvisorModal = params.openAdvisorModal === '1';
  const { messages, nextCursor } = await getMyMessages({ limit: 100 });

  return (
    <Suspense fallback={<Loading />}>
      <DirectMessagesClient
        initialMessages={messages}
        initialNextCursor={nextCursor}
        currentUserId={session.user.id}
        currentUserName={session.user.name || 'You'}
        listDescription="Message advisors, staff, and other users. New messages appear instantly."
        initialOpenAdvisorModal={initialOpenAdvisorModal}
      />
    </Suspense>
  );
}
