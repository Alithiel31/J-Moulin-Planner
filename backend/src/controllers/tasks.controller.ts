import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { config } from '../config';
import { NotFoundError, ValidationError, AuthorizationError } from '../lib/errors';
import { logActivity } from '../lib/activity';

// Accept both full ISO datetime ("2026-05-22T00:00:00Z") and date-only ("2026-05-22")
const isoDatetime = z
  .string()
  .transform((val) => (/^\d{4}-\d{2}-\d{2}$/.test(val) ? `${val}T00:00:00.000Z` : val));

const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.string().default('Autre'),
  startDate: isoDatetime.optional(),
  deadline: isoDatetime,
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  teamId: z.string().optional(),
  assignees: z.array(z.string()).optional(),
});

const updateTaskSchema = createTaskSchema.partial();

export const tasksController = {
  getAll: async (req: Request, res: Response) => {
    if (!req.user) throw new AuthorizationError();

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(
      config.maxPageSize,
      parseInt(req.query.limit as string) || config.defaultPageSize
    );
    const skip = (page - 1) * limit;

    const where =
      req.user.role === 'admin'
        ? {}
        : req.user.role === 'teamlead'
          ? { team: { leadId: req.user.userId } }
          : { assignees: { some: { userId: req.user.userId } } };

    const [tasks, total] = await prisma.$transaction([
      prisma.task.findMany({
        where,
        include: {
          createdBy: { select: { id: true, username: true } },
          team: { select: { id: true, name: true } },
          assignees: { include: { user: { select: { id: true, username: true } } } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.task.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        tasks,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      },
    });
  },

  getById: async (req: Request, res: Response) => {
    if (!req.user) throw new AuthorizationError();

    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, username: true } },
        team: { select: { id: true, name: true } },
        assignees: { include: { user: { select: { id: true, username: true } } } },
        comments: { include: { author: { select: { id: true, username: true } } } },
      },
    });

    if (!task) throw new NotFoundError('Task');

    if (req.user.role !== 'admin') {
      if (req.user.role === 'teamlead') {
        if (
          task.team?.id !==
          (await prisma.team.findFirst({ where: { leadId: req.user.userId } }))?.id
        ) {
          throw new AuthorizationError();
        }
      } else {
        const isAssigned = task.assignees.some((a) => a.user.id === req.user!.userId);
        if (!isAssigned) throw new AuthorizationError();
      }
    }

    res.json({ success: true, data: { task } });
  },

  create: async (req: Request, res: Response) => {
    if (!req.user) throw new AuthorizationError();

    const body = createTaskSchema.parse(req.body);

    const task = await prisma.task.create({
      data: {
        ...body,
        createdById: req.user.userId,
        assignees: body.assignees
          ? {
              create: body.assignees.map((userId) => ({ userId })),
            }
          : undefined,
      },
      include: {
        createdBy: { select: { id: true, username: true } },
        team: { select: { id: true, name: true } },
        assignees: { include: { user: { select: { id: true, username: true } } } },
      },
    });

    logActivity(req.user.userId, 'created', 'task', task.id, task.id, task.teamId ?? undefined);

    res.status(201).json({ success: true, data: { task } });
  },

  update: async (req: Request, res: Response) => {
    if (!req.user) throw new AuthorizationError();

    const { id } = req.params;
    const body = updateTaskSchema.parse(req.body);

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...body,
        assignees: body.assignees
          ? {
              deleteMany: {},
              create: body.assignees.map((userId) => ({ userId })),
            }
          : undefined,
      },
      include: {
        createdBy: { select: { id: true, username: true } },
        team: { select: { id: true, name: true } },
        assignees: { include: { user: { select: { id: true, username: true } } } },
      },
    });

    logActivity(req.user.userId, 'updated', 'task', task.id, task.id, task.teamId ?? undefined);

    res.json({ success: true, data: { task } });
  },

  delete: async (req: Request, res: Response) => {
    if (!req.user) throw new AuthorizationError();

    const { id } = req.params;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundError('Task');

    await prisma.task.delete({ where: { id } });

    logActivity(req.user.userId, 'deleted', 'task', id, id, task.teamId ?? undefined);

    res.json({ success: true, message: 'Task deleted' });
  },
};
