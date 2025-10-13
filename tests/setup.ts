import { vi } from 'vitest';
import { mockDeep } from 'vitest-mock-extended';
import prisma from '../src/lib/prisma';

vi.mock('../src/lib/prisma', () => ({
  __esModule: true,
  default: mockDeep<typeof prisma>(),
}));