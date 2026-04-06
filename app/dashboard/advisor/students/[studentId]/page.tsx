import { Suspense } from 'react';
import { getAdvisorStudentDetails } from '@/lib/actions/advisor-subactions';
import StudentDetailClient from './_components/student-detail-client';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id || !['staff', 'advisor', 'hod'].includes(session.user.role)) {
    redirect('/login');
  }

  const { studentId } = await params;
  let data;
  try {
    data = await getAdvisorStudentDetails(studentId);
  } catch (e) {
    return <div className="p-8 text-center"><p className="text-muted-foreground">Student not found.</p></div>;
  }

  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <StudentDetailClient initialData={data} currentUserId={session.user.id} />
    </Suspense>
  );
}
