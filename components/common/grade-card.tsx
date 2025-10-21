'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface GradeCardProps {
  moduleCode: string;
  moduleTitle: string;
  grade: number;
  letterGrade: string;
  credits: number;
  className?: string;
}

export function GradeCard({
  moduleCode,
  moduleTitle,
  grade,
  letterGrade,
  credits,
  className,
}: GradeCardProps) {
  const getGradeColor = (letter: string) => {
    if (letter.startsWith('A')) return 'bg-green-500';
    if (letter.startsWith('B')) return 'bg-blue-500';
    if (letter.startsWith('C')) return 'bg-yellow-500';
    if (letter.startsWith('D')) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <Card className={cn('transition-all hover:shadow-md', className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="space-y-1">
            <p className="font-semibold text-sm text-muted-foreground">
              {moduleCode}
            </p>
            <p className="font-medium">{moduleTitle}</p>
          </div>
          <Badge variant="outline">{credits} credits</Badge>
        </div>

        <div className="flex items-center gap-4">
          <div
            className={cn(
              'flex items-center justify-center w-16 h-16 rounded-lg text-white font-bold text-xl',
              getGradeColor(letterGrade)
            )}
          >
            {letterGrade}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Grade</p>
            <p className="text-lg font-medium">{letterGrade}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
