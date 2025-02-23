import { json } from '@sveltejs/kit';
import { prisma } from '$lib/prisma';
// import ical from 'node-ical';

export async function GET() {
  try {
    const calendars = await prisma.calendar.findMany({
      where: { isActive: true }
    });

    const results = [];
    for (const calendar of calendars) {
      try {
        // await ical.fromURL(calendar.syncUrl);
        await prisma.calendar.update({
          where: { id: calendar.id },
          data: { lastSync: new Date() }
        });
        results.push({ calendar: calendar.name, status: 'success' });
      } catch (error) {
        results.push({ calendar: calendar.name, status: 'failed' });
      }
    }

    return json({ success: true, results });
  } catch (error) {
    return json({ error: 'Sync failed' }, { status: 500 });
  }
} 