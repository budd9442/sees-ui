import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  getSelectionRounds, 
  getSelectionRoundDetail, 
  createSelectionRound, 
  updateRoundStatus,
  submitSelectionApplication,
  submitAllocationChangeRequest,
  promoteAllWaitlistToFreeSlots,
  rejectApplication
} from '@/lib/actions/selection-actions';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { assertStudentWriteAccess } from '@/lib/actions/student-access';

vi.mock('@/auth');
vi.mock('@/lib/actions/student-access', () => ({
  assertStudentWriteAccess: vi.fn().mockResolvedValue(undefined),
}));

const prismaMock = prisma as any;

describe('selection-actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSelectionRounds', () => {
    it('should return rounds for hod', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'hod-1', role: 'hod' } });
      prismaMock.selectionRound.findMany.mockResolvedValue([{
        round_id: 'r1',
        label: 'Pathway Round',
        configs: [],
        _count: { applications: 0 }
      }]);

      const result = await getSelectionRounds();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('getSelectionRoundDetail', () => {
    it('should return enriched round data', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'hod-1', role: 'hod' } });
      prismaMock.selectionRound.findUnique.mockResolvedValue({
        round_id: 'r1',
        configs: [],
        applications: [{ student_id: 's1', status: 'PENDING' }]
      });
      prismaMock.user.findMany.mockResolvedValue([{
        user_id: 's1',
        firstName: 'S',
        lastName: '1',
        student: { current_gpa: 3.5, current_level: 'L1', degree_path: { code: 'MIT' } }
      }]);

      const result = await getSelectionRoundDetail('r1');

      expect(result.success).toBe(true);
      expect(result!.data!.applications[0].student).toBeDefined();
    });
  });

  describe('createSelectionRound', () => {
    it('should create round and log audit', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'hod-1', role: 'hod' } });
      prismaMock.degreeProgram.findFirst.mockResolvedValue({ program_id: 'p1' });
      prismaMock.selectionRound.create.mockResolvedValue({ round_id: 'new-r' });
      prismaMock.auditLog.create.mockResolvedValue({});

      const result = await createSelectionRound({
        academic_year_id: 'y1',
        type: 'PATHWAY',
        label: 'New Round',
        level: 'L1',
        selection_mode: 'GPA',
        configs: [{ program_id: 'p1', capacity: 60 }]
      });

      expect(result.success).toBe(true);
      expect(prismaMock.selectionRound.create).toHaveBeenCalled();
    });
  });

  describe('updateRoundStatus', () => {
    it('should update status and trigger notifications if opening', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'hod-1', role: 'hod' } });
      prismaMock.selectionRound.findUnique.mockResolvedValue({ status: 'DRAFT', closes_at: new Date(Date.now() + 10000) });
      prismaMock.selectionRound.update.mockResolvedValue({});
      prismaMock.auditLog.create.mockResolvedValue({});

      const result = await updateRoundStatus('r1', 'OPEN');

      expect(result.success).toBe(true);
      expect(prismaMock.selectionRound.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ status: 'OPEN' })
      }));
    });
  });

  describe('submitSelectionApplication', () => {
    it('should submit application successfully', async () => {
      (auth as any).mockResolvedValue({ user: { id: 's1', role: 'student' } });
      prismaMock.selectionRound.findUnique.mockResolvedValue({
        round_id: 'r1',
        status: 'OPEN',
        type: 'SPECIALIZATION',
        opens_at: new Date(Date.now() - 1000),
        closes_at: new Date(Date.now() + 10000),
        configs: [{ spec_id: 'spec1' }],
        level: 'L2'
      });
      prismaMock.student.findUnique.mockResolvedValue({
        student_id: 's1',
        current_gpa: 3.8,
        current_level: 'L2',
        degree_path: { program_id: 'p1' }
      });
      prismaMock.selectionApplication.upsert.mockResolvedValue({ app_id: 'app1' });

      const result = await submitSelectionApplication({
        round_id: 'r1',
        preference_1: 'spec1'
      });

      expect(result.success).toBe(true);
      expect(prismaMock.selectionApplication.upsert).toHaveBeenCalled();
    });

    it('should fail if level mismatches', async () => {
      (auth as any).mockResolvedValue({ user: { id: 's1', role: 'student' } });
      prismaMock.selectionRound.findUnique.mockResolvedValue({
        round_id: 'r1',
        status: 'OPEN',
        opens_at: new Date(Date.now() - 1000),
        closes_at: new Date(Date.now() + 10000),
        configs: [{ program_id: 'p1' }],
        level: 'L1'
      });
      prismaMock.student.findUnique.mockResolvedValue({
        student_id: 's1',
        current_level: 'L2'
      });

      const result = await submitSelectionApplication({
        round_id: 'r1',
        preference_1: 'p1'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('level mismatch');
    });
  });

  describe('submitAllocationChangeRequest', () => {
    it('should fail if grace period ended', async () => {
      (auth as any).mockResolvedValue({ user: { id: 's1', role: 'student' } });
      const approvedAt = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
      prismaMock.selectionRound.findUnique.mockResolvedValue({
        round_id: 'r1',
        status: 'APPROVED',
        approved_at: approvedAt,
        allocation_change_grace_days: 7,
        configs: []
      });

      const result = await submitAllocationChangeRequest({
        round_id: 'r1',
        requested_preference_1: 'p2'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('period has ended');
    });
  });

  describe('promoteAllWaitlistToFreeSlots', () => {
    it('should promote students within capacity', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'hod-1', role: 'hod' } });
      prismaMock.selectionRound.findUnique.mockResolvedValue({
        round_id: 'r1',
        status: 'CLOSED',
        configs: [{ program_id: 'p1', capacity: 10 }],
        applications: [
          { status: 'ALLOCATED', allocated_to: 'p1' }, // 1 allocated
          { app_id: 'a1', student_id: 's1', status: 'WAITLISTED', preference_1: 'p1' }
        ]
      });
      prismaMock.$transaction.mockImplementation(async (cb: any) => cb(prismaMock));

      const result = await promoteAllWaitlistToFreeSlots('r1');

      expect(result.success).toBe(true);
      expect(result.moved).toBe(1);
    });
  });

  describe('rejectApplication', () => {
    it('should fail if round is not closed', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'hod-1', role: 'hod' } });
      prismaMock.selectionApplication.findUnique.mockResolvedValue({
        app_id: 'app1',
        round: { status: 'OPEN' }
      });

      const result = await rejectApplication('app1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('round is closed');
    });
  });
});
