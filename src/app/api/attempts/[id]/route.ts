import { NextResponse } from 'next/server';
import { z } from 'zod';
import { database } from '@/lib/server/mongodb';
import { requireSession } from '@/lib/server/session';
import { apiError } from '@/lib/server/api';
import { toPublicExam } from '@/lib/exams/public-exam';
export const dynamic = 'force-dynamic';

const schema = z.object({ answers: z.record(z.string(), z.unknown()), timeTaken: z.record(z.string(), z.number().finite().min(0).max(86400)), currentQuestion: z.number().int().min(0).optional() });
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) { try { const i = await requireSession(); const { id } = await context.params; const attempt = await (await database()).collection('attempts').findOne({ id, userId: i.userId, organizationId: i.organizationId }, { projection: { exam: 1, status: 1, draftAnswers: 1, draftTimeTaken: 1, currentQuestion: 1, result: 1, _id: 0 } }); if (!attempt) return NextResponse.json({ error: 'Attempt not found' }, { status: 404 }); const exam = attempt.exam ? { ...toPublicExam(attempt.exam), draftAnswers: attempt.draftAnswers || {}, draftTimeTaken: attempt.draftTimeTaken || {}, currentQuestion: attempt.currentQuestion || 0 } : undefined; return NextResponse.json({ ...attempt, exam }); } catch (e) { return apiError(e); } }
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) { try { const i = await requireSession(); const { id } = await context.params; const input = schema.parse(await request.json()); const result = await (await database()).collection('attempts').updateOne({ id, userId: i.userId, organizationId: i.organizationId, status: 'in_progress' }, { $set: { draftAnswers: input.answers, draftTimeTaken: input.timeTaken, currentQuestion: input.currentQuestion, lastSavedAt: new Date() } }); if (!result.matchedCount) return NextResponse.json({ error: 'Active attempt not found' }, { status: 404 }); return NextResponse.json({ ok: true, savedAt: new Date().toISOString() }); } catch (e) { if (e instanceof z.ZodError) return NextResponse.json({ error: 'Invalid autosave payload' }, { status: 400 }); return apiError(e); } }
