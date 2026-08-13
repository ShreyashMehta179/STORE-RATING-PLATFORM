import { Router } from 'express';
import {
  register,
  login,
  logout,
  getCurrentUser,
  changePassword,
  updateProfile,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller';
import { authenticateUser } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/me', authenticateUser, getCurrentUser);
router.put('/password', authenticateUser, changePassword);
router.put('/profile', authenticateUser, updateProfile);

export default router;
