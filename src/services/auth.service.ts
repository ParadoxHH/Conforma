import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';
import prismaClient from '../lib/prisma';

export const register = async (data: any, prisma: PrismaClient = prismaClient, argon: typeof argon2 = argon2) => {
  const { email, password, role } = data;
  const hashedPassword = await argon.hash(password);
  
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role,
    },
  });

  return user;
};

export const login = async (data: any, prisma: PrismaClient = prismaClient, argon: typeof argon2 = argon2, jsonwebtoken: typeof jwt = jwt) => {
  const { email, password } = data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isPasswordValid = await argon.verify(user.password, password);

  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  const token = jsonwebtoken.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, {
    expiresIn: '1d',
  });

  return { user, token };
};
