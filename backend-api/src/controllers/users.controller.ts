import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { NotFoundError, ValidationError } from '../lib/errors';

const updateUserSchema = z.object({
  username: z.string().min(3).optional(),
  role: z.enum(['admin', 'teamlead', 'teammate']).optional(),
});

export const usersController = {
  getAll: async (req: Request, res: Response) => {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, role: true, teamId: true, createdAt: true },
    });

    res.json({ success: true, data: { users } });
  },

  getById: async (req: Request, res: Response) => {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, role: true, teamId: true, createdAt: true },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    res.json({ success: true, data: { user } });
  },

  update: async (req: Request, res: Response) => {
    const { id } = req.params;
    const body = updateUserSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id },
      data: body,
      select: { id: true, username: true, role: true, teamId: true },
    });

    res.json({ success: true, data: { user } });
  },

  delete: async (req: Request, res: Response) => {
    const { id } = req.params;

    await prisma.user.delete({ where: { id } });

    res.json({ success: true, message: 'User deleted' });
  },
};
