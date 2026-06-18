import { NextResponse } from 'next/server';
import { getPattern } from '@/lib/exams/patterns';
import { generateExam, signature } from '@/lib/exams/generator';
import type { GeneratedExam } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { examId, seenSignatures = [], attemptNumber = 1 } = await request.json();
    if (!examId) {
      return NextResponse.json({ error: 'examId is required' }, { status: 400 });
    }
    const pattern = getPattern(examId);
    if (!pattern) {
      return NextResponse.json({ error: 'Unknown exam' }, { status: 404 });
    }

    const seenSet = new Set<string>(Array.isArray(seenSignatures) ? seenSignatures : []);
    const { questions, sections } = generateExam(pattern, seenSet);

    const newSignatures = questions.map((q) => signature(q.text));

    const exam: GeneratedExam = {
      id: `exam_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      examId: pattern.id,
      examName: pattern.name,
      durationSec: pattern.durationSec,
      totalMarks: pattern.totalMarks,
      startedAt: new Date().toISOString(),
      questions,
      sections,
    };

    return NextResponse.json({ ...exam, _newSignatures: newSignatures, _attemptNumber: attemptNumber });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
