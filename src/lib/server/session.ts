import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { env } from './env';

const COOKIE = 'prep_session';
const secretValue = env.AUTH_SECRET || (env.NODE_ENV === 'production' ? '' : 'development-only-secret-change-me-now');

export interface SessionIdentity {
  userId: string;
  organizationId: string;
  role: 'student' | 'teacher' | 'org_admin' | 'platform_admin';
  email: string;
}

function secret(): Uint8Array {
  if (secretValue.length < 32) throw new Error('AUTH_SECRET must contain at least 32 characters');
  return new TextEncoder().encode(secretValue);
}

export async function createSession(identity: SessionIdentity): Promise<void> {
  const token = await new SignJWT({ ...identity })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(identity.userId)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSession(): Promise<SessionIdentity | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      userId: String(payload.userId), organizationId: String(payload.organizationId),
      role: payload.role as SessionIdentity['role'], email: String(payload.email),
    };
  } catch { return null; }
}

export async function requireSession(): Promise<SessionIdentity> {
  const identity = await getSession();
  if (!identity) throw new Error('UNAUTHORIZED');
  return identity;
}

export async function clearSession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}
