import type { Grade, AcademicClass } from '@/types';

export function calculateGPA(grades: Grade[]): number {
  if (grades.length === 0) return 0;

  const totalPoints = grades.reduce(
    (sum, grade) => sum + grade.points * grade.credits,
    0
  );
  const totalCredits = grades.reduce((sum, grade) => sum + grade.credits, 0);

  return totalCredits > 0 ? totalPoints / totalCredits : 0;
}

export function calculateSemesterGPA(
  grades: Grade[],
  semester: string,
  academicYear: string
): number {
  const semesterGrades = grades.filter(
    (g) => g.semester === semester && g.academicYear === academicYear
  );
  return calculateGPA(semesterGrades);
}

export function getAcademicClass(gpa: number): AcademicClass {
  if (gpa >= 3.7) return 'First Class';
  if (gpa >= 3.3) return 'Second Class Upper';
  if (gpa >= 3.0) return 'Second Class Lower';
  if (gpa >= 2.5) return 'Third Class';
  return 'Pass';
}

export function getLetterGrade(score: number): string {
  if (score >= 85) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 75) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 65) return 'C+';
  if (score >= 60) return 'C';
  if (score >= 55) return 'D+';
  if (score >= 50) return 'D';
  return 'F';
}

export function getGradePoints(score: number): number {
  if (score >= 80) return 4.0;
  if (score >= 75) return 3.5;
  if (score >= 70) return 3.0;
  if (score >= 65) return 2.5;
  if (score >= 60) return 2.0;
  if (score >= 55) return 1.5;
  if (score >= 50) return 1.0;
  return 0;
}

export function getClassColor(academicClass: AcademicClass): string {
  const colors = {
    'First Class': 'bg-green-500',
    'Second Class Upper': 'bg-blue-500',
    'Second Class Lower': 'bg-yellow-500',
    'Third Class': 'bg-orange-500',
    Pass: 'bg-gray-500',
  };
  return colors[academicClass];
}

export function getClassVariant(
  academicClass: AcademicClass
): 'default' | 'destructive' | 'outline' | 'secondary' {
  const variants = {
    'First Class': 'default',
    'Second Class Upper': 'secondary',
    'Second Class Lower': 'outline',
    'Third Class': 'outline',
    Pass: 'outline',
  } as const;
  return variants[academicClass];
}
