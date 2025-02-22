import { json } from '@sveltejs/kit';
import { prisma } from '$lib/prisma';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET() {
  try {
    const today = new Date();
    const startToday = startOfDay(today);
    const endToday = endOfDay(today);

    // Get total bookings
    const totalBookings = await prisma.booking.count();

    // Get upcoming bookings (check-in date is in the future)
    const upcomingBookings = await prisma.booking.count({
      where: {
        checkIn: {
          gte: startToday
        },
        status: 'confirmed'
      }
    });

    // Get today's check-ins
    const todayCheckIns = await prisma.booking.count({
      where: {
        checkIn: {
          gte: startToday,
          lte: endToday
        },
        status: 'confirmed'
      }
    });

    // Get today's check-outs
    const todayCheckOuts = await prisma.booking.count({
      where: {
        checkOut: {
          gte: startToday,
          lte: endToday
        },
        status: 'checked-in'
      }
    });

    // Get recent bookings
    const recentBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        checkIn: true,
        checkOut: true,
        totalPrice: true,
        status: true,
        createdAt: true
      }
    });

    return json({
      totalBookings,
      upcomingBookings,
      todayCheckIns,
      todayCheckOuts,
      recentBookings
    });
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
} 