import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../types';
import { logActivity } from '../utils/activity';
import { broadcastRatingEvent } from '../utils/socket';
import { ratingSchema, updateRatingSchema } from '../validators/rating.validator';
import { Role } from '@prisma/client';

export const createRating = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const validatedData = ratingSchema.parse(req.body);

    const store = await prisma.store.findUnique({
      where: { id: validatedData.storeId },
    });

    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found.' });
    }

    // Prevent Store Owner self-review
    if (store.ownerId === req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You cannot rate or review your own store.',
      });
    }

    // Check duplicate rating
    const existingRating = await prisma.rating.findUnique({
      where: {
        userId_storeId: {
          userId: req.user.userId,
          storeId: validatedData.storeId,
        },
      },
    });

    if (existingRating) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted a rating for this store. You can update your existing rating.',
        data: { existingRatingId: existingRating.id },
      });
    }

    const ratingObj = await prisma.rating.create({
      data: {
        userId: req.user.userId,
        storeId: validatedData.storeId,
        rating: validatedData.rating,
        review: validatedData.review || null,
      },
      include: {
        store: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // Recalculate store average rating and count in PostgreSQL
    await recalculateStoreRating(validatedData.storeId);

    await logActivity(req.user.userId, 'RATING_SUBMITTED', 'RATING', ratingObj.id, {
      storeId: store.id,
      storeName: store.name,
      rating: ratingObj.rating,
    });

    broadcastRatingEvent('rating.created', {
      ...ratingObj,
      storeId: store.id,
      ownerId: store.ownerId,
    });

    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully!',
      data: ratingObj,
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

const recalculateStoreRating = async (storeId: string) => {
  await prisma.store.update({
    where: { id: storeId },
    data: {
      updatedAt: new Date(),
    },
  });
};

export const updateRating = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.params;
    const validatedData = updateRatingSchema.parse(req.body);

    const existingRating = await prisma.rating.findUnique({
      where: { id },
      include: { store: { select: { id: true, name: true, ownerId: true } } },
    });

    if (!existingRating) {
      return res.status(404).json({ success: false, message: 'Rating not found' });
    }

    // Only owner of rating or admin can update
    if (existingRating.userId !== req.user.userId && req.user.role !== Role.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to modify this rating.',
      });
    }

    const updatedRating = await prisma.rating.update({
      where: { id },
      data: {
        rating: validatedData.rating,
        review: validatedData.review !== undefined ? validatedData.review || null : existingRating.review,
      },
      include: {
        store: { select: { id: true, name: true, ownerId: true } },
      },
    });

    await recalculateStoreRating(existingRating.storeId);

    await logActivity(req.user.userId, 'RATING_UPDATED', 'RATING', id, {
      oldRating: existingRating.rating,
      newRating: updatedRating.rating,
      storeName: existingRating.store.name,
    });

    broadcastRatingEvent('rating.updated', {
      ...updatedRating,
      storeId: existingRating.storeId,
      ownerId: existingRating.store.ownerId,
    });

    res.status(200).json({
      success: true,
      message: 'Rating updated successfully!',
      data: updatedRating,
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

export const deleteRating = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.params;

    const existingRating = await prisma.rating.findUnique({
      where: { id },
      include: { store: { select: { id: true, name: true, ownerId: true } } },
    });

    if (!existingRating) {
      return res.status(404).json({ success: false, message: 'Rating not found' });
    }

    if (existingRating.userId !== req.user.userId && req.user.role !== Role.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this rating.',
      });
    }

    await prisma.rating.delete({ where: { id } });

    await recalculateStoreRating(existingRating.storeId);

    await logActivity(
      req.user.userId,
      req.user.role === Role.ADMIN ? 'ADMIN_DELETED_RATING' : 'USER_DELETED_RATING',
      'RATING',
      id,
      { storeName: existingRating.store.name }
    );

    broadcastRatingEvent('rating.deleted', {
      id,
      storeId: existingRating.storeId,
      ownerId: existingRating.store.ownerId,
    });

    res.status(200).json({
      success: true,
      message: 'Rating deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const getUserRatings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [ratings, total] = await Promise.all([
      prisma.rating.findMany({
        where: { userId: req.user.userId },
        include: {
          store: {
            select: {
              id: true,
              name: true,
              category: true,
              address: true,
              imageUrl: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.rating.count({ where: { userId: req.user.userId } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        ratings,
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

export const getAllRatings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const ratingFilter = parseInt(req.query.rating as string) || 0;
    const storeId = (req.query.storeId as string) || '';
    const userId = (req.query.userId as string) || '';
    const skip = (page - 1) * limit;

    const where: any = {};

    if (ratingFilter > 0) {
      where.rating = ratingFilter;
    }

    if (storeId) {
      where.storeId = storeId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (search) {
      where.OR = [
        { review: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { store: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [ratings, total] = await Promise.all([
      prisma.rating.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          store: { select: { id: true, name: true, category: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.rating.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        ratings,
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

export const exportRatingsCSV = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const ratings = await prisma.rating.findMany({
      include: {
        user: { select: { name: true, email: true } },
        store: { select: { name: true, category: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const header = 'ID,UserName,UserEmail,StoreName,StoreCategory,Rating,Review,CreatedAt\n';
    const rows = ratings
      .map(
        (r) =>
          `"${r.id}","${r.user.name.replace(/"/g, '""')}","${r.user.email}","${r.store.name.replace(
            /"/g,
            '""'
          )}","${r.store.category}",${r.rating},"${(r.review || '').replace(/"/g, '""')}","${r.createdAt.toISOString()}"`
      )
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=storehub-ratings.csv');
    res.status(200).send(header + rows);
  } catch (error) {
    next(error);
  }
};
