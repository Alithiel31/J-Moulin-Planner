import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { config } from '../config';
import { NotFoundError, ConflictError, AuthorizationError, ValidationError } from '../lib/errors';
import { logActivity } from '../lib/activity';

const createTeamSchema = z.object({
  name: z.string().min(1).max(100),
  memberIds: z.array(z.string()).optional(),
});

const updateTeamSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  memberIds: z.array(z.string()).optional(),
  leadId: z.string().optional(),
});

export const teamsController = {
  getAll: async (req: Request, res: Response) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(config.maxPageSize, parseInt(req.query.limit as string) || config.defaultPageSize);
    const skip = (page - 1) * limit;

    const [teams, total] = await prisma.$transaction([
      prisma.team.findMany({
        include: {
          lead: { select: { id: true, username: true } },
          members: { select: { id: true, username: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.team.count(),
    ]);

    res.json({
      success: true,
      data: {
        teams,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      },
    });
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

    logActivity(req.user.userId, 'created', 'team', team.id, undefined, team.id);

    res.status(201).json({ success: true, data: { team } });
  },

  update: async (req: Request, res: Response) => {
    if (!req.user) throw new AuthorizationError();

    const { id } = req.params;
    const body = updateTeamSchema.parse(req.body);

    const existing = await prisma.team.findUnique({
      where: { id },
      include: { members: { select: { id: true } } },
    });

    if (!existing) throw new NotFoundError('Team');

    if (req.user.role !== 'admin') {
      if (req.user.role !== 'teamlead' || existing.leadId !== req.user.userId) {
        throw new AuthorizationError();
      }
    }

    // Validate leadId transfer: new lead must be a member of the team
    if (body.leadId && body.leadId !== existing.leadId) {
      const targetMemberIds = body.memberIds ?? existing.members.map((m) => m.id);
      if (!targetMemberIds.includes(body.leadId)) {
        throw new ValidationError('New lead must be a member of the team');
      }
    }

    const team = await prisma.team.update({
      where: { id },
      data: {
        name: body.name,
        leadId: body.leadId,
        members: body.memberIds
          ? { set: body.memberIds.map((memberId) => ({ id: memberId })) }
          : undefined,
      },
      include: {
        lead: { select: { id: true, username: true } },
        members: { select: { id: true, username: true } },
      },
    });

    logActivity(req.user.userId, 'updated', 'team', team.id, undefined, team.id);

    res.json({ success: true, data: { team } });
  },

  delete: async (req: Request, res: Response) => {
    if (!req.user) throw new AuthorizationError();

    const { id } = req.params;

    const existing = await prisma.team.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Team');

    if (req.user.role !== 'admin') {
      if (req.user.role !== 'teamlead' || existing.leadId !== req.user.userId) {
        throw new AuthorizationError();
      }
    }

    await prisma.team.delete({ where: { id } });

    logActivity(req.user.userId, 'deleted', 'team', id, undefined, id);

    res.json({ success: true, message: 'Team deleted' });
  },
};
