import { json } from '@sveltejs/kit';
// import ical from 'node-ical';
import { prisma } from '$lib/prisma';
import { startOfDay, endOfDay, subDays } from 'date-fns';

async function parseICalDate(date: string, hasTime = false) {
	const year = parseInt(date.slice(0, 4));
	const month = parseInt(date.slice(4, 6)) - 1;
	const day = parseInt(date.slice(6, 8));
	
	if (hasTime) {
		// For timestamps with 'Z' suffix (UTC)
		const hour = parseInt(date.slice(9, 11));
		const minute = parseInt(date.slice(11, 13));
		const second = parseInt(date.slice(13, 15));
		return new Date(Date.UTC(year, month, day, hour, minute, second));
	}
	
	// For DATE values, always use UTC midnight
	return new Date(Date.UTC(year, month, day));
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
					// Subtract one day from endDate since iCal DTEND is exclusive
					currentEvent.endDate = subDays(currentEvent.endDate, 1);
					events.push(currentEvent);
				}
				currentEvent = null;
			} else if (currentEvent && line.includes(':')) {
				const [key, value] = line.split(':');
				if (key === 'DTSTAMP' || key.startsWith('DTSTAMP;')) {
					currentEvent.timestamp = await parseICalDate(value, true);
				} else if (key === 'DTSTART' || key.startsWith('DTSTART;')) {
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
		console.log('Server timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
		console.log('Current server time:', new Date().toISOString());

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
					console.log('Parsed event:', {
						timestamp: event.timestamp?.toISOString(),
						start: event.startDate.toISOString(),
						end: event.endDate.toISOString()
					});
					if (event.startDate && event.endDate) {
						bookedDates.push({
							start: startOfDay(new Date(event.startDate.toISOString())),
							end: endOfDay(new Date(event.endDate.toISOString())),
							source: `${calendar.name} - External Booking`
						});
					}
				});
			}
		}

		// Add blocked dates to bookedDates array
		blockedDates.forEach((blocked) => {
			const startDate = new Date(Date.UTC(
				blocked.startDate.getFullYear(),
				blocked.startDate.getMonth(),
				blocked.startDate.getDate()
			));
			const endDate = new Date(Date.UTC(
				blocked.endDate.getFullYear(),
				blocked.endDate.getMonth(),
				blocked.endDate.getDate()
			));
			
			bookedDates.push({
				start: startOfDay(startDate),
				end: endOfDay(subDays(endDate, 1)),
				source: 'Manual Block: ' + blocked.reason
			});
		});

		return json({ bookedDates });
	} catch (error) {
		console.error('Failed to fetch calendars:', error);
		return json({ error: 'Failed to fetch calendar data' }, { status: 500 });
	}
}
