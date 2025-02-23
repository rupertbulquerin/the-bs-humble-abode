import { prisma } from '$lib/prisma';
import { startOfDay, endOfDay, subDays } from 'date-fns';

async function parseICalDate(date: string) {
  // Format: YYYYMMDD or YYYYMMDDTHHMMSSZ
  const year = parseInt(date.slice(0, 4));
  const month = parseInt(date.slice(4, 6)) - 1; // JS months are 0-based
  const day = parseInt(date.slice(6, 8));
  return new Date(year, month, day);
}

async function fetchAndParseCalendar(url: string) {
  try {
    const response = await fetch(url);
    const icsData = await response.text();
    const events = [];
    
    const lines = icsData.split('\n').map(line => line.trim());
    let currentEvent: any = null;

    for (const line of lines) {
      if (line === 'BEGIN:VEVENT') {
        currentEvent = {};
      } else if (line === 'END:VEVENT' && currentEvent) {
        if (currentEvent.startDate && currentEvent.endDate) {
          currentEvent.endDate = subDays(currentEvent.endDate, 1);
          events.push(currentEvent);
        }
        currentEvent = null;
      } else if (currentEvent && line.includes(':')) {
        const [key, value] = line.split(':');
        if (key === 'DTSTART' || key.startsWith('DTSTART;')) {
          currentEvent.startDate = await parseICalDate(value);
        } else if (key === 'DTEND' || key.startsWith('DTEND;')) {
          currentEvent.endDate = await parseICalDate(value);
        }
      }
    }

    return events;
  } catch (error) {
    console.error('Failed to fetch calendar:', error);
    return [];
  }
}

export async function load() {
  try {
    // Fetch all data server-side
    const [calendars, blockedDates, bookings] = await Promise.all([
      prisma.calendar.findMany({
        where: { isActive: true }
      }),
      prisma.blockedDate.findMany({
        where: { endDate: { gte: new Date() } },
        orderBy: { startDate: 'asc' }
      }),
      prisma.booking.findMany({
        where: {
          checkOut: { gte: new Date() },
          status: { not: 'cancelled' }
        }
      })
    ]);

    const bookedDates: any[] = [];

    // Fetch and parse external calendar events
    for (const calendar of calendars) {
      if (calendar.syncUrl) {
        const events = await fetchAndParseCalendar(calendar.syncUrl);
        events.forEach(event => {
          if (event.startDate && event.endDate) {
            bookedDates.push({
              start: startOfDay(event.startDate),
              end: endOfDay(event.endDate),
              source: `${calendar.name} - External Booking`
            });
          }
        });
      }
    }

    // Add local bookings to bookedDates
    bookings.forEach((booking) => {
      bookedDates.push({
        start: startOfDay(new Date(booking.checkIn)),
        end: endOfDay(subDays(new Date(booking.checkOut), 1)),
        source: `Booking: ${booking.firstName} ${booking.lastName}`
      });
    });

    // Add blocked dates to bookedDates
    blockedDates.forEach((blocked) => {
      bookedDates.push({
        start: startOfDay(new Date(blocked.startDate)),
        end: endOfDay(subDays(new Date(blocked.endDate), 1)),
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