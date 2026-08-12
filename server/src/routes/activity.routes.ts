import { Router } from 'express';
import { getActivityLogs } from '../controllers/activity.controller';
import { authenticateUser, authorizeRole } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticateUser);

router.get('/', authorizeRole(Role.ADMIN), getActivityLogs);

export default router;
