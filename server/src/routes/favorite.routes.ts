import { Router } from 'express';
import { toggleFavorite, getFavorites } from '../controllers/favorite.controller';
import { authenticateUser } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateUser);

router.get('/', getFavorites);
router.post('/:storeId', toggleFavorite);

export default router;
