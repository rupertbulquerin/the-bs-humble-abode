import { json } from '@sveltejs/kit';
import { prisma } from '$lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '$lib/auth';

export async function POST({ request, cookies }) {
  try {
    const { email, password } = await request.json();
    
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) throw new Error('Invalid credentials');

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) throw new Error('Invalid credentials');

    const token = await signToken({ adminId: admin.id });
    
    cookies.set('adminToken', token, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return json({ success: true });
  } catch (error) {
    return json({ error: 'Invalid credentials' }, { status: 401 });
  }
} 