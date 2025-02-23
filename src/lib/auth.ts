import * as jose from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || '');

export async function signToken(payload: { adminId: string }) {
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(secret);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jose.jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
} 