import { Request, Response } from 'express';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { prisma } from '../lib/db';
import { config } from '../config';
import { NotFoundError, AuthorizationError } from '../lib/errors';
import { logActivity } from '../lib/activity';
import { canAccessTask } from '../lib/task-access';

const createAttachmentSchema = z.object({
  taskId: z.string(),
  name: z.string().min(1).max(255),
});

export const attachmentsController = {
  getByTaskId: async (req: Request, res: Response) => {
    if (!req.user) throw new AuthorizationError();

    const { taskId } = req.params;

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundError('Task');

    if (!(await canAccessTask(req.user, taskId))) throw new AuthorizationError();

    const attachments = await prisma.attachment.findMany({
      where: { taskId },
      include: { uploadedBy: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: { attachments } });
  },

  getById: async (req: Request, res: Response) => {
    if (!req.user) throw new AuthorizationError();

    const { id } = req.params;

    const attachment = await prisma.attachment.findUnique({
      where: { id },
      include: { uploadedBy: { select: { id: true, username: true } } },
    });

    if (!attachment) throw new NotFoundError('Attachment');

    if (!(await canAccessTask(req.user, attachment.taskId))) throw new AuthorizationError();

    res.json({ success: true, data: { attachment } });
  },

  upload: async (req: Request, res: Response) => {
    if (!req.user) throw new AuthorizationError();

    const { taskId } = createAttachmentSchema.pick({ taskId: true }).parse(req.body);

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundError('Task');

    if (!(await canAccessTask(req.user, taskId))) throw new AuthorizationError();

    if (!req.file) throw new Error('No file provided');

    const attachment = await prisma.attachment.create({
      data: {
        name: req.file.originalname,
        fileName: req.file.filename,
        mimeType: req.file.mimetype,
        size: req.file.size,
        taskId,
        uploadedById: req.user.userId,
      },
      include: { uploadedBy: { select: { id: true, username: true } } },
    });

    logActivity(req.user.userId, 'created', 'attachment', attachment.id, taskId);

    res.status(201).json({ success: true, data: { attachment } });
  },

  delete: async (req: Request, res: Response) => {
    if (!req.user) throw new AuthorizationError();

    const { id } = req.params;

    const attachment = await prisma.attachment.findUnique({ where: { id } });
    if (!attachment) throw new NotFoundError('Attachment');

    // Only allow deletion by uploader or admin
    if (attachment.uploadedById !== req.user.userId && req.user.role !== 'admin') {
      throw new AuthorizationError('Cannot delete other users attachments');
    }

    await prisma.attachment.delete({ where: { id } });

    try {
      await fs.unlink(path.join(config.uploadDir, attachment.fileName));
    } catch {
      // File already absent — not blocking
    }

    logActivity(req.user.userId, 'deleted', 'attachment', id, attachment.taskId);

    res.json({ success: true, message: 'Attachment deleted' });
  },
};
