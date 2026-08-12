import { Router } from 'express';
import { getAdminAnalytics, getOwnerAnalytics, getPublicAnalytics } from '../controllers/analytics.controller';
import { authenticateUser, authorizeRole } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Public analytics
router.get('/public', getPublicAnalytics);

// Authenticated analytics
router.use(authenticateUser);
router.get('/admin', authorizeRole(Role.ADMIN), getAdminAnalytics);
router.get('/owner', authorizeRole(Role.STORE_OWNER), getOwnerAnalytics);

export default router;
