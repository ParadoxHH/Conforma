import { Role } from '@prisma/client';

declare global {
  namespace Express {
    interface AuthenticatedUser {
      id: string;
      role: Role;
      email?: string;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
