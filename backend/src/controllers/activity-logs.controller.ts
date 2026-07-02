import { Request, Response } from 'express';
import { prisma } from '../lib/db';
import { config } from '../config';
import { NotFoundError } from '../lib/errors';
export { logActivity } from '../lib/activity';

export const activityLogsController = {
  getAll: async (req: Request, res: Response) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(
      config.maxPageSize,
      parseInt(req.query.limit as string) || config.defaultPageSize
    );
    const skip = (page - 1) * limit;

    const [logs, total] = await prisma.$transaction([
      prisma.activityLog.findMany({
        include: { user: { select: { id: true, username: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.activityLog.count(),
    ]);

    res.json({
      success: true,
      data: { logs, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } },
    });
  },

  getByTaskId: async (req: Request, res: Response) => {
    const { taskId } = req.params;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(
      config.maxPageSize,
      parseInt(req.query.limit as string) || config.defaultPageSize
    );
    const skip = (page - 1) * limit;

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundError('Task');

    const [logs, total] = await prisma.$transaction([
      prisma.activityLog.findMany({
        where: { taskId },
        include: { user: { select: { id: true, username: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.activityLog.count({ where: { taskId } }),
    ]);

    res.json({
      success: true,
      data: { logs, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } },
    });
  },

  getByTeamId: async (req: Request, res: Response) => {
    const { teamId } = req.params;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(
      config.maxPageSize,
      parseInt(req.query.limit as string) || config.defaultPageSize
    );
    const skip = (page - 1) * limit;

    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new NotFoundError('Team');

    const [logs, total] = await prisma.$transaction([
      prisma.activityLog.findMany({
        where: { teamId },
        include: { user: { select: { id: true, username: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.activityLog.count({ where: { teamId } }),
    ]);

    res.json({
      success: true,
      data: { logs, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } },
    });
  },

  getByUserId: async (req: Request, res: Response) => {
    const { userId } = req.params;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(
      config.maxPageSize,
      parseInt(req.query.limit as string) || config.defaultPageSize
    );
    const skip = (page - 1) * limit;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User');

    const [logs, total] = await prisma.$transaction([
      prisma.activityLog.findMany({
        where: { userId },
        include: { user: { select: { id: true, username: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.activityLog.count({ where: { userId } }),
    ]);

    res.json({
      success: true,
      data: { logs, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } },
    });
  },
};
