import { Router } from 'express';
import { eventsController } from '../controllers/events.controller';
import { asyncHandler } from '../middlewares/async-handler';
import { authMiddleware } from '../middlewares/auth.middleware';
import { rbac } from '../middlewares/rbac.middleware';

const router = Router();

router.get('/', asyncHandler(eventsController.getAll));
router.get('/:id', asyncHandler(eventsController.getById));
router.post('/', authMiddleware, rbac(['admin']), asyncHandler(eventsController.create));
router.patch('/:id', authMiddleware, rbac(['admin']), asyncHandler(eventsController.update));
router.delete('/:id', authMiddleware, rbac(['admin']), asyncHandler(eventsController.delete));

export default router;
