import { Router } from 'express';
import { tasksController } from '../controllers/tasks.controller';
import { asyncHandler } from '../middlewares/async-handler';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', asyncHandler(tasksController.getAll));
router.post('/', asyncHandler(tasksController.create));
router.get('/:id', asyncHandler(tasksController.getById));
router.patch('/:id', asyncHandler(tasksController.update));
router.delete('/:id', asyncHandler(tasksController.delete));

export default router;
