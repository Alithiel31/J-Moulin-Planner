import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { NotFoundError, ValidationError, AuthorizationError } from '../lib/errors';

const createEventSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  location: z.string().optional(),
  teamId: z.string().optional(),
  attendees: z.array(z.string()).optional(),
});

const updateEventSchema = createEventSchema.partial();

export const eventsController = {
  getAll: async (req: Request, res: Response) => {
    const events = await prisma.event.findMany({
      include: {
        createdBy: { select: { id: true, username: true } },
        team: { select: { id: true, name: true } },
        attendees: { include: { user: { select: { id: true, username: true } } } },
      },
      orderBy: { startDate: 'asc' },
    });

    res.json({ success: true, data: { events } });
  },

  getById: async (req: Request, res: Response) => {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, username: true } },
        team: { select: { id: true, name: true } },
        attendees: { include: { user: { select: { id: true, username: true } } } },
      },
    });

    if (!event) throw new NotFoundError('Event');

    res.json({ success: true, data: { event } });
  },

  create: async (req: Request, res: Response) => {
    if (!req.user) throw new AuthorizationError();
    if (req.user.role !== 'admin') {
      throw new AuthorizationError('Only admins can create events');
    }

    const body = createEventSchema.parse(req.body);

    const event = await prisma.event.create({
      data: {
        ...body,
        createdById: req.user.userId,
        attendees: body.attendees
          ? {
              create: body.attendees.map((userId) => ({ userId })),
            }
          : undefined,
      },
      include: {
        createdBy: { select: { id: true, username: true } },
        team: { select: { id: true, name: true } },
        attendees: { include: { user: { select: { id: true, username: true } } } },
      },
    });

    res.status(201).json({ success: true, data: { event } });
  },

  update: async (req: Request, res: Response) => {
    if (!req.user) throw new AuthorizationError();
    if (req.user.role !== 'admin') {
      throw new AuthorizationError('Only admins can update events');
    }

    const { id } = req.params;
    const body = updateEventSchema.parse(req.body);

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...body,
        attendees: body.attendees
          ? {
              deleteMany: {},
              create: body.attendees.map((userId) => ({ userId })),
            }
          : undefined,
      },
      include: {
        createdBy: { select: { id: true, username: true } },
        team: { select: { id: true, name: true } },
        attendees: { include: { user: { select: { id: true, username: true } } } },
      },
    });

    res.json({ success: true, data: { event } });
  },

  delete: async (req: Request, res: Response) => {
    if (!req.user) throw new AuthorizationError();
    if (req.user.role !== 'admin') {
      throw new AuthorizationError('Only admins can delete events');
    }

    const { id } = req.params;

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundError('Event');

    await prisma.event.delete({ where: { id } });

    res.json({ success: true, message: 'Event deleted' });
  },
};
