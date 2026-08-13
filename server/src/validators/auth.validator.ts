import { z } from 'zod';
import { Role } from '@prisma/client';

export const registerSchema = z.object({
  name: z
    .string()
    .min(20, 'Name must be at least 20 characters long')
    .max(60, 'Name must not exceed 60 characters'),
  email: z.string().email('Invalid email address format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(16, 'Password must not exceed 16 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
  address: z
    .string()
    .min(5, 'Address must be at least 5 characters long')
    .max(400, 'Address must not exceed 400 characters'),
  role: z.nativeEnum(Role).optional().default(Role.USER),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(16, 'Password must not exceed 16 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
});

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(20, 'Name must be at least 20 characters long')
    .max(60, 'Name must not exceed 60 characters')
    .optional(),
  address: z
    .string()
    .min(5, 'Address must be at least 5 characters long')
    .max(400, 'Address must not exceed 400 characters')
    .optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address format'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(16, 'Password must not exceed 16 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
});

