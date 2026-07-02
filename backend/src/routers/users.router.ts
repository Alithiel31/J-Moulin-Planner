import { Router } from 'express';
import { usersController } from '../controllers/users.controller';
import { asyncHandler } from '../middlewares/async-handler';
import { authMiddleware } from '../middlewares/auth.middleware';
import { rbac } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', asyncHandler(usersController.getAll));
router.get('/:id', asyncHandler(usersController.getById));
router.patch('/:id', rbac(['admin']), asyncHandler(usersController.update));
router.delete('/:id', rbac(['admin']), asyncHandler(usersController.delete));

export default router;
