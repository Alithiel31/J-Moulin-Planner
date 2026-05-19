import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';

async function getUserFromRequest(request) {
  const auth = request.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return null;
  }
  // In production, verify JWT here
  // For now, assume the user ID is in the token
  return null;
}

export async function GET({ locals }) {
  try {
    if (!locals.user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tasks = await db.task.findMany({
      where: {
        OR: [
          { createdById: locals.user.id },
          { team: { members: { some: { id: locals.user.id } } } },
          { assignees: { some: { userId: locals.user.id } } }
        ]
      },
      include: {
        createdBy: { select: { id: true, username: true } },
        assignees: { include: { user: { select: { id: true, username: true } } } },
        team: { select: { id: true, name: true } }
      },
      orderBy: { deadline: 'asc' }
    });

    return json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    return json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST({ request, locals }) {
  try {
    if (!locals.user || !['admin', 'teamlead'].includes(locals.user.role)) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, category, startDate, deadline, priority, assignees } = await request.json();

    if (!title || !deadline) {
      return json({ error: 'Title and deadline required' }, { status: 400 });
    }

    const task = await db.task.create({
      data: {
        title,
        description,
        category,
        startDate: startDate ? new Date(startDate) : null,
        deadline: new Date(deadline),
        priority,
        createdById: locals.user.id,
        teamId: locals.user.teamId,
        assignees: {
          create: (assignees || []).map(userId => ({ userId }))
        }
      },
      include: {
        createdBy: { select: { id: true, username: true } },
        assignees: { include: { user: { select: { id: true, username: true } } } },
        team: { select: { id: true, name: true } }
      }
    });

    return json({ task }, { status: 201 });
  } catch (error) {
    console.error('Create task error:', error);
    return json({ error: 'Failed to create task' }, { status: 500 });
  }
}
