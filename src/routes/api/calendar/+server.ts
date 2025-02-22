import { json } from '@sveltejs/kit';
import ical from 'node-ical';

export async function GET() {
	try {
		// Replace with your Airbnb iCal URL
		const AIRBNB_ICAL_URL =
			'https://www.airbnb.com/calendar/ical/1347709887318066348.ics?s=6ca66a6960baa08116f1c25feb37b607';

		const events = await ical.fromURL(AIRBNB_ICAL_URL);
		const bookedDates = [];

		for (let event of Object.values(events)) {
			if (event.type === 'VEVENT') {
				bookedDates.push({
					start: event.start,
					end: event.end
				});
			}
		}

		return json({ bookedDates });
	} catch (error) {
		return json({ error: 'Failed to fetch calendar data' }, { status: 500 });
	}
}
