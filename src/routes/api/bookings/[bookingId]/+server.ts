import { json } from '@sveltejs/kit';
import prisma from '$lib/db';

export async function GET({ params }) {
  try {
    const { bookingId } = params;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      return json({ error: 'Booking not found' }, { status: 404 });
    }

    return json({ booking });
  } catch (error) {
    console.error('Failed to fetch booking:', error);
    return json({ error: 'Failed to fetch booking details' }, { status: 500 });
  }
}

export async function PATCH({ params, request }) {
  try {
    const { bookingId } = params;
    const data = await request.json();
    
    console.log('Request params:', params);
    console.log('Request data:', data);
    console.log('Booking ID:', bookingId);

    // First check if we can find the booking
    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    console.log('Existing booking:', existingBooking);

    if (!existingBooking) {
      return json({ error: 'Booking not found' }, { status: 404 });
    }

    const validStatuses = ['confirmed', 'checked-in', 'checked-out', 'cancelled'];
    if (!validStatuses.includes(data.status)) {
      return json({ error: 'Invalid status' }, { status: 400 });
    }

    const updatedBooking = await prisma.booking.update({
      where: { 
        id: bookingId
      },
      data: {
        status: data.status
      }
    });

    console.log('Updated booking:', updatedBooking);
    return json({ booking: updatedBooking });
  } catch (error) {
    console.error('Failed to update booking:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    return json({ 
      error: 'Failed to update booking',
      details: error.message 
    }, { status: 500 });
  }
} 