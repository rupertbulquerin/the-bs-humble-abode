import { json } from '@sveltejs/kit';
import { prisma } from '$lib/prisma';

export async function DELETE({ params }) {
  try {
    await prisma.blockedDate.deleteMany({
      where: {
        id: params.id,
        source: null // Only allow deletion of manual blocks
      }
    });
    return json({ success: true });
  } catch (error) {
    console.error('Failed to delete blocked date:', error);
    return json({ error: 'Failed to delete blocked date' }, { status: 500 });
  }
} 