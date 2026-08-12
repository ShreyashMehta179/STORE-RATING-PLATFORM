import { Router } from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
  exportUsersCSV,
} from '../controllers/user.controller';
import { authenticateUser, authorizeRole } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticateUser);

// CSV Export (Admin only)
router.get('/export/csv', authorizeRole(Role.ADMIN), exportUsersCSV);

// Admin User Management
router.get('/', authorizeRole(Role.ADMIN), getUsers);
router.post('/', authorizeRole(Role.ADMIN), createUser);
router.get('/:id', authorizeRole(Role.ADMIN), getUserById);
router.put('/:id', authorizeRole(Role.ADMIN), updateUser);
router.patch('/:id/status', authorizeRole(Role.ADMIN), toggleUserStatus);
router.delete('/:id', authorizeRole(Role.ADMIN), deleteUser);

export default router;
