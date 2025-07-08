import { json } from '@sveltejs/kit';
import { prisma } from '$lib/prisma';
import { sendBookingEmail, sendAdminBookingNotification } from '$lib/email';

const DEFAULT_ROOM_RATE = 1600;

async function getRoomRate() {
  const setting = await prisma.setting.findUnique({ where: { key: 'roomRate' } });
  return setting ? parseInt(setting.value) : DEFAULT_ROOM_RATE;
}

export async function POST({ request }) {
  try {
    const data = await request.json();
    let basePrice = data.basePrice;
    if (!basePrice) {
      basePrice = await getRoomRate();
    }
    
    const booking = await prisma.booking.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        checkIn: new Date(data.checkIn),
        checkOut: new Date(data.checkOut),
        guests: data.guests,
        specialRequests: data.specialRequests,
        basePrice: basePrice,
        extraGuestsFee: data.extraGuestsFee,
        totalPrice: data.totalPrice,
        status: data.status,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentStatus
      }
    });

    // Send confirmation email to guest
    await sendBookingEmail(booking);
    // Send notification email to admin
    await sendAdminBookingNotification(booking);

    return json({ booking });
  } catch (error) {
    console.error('Failed to create booking:', error);
    return json({ error: 'Failed to create booking' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: {
        checkIn: 'desc'
      }
    });
    return json({ bookings });
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
    return json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
} 