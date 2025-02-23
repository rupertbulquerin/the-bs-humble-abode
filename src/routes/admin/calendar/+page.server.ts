import { prisma } from '$lib/prisma';
import { startOfDay, endOfDay } from 'date-fns';
import ical from 'node-ical';

export async function load() {
  try {
    // Fetch all data server-side
    const [calendars, blockedDates, activeCalendars] = await Promise.all([
      prisma.calendar.findMany(),
      prisma.blockedDate.findMany({
        where: { endDate: { gte: new Date() } },
        orderBy: { startDate: 'asc' }
      }),
      prisma.calendar.findMany({ where: { isActive: true } })
    ]);

    // Fetch events from active calendars
    const bookedDates = [];
    for (const calendar of activeCalendars) {
      try {
        const events = await ical.fromURL(calendar.syncUrl);
        for (let event of Object.values(events)) {
          if (event.type === 'VEVENT') {
            bookedDates.push({
              start: startOfDay(new Date(event.start)),
              end: endOfDay(new Date(event.end)),
              source: calendar.name
            });
          }
        }
      } catch (error) {
        console.error(`Failed to fetch calendar ${calendar.name}:`, error);
      }
    }

    // Add blocked dates to bookedDates
    blockedDates.forEach((blocked) => {
      bookedDates.push({
        start: startOfDay(new Date(blocked.startDate)),
        end: endOfDay(new Date(blocked.endDate)),
        source: 'Manual Block: ' + blocked.reason
      });
    });

    return { calendars, blockedDates, bookedDates };
  } catch (error) {
    console.error('Failed to load data:', error);
    return {
      calendars: [],
      blockedDates: [],
      bookedDates: []
    };
  }
} 