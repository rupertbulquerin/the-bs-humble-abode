import { json } from '@sveltejs/kit';
import Paymongo from 'paymongo';

const paymongo = new Paymongo(process.env.PAYMONGO_SECRET_KEY);

export async function POST({ request }) {
  try {
    const { amount, bookingData } = await request.json();

    // Create a payment intent
    const source = await paymongo.sources.create({
      type: 'gcash',
      amount: amount * 100, // Convert to cents
      currency: 'PHP',
      redirect: {
        success: `${process.env.PUBLIC_URL}/booking/success`,
        failed: `${process.env.PUBLIC_URL}/booking/failed`
      },
      billing: {
        name: `${bookingData.firstName} ${bookingData.lastName}`,
        email: bookingData.email,
        phone: bookingData.phone
      },
      metadata: {
        booking_date: bookingData.checkIn,
        checkout_date: bookingData.checkOut,
        guests: bookingData.guests
      }
    });

    return json({
      source: source
    });
  } catch (error) {
    console.error('Payment error:', error);
    return json({ error: 'Payment failed' }, { status: 500 });
  }
} 