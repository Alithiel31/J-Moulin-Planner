import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { NotFoundError, AuthorizationError } from '../lib/errors';
import { logActivity } from '../lib/activity';
import { canAccessTask } from '../lib/task-access';

const createCommentSchema = z.object({
  taskId: z.string(),
  content: z.string().min(1).max(5000),
});

const updateCommentSchema = z.object({
  content: z.string().min(1).max(5000),
});

export const commentsController = {
  getByTaskId: async (req: Request, res: Response) => {
    if (!req.user) throw new AuthorizationError();

    const { taskId } = req.params;

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundError('Task');

    if (!(await canAccessTask(req.user, taskId))) throw new AuthorizationError();

    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: { author: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: { comments } });
  },

  create: async (req: Request, res: Response) => {
    if (!req.user) throw new AuthorizationError();

    const body = createCommentSchema.parse(req.body);

    const task = await prisma.task.findUnique({ where: { id: body.taskId } });
    if (!task) throw new NotFoundError('Task');

    if (!(await canAccessTask(req.user, body.taskId))) throw new AuthorizationError();

    const comment = await prisma.comment.create({
      data: {
        ...body,
        authorId: req.user.userId,
      },
      include: { author: { select: { id: true, username: true } } },
    });

    logActivity(req.user.userId, 'commented', 'comment', comment.id, comment.taskId);

    res.status(201).json({ success: true, data: { comment } });
  },

  update: async (req: Request, res: Response) => {
    if (!req.user) throw new AuthorizationError();

    const { id } = req.params;
    const body = updateCommentSchema.parse(req.body);

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundError('Comment');

    if (comment.authorId !== req.user.userId && req.user.role !== 'admin') {
      throw new AuthorizationError('Cannot edit other users comments');
    }

    const updated = await prisma.comment.update({
      where: { id },
      data: body,
      include: { author: { select: { id: true, username: true } } },
    });

    res.json({ success: true, data: { comment: updated } });
  },

  delete: async (req: Request, res: Response) => {
    if (!req.user) throw new AuthorizationError();

    const { id } = req.params;

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundError('Comment');

    if (comment.authorId !== req.user.userId && req.user.role !== 'admin') {
      throw new AuthorizationError('Cannot delete other users comments');
    }

    await prisma.comment.delete({ where: { id } });

    logActivity(req.user.userId, 'deleted', 'comment', id, comment.taskId);

    res.json({ success: true, message: 'Comment deleted' });
  },
};
