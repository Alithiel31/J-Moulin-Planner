import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { verifyPassword, createToken } from '$lib/server/auth';

export async function POST({ request, cookies }) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return json({ error: 'Username and password required' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { username } });
    if (!user) {
      return json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = createToken(user.id);

    cookies.set('auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        teamId: user.teamId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return json({ error: 'Login failed' }, { status: 500 });
  }
}
