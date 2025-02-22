import { prisma } from '$lib/prisma';
import { format } from 'date-fns';

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        checkOut: {
          gte: new Date()
        },
        status: 'confirmed'
      }
    });

    const icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//The Bs Humble Abode//NONSGML v1.0//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      ...bookings.map(booking => [
        'BEGIN:VEVENT',
        `UID:${booking.id}@the-bs-humble-abode`,
        `DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss'Z'")}`,
        `DTSTART;VALUE=DATE:${format(new Date(booking.checkIn), 'yyyyMMdd')}`,
        `DTEND;VALUE=DATE:${format(new Date(booking.checkOut), 'yyyyMMdd')}`,
        'SUMMARY:Unavailable',
        'STATUS:CONFIRMED',
        'END:VEVENT'
      ]).flat(),
      'END:VCALENDAR'
    ].join('\r\n');

    return new Response(icalContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="calendar.ics"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Failed to generate calendar:', error);
    return new Response('Error generating calendar', { status: 500 });
  }
} 