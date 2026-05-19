import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { NotFoundError, ValidationError, AuthorizationError } from '../lib/errors';

const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.string().default('Autre'),
  startDate: z.string().datetime().optional(),
  deadline: z.string().datetime(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  teamId: z.string().optional(),
  assignees: z.array(z.string()).optional(),
});

const updateTaskSchema = createTaskSchema.partial();

export const tasksController = {
  getAll: async (req: Request, res: Response) => {
    if (!req.user) throw new AuthorizationError();

    const tasks = await prisma.task.findMany({
      where:
        req.user.role === 'admin'
          ? {}
          : req.user.role === 'teamlead'
            ? { team: { leadId: req.user.userId } }
            : { assignees: { some: { userId: req.user.userId } } },
      include: {
        createdBy: { select: { id: true, username: true } },
        team: { select: { id: true, name: true } },
        assignees: { include: { user: { select: { id: true, username: true } } } },
      },
    });

    res.json({ success: true, data: { tasks } });
  },

  getById: async (req: Request, res: Response) => {
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

    res.status(201).json({ success: true, data: { task } });
  },

  update: async (req: Request, res: Response) => {
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

    res.json({ success: true, data: { task } });
  },

  delete: async (req: Request, res: Response) => {
    const { id } = req.params;

    await prisma.task.delete({ where: { id } });

    res.json({ success: true, message: 'Task deleted' });
  },
};
