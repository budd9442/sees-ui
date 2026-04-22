import { describe, it, expect, vi } from 'vitest';
import { submitPathwayGuidancePreferences, getPathwayGuidance, submitPathwayPreferences, runPathwayAllocation } from '@/lib/actions/pathway-actions';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { AIService } from '@/lib/services/ai-service';

const prismaMock = prisma as any;

// Mock AI Service
vi.mock('@/lib/services/ai-service', () => ({
  AIService: {
    generatePathwayDecision: vi.fn(),
    generatePathwayGuidanceExplanation: vi.fn(),
  },
}));

describe('pathway-actions', () => {
  describe('submitPathwayGuidancePreferences', () => {
    it('should save pathway preferences', async () => {
      (auth as any).mockResolvedValue({ user: { id: 's1' } });
      prismaMock.student.findUnique.mockResolvedValue({ 
          student_id: 's1', 
          current_level: 'L1', 
          metadata: {} 
      });
      prismaMock.student.update.mockResolvedValue({});

      const input = {
        interests: ['Tech', 'Data'],
        strengths: ['Logic', 'Solving'],
        careerGoals: ['Dev', 'Architect'],
        reasoning: 'I want to build software and learn more about technical systems.'.repeat(2)
      };

      const result = await submitPathwayGuidancePreferences(input);

      expect(result.success).toBe(true);
      expect(prismaMock.student.update).toHaveBeenCalled();
    });
  });

  describe('getPathwayGuidance', () => {
    it('should return AI-enhanced recommendations', async () => {
      (auth as any).mockResolvedValue({ user: { id: 's1' } });
      prismaMock.student.findUnique.mockResolvedValue({
        student_id: 's1',
        current_gpa: 3.5,
        module_registrations: [],
        metadata: {
          pathwayPreferences: {
              interests: ['A', 'B'],
              strengths: ['C', 'D'],
              careerGoals: ['E', 'F'],
              reasoning: 'A'.repeat(50)
          }
        }
      });
      (AIService.generatePathwayDecision as any).mockResolvedValue({
          primary_recommendation: 'IT',
          fit_score: 90,
          supporting_reasons: ['Strong technical interest'],
          modelUsed: 'Grok'
      });
      (AIService.generatePathwayGuidanceExplanation as any).mockResolvedValue({
          supporting_reasons: ['Future proof'],
          insight: 'Good fit'
      });

      const result = await getPathwayGuidance();

      expect(result.isEligible).toBe(true);
      expect(result.primary_recommendation).toBe('IT');
    });
  });

  describe('submitPathwayPreferences', () => {
    it('should update student preferences if window is open', async () => {
      (auth as any).mockResolvedValue({ user: { id: 's1' } });
      prismaMock.student.findUnique.mockResolvedValue({ 
          student_id: 's1', 
          current_level: 'L1',
          metadata: {} 
      });
      prismaMock.systemSetting.findUnique.mockResolvedValue({ value: 'true' });
      prismaMock.degreeProgram.findFirst.mockResolvedValueOnce({ program_id: 'p1' }).mockResolvedValueOnce({ program_id: 'p2' });
      prismaMock.student.update.mockResolvedValue({});

      const result = await submitPathwayPreferences({ preference1: 'MIT', preference2: 'IT' });

      expect(result.success).toBe(true);
      expect(prismaMock.student.update).toHaveBeenCalled();
    });
  });

  describe('runPathwayAllocation', () => {
    it('should run greedy allocation in transaction', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'admin-1' } });
      prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock));
      prismaMock.student.findMany.mockResolvedValue([{
          student_id: 's1',
          current_gpa: 4.0,
          pathway_preference_1_id: 'p1',
          pathway_preference_2_id: 'p2'
      }]);
      prismaMock.degreeProgram.findMany.mockResolvedValue([{
          program_id: 'p1',
          code: 'MIT',
          intakes: [{ max_students: 60 }]
      }]);
      prismaMock.student.update.mockResolvedValue({});

      const result = await runPathwayAllocation();

      expect(result.success).toBe(true);
      expect(result.totalProcessed).toBe(1);
    });
  });
});
