import { json } from '@sveltejs/kit';
import { prisma } from '$lib/prisma';
import ical from 'node-ical';

export async function POST({ params }) {
  try {
    const calendar = await prisma.calendar.findUnique({
      where: { id: params.id }
    });

    if (!calendar) {
      return json({ error: 'Calendar not found' }, { status: 404 });
    }

    // Test the iCal URL by fetching events
    await ical.fromURL(calendar.syncUrl);

    // Update last sync time
    await prisma.calendar.update({
      where: { id: params.id },
      data: { lastSync: new Date() }
    });

    return json({ success: true });
  } catch (error) {
    console.error('Manual calendar sync failed:', error);
    return json({ error: 'Failed to sync calendar' }, { status: 500 });
  }
} 