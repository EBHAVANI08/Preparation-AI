import { NextResponse } from 'next/server';
import { getPattern } from '@/lib/exams/patterns';
import { generateExam, signature } from '@/lib/exams/generator';
import type { GeneratedExam } from '@/lib/types';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { database } from '@/lib/server/mongodb';
import { requireSession } from '@/lib/server/session';
import { apiError } from '@/lib/server/api';
import { rateLimit } from '@/lib/server/rate-limit';
import { toPublicExam } from '@/lib/exams/public-exam';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const inputSchema = z.object({
  examId: z.string().min(1).max(50),
  seenSignatures: z.array(z.string().max(500)).max(2000).default([]),
  attemptNumber: z.number().int().min(1).max(10000).default(1),
  difficulty: z.enum(['balanced', 'easy', 'hard']).default('balanced'),
  durationMinutes: z.number().int().min(15).max(360).optional(),
});

export async function POST(request: Request) {
  try {
    const identity = await requireSession();
    if (!rateLimit(`exam:${identity.userId}`, 20, 60_000).allowed) return NextResponse.json({ error: 'Too many exam requests' }, { status: 429 });
    const { examId, seenSignatures, attemptNumber, durationMinutes } = inputSchema.parse(await request.json());
    const pattern = getPattern(examId);
    if (!pattern) {
      return NextResponse.json({ error: 'Unknown exam' }, { status: 404 });
    }

    const seenSet = new Set<string>(Array.isArray(seenSignatures) ? seenSignatures : []);
    const { questions, sections } = generateExam(pattern, seenSet);

    const newSignatures = questions.map((q) => signature(q.text));

    const exam: GeneratedExam = {
      id: randomUUID(),
      examId: pattern.id,
      examName: pattern.name,
      durationSec: durationMinutes ? Math.min(pattern.durationSec, durationMinutes * 60) : pattern.durationSec,
      totalMarks: pattern.totalMarks,
      startedAt: new Date().toISOString(),
      questions,
      sections,
    };

    await (await database()).collection('attempts').insertOne({
      id: exam.id, userId: identity.userId, organizationId: identity.organizationId,
      status: 'in_progress', exam, attemptNumber, createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 86400000),
    });

    const publicExam = toPublicExam(exam);

    return NextResponse.json({ ...publicExam, _newSignatures: newSignatures, _attemptNumber: attemptNumber });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.issues[0]?.message || 'Invalid request' }, { status: 400 });
    return apiError(e);
  }
}
