import { json } from '@sveltejs/kit';
import { prisma } from '$lib/prisma';

export async function DELETE({ params }) {
  try {
    await prisma.blockedDate.delete({
      where: { id: params.id }
    });
    return json({ success: true });
  } catch (error) {
    return json({ error: 'Failed to delete blocked date' }, { status: 500 });
  }
} 