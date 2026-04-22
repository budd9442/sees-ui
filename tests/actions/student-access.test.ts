import { describe, it, expect, vi } from 'vitest';
import { assertStudentWriteAccess } from '@/lib/actions/student-access';
import { prisma } from '@/lib/db';

const prismaMock = prisma as any;

describe('student-access', () => {
  it('should allow access for active student', async () => {
    prismaMock.student.findUnique.mockResolvedValue({ current_level: 'L1', graduation_status: 'ENROLLED' });
    await expect(assertStudentWriteAccess('s1')).resolves.not.toThrow();
  });

  it('should throw error for graduated student', async () => {
    prismaMock.student.findUnique.mockResolvedValue({ current_level: 'GRADUATED', graduation_status: 'GRADUATED' });
    await expect(assertStudentWriteAccess('s1')).rejects.toThrow('read-only');
  });

  it('should throw error if student not found', async () => {
    prismaMock.student.findUnique.mockResolvedValue(null);
    await expect(assertStudentWriteAccess('s1')).rejects.toThrow('not found');
  });
});
