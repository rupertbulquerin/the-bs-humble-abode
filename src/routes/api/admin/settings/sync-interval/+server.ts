import { json } from '@sveltejs/kit';
import { prisma } from '$lib/prisma';

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'syncInterval' }
    });
    return json({ minutes: setting ? parseInt(setting.value) : 5 });
  } catch (error) {
    return json({ error: 'Failed to fetch sync interval' }, { status: 500 });
  }
}

export async function POST({ request }) {
  try {
    const { minutes } = await request.json();
    
    if (!minutes || minutes < 1) {
      return json({ error: 'Invalid interval' }, { status: 400 });
    }

    await prisma.setting.upsert({
      where: { key: 'syncInterval' },
      create: {
        key: 'syncInterval',
        value: minutes.toString()
      },
      update: {
        value: minutes.toString()
      }
    });

    return json({ success: true });
  } catch (error) {
    return json({ error: 'Failed to update sync interval' }, { status: 500 });
  }
} 