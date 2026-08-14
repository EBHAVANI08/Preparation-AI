import { NextResponse } from 'next/server';
import { z } from 'zod';
import { database } from '@/lib/server/mongodb';
import { requireSession } from '@/lib/server/session';
import { apiError } from '@/lib/server/api';
const schema = z.object({ examGoal: z.string().min(1).max(50).optional(), examGoals: z.array(z.string().min(1).max(50)).min(1).max(10).optional(), examDate: z.string().date().optional(), targetScore: z.number().finite().min(0).max(10000).optional() }).refine((d) => !d.examGoal || !d.examGoals || d.examGoals.includes(d.examGoal), 'Primary exam must be selected');
export async function PATCH(request: Request) { try { const i = await requireSession(); const updates = schema.parse(await request.json()); await (await database()).collection('users').updateOne({ id: i.userId }, { $set: { ...updates, updatedAt: new Date() } }); return NextResponse.json({ ok: true }); } catch (e) { if (e instanceof z.ZodError) return NextResponse.json({ error: e.issues[0]?.message || 'Invalid profile' }, { status: 400 }); return apiError(e); } }
