import { writable } from 'svelte/store';

export const calendarStore = writable({
  events: null,
  lastFetch: 0
});

export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
