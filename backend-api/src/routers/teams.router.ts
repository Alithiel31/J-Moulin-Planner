import { Router } from 'express';
import { teamsController } from '../controllers/teams.controller';
import { asyncHandler } from '../middlewares/async-handler';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', asyncHandler(teamsController.getAll));
router.post('/', asyncHandler(teamsController.create));
router.get('/:id', asyncHandler(teamsController.getById));
router.patch('/:id', asyncHandler(teamsController.update));
router.delete('/:id', asyncHandler(teamsController.delete));

export default router;
