import { json } from '@sveltejs/kit';
import prisma from '$lib/db';
import { sendBookingEmail } from '$lib/email';

export async function POST({ request }) {
  try {
    const data = await request.json();
    
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
        basePrice: data.basePrice,
        extraGuestsFee: data.extraGuestsFee,
        totalPrice: data.totalPrice,
        status: data.status,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentStatus
      }
    });

    // Send confirmation email
    await sendBookingEmail(booking);

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