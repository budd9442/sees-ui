import { Suspense } from 'react';
import { getInternshipData } from '@/lib/actions/student-subactions';
import InternshipClient from './_components/internship-client';
import Loading from '../loading';

export const dynamic = 'force-dynamic';

export default async function InternshipPage() {
  const data = await getInternshipData();

  return (
    <Suspense fallback={<Loading />}>
      <InternshipClient initialData={data} />
    </Suspense>
  );
}