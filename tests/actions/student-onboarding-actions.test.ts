import { describe, it, expect, vi } from 'vitest';
import { getOnboardingQuestionsForAdmin, saveOnboardingQuestionsForAdmin, getStudentOnboardingState, submitStudentOnboardingAnswers } from '@/lib/actions/student-onboarding-actions';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';

const prismaMock = prisma as any;

describe('student-onboarding-actions', () => {
  describe('Admin/HOD Actions', () => {
    it('should save onboarding questions for admin', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'admin-1', role: 'admin' } });
      prismaMock.systemSetting.upsert.mockResolvedValue({});
      
      const questions = {
        version: 1,
        questions: [{ key: 'q1', type: 'text', label: 'Question 1', required: true }]
      };

      const result = await saveOnboardingQuestionsForAdmin(questions);

      expect(result.ok).toBe(true);
      expect(prismaMock.systemSetting.upsert).toHaveBeenCalled();
    });

    it('should throw Unauthorized if not admin/hod', async () => {
      (auth as any).mockResolvedValue({ user: { id: 's1', role: 'student' } });
      await expect(getOnboardingQuestionsForAdmin()).rejects.toThrow('Unauthorized');
    });
  });

  describe('Student Actions', () => {
    it('should return student onboarding state', async () => {
      (auth as any).mockResolvedValue({ user: { id: 's1', role: 'student', email: 's1@ex.com' } });
      prismaMock.user.findUnique.mockResolvedValue({ user_id: 's1' });
      prismaMock.student.findUnique.mockResolvedValue({
        student_id: 's1',
        metadata: { q1: 'ans1' },
        onboarding_completed_at: new Date()
      });
      prismaMock.systemSetting.findUnique.mockResolvedValue({ value: JSON.stringify({ version: 1, questions: [] }) });

      const result = await getStudentOnboardingState();

      expect(result.completed).toBe(true);
      expect(result.metadata.q1).toBe('ans1');
    });

    it('should submit answers and update status', async () => {
      (auth as any).mockResolvedValue({ user: { id: 's1', role: 'student', email: 's1@ex.com' } });
      prismaMock.user.findUnique.mockResolvedValue({ user_id: 's1' });
      prismaMock.systemSetting.findUnique.mockResolvedValue({ value: JSON.stringify({
        version: 1,
        questions: [{ key: 'q1', type: 'text', label: 'Q1', required: true }]
      }) });
      prismaMock.student.findUnique.mockResolvedValue({ student_id: 's1', metadata: {} });
      prismaMock.student.update.mockResolvedValue({});

      const result = await submitStudentOnboardingAnswers({ q1: 'Answer' });

      expect(result.ok).toBe(true);
      expect(prismaMock.student.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
            onboarding_completed_at: expect.any(Date)
        })
      }));
    });
  });
});
