'use client';

import { useMemo, useState } from 'react';
import {
  Sparkles,
  Gauge,
  Trophy,
  TrendingUp,
  Target,
  Brain,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Circle,
  Activity,
  Award,
  Clock,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { PageHeader, StatCard, SectionTitle } from '@/components/shared';
import { useStore } from '@/lib/store';
import { getPattern } from '@/lib/exams/patterns';
import { cn } from '@/lib/utils';

// ============================================================
// DigitalTwin
// ============================================================

export function DigitalTwin() {
  const user = useStore((s) => s.user);
  const attempts = useStore((s) => s.attempts);
  const setView = useStore((s) => s.setView);

  const examName = user ? (getPattern(user.examGoal)?.name || user.examGoal) : 'JEE Main';

  const sorted = useMemo(() => {
    return [...attempts].sort(
      (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
    );
  }, [attempts]);

  const latest = sorted[sorted.length - 1];
  const currentScorePct = latest ? latest.score / latest.totalMarks : 0.55;
  const currentScore = latest ? latest.score : 0;
  const totalMarks = latest?.totalMarks || 300;

  // Predicted trajectory: 30 / 60 / 90 days
  // Assume +0.4%/day if studying consistently, decay over time
  const trajectory = [
    { days: 0, score: currentScorePct },
    { days: 30, score: Math.min(0.95, currentScorePct + 0.08) },
    { days: 60, score: Math.min(0.95, currentScorePct + 0.14) },
    { days: 90, score: Math.min(0.95, currentScorePct + 0.18) },
  ];

  const failureRisk = Math.max(5, Math.round((1 - currentScorePct) * 60 - 10));
  const readinessScore = Math.round(currentScorePct * 1000);
  const trend = sorted.length >= 2
    ? (latest.score / latest.totalMarks) - (sorted[0].score / sorted[0].totalMarks)
    : 0;

  // Line chart SVG
  const w = 600, h = 220, pad = 30;
  const maxScore = 1;
  const linePts = trajectory.map((t, i) => ({
    x: pad + (i * (w - 2 * pad)) / (trajectory.length - 1),
    y: h - pad - (t.score * (h - 2 * pad)) / maxScore,
    ...t,
  }));
  const linePath = linePts.map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`)).join(' ');
  const areaPath = `${linePath} L ${linePts[linePts.length - 1].x},${h - pad} L ${linePts[0].x},${h - pad} Z`;

  const drivers = [
    { label: 'Strong topic mastery', impact: 'High', accent: 'emerald' as const },
    { label: 'Consistent mock practice', impact: 'High', accent: 'emerald' as const },
    { label: 'Weak: Calculus & Vectors', impact: 'Negative', accent: 'rose' as const },
    { label: 'Speed below target', impact: 'Medium', accent: 'amber' as const },
  ];

  const recommendations = [
    'Allocate 30% of daily study time to weak topics (Calculus, Vectors).',
    'Take one full-length mock every 3 days to maintain test stamina.',
    'Practise 10 timed numerical problems daily to improve speed.',
    'Use spaced repetition for organic chemistry reactions.',
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Sparkles}
        title="AI Digital Twin"
        subtitle="A simulation of your future academic self based on current trajectory"
        accent="emerald"
        right={<Badge className="bg-emerald-100 text-emerald-700 border-emerald-200"><Sparkles className="h-3 w-3" /> AI Powered</Badge>}
      />

      {/* Hero */}
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 via-teal-50 to-amber-50 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-stone-900">Meet your future self</h2>
              <p className="text-sm text-stone-700 mt-1">
                If you maintain your current pace, in <strong>90 days</strong> your projected{' '}
                <strong>{examName}</strong> score is{' '}
                <strong className="text-emerald-700">{(trajectory[3].score * 100).toFixed(1)}%</strong> — that's{' '}
                <strong>{Math.round(trajectory[3].score * totalMarks)}</strong> / {totalMarks}.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Current Score" value={`${currentScore}/${totalMarks}`} sub={`${(currentScorePct * 100).toFixed(1)}%`} icon={Target} accent="emerald" />
        <StatCard label="Trend" value={`${trend >= 0 ? '+' : ''}${(trend * 100).toFixed(1)}%`} sub={`${sorted.length} attempts`} icon={trend >= 0 ? TrendingUp : AlertTriangle} accent={trend >= 0 ? 'emerald' : 'rose'} />
        <StatCard label="Readiness" value={`${readinessScore}`} sub="/ 1000" icon={Gauge} accent="amber" />
        <StatCard label="Failure Risk" value={`${failureRisk}%`} sub={failureRisk < 30 ? 'Low' : failureRisk < 60 ? 'Medium' : 'High'} icon={AlertTriangle} accent={failureRisk < 30 ? 'emerald' : failureRisk < 60 ? 'amber' : 'rose'} />
      </div>

      {/* Trajectory chart */}
      <Card className="border-stone-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-emerald-600" /> Predicted Score Trajectory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
            <defs>
              <linearGradient id="twinGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Grid */}
            {[0, 0.25, 0.5, 0.75, 1].map((g) => {
              const y = h - pad - g * (h - 2 * pad);
              return (
                <g key={g}>
                  <line x1={pad} y1={y} x2={w - pad} y2={y} stroke="#e7e5e4" strokeWidth={1} />
                  <text x={4} y={y + 3} fontSize={9} fill="#a8a29e">{Math.round(g * 100)}%</text>
                </g>
              );
            })}
            {/* Area */}
            <path d={areaPath} fill="url(#twinGrad)" />
            {/* Line */}
            <path d={linePath} stroke="#059669" strokeWidth={2.5} fill="none" />
            {/* Points */}
            {linePts.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={4} fill="#059669" stroke="white" strokeWidth={2} />
                <text x={p.x} y={p.y - 10} fontSize={10} fill="#0f766e" textAnchor="middle" fontWeight="600">
                  {(p.score * 100).toFixed(0)}%
                </text>
                <text x={p.x} y={h - 8} fontSize={10} fill="#78716c" textAnchor="middle">{p.days}d</text>
              </g>
            ))}
          </svg>
        </CardContent>
      </Card>

      {/* Failure risk + drivers */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="border-rose-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-rose-800">
              <AlertTriangle className="h-4 w-4" /> Failure Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold text-rose-600">{failureRisk}%</span>
              <span className="text-sm text-muted-foreground">risk of missing your target</span>
            </div>
            <Progress value={failureRisk} className="bg-rose-100 [&>div]:bg-rose-500 h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              {failureRisk < 30
                ? 'You are on track — maintain consistency and you should hit your target.'
                : failureRisk < 60
                ? 'Moderate risk — increase study intensity and fix weak topics urgently.'
                : 'High risk — recommend a deep revision plan and daily mock practice.'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-stone-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-amber-600" /> Key Drivers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {drivers.map((d) => (
              <div key={d.label} className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50">
                <span className="text-sm text-stone-700">{d.label}</span>
                <Badge variant="outline" className={cn(
                  d.accent === 'emerald' && 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  d.accent === 'amber' && 'bg-amber-50 text-amber-700 border-amber-200',
                  d.accent === 'rose' && 'bg-rose-50 text-rose-700 border-rose-200',
                )}>{d.impact}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* AI recommendations */}
      <Card className="border-stone-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-4 w-4 text-amber-500" /> AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {recommendations.map((r, i) => (
            <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-100">
              <div className="h-6 w-6 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
              <p className="text-sm text-stone-700">{r}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-semibold text-stone-900">Want to improve your trajectory?</h4>
            <p className="text-sm text-muted-foreground mt-0.5">Get a personalised study plan based on this twin.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setView('mentor')}><Brain className="h-4 w-4" /> Ask Mentor</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setView('planner')}><Target className="h-4 w-4" /> Get Plan</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// ExamReadiness
// ============================================================

export function ExamReadiness() {
  const user = useStore((s) => s.user);
  const attempts = useStore((s) => s.attempts);
  const setView = useStore((s) => s.setView);

  const sorted = useMemo(() => [...attempts].sort(
    (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
  ), [attempts]);

  const latest = sorted[sorted.length - 1];
  const examName = user ? (getPattern(user.examGoal)?.name || user.examGoal) : 'JEE Main';

  // Readiness 0-1000
  const readiness = latest?.readinessIndex || 550;

  // 5 dimensions
  const dimensions = [
    { label: 'Knowledge', score: latest ? Math.round((latest.score / latest.totalMarks) * 100) : 55, accent: 'emerald' as const },
    { label: 'Accuracy', score: latest?.accuracy || 65, accent: 'teal' as const },
    { label: 'Speed', score: latest ? Math.min(100, Math.round(latest.speed * 4)) : 60, accent: 'amber' as const },
    { label: 'Consistency', score: sorted.length >= 2
      ? Math.max(20, 100 - Math.round(Math.abs((latest.score / latest.totalMarks) - (sorted[0].score / sorted[0].totalMarks)) * 200))
      : 50, accent: 'rose' as const },
    { label: 'Coverage', score: 70, accent: 'emerald' as const },
  ];

  const checklist = [
    { label: 'Solve 50 weak-topic problems', done: false },
    { label: 'Take 3 full mocks this week', done: false },
    { label: 'Revise formula sheet daily', done: true },
    { label: 'Practise 20 numerical problems', done: true },
    { label: 'Analyse last 3 mock mistakes', done: false },
    { label: 'Sleep 7+ hours consistently', done: true },
  ];

  const accentBar = {
    emerald: 'bg-emerald-500',
    teal: 'bg-teal-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Gauge}
        title="Exam Readiness Index"
        subtitle={`Multi-dimensional readiness for ${examName}`}
        accent="amber"
        right={<Badge className="bg-emerald-100 text-emerald-700 border-emerald-200"><Sparkles className="h-3 w-3" /> AI Powered</Badge>}
      />

      {/* Big readiness number */}
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className="relative h-36 w-36">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#e7e5e4" strokeWidth="10" />
                  <circle
                    cx="60" cy="60" r="50" fill="none" stroke="#059669" strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${(readiness / 1000) * 314} 314`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-emerald-700">{readiness}</span>
                  <span className="text-[10px] text-muted-foreground">/ 1000</span>
                </div>
              </div>
              <Badge className="mt-2 bg-emerald-100 text-emerald-700 border-emerald-200">
                {readiness >= 850 ? 'Exam Ready' : readiness >= 700 ? 'On Track' : readiness >= 500 ? 'Needs Work' : 'At Risk'}
              </Badge>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-stone-900">Your readiness score</h3>
              <p className="text-sm text-stone-700 mt-1">
                {readiness >= 850
                  ? 'You are exam-ready. Focus on consistency and stress management to peak on exam day.'
                  : readiness >= 700
                  ? 'Strong foundation — push weak topics and speed to cross 850.'
                  : readiness >= 500
                  ? 'Significant gaps. Prioritise weak topics, mock practice, and daily revision.'
                  : 'Major gaps detected. Consider a structured mentor-led plan urgently.'}
              </p>
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="bg-white rounded-lg p-2 border border-emerald-100">
                  <p className="text-[10px] text-muted-foreground uppercase">Knowledge</p>
                  <p className="text-sm font-semibold text-stone-800">{dimensions[0].score}/100</p>
                </div>
                <div className="bg-white rounded-lg p-2 border border-emerald-100">
                  <p className="text-[10px] text-muted-foreground uppercase">Accuracy</p>
                  <p className="text-sm font-semibold text-stone-800">{dimensions[1].score}/100</p>
                </div>
                <div className="bg-white rounded-lg p-2 border border-emerald-100">
                  <p className="text-[10px] text-muted-foreground uppercase">Speed</p>
                  <p className="text-sm font-semibold text-stone-800">{dimensions[2].score}/100</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5 dimensions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {dimensions.map((d) => (
          <Card key={d.label} className="border-stone-200 p-4">
            <p className="text-xs text-muted-foreground">{d.label}</p>
            <p className="text-2xl font-bold text-stone-900">{d.score}<span className="text-xs text-muted-foreground">/100</span></p>
            <div className="h-2 bg-stone-100 rounded-full overflow-hidden mt-2">
              <div className={cn('h-full rounded-full', accentBar[d.accent])} style={{ width: `${d.score}%` }} />
            </div>
          </Card>
        ))}
      </div>

      {/* Improvement checklist */}
      <Card className="border-stone-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4 text-emerald-600" /> Path to 850+ Readiness
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {checklist.map((c, i) => (
            <div key={i} className={cn(
              'flex items-center gap-3 p-3 rounded-lg border',
              c.done ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-stone-200'
            )}>
              {c.done ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-stone-300 flex-shrink-0" />
              )}
              <span className={cn('text-sm', c.done ? 'text-stone-500 line-through' : 'text-stone-800')}>{c.label}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-semibold text-stone-900">Need a personalised readiness boost?</h4>
            <p className="text-sm text-muted-foreground mt-0.5">Ask the AI mentor for a tailored plan to cross 850+.</p>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setView('mentor')}>
            <Brain className="h-4 w-4" /> Ask AI Mentor
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// RankPredictor
// ============================================================

export function RankPredictor() {
  const user = useStore((s) => s.user);
  const attempts = useStore((s) => s.attempts);
  const setView = useStore((s) => s.setView);

  const sorted = useMemo(() => [...attempts].sort(
    (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
  ), [attempts]);

  const latest = sorted[sorted.length - 1];
  const examName = user ? (getPattern(user.examGoal)?.name || user.examGoal) : 'JEE Main';

  const predictedRank = latest?.rank || 50000;
  const percentile = latest?.percentile || 75;
  const topRankerRank = 1;
  const topRankerPercentile = 100;

  // Trajectory (rank improving over attempts, reverse-chronological = best first)
  const rankTraj = sorted.slice().reverse().slice(0, 5).map((a) => a.rank).reverse();
  const trajData = rankTraj.length > 0 ? rankTraj : [80000, 70000, 60000, 55000];

  const w = 600, h = 220, pad = 30;
  const maxRank = Math.max(...trajData) * 1.1;
  const minRank = Math.min(...trajData) * 0.9;
  const linePts = trajData.map((r, i) => ({
    x: pad + (i * (w - 2 * pad)) / Math.max(1, trajData.length - 1),
    y: pad + ((r - minRank) / (maxRank - minRank)) * (h - 2 * pad),
    rank: r,
  }));
  // Lower rank = better, so plot inverted (lower y for lower rank)
  const invertedPts = trajData.map((r, i) => ({
    x: pad + (i * (w - 2 * pad)) / Math.max(1, trajData.length - 1),
    y: h - pad - ((r - minRank) / (maxRank - minRank)) * (h - 2 * pad),
    rank: r,
  }));
  const linePath = invertedPts.map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`)).join(' ');

  void linePts;

  const actionPlan = [
    'Improve weak topics to drop rank by 20% in next 30 days.',
    'Take 2 full mocks per week — analyse every mistake.',
    'Practise speed-solving 30 numerical problems daily.',
    'Join a mentor-led revision sprint for last-mile prep.',
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Trophy}
        title="AI Rank Predictor"
        subtitle={`Predicted All-India Rank for ${examName}`}
        accent="amber"
        right={<Badge className="bg-emerald-100 text-emerald-700 border-emerald-200"><Sparkles className="h-3 w-3" /> AI Powered</Badge>}
      />

      {/* Big predicted AIR */}
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-amber-700 font-medium uppercase">Predicted All-India Rank</p>
              <p className="text-4xl sm:text-5xl font-bold text-stone-900 mt-1">#{predictedRank.toLocaleString()}</p>
              <p className="text-sm text-stone-700 mt-1">
                Estimated percentile: <strong>{percentile}</strong> · {percentile >= 95 ? 'Top-tier engineering/medical colleges within reach.' : percentile >= 80 ? 'Solid — target mid-tier colleges.' : 'Needs significant improvement.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Context */}
      <div className="grid sm:grid-cols-3 gap-3">
        <StatCard label="Predicted Rank" value={`#${predictedRank.toLocaleString()}`} sub={`Percentile ${percentile}`} icon={Trophy} accent="amber" />
        <StatCard label="Top Ranker" value={`#${topRankerRank}`} sub={`Percentile ${topRankerPercentile}`} icon={Award} accent="emerald" />
        <StatCard label="Gap to Top" value={`${(predictedRank - topRankerRank).toLocaleString()}`} sub="ranks to close" icon={Target} accent="rose" />
      </div>

      {/* vs Top Ranker comparison */}
      <Card className="border-stone-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-amber-600" /> Where You Stand vs Top Ranker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: 'Score %', you: latest ? Math.round((latest.score / latest.totalMarks) * 100) : 55, top: 98, max: 100 },
            { label: 'Accuracy %', you: latest?.accuracy || 65, top: 95, max: 100 },
            { label: 'Speed (q/hr)', you: latest?.speed || 18, top: 35, max: 40 },
            { label: 'Mock Practice', you: attempts.length, top: 30, max: 35 },
          ].map((m) => (
            <div key={m.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-stone-700 font-medium">{m.label}</span>
                <span className="text-muted-foreground">You: {m.you} · Top: {m.top}</span>
              </div>
              <div className="relative h-3 bg-stone-100 rounded-full overflow-hidden">
                <div className="absolute h-full bg-emerald-500/40 rounded-full" style={{ width: `${(m.you / m.max) * 100}%` }} />
                <div className="absolute h-full bg-amber-500 rounded-full" style={{ width: `${(m.top / m.max) * 100}%`, opacity: 0.6 }} />
              </div>
            </div>
          ))}
          <div className="flex gap-3 text-xs text-muted-foreground mt-3">
            <span className="flex items-center gap-1"><span className="h-2 w-2 bg-emerald-500/40 rounded" /> You</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 bg-amber-500 rounded" /> Top Ranker</span>
          </div>
        </CardContent>
      </Card>

      {/* Rank trajectory chart */}
      <Card className="border-stone-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-emerald-600" /> Rank Trajectory (latest 5 attempts)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
            {[0, 0.25, 0.5, 0.75, 1].map((g) => {
              const y = pad + g * (h - 2 * pad);
              return <line key={g} x1={pad} y1={y} x2={w - pad} y2={y} stroke="#e7e5e4" strokeWidth={1} />;
            })}
            <path d={linePath} stroke="#f59e0b" strokeWidth={2.5} fill="none" />
            {invertedPts.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={4} fill="#f59e0b" stroke="white" strokeWidth={2} />
                <text x={p.x} y={p.y - 10} fontSize={10} fill="#92400e" textAnchor="middle" fontWeight="600">
                  #{p.rank.toLocaleString()}
                </text>
                <text x={p.x} y={h - 8} fontSize={9} fill="#78716c" textAnchor="middle">#{trajData.length - i}</text>
              </g>
            ))}
            <text x={4} y={pad + 4} fontSize={9} fill="#a8a29e">Better</text>
            <text x={4} y={h - pad} fontSize={9} fill="#a8a29e">Worse</text>
          </svg>
        </CardContent>
      </Card>

      {/* Action plan */}
      <Card className="border-stone-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4 text-emerald-600" /> Reach Your Target Rank
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {actionPlan.map((p, i) => (
            <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
              <div className="h-6 w-6 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
              <p className="text-sm text-stone-700">{p}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-amber-50">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-semibold text-stone-900">Want to fast-track your rank?</h4>
            <p className="text-sm text-muted-foreground mt-0.5">Get a mentor-led improvement plan.</p>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setView('mentor')}>
            <Brain className="h-4 w-4" /> Ask Mentor
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// SuccessSimulator
// ============================================================

export function SuccessSimulator() {
  const user = useStore((s) => s.user);
  const attempts = useStore((s) => s.attempts);
  const setView = useStore((s) => s.setView);

  const [hours, setHours] = useState(5);

  const examName = user ? (getPattern(user.examGoal)?.name || user.examGoal) : 'JEE Main';

  const latest = attempts[0];
  const currentScorePct = latest ? latest.score / latest.totalMarks : 0.55;

  // Predicted score: linear extrapolation from current
  // 1hr/day = +0.5% in 30 days, 5hr/day = +5%, 8hr/day = +9%, capped at 95%
  const predictedDelta = Math.min(0.40, hours * 0.012);
  const predictedScorePct = Math.min(0.95, currentScorePct + predictedDelta);
  const totalMarks = latest?.totalMarks || 300;
  const predictedScore = Math.round(predictedScorePct * totalMarks);

  const advice = hours < 3
    ? 'Low intensity — you may maintain your current level but unlikely to improve. Aim for at least 4 hours/day.'
    : hours < 6
    ? 'Moderate intensity — steady improvement expected. Add a full mock every 3rd day for faster gains.'
    : hours < 9
    ? 'High intensity — strong improvement trajectory. Make sure to balance with sleep and exercise to avoid burnout.'
    : 'Very high intensity — burnout risk is real. Cap at 9-10 hours of focused study with breaks; quality > quantity.';

  const comparisons = [
    { hours: 2, score: Math.min(0.95, currentScorePct + 0.024), label: 'Casual' },
    { hours: 5, score: Math.min(0.95, currentScorePct + 0.06), label: 'Balanced' },
    { hours: 8, score: Math.min(0.95, currentScorePct + 0.096), label: 'Intensive' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={TrendingUp}
        title="AI Success Simulator"
        subtitle="Simulate how your daily study hours translate into score gains"
        accent="amber"
        right={<Badge className="bg-emerald-100 text-emerald-700 border-emerald-200"><Sparkles className="h-3 w-3" /> AI Powered</Badge>}
      />

      {/* Hero with slider */}
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md flex-shrink-0">
              <Clock className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-stone-900 text-lg">Daily Study Hours</h3>
              <p className="text-sm text-stone-700">Drag the slider to see predicted outcomes for {examName}.</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-amber-700">{hours}<span className="text-base font-normal text-stone-600"> hr/day</span></p>
              <p className="text-xs text-muted-foreground">{hours * 7} hr/week</p>
            </div>
          </div>

          <Slider
            value={[hours]}
            min={1}
            max={12}
            step={1}
            onValueChange={(v) => setHours(v[0])}
            className="mb-2"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground px-1">
            <span>1 hr</span>
            <span>3</span>
            <span>5</span>
            <span>7</span>
            <span>9</span>
            <span>12 hr</span>
          </div>
        </CardContent>
      </Card>

      {/* Predicted score */}
      <div className="grid sm:grid-cols-3 gap-3">
        <StatCard label="Current Score" value={`${Math.round(currentScorePct * totalMarks)}/${totalMarks}`} sub={`${(currentScorePct * 100).toFixed(1)}%`} icon={Target} accent="emerald" />
        <StatCard label="Predicted Score" value={`${predictedScore}/${totalMarks}`} sub={`${(predictedScorePct * 100).toFixed(1)}%`} icon={TrendingUp} accent="amber" />
        <StatCard label="Improvement" value={`+${((predictedScorePct - currentScorePct) * 100).toFixed(1)}%`} sub="in 30 days" icon={Zap} accent="rose" />
      </div>

      {/* What this means */}
      <Card className="border-stone-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-4 w-4 text-amber-500" /> What This Means
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-stone-700">
            Studying <strong>{hours} hours/day</strong> with consistent focus could lift your{' '}
            <strong>{examName}</strong> score from{' '}
            <strong>{Math.round(currentScorePct * totalMarks)}</strong> to{' '}
            <strong className="text-emerald-700">{predictedScore}</strong> / {totalMarks} in 30 days.
          </p>
          <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-100 flex items-start gap-2">
            <Brain className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-stone-700">{advice}</p>
          </div>
        </CardContent>
      </Card>

      {/* Comparison bars */}
      <Card className="border-stone-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-emerald-600" /> Comparison: 2hr vs 5hr vs 8hr/day
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {comparisons.map((c) => {
            const isCurrent = c.hours === hours;
            return (
              <div key={c.hours}>
                <div className="flex justify-between text-xs mb-1">
                  <span className={cn('font-medium', isCurrent ? 'text-amber-700' : 'text-stone-700')}>
                    {c.hours} hr/day · {c.label} {isCurrent && '· your selection'}
                  </span>
                  <span className="text-muted-foreground">{(c.score * 100).toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', isCurrent ? 'bg-amber-500' : 'bg-emerald-400')}
                    style={{ width: `${c.score * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
          <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
            <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-amber-50">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-semibold text-stone-900">Ready to commit to {hours} hours/day?</h4>
            <p className="text-sm text-muted-foreground mt-0.5">Generate a structured study plan to match your commitment.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setView('mentor')}><Brain className="h-4 w-4" /> Ask Mentor</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setView('planner')}><Target className="h-4 w-4" /> Get Plan</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
