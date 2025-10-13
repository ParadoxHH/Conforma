import { describe, it, expect, vi } from 'vitest';
import * as authService from '../src/services/auth.service';
import { mockDeep } from 'vitest-mock-extended';
import { PrismaClient } from '@prisma/client';

describe('Auth Service', () => {
  it('should register a new user', async () => {
    const userData = { email: 'test@test.com', password: 'password', role: 'HOMEOWNER' };
    const hashedPassword = 'hashedpassword';

    const mockPrisma = mockDeep<PrismaClient>();
    const mockArgon2 = { hash: vi.fn().mockResolvedValue(hashedPassword) };

    mockPrisma.user.create.mockResolvedValue({ ...userData, password: hashedPassword, id: '1' });

    const user = await authService.register(userData, mockPrisma, mockArgon2 as any);

    expect(user).toBeDefined();
    expect(mockArgon2.hash).toHaveBeenCalledWith('password');
    expect(mockPrisma.user.create).toHaveBeenCalled();
  });

  it('should login a user', async () => {
    const credentials = { email: 'test@test.com', password: 'password' };
    const user = { id: '1', email: 'test@test.com', password: 'hashedpassword', role: 'HOMEOWNER' };
    const token = 'testtoken';

    const mockPrisma = mockDeep<PrismaClient>();
    const mockArgon2 = { verify: vi.fn().mockResolvedValue(true) };
    const mockJwt = { sign: vi.fn().mockReturnValue(token) };

    mockPrisma.user.findUnique.mockResolvedValue(user);

    const result = await authService.login(credentials, mockPrisma, mockArgon2 as any, mockJwt as any);

    expect(result.token).toBe(token);
    expect(mockArgon2.verify).toHaveBeenCalledWith('hashedpassword', 'password');
    expect(mockJwt.sign).toHaveBeenCalled();
  });
});