import { describe, it, expect, vi } from 'vitest';
import { getAcademicYears } from '@/lib/actions/academic-years';
import { prisma } from '@/lib/db';

const prismaMock = prisma as any;

describe('academic-years', () => {
  it('should return all years', async () => {
    const mockYears = [{
      academic_year_id: 'y1',
      label: '2024',
      active: true,
      start_date: new Date(),
      end_date: new Date()
    }];
    prismaMock.academicYear.findMany.mockResolvedValue(mockYears);

    const result = await getAcademicYears();

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data![0].label).toBe('2024');
  });

  it('should return error on failure', async () => {
    prismaMock.academicYear.findMany.mockRejectedValue(new Error('fail'));
    const result = await getAcademicYears();
    expect(result.success).toBe(false);
  });
});
