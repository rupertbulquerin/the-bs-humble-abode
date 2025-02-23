type Cache = {
  events: any[] | null;
  lastFetch: number;
};

let cache: Cache = {
  events: null,
  lastFetch: 0
};

export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function getCache(): Cache {
  return { ...cache };
}

export function setCache(events: any[] | null) {
  cache = {
    events: events ? [...events] : null,
    lastFetch: Date.now()
  };
} 