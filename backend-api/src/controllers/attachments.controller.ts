import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { NotFoundError, AuthorizationError } from '../lib/errors';

const createAttachmentSchema = z.object({
  taskId: z.string(),
  name: z.string().min(1).max(255),
});

export const attachmentsController = {
  getByTaskId: async (req: Request, res: Response) => {
    const { taskId } = req.params;

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundError('Task');

    const attachments = await prisma.attachment.findMany({
      where: { taskId },
      include: { uploadedBy: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: { attachments } });
  },

  getById: async (req: Request, res: Response) => {
    const { id } = req.params;

    const attachment = await prisma.attachment.findUnique({
      where: { id },
      include: { uploadedBy: { select: { id: true, username: true } } },
    });

    if (!attachment) throw new NotFoundError('Attachment');

    res.json({ success: true, data: { attachment } });
  },

  upload: async (req: Request, res: Response) => {
    if (!req.user) throw new AuthorizationError();

    const { taskId } = req.body;
    if (!taskId) throw new Error('taskId is required');

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundError('Task');

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

    // Note: In production, you should also delete the actual file from disk
    // using fs.unlink(path.join(config.uploadDir, attachment.fileName))

    await prisma.attachment.delete({ where: { id } });

    res.json({ success: true, message: 'Attachment deleted' });
  },
};
