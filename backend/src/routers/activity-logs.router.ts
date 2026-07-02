import { Router } from 'express';
import { activityLogsController } from '../controllers/activity-logs.controller';
import { asyncHandler } from '../middlewares/async-handler';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', asyncHandler(activityLogsController.getAll));
router.get('/task/:taskId', asyncHandler(activityLogsController.getByTaskId));
router.get('/team/:teamId', asyncHandler(activityLogsController.getByTeamId));
router.get('/user/:userId', asyncHandler(activityLogsController.getByUserId));

export default router;
