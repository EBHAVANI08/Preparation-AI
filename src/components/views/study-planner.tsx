'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  RotateCcw,
  Clock,
  CheckCircle2,
  Circle,
  Target,
  BookOpen,
  Brain,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader, SectionTitle } from '@/components/shared';
import { STUDY_PLAN_TEMPLATES } from '@/lib/study-plan-templates';
import { useStore } from '@/lib/store';
import { getPattern } from '@/lib/exams/patterns';
import { cn } from '@/lib/utils';
import type { StudyPlan } from '@/lib/types';

const TABS: { id: StudyPlan['type']; label: string }[] = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'revision', label: 'Revision' },
  { id: 'mock', label: 'Mock Schedule' },
  { id: 'priority', label: 'Priority Matrix' },
];

const SUBJECT_COLORS: Record<string, string> = {
  Physics: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Chemistry: 'bg-teal-100 text-teal-700 border-teal-200',
  Mathematics: 'bg-amber-100 text-amber-700 border-amber-200',
  Math: 'bg-amber-100 text-amber-700 border-amber-200',
  Biology: 'bg-rose-100 text-rose-700 border-rose-200',
  Botany: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Zoology: 'bg-rose-100 text-rose-700 border-rose-200',
  English: 'bg-stone-100 text-stone-700 border-stone-200',
  Mock: 'bg-rose-100 text-rose-700 border-rose-200',
  Revision: 'bg-amber-100 text-amber-700 border-amber-200',
  Practice: 'bg-teal-100 text-teal-700 border-teal-200',
  Break: 'bg-stone-100 text-stone-500 border-stone-200',
  Routine: 'bg-stone-100 text-stone-500 border-stone-200',
};

function subjectBadgeClass(subject: string): string {
  // Try exact match first, then partial match
  if (SUBJECT_COLORS[subject]) return SUBJECT_COLORS[subject];
  for (const key of Object.keys(SUBJECT_COLORS)) {
    if (subject.toLowerCase().includes(key.toLowerCase())) return SUBJECT_COLORS[key];
  }
  return 'bg-stone-100 text-stone-700 border-stone-200';
}

export function StudyPlanner() {
  const user = useStore((s) => s.user);
  const attempts = useStore((s) => s.attempts);
  const setView = useStore((s) => s.setView);

  const [activeTab, setActiveTab] = useState<StudyPlan['type']>('daily');
  const [doneBlocks, setDoneBlocks] = useState<Set<string>>(new Set());
  const [planLoaded, setPlanLoaded] = useState(false);

  useEffect(() => { fetch('/api/study-plan').then((r) => r.ok ? r.json() : null).then((b) => { if (b) setDoneBlocks(new Set(b.completedBlockIds)); setPlanLoaded(true); }).catch(() => setPlanLoaded(true)); }, []);
  useEffect(() => { if (!planLoaded) return; const timer = setTimeout(() => { fetch('/api/study-plan', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ completedBlockIds: [...doneBlocks] }) }).catch(() => undefined); }, 500); return () => clearTimeout(timer); }, [doneBlocks, planLoaded]);

  const pattern = user ? getPattern(user.examGoal) : undefined;
  const examName = pattern?.name || user?.examGoal || 'JEE Main';

  // Aggregate weak topics from latest 3 attempts
  const weakTopics = useMemo(() => {
    const counts = new Map<string, number>();
    for (const a of attempts.slice(0, 3)) {
      for (const t of a.weakTopics) {
        counts.set(t, (counts.get(t) || 0) + 1);
      }
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).map((e) => e[0]).slice(0, 5);
  }, [attempts]);

  const currentPlan = STUDY_PLAN_TEMPLATES.find((p) => p.type === activeTab);

  // For priority/revision/mock tabs — derive a list from weak topics
  const weakTopicList = useMemo(() => {
    if (weakTopics.length === 0) {
      return ['Rotational Motion', 'Coordination Compounds', 'Calculus', 'Electrostatics', 'Vectors'];
    }
    return weakTopics;
  }, [weakTopics]);

  function toggleBlock(blockId: string) {
    setDoneBlocks((prev) => {
      const next = new Set(prev);
      if (next.has(blockId)) next.delete(blockId);
      else next.add(blockId);
      return next;
    });
  }

  function resetPlan() {
    setDoneBlocks(new Set());
  }

  const showWeakTopicList = activeTab === 'priority' || activeTab === 'revision';

  return (
    <div className="space-y-6">
      <PageHeader
        icon={CalendarDays}
        title="Study Planner"
        subtitle={`${examName} · ${attempts.length} attempts · Personalised AI templates`}
        accent="amber"
        right={
          <Button variant="outline" size="sm" onClick={resetPlan}>
            <RotateCcw className="h-4 w-4" /> Reset plan
          </Button>
        }
      />

      {/* Today snapshot */}
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-amber-200 text-amber-800 border-amber-300">Today's Focus</Badge>
                <span className="text-xs text-amber-700">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
                </span>
              </div>
              <h3 className="font-bold text-stone-900 text-lg">{examName} · Daily Target 8 hrs</h3>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {weakTopics.slice(0, 3).map((t) => (
                  <Badge key={t} variant="outline" className="bg-white border-amber-300 text-amber-800">
                    <Target className="h-2.5 w-2.5" /> {t}
                  </Badge>
                ))}
                {weakTopics.length === 0 && (
                  <span className="text-xs text-stone-600">Take a mock to personalise weak topics.</span>
                )}
              </div>
            </div>
            <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => setView('mock-exam')}>
              <CalendarDays className="h-4 w-4" /> Take today's mock
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tab buttons */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              'px-3 py-2 rounded-lg text-xs sm:text-sm font-medium border transition text-center',
              activeTab === t.id
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                : 'bg-white border-stone-200 text-stone-600 hover:border-emerald-300 hover:text-emerald-700'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Plan card */}
      {currentPlan && (
        <Card className="border-stone-200">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {currentPlan.title}
                  {currentPlan.aiGenerated && (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                      <Sparkles className="h-3 w-3" /> AI-generated
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{currentPlan.description}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {showWeakTopicList ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-stone-600 mb-2">
                  <Target className="h-4 w-4 text-rose-500" />
                  Ranked by exam weightage × current accuracy
                </div>
                {weakTopicList.map((topic, idx) => {
                  const id = `${activeTab}-${topic}-${idx}`;
                  const done = doneBlocks.has(id);
                  return (
                    <button
                      key={id}
                      onClick={() => toggleBlock(id)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-lg border transition text-left',
                        done ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-stone-200 hover:border-emerald-300'
                      )}
                    >
                      {done ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 text-stone-300 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-sm font-medium', done ? 'text-stone-500 line-through' : 'text-stone-800')}>
                          {topic}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Priority {idx + 1} · {idx === 0 ? 'High weightage, low accuracy' : idx < 3 ? 'Medium priority' : 'Maintenance'}
                        </p>
                      </div>
                      <Badge variant="outline" className={subjectBadgeClass(topic)}>
                        {idx + 1} hr
                      </Badge>
                    </button>
                  );
                })}
              </div>
            ) : (
              currentPlan.blocks.map((b, idx) => {
                const id = `${activeTab}-${idx}-${b.time}`;
                const done = doneBlocks.has(id);
                return (
                  <button
                    key={id}
                    onClick={() => toggleBlock(id)}
                    className={cn(
                      'w-full flex items-start gap-3 p-3 rounded-lg border transition text-left',
                      done ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-stone-200 hover:border-emerald-300'
                    )}
                  >
                    {done ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="h-5 w-5 text-stone-300 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn('text-sm font-medium', done ? 'text-stone-500 line-through' : 'text-stone-800')}>
                          {b.task}
                        </span>
                        <Badge variant="outline" className={cn('text-[10px]', subjectBadgeClass(b.subject))}>
                          {b.subject}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {b.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" /> {b.duration}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>
      )}

      {/* CTA card */}
      <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-stone-900">Want a deeper personalised plan?</h4>
              <p className="text-sm text-muted-foreground mt-0.5">
                Ask the AI Mentor for a custom plan tuned to your recent mock performance and target exam date.
              </p>
            </div>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setView('mentor')}>
            <Brain className="h-4 w-4" /> Ask AI Mentor
          </Button>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid sm:grid-cols-3 gap-3">
        <Card className="border-stone-200 p-4">
          <SectionTitle icon={BookOpen} title="Completed" />
          <p className="text-2xl font-bold text-emerald-600">
            {doneBlocks.size}
            <span className="text-sm font-normal text-muted-foreground"> / {currentPlan?.blocks.length || 0}</span>
          </p>
        </Card>
        <Card className="border-stone-200 p-4">
          <SectionTitle icon={Clock} title="Hours Planned" />
          <p className="text-2xl font-bold text-amber-600">
            {currentPlan?.blocks.length || 0}
            <span className="text-sm font-normal text-muted-foreground"> blocks</span>
          </p>
        </Card>
        <Card className="border-stone-200 p-4">
          <SectionTitle icon={Target} title="Weak Topics" />
          <p className="text-2xl font-bold text-rose-600">
            {weakTopics.length}
            <span className="text-sm font-normal text-muted-foreground"> tracked</span>
          </p>
        </Card>
      </div>
    </div>
  );
}
