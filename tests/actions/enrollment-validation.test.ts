import { describe, it, expect, vi } from 'vitest';
import { validateEnrollmentCSV } from '@/lib/actions/enrollment-validation';
import { prisma } from '@/lib/db';

const prismaMock = prisma as any;

describe('enrollment-validation', () => {
  it('should validate CSV records and detect duplicates/invalid fields', async () => {
    const csv = 'email,firstName,lastName\ns1@ex.com,John,Doe\ninvalid-email,J,D\ns1@ex.com,Duplicate,Row';
    
    // DB duplicate check: s1@ex.com exists
    prismaMock.user.findMany.mockResolvedValue([{ email: 's1@ex.com' }]);

    const result = await validateEnrollmentCSV(csv);

    expect(result.summary.total).toBe(3);
    // Row 1: Duplicate (in DB)
    expect(result.records[0].status).toBe('DUPLICATE');
    // Row 2: Invalid (email format + first name too short)
    expect(result.records[1].status).toBe('INVALID');
    // Row 3: Invalid (duplicate in CSV)
    expect(result.records[2].status).toBe('INVALID');
    expect(result.records[2].message).toBe('Duplicate in CSV');
  });

  it('should infer student IDs from email', async () => {
    const csv = 'email,firstName,lastName\nsmith22053@ex.com,John,Doe';
    prismaMock.user.findMany.mockResolvedValue([]);

    const result = await validateEnrollmentCSV(csv, 'MIT');

    expect(result.records[0].studentId).toBe('MIT/2022/053');
  });
});
