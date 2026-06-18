'use client';

import * as React from 'react';
import { Calendar, Clock, Flame, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { getPattern } from '@/lib/exams/patterns';

function daysBetween(a: Date, b: Date): number {
  const ms = 1000 * 60 * 60 * 24;
  const aa = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const bb = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((bb.getTime() - aa.getTime()) / ms);
}

export function ExamCountdownCard({
  focusArea,
  streak = 0,
}: {
  focusArea?: string;
  streak?: number;
}) {
  const user = useStore((s) => s.user);
  const setView = useStore((s) => s.setView);

  const [selected, setSelected] = React.useState<Date | undefined>(undefined);

  if (!user) return null;

  const pattern = getPattern(user.examGoal);
  const examDate = new Date(user.examDate);
  const today = new Date();
  const days = Math.max(0, daysBetween(today, examDate));
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  const isToday = (date: Date) => daysBetween(today, date) === 0;
  const isExamDay = (date: Date) => daysBetween(date, examDate) === 0;

  return (
    <Card className="p-5 border-stone-200 bg-gradient-to-br from-amber-50 to-white relative overflow-hidden">
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-amber-100/60 blur-2xl" />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
              Exam Countdown
            </p>
            <h3 className="text-lg font-bold text-stone-900 mt-0.5">{pattern?.name ?? 'Target Exam'}</h3>
            <p className="text-xs text-muted-foreground">
              {examDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <Badge className="bg-amber-100 text-amber-700 border-amber-200 border">
            <Clock className="h-3 w-3" /> {pattern ? `${Math.round(pattern.durationSec / 60)} min` : '—'}
          </Badge>
        </div>

        {/* Big countdown */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="rounded-lg bg-white border border-amber-200 p-2.5 text-center">
            <p className={cn('text-2xl font-bold tabular-nums', days <= 30 ? 'text-rose-600' : 'text-amber-700')}>
              {days}
            </p>
            <p className="text-[10px] text-muted-foreground">days left</p>
          </div>
          <div className="rounded-lg bg-white border border-amber-200 p-2.5 text-center">
            <p className="text-2xl font-bold tabular-nums text-amber-700">{weeks}</p>
            <p className="text-[10px] text-muted-foreground">weeks</p>
          </div>
          <div className="rounded-lg bg-white border border-amber-200 p-2.5 text-center">
            <p className="text-2xl font-bold tabular-nums text-amber-700">{months}</p>
            <p className="text-[10px] text-muted-foreground">months</p>
          </div>
        </div>

        {/* Mini calendar */}
        <div className="rounded-lg border border-amber-200 bg-white p-2 mb-4 flex justify-center">
          <CalendarPicker
            mode="single"
            selected={selected}
            onSelect={setSelected}
            month={today}
            disabled={(date) => date < today}
            modifiers={{ examDay: [examDate], today }}
            modifiersClassNames={{
              examDay: 'bg-amber-500 text-white rounded-full',
              today: 'ring-2 ring-amber-400',
            }}
            classNames={{
              day: 'h-8 w-8 text-xs',
              month_caption: 'text-sm font-semibold py-1',
              weekday: 'text-[10px] text-muted-foreground',
            }}
            className="[&_.rdp-day_button]:h-8 [&_.rdp-day_button]:w-8 [&_.rdp-day_button]:text-xs"
          />
        </div>

        {/* Footer chips */}
        <div className="flex flex-wrap items-center gap-2">
          {focusArea && (
            <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700">
              <MapPin className="h-3 w-3" /> Focus: {focusArea}
            </Badge>
          )}
          <Badge variant="outline" className="bg-rose-50 border-rose-200 text-rose-700">
            <Flame className="h-3 w-3" /> {streak} day streak
          </Badge>
          <button
            onClick={() => setView('planner')}
            className="ml-auto text-[11px] font-medium text-amber-700 hover:text-amber-800 inline-flex items-center gap-1"
          >
            <Calendar className="h-3 w-3" /> Open planner
          </button>
        </div>
      </div>
    </Card>
  );
}
