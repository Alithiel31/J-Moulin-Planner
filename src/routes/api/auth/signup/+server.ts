import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { hashPassword } from '$lib/server/auth';

export async function POST({ request }) {
  try {
    const { username, password, role } = await request.json();

    if (!username || !password) {
      return json({ error: 'Username and password required' }, { status: 400 });
    }

    if (!['admin', 'teamlead', 'teammate'].includes(role)) {
      return json({ error: 'Invalid role' }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { username } });
    if (existing) {
      return json({ error: 'User already exists' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const user = await db.user.create({
      data: {
        username,
        password: hashedPassword,
        role
      },
      select: {
        id: true,
        username: true,
        role: true,
        teamId: true
      }
    });

    return json({ user }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return json({ error: 'Signup failed' }, { status: 500 });
  }
}
