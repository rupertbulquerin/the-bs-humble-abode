import { json } from '@sveltejs/kit';
// import ical from 'node-ical';
import { prisma } from '$lib/prisma';
import { startOfDay, endOfDay, subDays } from 'date-fns';
import { parseICalDate, convertToManila, convertFromManila } from '$lib/dates';

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
				if (key === 'DTSTAMP' || key.startsWith('DTSTAMP;')) {
					currentEvent.timestamp = parseICalDate(value, true);
				} else if (key === 'DTSTART' || key.startsWith('DTSTART;')) {
					currentEvent.startDate = parseICalDate(value);
				} else if (key === 'DTEND' || key.startsWith('DTEND;')) {
					currentEvent.endDate = parseICalDate(value);
				}
			}
		}

		return events;
	} catch (error) {
		console.error('Failed to fetch calendar:', error);
		return [];
	}
}

// Define the type for booked dates
interface BookedDate {
	start: Date;
	end: Date;
	source: string;
}

export async function GET({ request }) {
	try {
		const [calendars, blockedDates, confirmedBookings] = await Promise.all([
			prisma.calendar.findMany({
				where: { isActive: true }
			}),
			prisma.blockedDate.findMany({
				where: {
					endDate: {
						gte: convertFromManila(new Date())
					}
				}
			}),
			prisma.booking.findMany({
				where: {
					status: 'confirmed',
					checkOut: {
						gte: convertFromManila(new Date())
					}
				}
			})
		]);

		const bookedDates: BookedDate[] = [];

		// Fetch and parse external calendar events
		for (const calendar of calendars) {
			if (calendar.syncUrl) {
				const events = await fetchAndParseCalendar(calendar.syncUrl);
				events.forEach(event => {
					if (event.startDate && event.endDate) {
						bookedDates.push({
							start: startOfDay(convertToManila(event.startDate)),
							end: endOfDay(convertToManila(event.endDate)),
							source: `${calendar.name} - External Booking`
						});
					}
				});
			}
		}

		// Add blocked dates to bookedDates array
		blockedDates.forEach((blocked) => {
			const startDate = new Date(blocked.startDate);
			const endDate = new Date(blocked.endDate);
			
			bookedDates.push({
				start: startOfDay(convertToManila(startDate)),
				end: endOfDay(convertToManila(endDate)),
				source: blocked.source || ('Manual Block: ' + blocked.reason)
			});
		});

		// Add confirmed bookings to bookedDates array
		confirmedBookings.forEach((booking) => {
			const checkInDate = new Date(booking.checkIn);
			const checkOutDate = new Date(booking.checkOut);
			
			bookedDates.push({
				start: startOfDay(convertToManila(checkInDate)),
				end: endOfDay(convertToManila(checkOutDate)),
				source: `Booking: ${booking.firstName} ${booking.lastName}`
			});
		});

		return json({ bookedDates });
	} catch (error) {
		console.error('Failed to fetch calendars:', error);
		return json({ error: 'Failed to fetch calendar data' }, { status: 500 });
	}
}
