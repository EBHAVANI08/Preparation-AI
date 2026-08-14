'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Sparkles,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Calendar,
  CheckCircle2,
  Circle,
  BookOpen,
  PencilLine,
  FileText,
  RotateCcw,
  Quote,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { getPattern } from '@/lib/exams/patterns';

interface PlanTask {
  id: string;
  title: string;
  type: 'study' | 'practice' | 'mock' | 'revision';
  duration: string;
  subject?: string;
}

const DEFAULT_TASKS: PlanTask[] = [
  { id: 't1', title: 'Revise Calculus — Limits & Continuity', type: 'study', duration: '45 min', subject: 'Math' },
  { id: 't2', title: 'Solve Organic Chemistry problems', type: 'study', duration: '40 min', subject: 'Chemistry' },
  { id: 't3', title: 'Practice Rotational Motion MCQs', type: 'practice', duration: '30 min', subject: 'Physics' },
  { id: 't4', title: 'Take a 30-min mini mock exam', type: 'mock', duration: '30 min' },
  { id: 't5', title: 'Revise yesterday\'s weak topics', type: 'revision', duration: '20 min' },
];

const QUOTES = [
  'Small daily improvements lead to stunning results.',
  'The expert in anything was once a beginner.',
  'Don\'t watch the clock; do what it does — keep going.',
  'Your only limit is the one you set yourself.',
  'Discipline is choosing what you want most over what you want now.',
];

function greetingFor(): { text: string; Icon: React.ComponentType<{ className?: string }> } {
  const h = new Date().getHours();
  if (h < 5) return { text: 'Burning the midnight oil', Icon: Moon };
  if (h < 12) return { text: 'Good morning', Icon: Sunrise };
  if (h < 17) return { text: 'Good afternoon', Icon: Sun };
  if (h < 21) return { text: 'Good evening', Icon: Sunset };
  return { text: 'Good night', Icon: Moon };
}

const TASK_ICON: Record<PlanTask['type'], React.ComponentType<{ className?: string }>> = {
  study: BookOpen,
  practice: PencilLine,
  mock: FileText,
  revision: RotateCcw,
};

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function DailyPlanModal() {
  const user = useStore((s) => s.user);
  const attempts = useStore((s) => s.attempts);
  const dailyPlanDismissed = useStore((s) => s.dailyPlanDismissed);
  const dismissDailyPlan = useStore((s) => s.dismissDailyPlan);
  const setView = useStore((s) => s.setView);

  const [tasks] = React.useState<PlanTask[]>(DEFAULT_TASKS);
  const [tasksDone, setTasksDone] = React.useState<Set<string>>(new Set());
  const [quote] = React.useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  // Show only once per day
  const shouldShow = React.useMemo(() => {
    if (!user) return false;
    return dailyPlanDismissed !== todayKey();
  }, [user, dailyPlanDismissed]);

  if (!user || !shouldShow) return null;

  const pattern = getPattern(user.examGoal);
  const examDate = new Date(user.examDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  examDate.setHours(0, 0, 0, 0);
  const days = Math.max(0, Math.ceil((examDate.getTime() - today.getTime()) / 86400000));
  const mockScheduled = tasks.some((t) => t.type === 'mock');

  const firstName = user.name.split(' ')[0] ?? 'aspirant';
  const { text: greeting, Icon: GreetIcon } = greetingFor();

  function toggleTask(id: string) {
    setTasksDone((curr) => {
      const next = new Set(curr);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleLater() {
    dismissDailyPlan(todayKey());
  }

  function handleLetsGo() {
    dismissDailyPlan(todayKey());
    setView('planner');
  }

  function handleStartMock() {
    dismissDailyPlan(todayKey());
    setView('mock-exam');
  }

  const completedCount = tasksDone.size;
  const totalTasks = tasks.length;
  const progress = Math.round((completedCount / totalTasks) * 100);

  return (
    <Dialog open={shouldShow} onOpenChange={(o) => { if (!o) handleLater(); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto scroll-thin">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GreetIcon className="h-5 w-5 text-amber-500" />
            {greeting}, {firstName}!
          </DialogTitle>
          <DialogDescription>
            Here's your personalised plan for today, crafted by your AI mentor.
          </DialogDescription>
        </DialogHeader>

        {/* Countdown */}
        <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-3 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
              {pattern?.name ?? 'Target exam'}
            </p>
            <p className="text-lg font-bold text-stone-900">
              {days} days <span className="text-sm font-normal text-muted-foreground">to go</span>
            </p>
          </div>
          <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200">
            {attempts.length} mocks done
          </Badge>
        </div>

        {/* Tasks */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              Today's tasks
            </h4>
            <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700">
              {completedCount}/{totalTasks} done · {progress}%
            </Badge>
          </div>
          <div className="space-y-1.5">
            {tasks.map((t) => {
              const Icon = TASK_ICON[t.type];
              const done = tasksDone.has(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => toggleTask(t.id)}
                  className={cn(
                    'w-full flex items-center gap-2 rounded-lg border p-2.5 text-left transition palette-btn',
                    done
                      ? 'border-emerald-300 bg-emerald-50/60'
                      : 'border-stone-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30'
                  )}
                >
                  {done ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-stone-300 flex-shrink-0" />
                  )}
                  <Icon className={cn('h-3.5 w-3.5 flex-shrink-0', done ? 'text-emerald-600' : 'text-stone-400')} />
                  <span className={cn('flex-1 text-sm', done ? 'text-stone-500 line-through' : 'text-stone-800')}>
                    {t.title}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{t.duration}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mock alert */}
        {mockScheduled && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-rose-500 text-white flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-rose-900">Mock exam scheduled today</p>
              <p className="text-xs text-rose-700">A 30-min mini mock is on your list. Knock it out when you're sharp.</p>
            </div>
            <Button size="sm" onClick={handleStartMock} className="bg-rose-600 hover:bg-rose-700">
              Start
            </Button>
          </div>
        )}

        {/* Quote */}
        <div className="rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-3 flex gap-2">
          <Quote className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm italic text-stone-700">{quote}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button variant="outline" className="flex-1" onClick={handleLater}>
            Later
          </Button>
          <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={handleLetsGo}>
            Let's go
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
