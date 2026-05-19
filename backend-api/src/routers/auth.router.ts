import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { asyncHandler } from '../middlewares/async-handler';
import { authMiddleware, optionalAuthMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/signup', asyncHandler(authController.signup));
router.post('/login', asyncHandler(authController.login));
router.post('/logout', asyncHandler(authController.logout));
router.get('/me', optionalAuthMiddleware, asyncHandler(authController.me));

export default router;
