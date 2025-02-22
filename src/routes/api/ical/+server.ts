import { json } from '@sveltejs/kit';
import { prisma } from '$lib/prisma';
import { format } from 'date-fns';

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        checkOut: {
          gte: new Date()
        }
      }
    });

    const icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//The B\'s Humble Abode//EN',
      'CALSCALE:GREGORIAN',
      'X-WR-CALNAME:The B\'s Humble Abode Bookings',
      'X-WR-TIMEZONE:Asia/Manila',
      ...bookings.map(booking => [
        'BEGIN:VEVENT',
        `UID:${booking.id}@the-bs-humble-abode`,
        `DTSTART;VALUE=DATE:${format(booking.checkIn, 'yyyyMMdd')}`,
        `DTEND;VALUE=DATE:${format(booking.checkOut, 'yyyyMMdd')}`,
        `SUMMARY:Booked - Avida Tower 4, Iloilo`,
        'STATUS:CONFIRMED',
        'DESCRIPTION:Booking from The B\'s Humble Abode website',
        'LOCATION:Avida Tower 4\\, Donato Pison Avenue\\, Brgy. San Rafael\\, Mandurriao\\, Iloilo City\\, 5000',
        'END:VEVENT'
      ]).flat(),
      'END:VCALENDAR'
    ].join('\r\n');

    return new Response(icalContent, {
      headers: {
        'Content-Type': 'text/calendar',
        'Content-Disposition': 'attachment; filename=the-bs-humble-abode-bookings.ics'
      }
    });
  } catch (error) {
    return json({ error: 'Failed to generate calendar' }, { status: 500 });
  }
} 