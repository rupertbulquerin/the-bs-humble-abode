import 'dotenv/config';
import { redirect, type Handle } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { prisma } from '$lib/prisma';
import ical from 'node-ical';
import { startOfDay } from 'date-fns';

const JWT_SECRET = process.env.JWT_SECRET;
const PUBLIC_ROUTES = ['/admin/login'];
const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in environment variables');
}

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
        const events = await ical.fromURL(calendar.syncUrl);
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
  // Check if it's an admin route
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
      try {
        const decoded = jwt.verify(adminToken, JWT_SECRET);
        event.locals.adminId = decoded.adminId;
      } catch (error) {
        event.cookies.delete('adminToken', { path: '/' });
        throw redirect(303, '/admin/login');
      }
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