import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { database, ensureIndexes } from '@/lib/server/mongodb';
import { createSession } from '@/lib/server/session';
import { apiError } from '@/lib/server/api';

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8).max(128),
  type: z.enum(['school-11', 'school-12', 'ug', 'grad']),
  examGoals: z.array(z.string().min(1).max(50)).min(1).max(10),
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    await ensureIndexes();
    const db = await database();
    const existing = await db.collection('users').findOne({ email: input.email });
    if (existing) return NextResponse.json({ error: 'An account already exists for this email' }, { status: 409 });
    const now = new Date();
    const userId = randomUUID();
    const organizationId = randomUUID();
    await db.collection('organizations').insertOne({ id: organizationId, name: `${input.name}'s workspace`, slug: `personal-${userId}`, plan: 'free', createdAt: now });
    await db.collection('users').insertOne({ id: userId, name: input.name, email: input.email, passwordHash: await bcrypt.hash(input.password, 12), type: input.type, examGoal: input.examGoals[0], examGoals: input.examGoals, examDate: new Date(Date.now() + 120 * 86400000).toISOString().slice(0, 10), joinedAt: now.toISOString(), createdAt: now, updatedAt: now });
    await db.collection('memberships').insertOne({ id: randomUUID(), organizationId, userId, role: 'student', createdAt: now });
    await createSession({ userId, organizationId, role: 'student', email: input.email });
    return NextResponse.json({ user: { id: userId, name: input.name, email: input.email, type: input.type, examGoal: input.examGoals[0], examGoals: input.examGoals, examDate: new Date(Date.now() + 120 * 86400000).toISOString().slice(0, 10), joinedAt: now.toISOString() } }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.issues[0]?.message || 'Invalid account details' }, { status: 400 });
    return apiError(error);
  }
}
