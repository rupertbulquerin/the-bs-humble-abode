import { startOfDay, endOfDay, addDays, subDays } from 'date-fns';
import { format } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

const TIMEZONE = 'Asia/Manila';

export function convertToManila(date: Date): Date {
  return toZonedTime(date, TIMEZONE);
}

export function convertFromManila(date: Date): Date {
  // Create a date string in Manila timezone, then parse as UTC
  const dateStr = formatInTimeZone(date, TIMEZONE, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
  return new Date(dateStr);
}

export function createManilaDate(year: number, month: number, day: number): Date {
  // Create date in Manila timezone
  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00.000Z`;
  const utcDate = new Date(dateStr);
  return convertFromManila(utcDate);
}

export function parseICalDate(date: string, hasTime = false): Date {
  const year = parseInt(date.slice(0, 4));
  const month = parseInt(date.slice(4, 6)) - 1;
  const day = parseInt(date.slice(6, 8));
  
  if (hasTime) {
    const hour = parseInt(date.slice(9, 11));
    const minute = parseInt(date.slice(11, 13));
    const second = parseInt(date.slice(13, 15));
    return new Date(Date.UTC(year, month, day, hour, minute, second));
  }
  
  return createManilaDate(year, month, day);
} 