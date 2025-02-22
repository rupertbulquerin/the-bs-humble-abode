import { json } from '@sveltejs/kit';

export async function POST({ request }) {
  try {
    const { amount, bookingData } = await request.json();
    
    // For now, just return success and redirect to success page
    return json({
      source: {
        redirect: {
          checkout_url: '/booking/success'
        }
      }
    });
  } catch (error) {
    console.error('Payment error:', error);
    return json({ error: 'Payment failed' }, { status: 500 });
  }
} 