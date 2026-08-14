'use client';

import { useState } from 'react';
import {
  HeartPulse,
  Brain,
  BrainCircuit,
  Flame,
  Sparkles,
  Target,
  Eye,
  BookOpen,
  Phone,
  LifeBuoy,
  Quote,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

type AccentKey = 'rose' | 'amber' | 'teal' | 'emerald';

const TOPICS: {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: AccentKey;
  tips: string[];
}[] = [
  {
    id: 'stress',
    label: 'Stress',
    icon: BrainCircuit,
    accent: 'rose',
    tips: [
      'Box breathing: inhale 4s, hold 4s, exhale 4s, hold 4s. Do 5 cycles to calm your nervous system.',
      'Take a 10-minute walk outside without your phone — daylight and movement reset cortisol.',
      'Write down the top 3 stressors on paper, then write one tiny next step for each.',
      'Cut caffeine after 2 PM — it has a 6-hour half-life and amplifies exam anxiety.',
    ],
  },
  {
    id: 'anxiety',
    label: 'Exam Anxiety',
    icon: Flame,
    accent: 'amber',
    tips: [
      'Use "worst-case reframing": write the worst outcome, then list 3 realistic counter-points.',
      'Arrive 20 minutes early to your exam centre to avoid last-minute panic spikes.',
      'Practise full-length mocks under real exam conditions to desensitise yourself.',
      'During the exam, do a "body scan" — relax your jaw, shoulders, and hands between sections.',
    ],
  },
  {
    id: 'burnout',
    label: 'Burnout',
    icon: HeartPulse,
    accent: 'rose',
    tips: [
      'Schedule a "no-study day" once every 2 weeks — your brain consolidates during rest.',
      'Swap one study block for a 30-min creative activity (music, sketching, cooking).',
      'Sleep 7-8 hours consistently — chronic sleep debt is the #1 cause of burnout.',
      'Talk to a friend or family member about how you feel — isolation worsens burnout.',
    ],
  },
  {
    id: 'motivation',
    label: 'Motivation',
    icon: Sparkles,
    accent: 'amber',
    tips: [
      'Visualise your success in detail — imagine opening the result with your dream score.',
      'Set a tiny daily "win" — even 1 solved problem counts as progress.',
      'Re-watch your "why" — write your top reason for the exam and pin it above your desk.',
      'Reward yourself after every mock, regardless of the score. Small rewards build momentum.',
    ],
  },
  {
    id: 'focus',
    label: 'Focus',
    icon: Eye,
    accent: 'teal',
    tips: [
      'Use Pomodoro: 25 min deep work + 5 min break. After 4 cycles, take a 20-min break.',
      'Put your phone in another room during study blocks — out of sight, out of mind.',
      'Use a single dedicated study space to train your brain into "study mode".',
      'Block distracting websites with a focus extension during study hours.',
    ],
  },
  {
    id: 'habits',
    label: 'Study Habits',
    icon: BookOpen,
    accent: 'emerald',
    tips: [
      'Use active recall: close the book and write everything you remember, then check.',
      'Spaced repetition: revisit a topic at 1 day, 3 days, 7 days, 14 days for long-term memory.',
      'Mix subjects in a single session (interleaving) — it feels harder but encodes deeper.',
      'End each session by writing 3 bullet points of what you learned today.',
    ],
  },
];

const QUOTES: { text: string; accent: AccentKey }[] = [
  { text: 'Success is the sum of small efforts repeated day in and day out.', accent: 'emerald' },
  { text: 'The expert in anything was once a beginner. Keep going.', accent: 'amber' },
  { text: 'Pressure is a privilege — it means you have something worth fighting for.', accent: 'teal' },
  { text: 'You don\'t have to be great to start, but you have to start to be great.', accent: 'rose' },
  { text: 'Discipline is choosing between what you want now and what you want most.', accent: 'emerald' },
];

const ACCENT_MAP: Record<AccentKey, {
  bg: string;
  text: string;
  border: string;
  gradient: string;
  iconBg: string;
  numberBg: string;
}> = {
  rose: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    gradient: 'from-rose-500 to-pink-500',
    iconBg: 'bg-rose-500',
    numberBg: 'bg-rose-100 text-rose-700',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    gradient: 'from-amber-500 to-orange-500',
    iconBg: 'bg-amber-500',
    numberBg: 'bg-amber-100 text-amber-700',
  },
  teal: {
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-200',
    gradient: 'from-teal-500 to-cyan-600',
    iconBg: 'bg-teal-500',
    numberBg: 'bg-teal-100 text-teal-700',
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    gradient: 'from-emerald-500 to-teal-600',
    iconBg: 'bg-emerald-500',
    numberBg: 'bg-emerald-100 text-emerald-700',
  },
};

export function WellnessCounsellor() {
  const setView = useStore((s) => s.setView);
  const [activeId, setActiveId] = useState<string>('stress');

  // Pick a quote based on day so it rotates daily
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const quote = QUOTES[dayOfYear % QUOTES.length];

  const activeTopic = TOPICS.find((t) => t.id === activeId)!;
  const activeAccent = ACCENT_MAP[activeTopic.accent];
  const quoteAccent = ACCENT_MAP[quote.accent];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={HeartPulse}
        title="Wellness Counsellor"
        subtitle="Your mental health matters as much as your marks — let's take care of both"
        accent="rose"
      />

      {/* Motivational quote banner */}
      <Card className={cn('border', quoteAccent.border, quoteAccent.bg)}>
        <CardContent className="p-5 flex items-start gap-3">
          <div className={cn('h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0', quoteAccent.gradient)}>
            <Quote className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-base sm:text-lg font-medium text-stone-800 leading-snug">
              "{quote.text}"
            </p>
            <p className="text-xs text-muted-foreground mt-2">Daily motivation · {new Date().toLocaleDateString('en-US', { weekday: 'long' })}</p>
          </div>
        </CardContent>
      </Card>

      {/* Topic chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {TOPICS.map((t) => {
          const Icon = t.icon;
          const isActive = t.id === activeId;
          const accent = ACCENT_MAP[t.accent];
          return (
            <button
              key={t.id}
              onClick={() => setActiveId(t.id)}
              className={cn(
                'flex flex-col items-center gap-1.5 p-3 rounded-xl border transition',
                isActive
                  ? cn(accent.bg, accent.border, accent.text)
                  : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
              )}
            >
              <div className={cn(
                'h-9 w-9 rounded-lg flex items-center justify-center',
                isActive ? cn('bg-gradient-to-br', accent.gradient) : 'bg-stone-100'
              )}>
                <Icon className={cn('h-4 w-4', isActive ? 'text-white' : 'text-stone-500')} />
              </div>
              <span className="text-xs font-medium text-center">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tips card */}
      <Card className={cn('border', activeAccent.border)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className={cn('h-8 w-8 rounded-lg bg-gradient-to-br flex items-center justify-center', activeAccent.gradient)}>
              <activeTopic.icon className="h-4 w-4 text-white" />
            </div>
            {activeTopic.label} — Practical Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {activeTopic.tips.map((tip, idx) => (
            <div
              key={idx}
              className={cn('flex items-start gap-3 p-3 rounded-lg', activeAccent.bg)}
            >
              <div className={cn('h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0', activeAccent.numberBg)}>
                {idx + 1}
              </div>
              <p className="text-sm text-stone-700">{tip}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* CTA card */}
      <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-stone-900">Need someone to talk to?</h4>
              <p className="text-sm text-muted-foreground mt-0.5">
                Your AI mentor is available 24/7 — share what's on your mind, get warmth and practical advice.
              </p>
            </div>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setView('mentor')}>
            <Brain className="h-4 w-4" /> Talk to AI Mentor
          </Button>
        </CardContent>
      </Card>

      {/* Crisis support card */}
      <Card className="border-rose-300 bg-rose-50">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center flex-shrink-0">
              <LifeBuoy className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-rose-900 flex items-center gap-2">
                Crisis Support
                <Badge className="bg-rose-200 text-rose-800 border-rose-300">24/7</Badge>
              </h4>
              <p className="text-sm text-rose-800 mt-1">
                If you're feeling overwhelmed, anxious, or in distress, please reach out to a professional helpline. You are not alone.
              </p>
              <div className="grid sm:grid-cols-2 gap-2 mt-3">
                <div className="bg-white rounded-lg p-3 border border-rose-200">
                  <div className="flex items-center gap-2 text-rose-700 font-medium text-sm">
                    <Phone className="h-4 w-4" /> iCall (India)
                  </div>
                  <p className="text-xs text-stone-600 mt-0.5">9152987821 · Free · 8 AM – 10 PM</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-rose-200">
                  <div className="flex items-center gap-2 text-rose-700 font-medium text-sm">
                    <Phone className="h-4 w-4" /> Vandrevala Foundation
                  </div>
                  <p className="text-xs text-stone-600 mt-0.5">1860-2662-345 · 24×7</p>
                </div>
              </div>
              <p className="text-xs text-rose-700 mt-3">
                For emergencies, call your local emergency number or go to the nearest hospital.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
