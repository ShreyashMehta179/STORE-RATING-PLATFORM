import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../types';
import { logActivity } from '../utils/activity';
import { broadcastStoreEvent } from '../utils/socket';
import { createStoreSchema, updateStoreSchema } from '../validators/store.validator';
import { Role } from '@prisma/client';

export const getStores = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const category = (req.query.category as string) || '';
    const minRating = parseFloat(req.query.minRating as string) || 0;
    const status = (req.query.status as string) || '';
    const ownerId = (req.query.ownerId as string) || '';
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const order = (req.query.order as string) === 'asc' ? 'asc' : 'desc';

    const skip = (page - 1) * limit;

    const where: any = {};

    // For non-admin, non-owner general store discovery, only active stores are shown by default
    if (status) {
      where.isActive = status === 'active';
    } else if (req.user?.role !== Role.ADMIN) {
      where.isActive = true;
    }

    if (ownerId) {
      where.ownerId = ownerId;
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Fetch stores along with ratings aggregate and owner details
    const stores = await prisma.store.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ratings: {
          select: {
            rating: true,
            userId: true,
          },
        },
        favorites: req.user?.userId
          ? {
              where: { userId: req.user.userId },
              select: { id: true },
            }
          : false,
      },
      orderBy: sortBy === 'rating' ? undefined : { [sortBy]: order },
    });

    // Map calculated ratings and user-specific status
    let mappedStores = stores.map((store) => {
      const totalRatings = store.ratings.length;
      const avgRating =
        totalRatings > 0
          ? store.ratings.reduce((acc, curr) => acc + curr.rating, 0) / totalRatings
          : 0;

      const userRatingObj = req.user?.userId
        ? store.ratings.find((r) => r.userId === req.user?.userId)
        : null;

      const isFavorite = Array.isArray(store.favorites) && store.favorites.length > 0;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        ownerId: store.ownerId,
        owner: store.owner,
        description: store.description,
        category: store.category,
        phone: store.phone,
        website: store.website,
        imageUrl: store.imageUrl,
        isActive: store.isActive,
        createdAt: store.createdAt,
        updatedAt: store.updatedAt,
        ratingAvg: parseFloat(avgRating.toFixed(1)),
        ratingCount: totalRatings,
        userRating: userRatingObj ? userRatingObj.rating : null,
        isFavorite,
      };
    });

    // Min rating filter
    if (minRating > 0) {
      mappedStores = mappedStores.filter((s) => s.ratingAvg >= minRating);
    }

    // Custom sorting for rating or rating count
    if (sortBy === 'rating') {
      mappedStores.sort((a, b) =>
        order === 'asc' ? a.ratingAvg - b.ratingAvg : b.ratingAvg - a.ratingAvg
      );
    } else if (sortBy === 'ratingsCount' || sortBy === 'popularity') {
      mappedStores.sort((a, b) =>
        order === 'asc' ? a.ratingCount - b.ratingCount : b.ratingCount - a.ratingCount
      );
    } else if (sortBy === 'name') {
      mappedStores.sort((a, b) =>
        order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      );
    }

    const total = mappedStores.length;
    const paginatedStores = mappedStores.slice(skip, skip + limit);

    // Get unique categories list for frontend filter dropdowns
    const categories = await prisma.store.findMany({
      select: { category: true },
      distinct: ['category'],
    });

    res.status(200).json({
      success: true,
      data: {
        stores: paginatedStores,
        categories: categories.map((c) => c.category),
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

export const getStoreById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,
          },
        },
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        favorites: req.user?.userId
          ? {
              where: { userId: req.user.userId },
              select: { id: true },
            }
          : false,
      },
    });

    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    const totalRatings = store.ratings.length;
    const avgRating =
      totalRatings > 0
        ? store.ratings.reduce((acc, curr) => acc + curr.rating, 0) / totalRatings
        : 0;

    // Rating distribution
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    store.ratings.forEach((r) => {
      if (distribution[r.rating as keyof typeof distribution] !== undefined) {
        distribution[r.rating as keyof typeof distribution]++;
      }
    });

    const userRatingObj = req.user?.userId
      ? store.ratings.find((r) => r.userId === req.user?.userId)
      : null;

    const isFavorite = Array.isArray(store.favorites) && store.favorites.length > 0;

    res.status(200).json({
      success: true,
      data: {
        ...store,
        ratingAvg: parseFloat(avgRating.toFixed(1)),
        ratingCount: totalRatings,
        distribution,
        userRating: userRatingObj ? userRatingObj.rating : null,
        userReview: userRatingObj ? userRatingObj.review : null,
        userRatingId: userRatingObj ? userRatingObj.id : null,
        isFavorite,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createStore = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = createStoreSchema.parse(req.body);

    // Verify owner exists and has STORE_OWNER role or convert if admin
    const owner = await prisma.user.findUnique({
      where: { id: validatedData.ownerId },
    });

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Assigned store owner user not found.',
      });
    }

    // Ensure owner has STORE_OWNER role
    if (owner.role !== Role.STORE_OWNER) {
      await prisma.user.update({
        where: { id: owner.id },
        data: { role: Role.STORE_OWNER },
      });
    }

    const newStore = await prisma.store.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        address: validatedData.address,
        ownerId: validatedData.ownerId,
        description: validatedData.description,
        category: validatedData.category,
        phone: validatedData.phone,
        website: validatedData.website || null,
        imageUrl:
          validatedData.imageUrl ||
          'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop',
        isActive: validatedData.isActive ?? true,
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
    });

    await logActivity(req.user?.userId || null, 'STORE_CREATED', 'STORE', newStore.id, {
      name: newStore.name,
      category: newStore.category,
    });

    broadcastStoreEvent('store.created', newStore);

    res.status(201).json({
      success: true,
      message: 'Store created successfully',
      data: newStore,
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

export const updateStore = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const validatedData = updateStoreSchema.parse(req.body);

    const existingStore = await prisma.store.findUnique({ where: { id } });
    if (!existingStore) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    // Authorization check: Admin or Store Owner who owns this store
    if (
      req.user?.role !== Role.ADMIN &&
      (req.user?.role !== Role.STORE_OWNER || existingStore.ownerId !== req.user?.userId)
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this store.',
      });
    }

    const updatedStore = await prisma.store.update({
      where: { id },
      data: validatedData,
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
    });

    await logActivity(req.user?.userId || null, 'STORE_UPDATED', 'STORE', id, validatedData);

    broadcastStoreEvent('store.updated', updatedStore);

    res.status(200).json({
      success: true,
      message: 'Store updated successfully',
      data: updatedStore,
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

export const toggleStoreStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const store = await prisma.store.findUnique({ where: { id } });
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    const updatedStore = await prisma.store.update({
      where: { id },
      data: { isActive: !store.isActive },
    });

    await logActivity(
      req.user?.userId || null,
      updatedStore.isActive ? 'ADMIN_ACTIVATED_STORE' : 'ADMIN_DEACTIVATED_STORE',
      'STORE',
      id
    );

    broadcastStoreEvent('store.statusChanged', updatedStore);

    res.status(200).json({
      success: true,
      message: `Store ${updatedStore.isActive ? 'activated' : 'deactivated'} successfully`,
      data: updatedStore,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteStore = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const store = await prisma.store.findUnique({ where: { id } });
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found' });
    }

    await prisma.store.delete({ where: { id } });

    await logActivity(req.user?.userId || null, 'ADMIN_DELETED_STORE', 'STORE', id, {
      storeName: store.name,
    });

    broadcastStoreEvent('store.deleted', { id, storeName: store.name });

    res.status(200).json({
      success: true,
      message: 'Store deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const exportStoresCSV = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const stores = await prisma.store.findMany({
      include: {
        owner: { select: { name: true, email: true } },
        ratings: { select: { rating: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const header = 'ID,Name,Email,Address,Category,Owner,OwnerEmail,AvgRating,TotalRatings,Status,CreatedAt\n';
    const rows = stores
      .map((s) => {
        const total = s.ratings.length;
        const avg = total > 0 ? (s.ratings.reduce((acc, curr) => acc + curr.rating, 0) / total).toFixed(1) : '0.0';
        return `"${s.id}","${s.name.replace(/"/g, '""')}","${s.email}","${s.address.replace(/"/g, '""')}","${s.category}","${s.owner.name.replace(/"/g, '""')}","${s.owner.email}",${avg},${total},${s.isActive},"${s.createdAt.toISOString()}"`;
      })
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=storehub-stores.csv');
    res.status(200).send(header + rows);
  } catch (error) {
    next(error);
  }
};

export const getCategoryStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const stores = await prisma.store.findMany({
      where: { isActive: true },
      include: {
        ratings: { select: { rating: true } },
      },
    });

    const categoryMap: Record<string, { storeCount: number; ratings: number[]; reviewCount: number }> = {};

    stores.forEach((store) => {
      const cat = store.category || 'General';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { storeCount: 0, ratings: [], reviewCount: 0 };
      }
      categoryMap[cat].storeCount += 1;
      const storeRatingCount = store.ratings.length;
      categoryMap[cat].reviewCount += storeRatingCount;
      store.ratings.forEach((r) => categoryMap[cat].ratings.push(r.rating));
    });

    const categories = Object.keys(categoryMap).map((cat) => {
      const data = categoryMap[cat];
      const avg =
        data.ratings.length > 0
          ? data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length
          : 4.5;
      return {
        category: cat,
        storeCount: data.storeCount,
        averageRating: parseFloat(avg.toFixed(1)),
        reviewCount: data.reviewCount,
      };
    });

    res.status(200).json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
};

