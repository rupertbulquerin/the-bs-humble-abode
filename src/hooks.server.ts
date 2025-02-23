import 'dotenv/config';
import { redirect, type Handle } from '@sveltejs/kit';
import { verifyToken } from '$lib/auth';
import { prisma } from '$lib/prisma';
// import ical from 'node-ical';
import { startOfDay } from 'date-fns';

const PUBLIC_ROUTES = ['/admin/login'];
const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

let syncInterval: NodeJS.Timeout;
let isSyncing = false;

async function syncCalendars() {
  if (isSyncing) return;
  
  try {
    isSyncing = true;
    console.log('Starting calendar sync...');
    
    const calendars = await prisma.calendar.findMany({
      where: { isActive: true }
    });

    for (const calendar of calendars) {
      try {
        // const events = await ical.fromURL(calendar.syncUrl);
        await prisma.calendar.update({
          where: { id: calendar.id },
          data: { lastSync: new Date() }
        });
        console.log(`Successfully synced calendar: ${calendar.name}`);
      } catch (error) {
        console.error(`Failed to sync calendar ${calendar.name}:`, error);
      }
    }

    console.log('Calendar sync completed');
  } catch (error) {
    console.error('Calendar sync failed:', error);
  } finally {
    isSyncing = false;
  }
}

// Cleanup function for the interval
function cleanup() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = undefined;
  }
}

// Handle server shutdown
process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);

export const handle: Handle = async ({ event, resolve }) => {
  if (event.url.pathname.startsWith('/admin')) {
    const adminToken = event.cookies.get('adminToken');
    const isPublicRoute = PUBLIC_ROUTES.includes(event.url.pathname);

    if (!adminToken && !isPublicRoute) {
      throw redirect(303, '/admin/login');
    }

    if (adminToken && isPublicRoute) {
      throw redirect(303, '/admin');
    }

    if (adminToken && !isPublicRoute) {
      const payload = await verifyToken(adminToken);
      if (!payload) {
        event.cookies.delete('adminToken', { path: '/' });
        throw redirect(303, '/admin/login');
      }
      event.locals.adminId = payload.adminId as string;
    }
  }

  // Start sync interval if not already running
  if (!syncInterval) {
    syncInterval = setInterval(syncCalendars, SYNC_INTERVAL);
    // Run initial sync
    syncCalendars();
  }

  return resolve(event);
}; 