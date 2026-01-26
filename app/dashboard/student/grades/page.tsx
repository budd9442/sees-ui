import { Suspense } from 'react';
import { getStudentGrades } from '@/lib/actions/student-actions';
import { GradesView } from './grades-view';
import { Loader2 } from 'lucide-react';

export default async function GradesPage() {
  const grades = await getStudentGrades();

  return (
    <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
      <GradesView initialGrades={grades} />
    </Suspense>
  );
}
