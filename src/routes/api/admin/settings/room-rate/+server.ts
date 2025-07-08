import { json } from '@sveltejs/kit';
import { prisma } from '$lib/prisma';

const DEFAULT_ROOM_RATE = 1600;

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'roomRate' }
    });
    return json({ rate: setting ? parseInt(setting.value) : DEFAULT_ROOM_RATE });
  } catch (error) {
    return json({ error: 'Failed to fetch room rate' }, { status: 500 });
  }
}

export async function POST({ request }) {
  try {
    const { rate } = await request.json();
    if (!rate || rate < 1) {
      return json({ error: 'Invalid room rate' }, { status: 400 });
    }
    await prisma.setting.upsert({
      where: { key: 'roomRate' },
      create: { key: 'roomRate', value: rate.toString() },
      update: { value: rate.toString() }
    });
    return json({ success: true });
  } catch (error) {
    return json({ error: 'Failed to update room rate' }, { status: 500 });
  }
} 