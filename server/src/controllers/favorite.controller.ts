import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../types';

export const toggleFavorite = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { storeId } = req.params;

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_storeId: {
          userId: req.user.userId,
          storeId,
        },
      },
    });

    if (existingFavorite) {
      await prisma.favorite.delete({
        where: { id: existingFavorite.id },
      });

      return res.status(200).json({
        success: true,
        isFavorite: false,
        message: 'Removed from favorites',
      });
    } else {
      await prisma.favorite.create({
        data: {
          userId: req.user.userId,
          storeId,
        },
      });

      return res.status(201).json({
        success: true,
        isFavorite: true,
        message: 'Added to favorites',
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getFavorites = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId: req.user.userId },
        include: {
          store: {
            include: {
              ratings: { select: { rating: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.favorite.count({ where: { userId: req.user.userId } }),
    ]);

    const mappedStores = favorites.map((fav) => {
      const totalRatings = fav.store.ratings.length;
      const avgRating =
        totalRatings > 0
          ? fav.store.ratings.reduce((acc, curr) => acc + curr.rating, 0) / totalRatings
          : 0;

      return {
        id: fav.store.id,
        name: fav.store.name,
        category: fav.store.category,
        address: fav.store.address,
        description: fav.store.description,
        imageUrl: fav.store.imageUrl,
        ratingAvg: parseFloat(avgRating.toFixed(1)),
        ratingCount: totalRatings,
        isFavorite: true,
        favoritedAt: fav.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        stores: mappedStores,
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
