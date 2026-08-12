import { z } from 'zod';
import { Role } from '@prisma/client';

export const adminCreateUserSchema = z.object({
  name: z
    .string()
    .min(20, 'Name must be between 20 and 60 characters')
    .max(60, 'Name must be between 20 and 60 characters'),
  email: z.string().email('Invalid email address format'),
  password: z
    .string()
    .min(8, 'Password must be between 8 and 16 characters')
    .max(16, 'Password must be between 8 and 16 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
  address: z
    .string()
    .min(5, 'Address must be at least 5 characters')
    .max(400, 'Address must not exceed 400 characters'),
  role: z.nativeEnum(Role),
});

export const adminUpdateUserSchema = z.object({
  name: z
    .string()
    .min(20, 'Name must be between 20 and 60 characters')
    .max(60, 'Name must be between 20 and 60 characters')
    .optional(),
  email: z.string().email('Invalid email address format').optional(),
  address: z
    .string()
    .min(5, 'Address must be at least 5 characters')
    .max(400, 'Address must not exceed 400 characters')
    .optional(),
  role: z.nativeEnum(Role).optional(),
  isActive: z.boolean().optional(),
});
