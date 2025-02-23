import { json } from '@sveltejs/kit';
import { prisma } from '$lib/prisma';

export async function GET() {
  try {
    const blockedDates = await prisma.blockedDate.findMany({
      orderBy: { startDate: 'asc' }
    });
    return json({ blockedDates });
  } catch (error) {
    return json({ error: 'Failed to fetch blocked dates' }, { status: 500 });
  }
}

export async function POST({ request }) {
  try {
    const data = await request.json();
    const blockedDate = await prisma.blockedDate.create({
      data: {
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        reason: data.reason
      }
    });
    return json({ blockedDate });
  } catch (error) {
    return json({ error: 'Failed to create blocked date' }, { status: 500 });
  }
} 