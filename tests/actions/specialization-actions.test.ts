import { describe, it, expect, vi } from 'vitest';
import { submitSpecializationPreferences, getSpecializationGuidance, submitSpecializationSelection } from '@/lib/actions/specialization-actions';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { AIService } from '@/lib/services/ai-service';

const prismaMock = prisma as any;

// Mock AI Service
vi.mock('@/lib/services/ai-service', () => ({
  AIService: {
    generateSpecializationDecision: vi.fn(),
    generateSpecializationGuidanceExplanation: vi.fn(),
  },
}));

describe('specialization-actions', () => {
  describe('submitSpecializationPreferences', () => {
    it('should save preferences for MIT student', async () => {
      (auth as any).mockResolvedValue({ user: { id: 's1' } });
      prismaMock.student.findUnique.mockResolvedValue({
        student_id: 's1',
        current_level: 'L1',
        degree_path: { code: 'MIT' },
        module_registrations: [],
        metadata: {
            specializationPreferences: {
                academicInterests: ['AI'],
                technicalInterests: ['Python'],
                learningGoals: ['Learn'],
                skillDevelopment: ['Coding'],
                reasoning: 'I like it',
                careerAspirations: ['Dev'],
                careerFocus: ['SWE'],
                projectTypes: ['Web'],
                workEnvironment: 'Remote'
            }
        }
      });
      prismaMock.student.update.mockResolvedValue({});

      const input = {
        academicInterests: ['AI', 'Data'],
        careerAspirations: ['Dev', 'Manager'],
        reasoning: 'I like tech and management and want to grow more in this field.'.repeat(5)
      };

      const result = await submitSpecializationPreferences(input);

      expect(result.success).toBe(true);
      expect(prismaMock.student.update).toHaveBeenCalled();
    });
  });

  describe('getSpecializationGuidance', () => {
    it('should return AI-enhanced recommendations', async () => {
      (auth as any).mockResolvedValue({ user: { id: 's1' } });
      prismaMock.student.findUnique.mockResolvedValue({
        student_id: 's1',
        degree_path: { code: 'MIT' },
        current_gpa: 3.5,
        module_registrations: [],
        metadata: {
          specializationPreferences: {
              academicInterests: ['AI', 'Data Science'],
              careerAspirations: ['Developer', 'Architect'],
              reasoning: 'I am interested in information systems and software engineering at scale.'.repeat(2)
          }
        }
      });
      prismaMock.systemSetting.findUnique.mockResolvedValue(null);
      (AIService.generateSpecializationDecision as any).mockResolvedValue({
          recommended_specialization: 'IS',
          confidence: 0.9,
          fit_score: 85,
          reasons: ['Strong tech interest'],
          modelUsed: 'Grok'
      });
      (AIService.generateSpecializationGuidanceExplanation as any).mockResolvedValue({
          reasons: ['Future proof'],
          insight: 'Good fit'
      });

      const result = await getSpecializationGuidance();

      expect(result.isEligible).toBe(true);
      expect(result.recommended_specialization).toBe('IS');
    });
  });

  describe('submitSpecializationSelection', () => {
    it('should update student specialization', async () => {
      (auth as any).mockResolvedValue({ user: { id: 's1' } });
      prismaMock.student.findUnique.mockResolvedValue({ 
          student_id: 's1',
          current_level: 'L1',
          degree_path_id: 'p1' 
      });
      prismaMock.specialization.findFirst.mockResolvedValue({ specialization_id: 'spec1' });
      prismaMock.student.update.mockResolvedValue({});

      const result = await submitSpecializationSelection('IS');

      expect(result.success).toBe(true);
      expect(prismaMock.student.update).toHaveBeenCalledWith(expect.objectContaining({
          data: { specialization_id: 'spec1' }
      }));
    });
  });
});
