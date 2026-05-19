import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export async function GET({ locals }) {
  try {
    if (!locals.user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const events = await db.event.findMany({
      orderBy: { date: 'asc' }
    });

    return json({ events });
  } catch (error) {
    console.error('Get events error:', error);
    return json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST({ request, locals }) {
  try {
    if (locals.user?.role !== 'admin') {
      return json({ error: 'Admin only' }, { status: 403 });
    }

    const { name, date } = await request.json();

    if (!name || !date) {
      return json({ error: 'Name and date required' }, { status: 400 });
    }

    const event = await db.event.create({
      data: {
        name,
        date: new Date(date)
      }
    });

    return json({ event }, { status: 201 });
  } catch (error) {
    console.error('Create event error:', error);
    return json({ error: 'Failed to create event' }, { status: 500 });
  }
}
