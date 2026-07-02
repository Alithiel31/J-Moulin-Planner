import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { password } from '../lib/password';
import { token } from '../lib/token';
import { ValidationError, ConflictError, AuthenticationError, NotFoundError } from '../lib/errors';

const signupSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(8),
  role: z.enum(['teamlead', 'teammate']).optional().default('teammate'),
});

const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(1),
});

export const authController = {
  signup: async (req: Request, res: Response) => {
    const body = signupSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { username: body.username } });
    if (existing) {
      throw new ConflictError(`Username ${body.username} already exists`);
    }

    const hashedPassword = await password.hash(body.password);

    const user = await prisma.user.create({
      data: {
        username: body.username,
        password: hashedPassword,
        role: body.role,
      },
      select: { id: true, username: true, role: true, createdAt: true },
    });

    const authToken = token.sign({
      userId: user.id,
      username: user.username,
      role: user.role as any,
    });

    res.cookie('auth', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      // SameSite=None is required for cross-domain requests (Railway: client.up.railway.app → api.up.railway.app)
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      data: { user, token: authToken },
    });
  },

  login: async (req: Request, res: Response) => {
    const body = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { username: body.username } });
    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    const isPasswordValid = await password.verify(user.password, body.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid credentials');
    }

    const authToken = token.sign({
      userId: user.id,
      username: user.username,
      role: user.role as any,
    });

    res.cookie('auth', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
        token: authToken,
      },
    });
  },

  logout: async (req: Request, res: Response) => {
    res.clearCookie('auth');
    res.json({ success: true, message: 'Logged out' });
  },

  me: async (req: Request, res: Response) => {
    if (!req.user) {
      return res.json({ success: true, data: { user: null } });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, username: true, role: true, teamId: true },
    });

    res.json({ success: true, data: { user } });
  },
};
