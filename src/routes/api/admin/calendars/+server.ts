import { json } from '@sveltejs/kit';
import { prisma } from '$lib/prisma';

export async function GET() {
  try {
    const calendars = await prisma.calendar.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return json({ calendars });
  } catch (error) {
    return json({ error: 'Failed to fetch calendars' }, { status: 500 });
  }
}

export async function POST({ request }) {
  try {
    const data = await request.json();
    const calendar = await prisma.calendar.create({
      data: {
        name: data.name,
        syncUrl: data.syncUrl,
        isActive: true,
        lastSync: new Date()
      }
    });
    return json({ calendar });
  } catch (error) {
    console.error('Calendar creation error:', error);
    return json({ error: 'Failed to create calendar' }, { status: 500 });
  }
}