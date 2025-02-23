import { json } from '@sveltejs/kit';
// import ical from 'node-ical';
import { prisma } from '$lib/prisma';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET() {
	try {
		// Fetch all active calendars
		const calendars = await prisma.calendar.findMany({
			where: { isActive: true }
		});

		const bookedDates = [];

		// Fetch events from all calendars
		// for (const calendar of calendars) {
		// 	try {
		// 		const events = await ical.fromURL(calendar.syncUrl);
		// 		for (let event of Object.values(events)) {
		// 			if (event.type === 'VEVENT') {
		// 				bookedDates.push({
		// 					start: startOfDay(new Date(event.start)),
		// 					end: endOfDay(new Date(event.end)),
		// 					source: calendar.name
		// 				});
		// 			}
		// 		}
		// 	} catch (error) {
		// 		console.error(`Failed to fetch calendar ${calendar.name}:`, error);
		// 	}
		// }

		// Fetch manually blocked dates
		const blockedDates = await prisma.blockedDate.findMany({
			where: {
				endDate: {
					gte: new Date()
				}
			}
		});

		// Add blocked dates to bookedDates array with normalized dates
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
