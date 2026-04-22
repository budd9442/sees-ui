import { vi, beforeEach } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

// Mock Prisma
vi.mock('@/lib/db', () => ({
  prisma: mockDeep<PrismaClient>(),
}));

// Mock Auth
vi.mock('@/auth', () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  handlers: { GET: vi.fn(), POST: vi.fn() },
}));

// Mock Next.js cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock server-only
vi.mock('server-only', () => ({}));

// Reset mocks before each test
beforeEach(() => {
  mockReset(prisma as any);
  (auth as any).mockReset?.();
  (revalidatePath as any).mockReset?.();
});
