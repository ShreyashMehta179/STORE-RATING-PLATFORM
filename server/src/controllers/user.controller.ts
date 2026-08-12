import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../types';
import { logActivity } from '../utils/activity';
import { adminCreateUserSchema, adminUpdateUserSchema } from '../validators/user.validator';
import { Role } from '@prisma/client';

export const getUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const roleFilter = (req.query.role as string) || '';
    const statusFilter = (req.query.status as string) || '';
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const order = (req.query.order as string) === 'asc' ? 'asc' : 'desc';

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (roleFilter && Object.values(Role).includes(roleFilter as Role)) {
      where.role = roleFilter as Role;
    }

    if (statusFilter) {
      where.isActive = statusFilter === 'active';
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
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
          _count: {
            select: {
              ratings: true,
              ownedStores: true,
            },
          },
        },
        orderBy: { [sortBy]: order },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
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
        ownedStores: true,
        ratings: {
          include: {
            store: { select: { id: true, name: true } },
          },
          take: 10,
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = adminCreateUserSchema.parse(req.body);

    const existing = await prisma.user.findUnique({
      where: { email: validatedData.email.toLowerCase() },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email.toLowerCase(),
        password: hashedPassword,
        address: validatedData.address,
        role: validatedData.role,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    await logActivity(req.user?.userId || null, 'ADMIN_CREATED_USER', 'USER', newUser.id, {
      name: newUser.name,
      role: newUser.role,
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser,
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

export const updateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const validatedData = adminUpdateUserSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: validatedData.email.toLowerCase() },
      });
      if (emailTaken) {
        return res.status(409).json({
          success: false,
          message: 'Email address is already in use.',
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...validatedData,
        ...(validatedData.email && { email: validatedData.email.toLowerCase() }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    await logActivity(req.user?.userId || null, 'ADMIN_UPDATED_USER', 'USER', id, validatedData);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
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

export const toggleUserStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === Role.ADMIN && user.id === req.user?.userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own active admin account.',
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
      },
    });

    await logActivity(
      req.user?.userId || null,
      updatedUser.isActive ? 'ADMIN_ACTIVATED_USER' : 'ADMIN_DEACTIVATED_USER',
      'USER',
      id
    );

    res.status(200).json({
      success: true,
      message: `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.id === req.user?.userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own admin account.',
      });
    }

    await prisma.user.delete({ where: { id } });

    await logActivity(req.user?.userId || null, 'ADMIN_DELETED_USER', 'USER', id, {
      deletedEmail: user.email,
    });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const exportUsersCSV = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const header = 'ID,Name,Email,Address,Role,IsActive,LastLoginAt,CreatedAt\n';
    const rows = users
      .map(
        (u) =>
          `"${u.id}","${u.name.replace(/"/g, '""')}","${u.email}","${u.address.replace(
            /"/g,
            '""'
          )}","${u.role}",${u.isActive},"${u.lastLoginAt ? u.lastLoginAt.toISOString() : ''}","${u.createdAt.toISOString()}"`
      )
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=storehub-users.csv');
    res.status(200).send(header + rows);
  } catch (error) {
    next(error);
  }
};
