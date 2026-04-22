import { describe, it, expect, vi } from 'vitest';
import { getAIGuidance } from '@/lib/actions/ai-actions';
import { auth } from '@/auth';
import { AIService } from '@/lib/services/ai-service';

// Mock AIService
vi.mock('@/lib/services/ai-service', () => ({
  AIService: {
    generatePathwayAdvice: vi.fn(),
  },
}));

describe('ai-actions', () => {
  describe('getAIGuidance', () => {
    it('should return advice for authenticated student', async () => {
      (auth as any).mockResolvedValue({ user: { id: 'student-1' } });
      const mockAdvice = { advice: 'Follow CS' };
      (AIService.generatePathwayAdvice as any).mockResolvedValue(mockAdvice);

      const result = await getAIGuidance();

      expect(result).toBe(mockAdvice);
      expect(AIService.generatePathwayAdvice).toHaveBeenCalledWith('student-1');
    });

    it('should throw Unauthorized if no session', async () => {
      (auth as any).mockResolvedValue(null);
      await expect(getAIGuidance()).rejects.toThrow('Unauthorized');
    });
  });
});
