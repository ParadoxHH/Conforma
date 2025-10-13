import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const register = async (data: any) => {
  const { email, password, role } = data;
  const hashedPassword = await argon2.hash(password);
  
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role,
    },
  });

  return user;
};

export const login = async (data: any) => {
  const { email, password } = data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isPasswordValid = await argon2.verify(user.password, password);

  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, {
    expiresIn: '1d',
  });

  return { user, token };
};
