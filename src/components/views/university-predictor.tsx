'use client';

import { useMemo } from 'react';
import {
  GraduationCap,
  Sparkles,
  TrendingUp,
  Target,
  ShieldCheck,
  Zap,
  Crown,
  Globe,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared';
import { UNIVERSITIES } from '@/lib/university-data';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

/**
 * Heuristic: probability of admission given current score pct,
 * university world ranking, and target score pct.
 * - Top-20 need scorePct >= 0.90 → high chance
 * - Top-50 need scorePct >= 0.80
 * - Top-100 need scorePct >= 0.70
 * - Others need scorePct >= 0.60
 * Each tier below target drops probability sharply.
 */
function computeAdmissionProb(
  scorePct: number,
  ranking: number,
  targetScorePct: number
): number {
  // Required score pct based on tier
  let required: number;
  if (ranking <= 20) required = 0.90;
  else if (ranking <= 50) required = 0.80;
  else if (ranking <= 100) required = 0.70;
  else required = 0.60;

  // Base acceptance penalty for elite unis
  const elitePenalty = ranking <= 5 ? 0.15 : ranking <= 20 ? 0.10 : ranking <= 50 ? 0.05 : 0;

  const gap = scorePct - required;
  let prob = 50 + gap * 200; // each +0.10 score above required = +20% prob
  prob -= elitePenalty * 100;

  // Bonus if score exceeds target score
  if (scorePct >= targetScorePct) prob += 10;

  return Math.max(2, Math.min(95, Math.round(prob)));
}

type Bucket = 'safe' | 'reach' | 'ambitious';

function bucketFor(prob: number): Bucket {
  if (prob >= 70) return 'safe';
  if (prob >= 35) return 'reach';
  return 'ambitious';
}

const BUCKET_INFO: Record<Bucket, {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  border: string;
  text: string;
  badge: string;
  bar: string;
  gradient: string;
}> = {
  safe: {
    label: 'Safe',
    description: '≥70% admission chance — likely admits',
    icon: ShieldCheck,
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    bar: 'bg-emerald-500',
    gradient: 'from-emerald-500 to-teal-600',
  },
  reach: {
    label: 'Reach',
    description: '35-70% chance — competitive but possible',
    icon: Target,
    border: 'border-amber-200',
    text: 'text-amber-700',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    bar: 'bg-amber-500',
    gradient: 'from-amber-500 to-orange-500',
  },
  ambitious: {
    label: 'Ambitious',
    description: '<35% chance — stretch goals',
    icon: Zap,
    border: 'border-rose-200',
    text: 'text-rose-700',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    bar: 'bg-rose-500',
    gradient: 'from-rose-500 to-pink-600',
  },
};

const ACCENT_BAR: Record<Bucket, string> = {
  safe: 'bg-emerald-500',
  reach: 'bg-amber-500',
  ambitious: 'bg-rose-500',
};

const FLAG_BY_COUNTRY: Record<string, string> = {
  USA: '🇺🇸', Canada: '🇨🇦', UK: '🇬🇧', Germany: '🇩🇪', Australia: '🇦🇺',
  'New Zealand': '🇳🇿', Ireland: '🇮🇪', Singapore: '🇸🇬', Netherlands: '🇳🇱', Sweden: '🇸🇪',
};

export function UniversityPredictor() {
  const user = useStore((s) => s.user);
  const attempts = useStore((s) => s.attempts);
  const setView = useStore((s) => s.setView);

  const latestAttempt = attempts[0];
  const hasAttempt = !!latestAttempt;

  const scorePct = latestAttempt
    ? latestAttempt.score / latestAttempt.totalMarks
    : 0.50;
  const targetScorePct = user?.targetScore
    ? Math.min(1, user.targetScore / 100)
    : 0.85;

  const predictions = useMemo(() => {
    return UNIVERSITIES.map((u) => ({
      ...u,
      prob: computeAdmissionProb(scorePct, u.ranking, targetScorePct),
    })).sort((a, b) => b.prob - a.prob);
  }, [scorePct, targetScorePct]);

  const buckets: Record<Bucket, typeof predictions> = {
    safe: predictions.filter((p) => bucketFor(p.prob) === 'safe').slice(0, 5),
    reach: predictions.filter((p) => bucketFor(p.prob) === 'reach').slice(0, 5),
    ambitious: predictions.filter((p) => bucketFor(p.prob) === 'ambitious').slice(0, 5),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={GraduationCap}
        title="Future University Predictor"
        subtitle="AI-powered admission probability across 24 global universities"
        accent="emerald"
        right={
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
            <Sparkles className="h-3 w-3" /> AI Powered
          </Badge>
        }
      />

      {/* Status banner */}
      <Card className={cn(
        'border',
        hasAttempt ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'
      )}>
        <CardContent className="p-4 flex items-center gap-3">
          <div className={cn(
            'h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0',
            hasAttempt ? 'bg-emerald-600' : 'bg-amber-600'
          )}>
            {hasAttempt ? <TrendingUp className="h-5 w-5 text-white" /> : <Sparkles className="h-5 w-5 text-white" />}
          </div>
          <div className="flex-1">
            {hasAttempt ? (
              <>
                <p className="text-sm font-semibold text-stone-900">
                  Predicting from your latest attempt — {latestAttempt.examName} · {latestAttempt.score}/{latestAttempt.totalMarks}
                </p>
                <p className="text-xs text-muted-foreground">
                  Score {(scorePct * 100).toFixed(1)}% · Target {(targetScorePct * 100).toFixed(0)}%
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-stone-900">
                  No mock attempts yet — showing estimates from a default 50% score
                </p>
                <p className="text-xs text-muted-foreground">
                  Take a mock test to get accurate, personalised predictions.
                </p>
              </>
            )}
          </div>
          {!hasAttempt && (
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={() => setView('mock-exam')}>
              Take a mock
            </Button>
          )}
        </CardContent>
      </Card>

      {/* 3 bucket cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {(['safe', 'reach', 'ambitious'] as Bucket[]).map((b) => {
          const info = BUCKET_INFO[b];
          const Icon = info.icon;
          const items = buckets[b];
          return (
            <Card key={b} className={cn('border', info.border)}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className={cn('h-9 w-9 rounded-lg bg-gradient-to-br flex items-center justify-center', info.gradient)}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{info.label}</CardTitle>
                    <p className="text-[10px] text-muted-foreground">{info.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-1.5 pt-0">
                {items.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">No universities in this bucket.</p>
                ) : (
                  items.map((u) => (
                    <div key={u.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-stone-50">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base">{FLAG_BY_COUNTRY[u.country] || '🌍'}</span>
                        <span className="text-xs font-medium text-stone-800 truncate">{u.name.split('(')[0]}</span>
                      </div>
                      <Badge variant="outline" className={cn('text-[10px]', info.badge)}>
                        {u.prob}%
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Full predictions card */}
      <Card className="border-stone-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Crown className="h-4 w-4 text-amber-600" /> Full Predictions — All 24 Universities
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Sorted by admission probability (highest first)
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {predictions.map((u) => {
              const bucket = bucketFor(u.prob);
              const info = BUCKET_INFO[bucket];
              return (
                <div
                  key={u.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border border-stone-200 bg-white"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xl flex-shrink-0">{FLAG_BY_COUNTRY[u.country] || '🌍'}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-stone-900 truncate">{u.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Rank #{u.ranking} · {u.country} · Accept {u.acceptanceRate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:w-64">
                    <div className="flex-1">
                      <div className="flex justify-between items-center text-xs mb-0.5">
                        <span className={cn('font-semibold', info.text)}>
                          {u.prob}%
                        </span>
                        <Badge variant="outline" className={cn('text-[9px]', info.badge)}>
                          {info.label}
                        </Badge>
                      </div>
                      <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div className={cn('h-full rounded-full', ACCENT_BAR[bucket])} style={{ width: `${u.prob}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="border-stone-200 bg-gradient-to-r from-emerald-50 to-teal-50">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-stone-900">Improve your admission probability</h4>
              <p className="text-sm text-muted-foreground mt-0.5">
                Raise your mock score by 5-10% to unlock more Reach & Safe universities.
              </p>
            </div>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setView('planner')}>
            <Target className="h-4 w-4" /> Get a study plan
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
