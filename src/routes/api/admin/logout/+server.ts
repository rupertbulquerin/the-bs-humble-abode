import { json } from '@sveltejs/kit';

export async function POST({ cookies }) {
  try {
    cookies.delete('adminToken', { path: '/' });
    return json({ success: true });
  } catch (error) {
    return json({ error: 'Failed to logout' }, { status: 500 });
  }
} 