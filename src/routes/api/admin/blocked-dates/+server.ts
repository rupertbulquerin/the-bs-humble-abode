import { json } from '@sveltejs/kit';
import { prisma } from '$lib/prisma';

export async function GET() {
  try {
    const blockedDates = await prisma.blockedDate.findMany({
      orderBy: { startDate: 'asc' },
      where: {
        // Only get manual blocks and future blocks
        AND: [
          { source: null }, // Manual blocks don't have a source
          { endDate: { gte: new Date() } }
        ]
      }
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
        reason: data.reason,
        // These will be null for manual blocks
        externalId: null,
        source: null
      }
    });
    return json({ blockedDate });
  } catch (error) {
    return json({ error: 'Failed to create blocked date' }, { status: 500 });
  }
} 