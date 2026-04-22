import { describe, it, expect, vi } from 'vitest';
import { uploadBulkEnrollment, processEnrollmentBatch, getBulkEnrollmentBatches } from '@/lib/actions/enrollment-bulk-actions';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';

const prismaMock = prisma as any;

describe('enrollment-bulk-actions', () => {
  describe('uploadBulkEnrollment', () => {
    it('should parse CSV and create batch for admin', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'admin-1', role: 'admin' } });
      
      const formData = new FormData();
      const csv = 'email,firstName,lastName\ns1@ex.com,S,1';
      const file = new File([csv], 'test.csv', { type: 'text/csv' });
      formData.append('file', file);

      prismaMock.user.findMany.mockResolvedValue([]);
      prismaMock.bulkEnrollmentBatch.create.mockResolvedValue({ batch_id: 'b1' });
      prismaMock.bulkEnrollmentRecord.createMany.mockResolvedValue({});

      const result = await uploadBulkEnrollment(formData);

      expect(result.success).toBe(true);
      expect(prismaMock.bulkEnrollmentBatch.create).toHaveBeenCalled();
      expect(prismaMock.bulkEnrollmentRecord.createMany).toHaveBeenCalled();
    });
  });

  describe('processEnrollmentBatch', () => {
    it('should create users and profiles for batch records', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'admin-1', role: 'admin' } });
      prismaMock.bulkEnrollmentBatch.findUnique.mockResolvedValue({
        batch_id: 'b1',
        status: 'READY',
        records: [{ record_id: 'r1', email: 's1@ex.com', firstName: 'S', lastName: '1', status: 'READY' }]
      });
      prismaMock.bulkEnrollmentBatch.update.mockResolvedValue({});
      prismaMock.$transaction.mockImplementation(async (callback: any) => callback(prismaMock));
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({ user_id: 'u1' });
      prismaMock.degreeProgram.findFirst.mockResolvedValue({ program_id: 'p1' });
      prismaMock.student.create.mockResolvedValue({});
      prismaMock.registrationToken.create.mockResolvedValue({});
      prismaMock.bulkEnrollmentRecord.update.mockResolvedValue({});

      const result = await processEnrollmentBatch('b1');

      expect(result.success).toBe(true);
      expect(result.successCount).toBe(1);
    });
  });

  describe('getBulkEnrollmentBatches', () => {
    it('should return list of batches', async () => {
      prismaMock.bulkEnrollmentBatch.findMany.mockResolvedValue([{ batch_id: 'b1' }]);
      const result = await getBulkEnrollmentBatches();
      expect(result).toHaveLength(1);
    });
  });
});
