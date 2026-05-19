import { Request, Response } from 'express';
import { prisma } from '../lib/db';
import { NotFoundError } from '../lib/errors';

export const activityLogsController = {
  getAll: async (req: Request, res: Response) => {
    const logs = await prisma.activityLog.findMany({
      include: { user: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to last 100 logs
    });

    res.json({ success: true, data: { logs } });
  },

  getByTaskId: async (req: Request, res: Response) => {
    const { taskId } = req.params;

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundError('Task');

    const logs = await prisma.activityLog.findMany({
      where: { taskId },
      include: { user: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: { logs } });
  },

  getByTeamId: async (req: Request, res: Response) => {
    const { teamId } = req.params;

    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new NotFoundError('Team');

    const logs = await prisma.activityLog.findMany({
      where: { teamId },
      include: { user: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ success: true, data: { logs } });
  },

  getByUserId: async (req: Request, res: Response) => {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User');

    const logs = await prisma.activityLog.findMany({
      where: { userId },
      include: { user: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ success: true, data: { logs } });
  },

  // Helper function to log activity (called internally by other controllers)
  logActivity: async (
    userId: string,
    action: string,
    entityType: 'task' | 'team' | 'comment' | 'attachment' | 'event',
    entityId: string,
    taskId?: string,
    teamId?: string,
  ) => {
    try {
      await prisma.activityLog.create({
        data: {
          userId,
          action,
          entityType,
          entityId,
          taskId,
          teamId,
        },
      });
    } catch (error) {
      // Silently fail on logging errors to not disrupt main operations
      console.error('Failed to log activity:', error);
    }
  },
};
