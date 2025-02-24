import { parseICalDate } from '$lib/dates';
import { subDays } from 'date-fns';

export async function fetchAndParseCalendar(url: string) {
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