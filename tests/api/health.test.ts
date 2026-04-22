import { describe, it, expect, vi } from 'vitest';
import { GET } from '@/app/api/health/route';

describe('health api', () => {
  it('should return healthy status', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('healthy');
    expect(data.timestamp).toBeDefined();
  });
});
