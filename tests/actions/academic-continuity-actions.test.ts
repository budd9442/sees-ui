import { describe, it, expect, vi } from 'vitest';
import { cloneAcademicYearData } from '@/lib/actions/academic-continuity-actions';
import { prisma } from '@/lib/db';

const prismaMock = prisma as any;

describe('academic-continuity-actions', () => {
  it('should clone year data and return stats', async () => {
    prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock));
    
    // Mocking the many findMany calls
    prismaMock.academicCreditRule.findMany.mockResolvedValue([{ level: 'L1', semester_number: 1, min_credits: 12, max_credits: 30 }]);
    prismaMock.gradingScheme.findMany.mockResolvedValue([]);
    prismaMock.degreeProgram.findMany.mockResolvedValue([{ program_id: 'p1', code: 'CS', name: 'CS' }]);
    prismaMock.specialization.findMany.mockResolvedValue([]);
    prismaMock.module.findMany.mockResolvedValue([{ module_id: 'm1', code: 'CS101' }]);
    prismaMock.programStructure.findMany.mockResolvedValue([]);
    prismaMock.staffAssignment.findMany.mockResolvedValue([]);

    // Mocking creates
    prismaMock.academicCreditRule.create.mockResolvedValue({});
    prismaMock.degreeProgram.create.mockResolvedValue({ program_id: 'p1-new' });
    prismaMock.module.findUnique.mockResolvedValue(null);
    prismaMock.module.create.mockResolvedValue({ module_id: 'm1-new' });

    const result = await cloneAcademicYearData('y1', 'y2', { modules: true, staff: true });

    expect(result!.success).toBe(true);
    expect(result!.data!.creditsCloned).toBe(1);
    expect(result!.data!.programsCloned).toBe(1);
    expect(result!.data!.modulesCloned).toBe(1);
  });
});
