import { Suspense } from 'react';
import { getStudentProfile } from '@/lib/actions/student-subactions';
import ProfileClient from './_components/profile-client';
import Loading from '../loading';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const data = await getStudentProfile();

  return (
    <Suspense fallback={<Loading />}>
      <ProfileClient initialProfile={data} />
    </Suspense>
  );
}