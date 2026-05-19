import { json } from '@sveltejs/kit';

export async function GET({ locals }) {
  if (!locals.user) {
    return json({ user: null });
  }

  return json({
    user: {
      id: locals.user.id,
      username: locals.user.username,
      role: locals.user.role,
      teamId: locals.user.teamId
    }
  });
}
