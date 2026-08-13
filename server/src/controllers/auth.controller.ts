import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { generateToken } from '../utils/jwt';
import { logActivity } from '../utils/activity';
import { config } from '../config';
import { sendPasswordResetEmail } from '../services/email.service';
import { AuthRequest } from '../types';
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  updateProfileSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validator';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email.toLowerCase().trim() },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email.toLowerCase().trim(),
        password: hashedPassword,
        address: validatedData.address,
        role: validatedData.role || 'USER',
        lastLoginAt: new Date(),
      },
    });

    await logActivity(user.id, 'USER_REGISTERED', 'USER', user.id, {
      email: user.email,
      role: user.role,
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const { password, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors,
      });
    }
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const normalizedEmail = validatedData.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact the administrator.',
      });
    }

    const isPasswordValid = await bcrypt.compare(
      validatedData.password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await logActivity(user.id, 'USER_LOGGED_IN', 'USER', user.id, {
      role: user.role,
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors,
      });
    }
    next(error);
  }
};

export const getCurrentUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        ownedStores: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const validatedData = changePasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isValidCurrent = await bcrypt.compare(
      validatedData.currentPassword,
      user.password
    );

    if (!isValidCurrent) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect current password.',
      });
    }

    const newHashedPassword = await bcrypt.hash(validatedData.newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: newHashedPassword },
    });

    await logActivity(user.id, 'PASSWORD_CHANGED', 'USER', user.id);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully!',
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors,
      });
    }
    next(error);
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const validatedData = updateProfileSchema.parse(req.body);

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: validatedData,
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        updatedAt: true,
      },
    });

    await logActivity(req.user.userId, 'PROFILE_UPDATED', 'USER', req.user.userId);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      data: updatedUser,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors,
      });
    }
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = forgotPasswordSchema.parse(req.body);
    const normalizedEmail = validatedData.email.toLowerCase().trim();

    const genericSuccessMessage =
      'If an account with that email exists, a password reset link has been sent.';

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Do not reveal whether email exists for security
      return res.status(200).json({
        success: true,
        message: genericSuccessMessage,
      });
    }

    // Generate secure random token and hash it
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Invalidate previous unused reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Create new password reset token record
    await prisma.passwordResetToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    const cleanClientUrl = config.clientUrl.replace(/\/+$/, '');
    const resetUrl = `${cleanClientUrl}/reset-password?token=${rawToken}`;

    // Send transactional email asynchronously using Resend
    await sendPasswordResetEmail({
      to: user.email,
      resetUrl,
      userName: user.name,
    });

    await logActivity(user.id, 'PASSWORD_RESET_REQUESTED', 'USER', user.id, {
      email: user.email,
    });

    return res.status(200).json({
      success: true,
      message: genericSuccessMessage,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors,
      });
    }
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = resetPasswordSchema.parse(req.body);
    const tokenHash = crypto
      .createHash('sha256')
      .update(validatedData.token)
      .digest('hex');

    const resetTokenRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    const invalidMessage = 'This password reset link is invalid or has expired.';

    if (!resetTokenRecord) {
      return res.status(400).json({
        success: false,
        message: invalidMessage,
      });
    }

    if (resetTokenRecord.usedAt) {
      return res.status(400).json({
        success: false,
        message: invalidMessage,
      });
    }

    if (new Date() > resetTokenRecord.expiresAt) {
      return res.status(400).json({
        success: false,
        message: invalidMessage,
      });
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Update user password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetTokenRecord.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetTokenRecord.id },
        data: { usedAt: new Date() },
      }),
      prisma.passwordResetToken.deleteMany({
        where: {
          userId: resetTokenRecord.userId,
          id: { not: resetTokenRecord.id },
        },
      }),
    ]);

    await logActivity(
      resetTokenRecord.userId,
      'PASSWORD_RESET',
      'USER',
      resetTokenRecord.userId
    );

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now log in.',
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors,
      });
    }
    next(error);
  }
};

export const logout = async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

