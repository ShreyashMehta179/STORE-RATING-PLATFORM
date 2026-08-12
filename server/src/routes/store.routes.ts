import { Router } from 'express';
import {
  getStores,
  getStoreById,
  createStore,
  updateStore,
  toggleStoreStatus,
  deleteStore,
  exportStoresCSV,
  getCategoryStats,
} from '../controllers/store.controller';
import { authenticateUser, authorizeRole, optionalAuth } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Public / User discovery endpoints with optional authentication parsing
router.get('/', optionalAuth, getStores);
router.get('/categories/stats', getCategoryStats);
router.get('/:id', optionalAuth, getStoreById);

// Admin CSV Export
router.get('/export/csv', authenticateUser, authorizeRole(Role.ADMIN), exportStoresCSV);

// Store Management (Admin & Store Owner)
router.post('/', authenticateUser, authorizeRole(Role.ADMIN), createStore);
router.put('/:id', authenticateUser, authorizeRole(Role.ADMIN, Role.STORE_OWNER), updateStore);
router.patch('/:id/status', authenticateUser, authorizeRole(Role.ADMIN), toggleStoreStatus);
router.delete('/:id', authenticateUser, authorizeRole(Role.ADMIN), deleteStore);

export default router;
