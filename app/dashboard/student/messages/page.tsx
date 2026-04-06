import { Suspense } from 'react';
import { getStudentMessages } from '@/lib/actions/student-subactions';
import MessagesClient from './_components/messages-client';
import Loading from '../loading';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const data = await getStudentMessages();

  return (
    <Suspense fallback={<Loading />}>
      <MessagesClient initialMessages={data} currentUserId={session.user.id} />
    </Suspense>
  );
}