import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { config } from '../config';
import { NotFoundError, ValidationError, ConflictError } from '../lib/errors';

const updateUserSchema = z.object({
  username: z.string().min(3).optional(),
  role: z.enum(['admin', 'teamlead', 'teammate']).optional(),
});

export const usersController = {
  getAll: async (req: Request, res: Response) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(
      config.maxPageSize,
      parseInt(req.query.limit as string) || config.defaultPageSize
    );
    const skip = (page - 1) * limit;

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        select: { id: true, username: true, role: true, teamId: true, createdAt: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      },
    });
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

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundError('User');

    // If this user leads a team, hand leadership over before deleting them —
    // otherwise the FK constraint on Team.leadId would block the delete.
    const ledTeam = await prisma.team.findUnique({
      where: { leadId: id },
      include: {
        members: { where: { NOT: { id } }, select: { id: true }, orderBy: { createdAt: 'asc' } },
      },
    });

    if (ledTeam) {
      const nextLead = ledTeam.members[0];

      if (nextLead) {
        // Hand off to the longest-standing other member of the team.
        await prisma.team.update({ where: { id: ledTeam.id }, data: { leadId: nextLead.id } });
      } else {
        // No other member to promote — hand the team to an admin instead of
        // deleting it, so its tasks/events aren't orphaned.
        const admin = await prisma.user.findFirst({
          where: { role: 'admin', NOT: { id } },
          orderBy: { createdAt: 'asc' },
        });

        if (!admin) {
          throw new ConflictError(
            'Cannot delete this user: they lead an otherwise-empty team and no other admin exists to take it over.'
          );
        }

        await prisma.team.update({ where: { id: ledTeam.id }, data: { leadId: admin.id } });
      }
    }

    await prisma.user.delete({ where: { id } });

    res.json({ success: true, message: 'User deleted' });
  },
};
