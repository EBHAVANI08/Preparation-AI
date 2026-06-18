'use client';

import * as React from 'react';
import {
  Sparkles,
  Star,
  Target,
  Trophy,
  Award,
  Gauge,
  Activity,
  FileText,
  BarChart3,
  MessageSquare,
  UserCog,
  Radar,
  Briefcase,
  GraduationCap,
  CalendarDays,
  HeartPulse,
  ChevronRight,
  PlayCircle,
  Lightbulb,
  Settings2,
  TrendingUp,
  Flame,
  Brain,
  ArrowUpRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useStore, userExamGoals } from '@/lib/store';
import { getPattern } from '@/lib/exams/patterns';
import { StatCard } from '@/components/shared';
import { FeatureCard, type FeatureAccent } from './feature-card';
import { ExamCountdownCard } from './exam-countdown-card';
import { ManageExamsDialog } from './manage-exams-dialog';
import { DailyPlanModal } from './daily-plan-modal';
import type { View } from '@/lib/types';

interface FeatureDef {
  view: View;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  accent: FeatureAccent;
  badge?: string;
  detailTitle?: string;
  detailDescription?: string;
  detailBody?: React.ReactNode;
  ctaLabel?: string;
}

const FEATURES: FeatureDef[] = [
  {
    view: 'mock-exam',
    icon: FileText,
    title: 'Mock Exam Engine',
    subtitle: 'Real-pattern papers, AI-generated, with cross-attempt deduplication.',
    accent: 'emerald',
    badge: 'AI',
    detailTitle: 'Mock Exam Engine',
    detailDescription: 'Take full-length, syllabus-weighted mock exams in real exam patterns.',
    detailBody: (
      <ul className="space-y-1.5">
        <li>• 17 exam patterns supported (JEE, NEET, GRE, GMAT, GATE, UPSC, SAT, IELTS, TOEFL and more)</li>
        <li>• Cross-attempt question signature dedup so you never see the same question twice</li>
        <li>• Subject-wise timing, confidence tagging, and negative marking</li>
        <li>• Auto-evaluation with percentile + rank estimation</li>
      </ul>
    ),
    ctaLabel: 'Start a mock',
  },
  {
    view: 'analytics',
    icon: BarChart3,
    title: 'Performance Analytics',
    subtitle: 'Subject-wise breakdown, accuracy trends, and behaviour insights.',
    accent: 'teal',
    detailTitle: 'Performance Analytics',
    detailDescription: 'Deep insights into your attempt history.',
    detailBody: (
      <ul className="space-y-1.5">
        <li>• Subject-wise score, accuracy, and time distribution</li>
        <li>• Behaviour analysis: pace trend, rapid guesses, answer changes</li>
        <li>• Per-question time spent with confidence levels</li>
        <li>• Compare attempts side-by-side</li>
      </ul>
    ),
  },
  {
    view: 'mentor',
    icon: MessageSquare,
    title: 'AI Mentor Room',
    subtitle: '24/7 chat with GLM-4.6 — concepts, strategy, motivation.',
    accent: 'emerald',
    badge: 'Live',
    detailTitle: 'AI Mentor Room',
    detailDescription: 'Chat with your personal academic mentor anytime.',
    detailBody: (
      <ul className="space-y-1.5">
        <li>• Ask concept doubts, get step-by-step explanations</li>
        <li>• Personalised score-improvement strategy</li>
        <li>• Stress & burnout support</li>
        <li>• Time-management & study planning advice</li>
      </ul>
    ),
  },
  {
    view: 'digital-twin',
    icon: UserCog,
    title: 'Digital Twin',
    subtitle: 'A virtual clone of you that simulates attempts and predicts outcomes.',
    accent: 'teal',
    badge: 'New',
    detailTitle: 'Digital Twin',
    detailDescription: 'Your AI replica for safe experiments.',
    detailBody: (
      <ul className="space-y-1.5">
        <li>• Builds a behavioural model from your past attempts</li>
        <li>• Simulates how you would perform under different strategies</li>
        <li>• Identifies optimal attempt ordering & time allocation</li>
      </ul>
    ),
  },
  {
    view: 'success-simulator',
    icon: Sparkles,
    title: 'Success Simulator',
    subtitle: 'What-if scenarios: if you score X, what ranks & colleges open up?',
    accent: 'amber',
    detailTitle: 'Success Simulator',
    detailDescription: 'Map scores to outcomes.',
    detailBody: (
      <ul className="space-y-1.5">
        <li>• Score → Percentile → Rank → College chain</li>
        <li>• Compare target vs. projected scores</li>
        <li>• Identify the gap you need to close</li>
      </ul>
    ),
  },
  {
    view: 'readiness',
    icon: Gauge,
    title: 'Readiness Index',
    subtitle: 'A single 0-100 score combining accuracy, coverage & consistency.',
    accent: 'emerald',
    detailTitle: 'Readiness Index',
    detailDescription: 'Your exam readiness in one number.',
    detailBody: (
      <ul className="space-y-1.5">
        <li>• Composite of accuracy, syllabus coverage, and consistency</li>
        <li>• Tracks progress week-over-week</li>
        <li>• Tells you exactly when you are exam-ready</li>
      </ul>
    ),
  },
  {
    view: 'rank-predictor',
    icon: Trophy,
    title: 'Rank Predictor',
    subtitle: 'Estimate your rank from the latest mock score & percentile.',
    accent: 'amber',
    detailTitle: 'Rank Predictor',
    detailDescription: 'Forecast your all-India rank.',
    detailBody: (
      <ul className="space-y-1.5">
        <li>• Uses historical normalised distributions</li>
        <li>• Confidence bands on predictions</li>
        <li>• Compares across attempts</li>
      </ul>
    ),
  },
  {
    view: 'university-predictor',
    icon: GraduationCap,
    title: 'University Predictor',
    subtitle: 'See which colleges your projected rank makes you eligible for.',
    accent: 'teal',
    detailTitle: 'University Predictor',
    detailDescription: 'College shortlist from your rank.',
    detailBody: (
      <ul className="space-y-1.5">
        <li>• Match your rank to college cutoffs</li>
        <li>• Filter by location, fees, branch</li>
        <li>• Save favourites for later</li>
      </ul>
    ),
  },
  {
    view: 'weakness-radar',
    icon: Radar,
    title: 'Weakness Radar',
    subtitle: 'Detect weak topics and fix them with curated YouTube lessons.',
    accent: 'rose',
    detailTitle: 'Weakness Radar',
    detailDescription: 'Find & fix weak topics.',
    detailBody: (
      <ul className="space-y-1.5">
        <li>• Topic-level accuracy heatmaps</li>
        <li>• Curated YouTube video recommendations per weak topic</li>
        <li>• Track fix progress over time</li>
      </ul>
    ),
  },
  {
    view: 'career',
    icon: Briefcase,
    title: 'Career Guide',
    subtitle: 'Explore careers — salaries, demand, future scope, recruiters.',
    accent: 'amber',
    detailTitle: 'Career Guide',
    detailDescription: 'Plan beyond the exam.',
    detailBody: (
      <ul className="space-y-1.5">
        <li>• 20+ career paths with deep profiles</li>
        <li>• Salary, demand forecast, work-life balance</li>
        <li>• Skill requirements & top recruiters</li>
      </ul>
    ),
  },
  {
    view: 'university',
    icon: GraduationCap,
    title: 'University Finder',
    subtitle: 'Search 30+ global universities by ranking, fees, country.',
    accent: 'emerald',
    detailTitle: 'University Finder',
    detailDescription: 'Discover universities worldwide.',
    detailBody: (
      <ul className="space-y-1.5">
        <li>• Filter by country, ranking, fees, acceptance rate</li>
        <li>• Scholarships & accommodation details</li>
        <li>• Visa & employment rate insights</li>
      </ul>
    ),
  },
  {
    view: 'scholarship',
    icon: Award,
    title: 'Scholarship Engine',
    subtitle: 'Match scholarships to your profile, country, and level.',
    accent: 'amber',
    detailTitle: 'Scholarship Engine',
    detailDescription: 'Fund your education.',
    detailBody: (
      <ul className="space-y-1.5">
        <li>• Curated scholarships across 10+ countries</li>
        <li>• Filter by eligibility, deadline, level</li>
        <li>• Direct application links</li>
      </ul>
    ),
  },
  {
    view: 'planner',
    icon: CalendarDays,
    title: 'Study Planner',
    subtitle: 'Daily, weekly, monthly & revision plans — AI-personalised.',
    accent: 'teal',
    detailTitle: 'Study Planner',
    detailDescription: 'Structured study schedules.',
    detailBody: (
      <ul className="space-y-1.5">
        <li>• Daily / weekly / monthly / revision / mock plan templates</li>
        <li>• AI-generated plans tuned to your weak topics</li>
        <li>• Drag-and-drop time blocks</li>
      </ul>
    ),
  },
  {
    view: 'counsellor',
    icon: HeartPulse,
    title: 'Wellness Counsellor',
    subtitle: 'Stress, sleep, focus, motivation — your mental wellness ally.',
    accent: 'rose',
    detailTitle: 'Wellness Counsellor',
    detailDescription: 'Stay mentally sharp.',
    detailBody: (
      <ul className="space-y-1.5">
        <li>• Daily mood & energy check-ins</li>
        <li>• Burnout risk detection from behaviour patterns</li>
        <li>• Guided breathing & focus exercises</li>
      </ul>
    ),
  },
  {
    view: 'analytics',
    icon: Activity,
    title: 'Behaviour Insights',
    subtitle: 'Pace, idle time, guess patterns — your hidden exam habits.',
    accent: 'rose',
    detailTitle: 'Behaviour Insights',
    detailDescription: 'See how you actually attempt exams.',
    detailBody: (
      <ul className="space-y-1.5">
        <li>• Speed progression across the paper</li>
        <li>• Idle pauses and rapid-guess detection</li>
        <li>• Difficulty-vs-time gap analysis</li>
      </ul>
    ),
  },
];

function daysToExam(examDate?: string): number {
  if (!examDate) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(examDate);
  target.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((target.getTime() - today.getTime()) / 86400000));
}

function ReadinessRing({ value }: { value: number }) {
  const radius = 32;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (Math.min(100, Math.max(0, value)) / 100) * circ;
  const color = value >= 75 ? '#10b981' : value >= 50 ? '#f59e0b' : '#f43f5e';
  return (
    <div className="relative h-20 w-20 flex-shrink-0">
      <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="60%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        <circle cx="40" cy="40" r={radius} stroke="#f5f5f4" strokeWidth="6" fill="none" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="url(#ring-grad)"
          strokeWidth="6"
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold tabular-nums text-stone-900">{value}</span>
        <span className="text-[9px] text-muted-foreground uppercase tracking-wider">ready</span>
      </div>
      <span
        className="absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

function ScoreTrendCard({ scores }: { scores: { label: string; value: number }[] }) {
  if (scores.length === 0) {
    return (
      <Card className="p-5 border-stone-200 h-full">
        <p className="text-sm font-semibold text-stone-900 mb-2 flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-emerald-600" /> Score trend
        </p>
        <p className="text-xs text-muted-foreground">No attempts yet. Take your first mock to see your trend.</p>
      </Card>
    );
  }

  const max = Math.max(...scores.map((s) => s.value), 1);
  const min = Math.min(...scores.map((s) => s.value), 0);
  const range = Math.max(max - min, 1);
  const w = 240;
  const h = 80;
  const pts = scores.map((s, i) => {
    const x = (i / Math.max(scores.length - 1, 1)) * w;
    const y = h - ((s.value - min) / range) * h;
    return { x, y, ...s };
  });
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const area = `${path} L${w},${h} L0,${h} Z`;

  return (
    <Card className="p-5 border-stone-200 h-full">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-emerald-600" /> Score trend
        </p>
        <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700">
          <ArrowUpRight className="h-3 w-3" /> {scores.length} attempts
        </Badge>
      </div>
      <div className="flex items-end gap-1">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-20" preserveAspectRatio="none">
          <defs>
            <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#area-grad)" />
          <path d={path} fill="none" stroke="#10b981" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          {pts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#047857" />
          ))}
        </svg>
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
        {scores.map((s, i) => (
          <span key={i}>{s.label}</span>
        ))}
      </div>
    </Card>
  );
}

export function Dashboard() {
  const user = useStore((s) => s.user);
  const attempts = useStore((s) => s.attempts);
  const setView = useStore((s) => s.setView);
  const [manageOpen, setManageOpen] = React.useState(false);

  if (!user) return null;

  const goals = userExamGoals(user);
  const primaryPattern = getPattern(user.examGoal);
  const days = daysToExam(user.examDate);

  // Stats
  const avgScore =
    attempts.length > 0
      ? Math.round(attempts.reduce((a, t) => a + (t.score / Math.max(t.totalMarks, 1)) * 100, 0) / attempts.length)
      : 0;
  const mocksTaken = attempts.length;
  const bestPercentile = attempts.length > 0 ? Math.max(...attempts.map((t) => t.percentile)) : 0;
  const avgAccuracy =
    attempts.length > 0
      ? Math.round(attempts.reduce((a, t) => a + t.accuracy, 0) / attempts.length)
      : 0;
  const readiness = Math.min(100, Math.round((avgScore + avgAccuracy) / 2));

  // Latest weak topics
  const latest = attempts[0];
  const weakTopics = latest?.weakTopics?.slice(0, 4) ?? [];

  const scorePoints = attempts
    .slice(0, 6)
    .reverse()
    .map((a, i) => ({ label: `A${i + 1}`, value: Math.round((a.score / Math.max(a.totalMarks, 1)) * 100) }));

  return (
    <div className="space-y-6">
      {/* Hero card */}
      <Card className="bg-hero-emerald border-stone-200 overflow-hidden">
        <CardContent className="p-5 sm:p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200">
                  <Target className="h-3 w-3" /> {goals.length} target exam{goals.length === 1 ? '' : 's'}
                </Badge>
                <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700">
                  <CalendarDays className="h-3 w-3" /> {days} days to {primaryPattern?.name ?? 'exam'}
                </Badge>
                {latest && (
                  <Badge variant="outline" className="bg-stone-50 border-stone-200 text-stone-600">
                    Last mock: {latest.percentile} percentile
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
                Welcome back, <span className="text-gradient-emerald">{user.name.split(' ')[0]}</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                You're preparing for <span className="font-medium text-stone-700">{primaryPattern?.name}</span>
                {goals.length > 1 && (
                  <> and {goals.length - 1} more exam{goals.length === 2 ? '' : 's'}</>
                )}
                . Stay consistent — small daily reps compound into exam-day confidence.
              </p>

              {/* Target exam chips */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {goals.map((id) => {
                  const p = getPattern(id);
                  if (!p) return null;
                  const isPrimary = id === user.examGoal;
                  return (
                    <span
                      key={id}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium border',
                        isPrimary
                          ? 'bg-amber-50 border-amber-300 text-amber-700'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      )}
                    >
                      {isPrimary && <Star className="h-3 w-3 fill-amber-500 text-amber-500" />}
                      {p.name}
                    </span>
                  );
                })}
                <button
                  onClick={() => setManageOpen(true)}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium border border-stone-300 text-stone-600 hover:border-emerald-300 hover:text-emerald-700 transition"
                >
                  <Settings2 className="h-3 w-3" /> Manage
                </button>
              </div>

              {/* Action buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={() => setView('mock-exam')} className="bg-emerald-600 hover:bg-emerald-700">
                  <PlayCircle className="h-4 w-4" /> Start Mock
                </Button>
                <Button variant="outline" onClick={() => setView('mentor')} className="border-emerald-300">
                  <MessageSquare className="h-4 w-4" /> Ask Mentor
                </Button>
                <Button variant="ghost" onClick={() => setManageOpen(true)}>
                  <Settings2 className="h-4 w-4" /> Manage Exams
                </Button>
              </div>
            </div>

            {/* Readiness ring */}
            <div className="flex flex-col items-center justify-center gap-2 lg:border-l lg:border-stone-200 lg:pl-6">
              <ReadinessRing value={readiness} />
              <p className="text-xs text-center text-muted-foreground max-w-[160px]">
                {readiness >= 75
                  ? 'You are exam-ready. Keep refining.'
                  : readiness >= 50
                  ? 'Steady progress. Push weak topics.'
                  : 'Build fundamentals. Take more mocks.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Avg Score" value={`${avgScore}%`} sub="across all mocks" icon={TrendingUp} accent="emerald" />
        <StatCard label="Mocks Taken" value={mocksTaken} sub="last 30 days" icon={FileText} accent="teal" />
        <StatCard label="Best Percentile" value={bestPercentile} sub="all-time" icon={Trophy} accent="amber" />
        <StatCard label="Accuracy" value={`${avgAccuracy}%`} sub="average" icon={Target} accent="rose" />
      </div>

      {/* Countdown + trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ExamCountdownCard focusArea={weakTopics[0]} streak={mocksTaken > 0 ? Math.min(mocksTaken, 7) : 0} />
        <ScoreTrendCard scores={scorePoints} />
      </div>

      {/* Feature grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-600" /> AI Agents
            </h2>
            <p className="text-sm text-muted-foreground">Eleven specialised agents, one workspace.</p>
          </div>
          <Badge variant="outline" className="bg-stone-50 border-stone-200 text-stone-600">
            {FEATURES.length} tools
          </Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FEATURES.map((f) => (
            <FeatureCard
              key={f.title}
              icon={f.icon}
              title={f.title}
              subtitle={f.subtitle}
              accent={f.accent}
              badge={f.badge}
              detailTitle={f.detailTitle}
              detailDescription={f.detailDescription}
              detailBody={f.detailBody}
              ctaLabel={f.ctaLabel}
              onClick={() => setView(f.view)}
            />
          ))}
        </div>
      </div>

      {/* Today's focus + Quick start */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5 border-stone-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-stone-900 flex items-center gap-1.5">
              <Lightbulb className="h-4 w-4 text-amber-500" /> Today's focus
            </h3>
            {latest && (
              <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700">
                from latest mock
              </Badge>
            )}
          </div>
          {weakTopics.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Based on your latest attempt, focus on these weak topics:
              </p>
              <div className="space-y-1.5">
                {weakTopics.map((t, i) => (
                  <div
                    key={t}
                    className="flex items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 p-2.5"
                  >
                    <span className="h-6 w-6 rounded-md bg-rose-100 text-rose-600 text-xs font-semibold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm text-stone-800">{t}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs text-emerald-700 hover:text-emerald-800"
                      onClick={() => setView('weakness-radar')}
                    >
                      Fix <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Brain className="h-8 w-8 mx-auto text-stone-300 mb-2" />
              <p className="text-sm text-muted-foreground">
                Take a mock exam to get personalised weak-topic recommendations.
              </p>
              <Button size="sm" className="mt-3 bg-emerald-600 hover:bg-emerald-700" onClick={() => setView('mock-exam')}>
                <PlayCircle className="h-3.5 w-3.5" /> Take first mock
              </Button>
            </div>
          )}
        </Card>

        <Card className="p-5 border-stone-200 bg-gradient-to-br from-emerald-50 to-teal-50">
          <h3 className="font-semibold text-stone-900 flex items-center gap-1.5 mb-3">
            <Flame className="h-4 w-4 text-rose-500" /> Quick start
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setView('mock-exam')}
              className="rounded-lg border border-stone-200 bg-white p-3 text-left hover:border-emerald-300 hover:bg-emerald-50/30 transition card-lift"
            >
              <FileText className="h-5 w-5 text-emerald-600 mb-1.5" />
              <p className="text-sm font-semibold text-stone-900">Take a mock</p>
              <p className="text-[11px] text-muted-foreground">Full-length, AI-generated</p>
            </button>
            <button
              onClick={() => setView('mentor')}
              className="rounded-lg border border-stone-200 bg-white p-3 text-left hover:border-emerald-300 hover:bg-emerald-50/30 transition card-lift"
            >
              <MessageSquare className="h-5 w-5 text-teal-600 mb-1.5" />
              <p className="text-sm font-semibold text-stone-900">Ask mentor</p>
              <p className="text-[11px] text-muted-foreground">Doubts, strategy, motivation</p>
            </button>
            <button
              onClick={() => setView('weakness-radar')}
              className="rounded-lg border border-stone-200 bg-white p-3 text-left hover:border-emerald-300 hover:bg-emerald-50/30 transition card-lift"
            >
              <Radar className="h-5 w-5 text-rose-600 mb-1.5" />
              <p className="text-sm font-semibold text-stone-900">Fix weaknesses</p>
              <p className="text-[11px] text-muted-foreground">YouTube-curated fixes</p>
            </button>
            <button
              onClick={() => setView('planner')}
              className="rounded-lg border border-stone-200 bg-white p-3 text-left hover:border-emerald-300 hover:bg-emerald-50/30 transition card-lift"
            >
              <CalendarDays className="h-5 w-5 text-amber-600 mb-1.5" />
              <p className="text-sm font-semibold text-stone-900">Plan today</p>
              <p className="text-[11px] text-muted-foreground">AI-personalised schedule</p>
            </button>
          </div>
        </Card>
      </div>

      {/* Dialogs */}
      <ManageExamsDialog open={manageOpen} onOpenChange={setManageOpen} />
      <DailyPlanModal />
    </div>
  );
}
