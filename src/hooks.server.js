import { verifyToken } from '$lib/server/auth';
import { db } from '$lib/server/db';

export async function handle({ event, resolve }) {
  const token = event.cookies.get('auth');

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      const user = await db.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          username: true,
          role: true,
          teamId: true
        }
      });

      if (user) {
        event.locals.user = user;
      }
    }
  }

  return resolve(event);
}
