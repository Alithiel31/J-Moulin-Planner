import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { NotFoundError, ValidationError, AuthorizationError } from '../lib/errors';

const createCommentSchema = z.object({
  taskId: z.string(),
  content: z.string().min(1).max(5000),
});

const updateCommentSchema = z.object({
  content: z.string().min(1).max(5000),
});

export const commentsController = {
  getByTaskId: async (req: Request, res: Response) => {
    const { taskId } = req.params;

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

    const comment = await prisma.comment.create({
      data: {
        ...body,
        authorId: req.user.userId,
      },
      include: { author: { select: { id: true, username: true } } },
    });

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

    res.json({ success: true, message: 'Comment deleted' });
  },
};
