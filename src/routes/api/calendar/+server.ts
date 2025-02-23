import { json } from '@sveltejs/kit';
// import ical from 'node-ical';
import { prisma } from '$lib/prisma';
import { startOfDay, endOfDay, subDays } from 'date-fns';

async function parseICalDate(date: string) {
	const year = parseInt(date.slice(0, 4));
	const month = parseInt(date.slice(4, 6)) - 1;
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

export async function GET() {
	try {
		const [calendars, blockedDates] = await Promise.all([
			prisma.calendar.findMany({
				where: { isActive: true }
			}),
			prisma.blockedDate.findMany({
				where: {
					endDate: {
						gte: new Date()
					}
				}
			})
		]);

		const bookedDates = [];

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

		// Add blocked dates to bookedDates array
		blockedDates.forEach((blocked) => {
			bookedDates.push({
				start: startOfDay(new Date(blocked.startDate)),
				end: endOfDay(new Date(blocked.endDate)),
				source: 'Manual Block: ' + blocked.reason
			});
		});

		return json({ bookedDates });
	} catch (error) {
		console.error('Failed to fetch calendars:', error);
		return json({ error: 'Failed to fetch calendar data' }, { status: 500 });
	}
}
