import { Router } from 'express';
import {
  createRating,
  updateRating,
  deleteRating,
  getUserRatings,
  getAllRatings,
  exportRatingsCSV,
} from '../controllers/rating.controller';
import { authenticateUser, authorizeRole } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticateUser);

// Ratings submission & management for logged in users
router.post('/', createRating);
router.get('/user', getUserRatings);
router.put('/:id', updateRating);
router.delete('/:id', deleteRating);

// Admin ratings management & CSV export
router.get('/', authorizeRole(Role.ADMIN), getAllRatings);
router.get('/export/csv', authorizeRole(Role.ADMIN), exportRatingsCSV);

export default router;
