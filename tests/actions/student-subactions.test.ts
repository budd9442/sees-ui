import { describe, it, expect, vi } from 'vitest';
import { getCreditsData, getGoals, createGoal, getPathwayData } from '@/lib/actions/student-subactions';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { AcademicEngine } from '@/lib/services/academic-engine';

const prismaMock = prisma as any;

// Mock AcademicEngine
vi.mock('@/lib/services/academic-engine', () => ({
  AcademicEngine: {
    calculateStudentGPA: vi.fn(),
  },
}));

describe('student-subactions', () => {
  describe('getCreditsData', () => {
    it('should return progress and thresholds', async () => {
      (auth as any).mockResolvedValue({ user: { id: 's1' } });
      prismaMock.student.findUnique.mockResolvedValue({
        student_id: 's1',
        current_level: 'L1',
        degree_path_id: 'p1',
        degree_path: { 
            graduation_eligibility_profile: null 
        },
        grades: [{
          grade_id: 'g1',
          module_id: 'm1',
          module: { code: 'CS101', name: 'Intro', credits: 3 },
          semester: { label: 'Sem 1' },
          released_at: new Date()
        }]
      });
      prismaMock.grade.findMany.mockResolvedValue([]);
      prismaMock.programStructure.findMany.mockResolvedValue([]);
      prismaMock.academicCreditRule.findMany.mockResolvedValue([]);
      prismaMock.systemSetting.findMany.mockResolvedValue([{ key: 'graduation_required_credits', value: '132' }]);
      prismaMock.gradingScheme.findFirst.mockResolvedValue({ bands: [] });

      const result = await getCreditsData();

      expect(result.studentGrades).toHaveLength(1);
      expect(result.graduationRequiredCredits).toBe(132);
    });
  });

  describe('Goals', () => {
    it('should return student goals', async () => {
      (auth as any).mockResolvedValue({ user: { id: 's1' } });
      prismaMock.academicGoal.findMany.mockResolvedValue([{ goal_id: 'goal1', title: 'Goal' }]);

      const result = await getGoals();

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Goal');
    });

    it('should create a new goal', async () => {
      (auth as any).mockResolvedValue({ user: { id: 's1' } });
      prismaMock.student.findUnique.mockResolvedValue({ student_id: 's1', current_level: 'L1' });
      prismaMock.academicGoal.count.mockResolvedValue(0);
      (AcademicEngine.calculateStudentGPA as any).mockResolvedValue({ gpa: 3.0, totalCredits: 60 });
      prismaMock.academicGoal.create.mockResolvedValue({ goal_id: 'new-goal' });

      const result = await createGoal({
        title: 'Target GPA',
        goalType: 'GPA_TARGET',
        targetValue: 3.8
      });

      expect(result.goal_id).toBe('new-goal');
      expect(prismaMock.academicGoal.create).toHaveBeenCalled();
    });
  });

  describe('getPathwayData', () => {
    it('should return pathway demand and rank', async () => {
      (auth as any).mockResolvedValue({ user: { id: 's1' } });
      prismaMock.student.findUnique.mockResolvedValue({
        student_id: 's1',
        current_gpa: 3.5,
        degree_path: { code: 'CS' }
      });
      prismaMock.student.count.mockResolvedValue(10); // used for demand and rank
      prismaMock.degreeProgram.findFirst.mockResolvedValue({ program_id: 'p1' });
      prismaMock.programIntake.findFirst.mockResolvedValue({ max_students: 60 });

      const result = await getPathwayData();

      expect(result.currentStudent.degreeProgram).toBe('CS');
      expect(result.studentRank).toBe(11);
    });
  });
});
