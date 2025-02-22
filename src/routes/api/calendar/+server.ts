import { json } from '@sveltejs/kit';
import ical from 'node-ical';

let cachedEvents: any = null;
let lastFetch = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET() {
	try {
		// Check cache
		if (cachedEvents && (Date.now() - lastFetch) < CACHE_DURATION) {
			return json({ bookedDates: cachedEvents });
		}

		const AIRBNB_ICAL_URL =
			'https://www.airbnb.com/calendar/ical/1347709887318066348.ics?s=6ca66a6960baa08116f1c25feb37b607';

		const events = await ical.fromURL(AIRBNB_ICAL_URL);
		const bookedDates = [];

		for (let event of Object.values(events)) {
			if (event.type === 'VEVENT') {
				bookedDates.push({
					start: event.start,
					end: event.end,
					source: 'airbnb'
				});
			}
		}

		// Update cache
		cachedEvents = bookedDates;
		lastFetch = Date.now();

		return json({ bookedDates });
	} catch (error) {
		console.error('Failed to fetch Airbnb calendar:', error);
		// Return cached data if available
		if (cachedEvents) {
			return json({ bookedDates: cachedEvents, fromCache: true });
		}
		return json({ error: 'Failed to fetch calendar data' }, { status: 500 });
	}
}
