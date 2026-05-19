import { Router } from 'express';
import { commentsController } from '../controllers/comments.controller';
import { asyncHandler } from '../middlewares/async-handler';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/task/:taskId', asyncHandler(commentsController.getByTaskId));
router.post('/', authMiddleware, asyncHandler(commentsController.create));
router.patch('/:id', authMiddleware, asyncHandler(commentsController.update));
router.delete('/:id', authMiddleware, asyncHandler(commentsController.delete));

export default router;
