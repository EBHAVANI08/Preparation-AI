import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { database } from '@/lib/server/mongodb';
import { createSession } from '@/lib/server/session';
import { apiError } from '@/lib/server/api';
import { rateLimit } from '@/lib/server/rate-limit';

const schema = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1).max(128) });

export async function POST(request: Request) {
  try {
    const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    if (!rateLimit(`login:${forwarded}`, 10, 15 * 60_000).allowed) return NextResponse.json({ error: 'Too many login attempts. Try later.' }, { status: 429 });
    const input = schema.parse(await request.json());
    const db = await database();
    const user = await db.collection('users').findOne({ email: input.email });
    if (!user || typeof user.passwordHash !== 'string' || !(await bcrypt.compare(input.password, user.passwordHash))) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    const membership = await db.collection('memberships').findOne({ userId: user.id });
    if (!membership) throw new Error('Membership missing');
    await createSession({ userId: user.id, organizationId: membership.organizationId, role: membership.role, email: user.email });
    const { passwordHash: _, _id: __, ...safeUser } = user;
    return NextResponse.json({ user: safeUser });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });
    return apiError(error);
  }
}
