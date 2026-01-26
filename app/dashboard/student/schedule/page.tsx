import { Suspense } from 'react';
import { getStudentSchedule } from '@/lib/actions/student-actions';
import { ScheduleView } from './schedule-view';
import { Loader2 } from 'lucide-react';

export default async function SchedulePage() {
  const academicSchedule = await getStudentSchedule();

  return (
    <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
      <ScheduleView academicSchedule={academicSchedule} />
    </Suspense>
  );
}