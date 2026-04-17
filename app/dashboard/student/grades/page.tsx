import { Suspense } from 'react';
import { getStudentGrades } from '@/lib/actions/student-actions';
import { GradesView } from './grades-view';
import { Loader2 } from 'lucide-react';
import { auth } from '@/auth';
import { AcademicEngine } from '@/lib/services/academic-engine';

export default async function GradesPage() {
  const grades = await getStudentGrades();
  const session = await auth();
  const studentId = session?.user?.id as string | undefined;
  const gpa = studentId ? (await AcademicEngine.calculateStudentGPA(studentId)).gpa : 0;

  return (
    <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
      <GradesView initialGrades={grades} initialOverallGpa={gpa} />
    </Suspense>
  );
}
