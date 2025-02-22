import 'dotenv/config';
import { redirect, type Handle } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
console.log('all env', process.env)
const JWT_SECRET = process.env.JWT_SECRET;
const PUBLIC_ROUTES = ['/admin/login'];

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in environment variables');
}

export const handle: Handle = async ({ event, resolve }) => {
  // Check if it's an admin route
  if (event.url.pathname.startsWith('/admin')) {
    const adminToken = event.cookies.get('adminToken');
    const isPublicRoute = PUBLIC_ROUTES.includes(event.url.pathname);

    // If no token and trying to access protected route, redirect to login
    if (!adminToken && !isPublicRoute) {
      throw redirect(303, '/admin/login');
    }

    // If has token and trying to access login page, redirect to dashboard
    if (adminToken && isPublicRoute) {
      throw redirect(303, '/admin');
    }

    // Verify token for protected routes
    if (adminToken && !isPublicRoute) {
      try {
        const decoded = jwt.verify(adminToken, JWT_SECRET);
        event.locals.adminId = decoded.adminId;
      } catch (error) {
        // Invalid token, clear it and redirect to login
        event.cookies.delete('adminToken', { path: '/' });
        throw redirect(303, '/admin/login');
      }
    }
  }

  return resolve(event);
}; 