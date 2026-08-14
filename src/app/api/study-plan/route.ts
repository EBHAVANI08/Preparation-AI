import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { database } from '@/lib/server/mongodb';
import { requireSession } from '@/lib/server/session';
import { apiError } from '@/lib/server/api';
const schema = z.object({ completedBlockIds: z.array(z.string().min(1).max(200)).max(500) });
export async function GET() { try { const i = await requireSession(); const plan = await (await database()).collection('study_plans').findOne({ userId: i.userId, organizationId: i.organizationId, status: 'active' }, { projection: { completedBlockIds: 1, _id: 0 } }); return NextResponse.json({ completedBlockIds: plan?.completedBlockIds || [] }); } catch (e) { return apiError(e); } }
export async function PATCH(request: Request) { try { const i = await requireSession(); const input = schema.parse(await request.json()); await (await database()).collection('study_plans').updateOne({ userId: i.userId, organizationId: i.organizationId, status: 'active' }, { $set: { completedBlockIds: input.completedBlockIds, updatedAt: new Date() }, $setOnInsert: { id: randomUUID(), userId: i.userId, organizationId: i.organizationId, status: 'active', createdAt: new Date() } }, { upsert: true }); return NextResponse.json({ ok: true, savedAt: new Date().toISOString() }); } catch (e) { if (e instanceof z.ZodError) return NextResponse.json({ error: 'Invalid study plan update' }, { status: 400 }); return apiError(e); } }
