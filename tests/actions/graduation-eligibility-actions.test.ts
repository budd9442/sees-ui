import { describe, it, expect, vi } from 'vitest';
import { listGraduationProgramsForEditor, upsertGraduationEligibilityProfile, previewGraduationEligibility } from '@/lib/actions/graduation-eligibility-actions';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { evaluateStudentEligibility } from '@/lib/graduation/student-eligibility';

const prismaMock = prisma as any;

// Mock the evaluation engine
vi.mock('@/lib/graduation/student-eligibility', () => ({
  evaluateStudentEligibility: vi.fn(),
}));

describe('graduation-eligibility-actions', () => {
  describe('listGraduationProgramsForEditor', () => {
    it('should return programs with profiles for hod', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'hod-1', role: 'hod' } });
      prismaMock.degreeProgram.findMany.mockResolvedValue([{
        program_id: 'p1',
        code: 'CS',
        name: 'CS',
        graduation_eligibility_profile: { rules: {}, version: 1 }
      }]);

      const result = await listGraduationProgramsForEditor();

      expect(result).toHaveLength(1);
      expect(result[0].hasProfile).toBe(true);
    });
  });

  describe('upsertGraduationEligibilityProfile', () => {
    it('should upsert profile and sync settings', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'hod-1', role: 'hod' } });
      prismaMock.degreeProgram.findUnique.mockResolvedValue({ program_id: 'p1' });
      prismaMock.graduationEligibilityProfile.findUnique.mockResolvedValue({ version: 1 });
      prismaMock.staff.findUnique.mockResolvedValue({ staff_id: 'hod-1' });
      prismaMock.graduationEligibilityProfile.upsert.mockResolvedValue({});
      prismaMock.systemSetting.upsert.mockResolvedValue({});
      
      const rules = {
          version: 1,
          evaluationOrder: ['FIRST_CLASS'],
          divisions: {
              FIRST_CLASS: {
                  label: 'First Class',
                  conditions: [{ type: 'min_gpa', minGpa: 3.7 }]
              }
          }
      };

      const result = await upsertGraduationEligibilityProfile('p1', rules);

      expect(result.ok).toBe(true);
      expect(result.version).toBe(2);
      expect(prismaMock.graduationEligibilityProfile.upsert).toHaveBeenCalled();
    });
  });

  describe('previewGraduationEligibility', () => {
    it('should call evaluation engine for preview', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'hod-1', role: 'hod' } });
      (evaluateStudentEligibility as any).mockResolvedValue({ status: 'ELIGIBLE' });

      const result = await previewGraduationEligibility('s1');

      expect(result.status).toBe('ELIGIBLE');
      expect(evaluateStudentEligibility).toHaveBeenCalledWith('s1');
    });
  });
});
