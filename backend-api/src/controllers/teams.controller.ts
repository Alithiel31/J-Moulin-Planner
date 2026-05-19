import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { NotFoundError, ConflictError, AuthorizationError } from '../lib/errors';

const createTeamSchema = z.object({
  name: z.string().min(1).max(100),
  memberIds: z.array(z.string()).optional(),
});

const updateTeamSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  memberIds: z.array(z.string()).optional(),
});

export const teamsController = {
  getAll: async (req: Request, res: Response) => {
    const teams = await prisma.team.findMany({
      include: {
        lead: { select: { id: true, username: true } },
        members: { select: { id: true, username: true } },
      },
    });

    res.json({ success: true, data: { teams } });
  },

  getById: async (req: Request, res: Response) => {
    const { id } = req.params;

    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        lead: { select: { id: true, username: true } },
        members: { select: { id: true, username: true } },
        tasks: { select: { id: true, title: true, status: true } },
      },
    });

    if (!team) throw new NotFoundError('Team');

    res.json({ success: true, data: { team } });
  },

  create: async (req: Request, res: Response) => {
    if (!req.user) throw new AuthorizationError();

    const body = createTeamSchema.parse(req.body);

    const existing = await prisma.team.findUnique({ where: { name: body.name } });
    if (existing) throw new ConflictError('Team name already exists');

    const team = await prisma.team.create({
      data: {
        name: body.name,
        leadId: req.user.userId,
        members: body.memberIds
          ? { connect: body.memberIds.map((id) => ({ id })) }
          : undefined,
      },
      include: {
        lead: { select: { id: true, username: true } },
        members: { select: { id: true, username: true } },
      },
    });

    res.status(201).json({ success: true, data: { team } });
  },

  update: async (req: Request, res: Response) => {
    const { id } = req.params;
    const body = updateTeamSchema.parse(req.body);

    const team = await prisma.team.update({
      where: { id },
      data: {
        name: body.name,
        members: body.memberIds
          ? { set: body.memberIds.map((id) => ({ id })) }
          : undefined,
      },
      include: {
        lead: { select: { id: true, username: true } },
        members: { select: { id: true, username: true } },
      },
    });

    res.json({ success: true, data: { team } });
  },

  delete: async (req: Request, res: Response) => {
    const { id } = req.params;

    await prisma.team.delete({ where: { id } });

    res.json({ success: true, message: 'Team deleted' });
  },
};
