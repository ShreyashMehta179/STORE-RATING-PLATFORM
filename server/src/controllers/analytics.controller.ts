import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../types';
import { Role } from '@prisma/client';

export const getAdminAnalytics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const range = (req.query.range as string) || '30d';

    let startDate = new Date(0);
    const now = new Date();

    if (range === '7d') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === '30d') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (range === '90d') {
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    } else if (range === '1y') {
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    }

    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // KPI Aggregations
    const [
      totalUsers,
      totalStores,
      totalStoreOwners,
      totalRatings,
      activeUsers,
      activeStores,
      ratingsThisMonth,
      allRatings,
      usersByRole,
      storesWithRatings,
    ] = await Promise.all([
      prisma.user.count({ where: { role: Role.USER } }),
      prisma.store.count(),
      prisma.user.count({ where: { role: Role.STORE_OWNER } }),
      prisma.rating.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.store.count({ where: { isActive: true } }),
      prisma.rating.count({ where: { createdAt: { gte: firstDayOfMonth } } }),
      prisma.rating.findMany({
        where: { createdAt: { gte: startDate } },
        select: { rating: true, createdAt: true },
      }),
      prisma.user.groupBy({
        by: ['role'],
        _count: { _all: true },
      }),
      prisma.store.findMany({
        include: {
          ratings: { select: { rating: true } },
        },
      }),
    ]);

    // Calculate Platform Average Rating
    const platformAvgRating =
      allRatings.length > 0
        ? (allRatings.reduce((acc, r) => acc + r.rating, 0) / allRatings.length).toFixed(1)
        : '0.0';

    // Rating Distribution (1-5 stars)
    const ratingDistribution = [
      { name: '5 Stars', stars: 5, count: 0 },
      { name: '4 Stars', stars: 4, count: 0 },
      { name: '3 Stars', stars: 3, count: 0 },
      { name: '2 Stars', stars: 2, count: 0 },
      { name: '1 Star', stars: 1, count: 0 },
    ];

    allRatings.forEach((r) => {
      const idx = 5 - r.rating;
      if (ratingDistribution[idx]) {
        ratingDistribution[idx].count++;
      }
    });

    // Rating Trends Over Time
    const trendMap: { [key: string]: { count: number; sum: number } } = {};
    allRatings.forEach((r) => {
      const dateKey = r.createdAt.toISOString().split('T')[0];
      if (!trendMap[dateKey]) {
        trendMap[dateKey] = { count: 0, sum: 0 };
      }
      trendMap[dateKey].count++;
      trendMap[dateKey].sum += r.rating;
    });

    const ratingTrends = Object.keys(trendMap)
      .sort()
      .map((date) => ({
        date,
        ratings: trendMap[date].count,
        average: parseFloat((trendMap[date].sum / trendMap[date].count).toFixed(1)),
      }));

    // Role Distribution
    const roleDistribution = usersByRole.map((item) => ({
      role: item.role,
      name: item.role === 'ADMIN' ? 'Admins' : item.role === 'STORE_OWNER' ? 'Store Owners' : 'Normal Users',
      value: item._count._all,
    }));

    // Top Rated and Most Rated Stores
    const processedStores = storesWithRatings.map((s) => {
      const count = s.ratings.length;
      const avg = count > 0 ? s.ratings.reduce((a, b) => a + b.rating, 0) / count : 0;
      return {
        id: s.id,
        name: s.name,
        category: s.category,
        ratingAvg: parseFloat(avg.toFixed(1)),
        ratingCount: count,
      };
    });

    const topRatedStores = [...processedStores]
      .filter((s) => s.ratingCount >= 2)
      .sort((a, b) => b.ratingAvg - a.ratingAvg)
      .slice(0, 5);

    const mostRatedStores = [...processedStores]
      .sort((a, b) => b.ratingCount - a.ratingCount)
      .slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalStores,
          totalStoreOwners,
          totalRatings,
          platformAvgRating: parseFloat(platformAvgRating),
          activeUsers,
          activeStores,
          ratingsThisMonth,
        },
        ratingDistribution,
        ratingTrends,
        roleDistribution,
        topRatedStores,
        mostRatedStores,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getOwnerAnalytics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const ownedStores = await prisma.store.findMany({
      where: { ownerId: req.user.userId },
      select: { id: true, name: true, category: true },
    });

    if (ownedStores.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          hasStore: false,
          message: 'No stores assigned to this owner yet.',
        },
      });
    }

    const storeIds = ownedStores.map((s) => s.id);
    const primaryStore = ownedStores[0];

    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [allRatings, ratingsThisMonth, ratingsLastMonth] = await Promise.all([
      prisma.rating.findMany({
        where: { storeId: { in: storeIds } },
        include: {
          user: { select: { id: true, name: true, email: true } },
          store: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.rating.findMany({
        where: {
          storeId: { in: storeIds },
          createdAt: { gte: firstDayThisMonth },
        },
      }),
      prisma.rating.findMany({
        where: {
          storeId: { in: storeIds },
          createdAt: { gte: firstDayLastMonth, lt: firstDayThisMonth },
        },
      }),
    ]);

    const totalRatings = allRatings.length;
    const avgRating =
      totalRatings > 0
        ? parseFloat(
            (allRatings.reduce((acc, r) => acc + r.rating, 0) / totalRatings).toFixed(1)
          )
        : 0;

    const fiveStarCount = allRatings.filter((r) => r.rating === 5).length;
    const oneStarCount = allRatings.filter((r) => r.rating === 1).length;

    // Performance Summary % calculation
    const avgThisMonth =
      ratingsThisMonth.length > 0
        ? ratingsThisMonth.reduce((a, b) => a + b.rating, 0) / ratingsThisMonth.length
        : avgRating;

    const avgLastMonth =
      ratingsLastMonth.length > 0
        ? ratingsLastMonth.reduce((a, b) => a + b.rating, 0) / ratingsLastMonth.length
        : avgRating;

    let ratingImprovementPct = 0;
    if (avgLastMonth > 0) {
      ratingImprovementPct = parseFloat(
        (((avgThisMonth - avgLastMonth) / avgLastMonth) * 100).toFixed(1)
      );
    }

    // Rating Distribution Donut
    const ratingDistribution = [
      { name: '5 Stars', stars: 5, value: fiveStarCount, percentage: totalRatings > 0 ? Math.round((fiveStarCount / totalRatings) * 100) : 0 },
      { name: '4 Stars', stars: 4, value: allRatings.filter((r) => r.rating === 4).length, percentage: totalRatings > 0 ? Math.round((allRatings.filter((r) => r.rating === 4).length / totalRatings) * 100) : 0 },
      { name: '3 Stars', stars: 3, value: allRatings.filter((r) => r.rating === 3).length, percentage: totalRatings > 0 ? Math.round((allRatings.filter((r) => r.rating === 3).length / totalRatings) * 100) : 0 },
      { name: '2 Stars', stars: 2, value: allRatings.filter((r) => r.rating === 2).length, percentage: totalRatings > 0 ? Math.round((allRatings.filter((r) => r.rating === 2).length / totalRatings) * 100) : 0 },
      { name: '1 Star', stars: 1, value: oneStarCount, percentage: totalRatings > 0 ? Math.round((oneStarCount / totalRatings) * 100) : 0 },
    ];

    // Ratings by Month (Last 6 Months)
    const monthlyMap: { [key: string]: { count: number; sum: number } } = {};
    allRatings.forEach((r) => {
      const monthName = r.createdAt.toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!monthlyMap[monthName]) {
        monthlyMap[monthName] = { count: 0, sum: 0 };
      }
      monthlyMap[monthName].count++;
      monthlyMap[monthName].sum += r.rating;
    });

    const monthlyTrends = Object.keys(monthlyMap).map((m) => ({
      month: m,
      ratings: monthlyMap[m].count,
      average: parseFloat((monthlyMap[m].sum / monthlyMap[m].count).toFixed(1)),
    }));

    // Customer reviews list
    const customers = allRatings.map((r) => ({
      id: r.id,
      userName: r.user.name,
      userEmail: r.user.email,
      storeName: r.store.name,
      rating: r.rating,
      review: r.review,
      date: r.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: {
        hasStore: true,
        store: primaryStore,
        stats: {
          avgRating,
          totalRatings,
          fiveStarCount,
          oneStarCount,
          ratingsThisMonth: ratingsThisMonth.length,
          ratingImprovementPct,
        },
        ratingDistribution,
        monthlyTrends,
        recentActivity: customers.slice(0, 10),
        customers,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicAnalytics = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const [totalStores, totalRatings, totalUsers, allRatings] = await Promise.all([
      prisma.store.count({ where: { isActive: true } }),
      prisma.rating.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.rating.findMany({ select: { rating: true } }),
    ]);

    const avgRating =
      allRatings.length > 0
        ? allRatings.reduce((acc, r) => acc + r.rating, 0) / allRatings.length
        : 4.8;

    res.status(200).json({
      success: true,
      data: {
        totalStores: totalStores || 12,
        totalRatings: totalRatings || 72,
        totalUsers: totalUsers || 18,
        platformAvgRating: parseFloat(avgRating.toFixed(1)),
      },
    });
  } catch (error) {
    next(error);
  }
};

