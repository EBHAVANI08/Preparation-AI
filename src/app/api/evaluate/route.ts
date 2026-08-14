import { NextResponse } from 'next/server';
import type {
  AnswerValue, ExamAttempt, QuestionResult, SubjectScore, TopicScore, YoutubeRec,
  GeneratedExam, BehaviorAnalysis,
} from '@/lib/types';
import { getVideosForTopic, searchUrlForTopic, thumbnailUrl, type YoutubeVideo } from '@/lib/youtube-data';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { database } from '@/lib/server/mongodb';
import { requireSession } from '@/lib/server/session';
import { apiError } from '@/lib/server/api';
import { scoreQuestion } from '@/modules/evaluation/score-question';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function uid(): string {
  return randomUUID();
}

const submissionSchema = z.object({
  exam: z.object({ id: z.string().uuid() }).passthrough(),
  answers: z.record(z.string(), z.unknown()).default({}),
  timeTaken: z.record(z.string(), z.number().finite().min(0).max(86400)).default({}),
});

export async function POST(request: Request) {
  try {
    const identity = await requireSession();
    const body = submissionSchema.parse(await request.json());
    const db = await database();
    const stored = await db.collection('attempts').findOne({ id: body.exam.id, userId: identity.userId, organizationId: identity.organizationId });
    if (!stored) return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    if (stored.status === 'submitted' && stored.result) return NextResponse.json({ attempt: stored.result });
    const exam = stored.exam as GeneratedExam;
    const deadline = new Date(exam.startedAt).getTime() + exam.durationSec * 1000 + 60_000;
    if (Date.now() > deadline) return NextResponse.json({ error: 'This attempt has expired' }, { status: 409 });
    const answers = body.answers as Record<string, AnswerValue>;
    const timeTaken = body.timeTaken;
    const attemptNumber: number = stored.attemptNumber || 1;
    const previousAttempt: ExamAttempt | null = await db.collection('attempts').findOne(
      { userId: identity.userId, 'result.examId': exam.examId, status: 'submitted', id: { $ne: exam.id } },
      { sort: { submittedAt: -1 }, projection: { result: 1 } },
    ).then((value) => value?.result as ExamAttempt | null);

    if (!exam || !exam.questions) {
      return NextResponse.json({ error: 'exam payload required' }, { status: 400 });
    }

    const results: QuestionResult[] = [];
    const subjectAgg: Record<string, { total: number; scored: number; correct: number; wrong: number; unattempted: number }> = {};
    const topicAgg: Record<string, { subject: string; topic: string; total: number; scored: number; correct: number }> = {};

    for (const q of exam.questions) {
      const ans = answers[q.id];
      const taken = timeTaken[q.id] ?? 60;
      const { correct, partial, awarded } = scoreQuestion(q, ans);

      results.push({
        questionId: q.id,
        subject: q.subject,
        topic: q.topic,
        difficulty: q.difficulty,
        correct,
        partial,
        awardedMarks: parseFloat(awarded.toFixed(2)),
        timeTakenSec: taken,
        confidence: correct ? 'high' : partial ? 'medium' : 'low',
      });

      if (!subjectAgg[q.subject]) subjectAgg[q.subject] = { total: 0, scored: 0, correct: 0, wrong: 0, unattempted: 0 };
      subjectAgg[q.subject].total += q.marks;
      subjectAgg[q.subject].scored += awarded;
      if (!ans || ans.type === 'unanswered') subjectAgg[q.subject].unattempted += 1;
      else if (correct) subjectAgg[q.subject].correct += 1;
      else subjectAgg[q.subject].wrong += 1;

      const tkey = `${q.subject}|${q.topic}`;
      if (!topicAgg[tkey]) topicAgg[tkey] = { subject: q.subject, topic: q.topic, total: 0, scored: 0, correct: 0 };
      topicAgg[tkey].total += q.marks;
      topicAgg[tkey].scored += awarded;
      if (correct) topicAgg[tkey].correct += 1;
    }

    const subjectScores: SubjectScore[] = Object.entries(subjectAgg).map(([subject, v]) => ({
      subject,
      total: v.total,
      scored: parseFloat(v.scored.toFixed(2)),
      correct: v.correct,
      wrong: v.wrong,
      unattempted: v.unattempted,
      accuracy: v.correct + v.wrong > 0 ? parseFloat(((v.correct / (v.correct + v.wrong)) * 100).toFixed(1)) : 0,
    }));

    const topicScores: TopicScore[] = Object.values(topicAgg).map((v) => ({
      subject: v.subject,
      topic: v.topic,
      total: v.total,
      scored: parseFloat(v.scored.toFixed(2)),
      correct: v.correct,
      accuracy: v.total > 0 ? parseFloat(((v.scored / v.total) * 100).toFixed(1)) : 0,
    }));

    const totalScored = subjectScores.reduce((a, s) => a + s.scored, 0);
    const totalMarks = exam.totalMarks;
    const attempted = results.filter((r) => r.awardedMarks !== 0 || r.correct).length;
    const correctCount = results.filter((r) => r.correct).length;
    const accuracy = attempted > 0 ? parseFloat(((correctCount / attempted) * 100).toFixed(1)) : 0;
    const totalTime = results.reduce((a, r) => a + r.timeTakenSec, 0);
    const avgTime = results.length > 0 ? Math.round(totalTime / results.length) : 0;
    const speed = totalTime > 0 ? parseFloat((results.length / (totalTime / 3600)).toFixed(1)) : 0;

    const weakTopics = topicScores
      .filter((t) => t.accuracy < 50 && t.total > 0)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 8)
      .map((t) => t.topic);
    const strongTopics = topicScores
      .filter((t) => t.accuracy >= 75 && t.total > 0)
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 5)
      .map((t) => t.topic);

    const youtubeRecs: YoutubeRec[] = [];
    const seen = new Set<string>();
    for (const topic of weakTopics) {
      const vids = getVideosForTopic(topic);
      const toAdd = vids.length > 0 ? vids : [
        { videoId: 'search', title: `Search YouTube for: ${topic}`, channel: 'YouTube Search', duration: '—' } as YoutubeVideo,
      ];
      for (const v of toAdd.slice(0, 3)) {
        const key = `${topic}|${v.videoId}`;
        if (seen.has(key)) continue;
        seen.add(key);
        youtubeRecs.push({
          topic,
          videoId: v.videoId,
          title: v.title,
          channel: v.channel,
          duration: v.duration,
          thumbnail: v.videoId === 'search' ? '' : thumbnailUrl(v.videoId),
          searchUrl: v.videoId === 'search' ? searchUrlForTopic(topic) : `https://www.youtube.com/watch?v=${v.videoId}`,
        });
      }
    }

    const pct = Math.max(1, Math.min(99.9, 50 + (totalScored / Math.max(1, totalMarks)) * 49));
    const rank = Math.max(1, Math.round((1 - pct / 100) * 1200000));
    const readinessIndex = Math.round((totalScored / Math.max(1, totalMarks)) * 1000);

    const behaviour = computeBehaviour(results, exam.startedAt);

    const attempt: ExamAttempt = {
      id: uid(),
      examId: exam.examId,
      examName: exam.examName,
      startedAt: exam.startedAt,
      submittedAt: new Date().toISOString(),
      durationSec: totalTime,
      answers,
      score: parseFloat(totalScored.toFixed(2)),
      totalMarks,
      percentile: parseFloat(pct.toFixed(2)),
      rank,
      subjectScores,
      topicScores,
      accuracy,
      speed,
      avgTimePerQuestion: avgTime,
      weakTopics,
      strongTopics,
      results,
      youtubeRecs,
      readinessIndex,
      attemptNumber,
      behavior: behaviour,
    };

    await db.collection('attempts').updateOne(
      { id: exam.id, userId: identity.userId, status: 'in_progress' },
      { $set: { status: 'submitted', submittedAt: new Date(), result: attempt, answers } },
    );
    return NextResponse.json({ attempt });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.issues[0]?.message || 'Invalid submission' }, { status: 400 });
    return apiError(e);
  }
}

function computeBehaviour(
  results: QuestionResult[],
  startedAt: string,
): BehaviorAnalysis {
  const subjectTimes: Record<string, number[]> = {};
  for (const r of results) {
    if (!subjectTimes[r.subject]) subjectTimes[r.subject] = [];
    subjectTimes[r.subject].push(r.timeTakenSec);
  }
  const avgTimeBySubject = Object.entries(subjectTimes).map(([subject, times]) => ({
    subject,
    avgSec: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
  }));

  const decileCount = 10;
  const bucketSize = Math.max(1, Math.ceil(results.length / decileCount));
  const speedProgression: { decile: number; avgSec: number }[] = [];
  for (let d = 0; d < decileCount; d++) {
    const start = d * bucketSize;
    const end = Math.min(results.length, start + bucketSize);
    if (start >= results.length) break;
    const slice = results.slice(start, end);
    const avg = slice.length > 0 ? Math.round(slice.reduce((a, r) => a + r.timeTakenSec, 0) / slice.length) : 0;
    speedProgression.push({ decile: d + 1, avgSec: avg });
  }

  let idleTimeSec = 0;
  let idlePauses = 0;
  for (const r of results) {
    if (r.timeTakenSec > 60) {
      idleTimeSec += r.timeTakenSec - 60;
      idlePauses += 1;
    }
  }

  const startHour = new Date(startedAt).getHours();
  let timeOfDay: BehaviorAnalysis['timeOfDay'];
  if (startHour < 5) timeOfDay = 'Night';
  else if (startHour < 9) timeOfDay = 'Early Morning';
  else if (startHour < 12) timeOfDay = 'Morning';
  else if (startHour < 17) timeOfDay = 'Afternoon';
  else if (startHour < 21) timeOfDay = 'Evening';
  else timeOfDay = 'Night';

  let paceTrend: BehaviorAnalysis['paceTrend'] = 'steady';
  if (speedProgression.length >= 2) {
    const first = speedProgression[0].avgSec;
    const last = speedProgression[speedProgression.length - 1].avgSec;
    const deltaPct = first > 0 ? (last - first) / first : 0;
    if (deltaPct < -0.15) paceTrend = 'speeding-up';
    else if (deltaPct > 0.15) paceTrend = 'slowing-down';
  }

  let hardSum = 0, hardN = 0, easySum = 0, easyN = 0;
  for (const r of results) {
    if (r.difficulty === 'hard') { hardSum += r.timeTakenSec; hardN++; }
    else if (r.difficulty === 'easy') { easySum += r.timeTakenSec; easyN++; }
  }
  const hardAvg = hardN > 0 ? hardSum / hardN : 0;
  const easyAvg = easyN > 0 ? easySum / easyN : 0;
  const difficultyTimeGap = Math.round(hardAvg - easyAvg);

  const rapidGuesses = results.filter((r) => r.timeTakenSec < 10).length;
  const answerChanges = 0;

  return {
    avgTimeBySubject,
    speedProgression,
    idleTimeSec,
    idlePauses,
    startedAtHour: startHour,
    timeOfDay,
    paceTrend,
    difficultyTimeGap,
    rapidGuesses,
    answerChanges,
  };
}
