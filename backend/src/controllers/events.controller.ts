import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { config } from '../config';
import { NotFoundError, ValidationError, AuthorizationError } from '../lib/errors';

// Accept both full ISO datetime ("2026-05-22T00:00:00Z") and date-only ("2026-05-22")
const isoDatetime = z.string().transform((val) =>
  /^\d{4}-\d{2}-\d{2}$/.test(val) ? `${val}T00:00:00.000Z` : val
);

const createEventSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  startDate: isoDatetime,
  endDate: isoDatetime.optional(),
  location: z.string().optional(),
  teamId: z.string().optional(),
  attendees: z.array(z.string()).optional(),
});

const updateEventSchema = createEventSchema.partial();

export const eventsController = {
  getAll: async (req: Request, res: Response) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(config.maxPageSize, parseInt(req.query.limit as string) || config.defaultPageSize);
    const skip = (page - 1) * limit;

    const [events, total] = await prisma.$transaction([
      prisma.event.findMany({
        include: {
          createdBy: { select: { id: true, username: true } },
          team: { select: { id: true, name: true } },
          attendees: { include: { user: { select: { id: true, username: true } } } },
        },
        skip,
        take: limit,
        orderBy: { startDate: 'asc' },
      }),
      prisma.event.count(),
    ]);

    res.json({
      success: true,
      data: {
        events,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      },
    });
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
    // Default endDate to startDate + 1 hour if not provided
    const endDate = body.endDate ?? new Date(new Date(body.startDate).getTime() + 3600000).toISOString();

    if (new Date(endDate) < new Date(body.startDate)) {
      throw new ValidationError('endDate must be after startDate');
    }

    const event = await prisma.event.create({
      data: {
        ...body,
        endDate,
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

    if (body.startDate && body.endDate && new Date(body.endDate) < new Date(body.startDate)) {
      throw new ValidationError('endDate must be after startDate');
    }

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
