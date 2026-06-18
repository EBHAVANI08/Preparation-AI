'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';
import { useStore, userExamGoals } from '@/lib/store';
import { EXAM_PATTERNS, getPattern } from '@/lib/exams/patterns';
import type { ExamAttempt, ExamPattern, GeneratedExam, User } from '@/lib/types';
import { ManageExamsDialog } from '@/components/dashboard/manage-exams-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Atom, Clock, FileText, ListChecks, Settings2, Sparkles, Trophy, Target,
  TrendingUp, ArrowRight, Layers, Info, ShieldCheck, Loader2, GraduationCap,
  HeartPulse, BookOpen, Briefcase, Cpu, Languages, Landmark,
} from 'lucide-react';

interface Props {
  onStart?: () => void;
}

export function MockExamEngine({ onStart }: Props = {}) {
  const user = useStore((s) => s.user);
  const attempts = useStore((s) => s.attempts);
  const startExam = useStore((s) => s.startExam);
  const { toast } = useToast();

  const goals = userExamGoals(user);
  const available = React.useMemo(
    () => EXAM_PATTERNS.filter((p) => goals.includes(p.id)),
    [goals],
  );

  const [manageOpen, setManageOpen] = React.useState(false);
  const [configFor, setConfigFor] = React.useState<ExamPattern | null>(null);
  const [difficulty, setDifficulty] = React.useState<'balanced' | 'easy' | 'hard'>('balanced');
  const [durationOverride, setDurationOverride] = React.useState<string>('default');
  const [generating, setGenerating] = React.useState(false);

  const recentAttempts = React.useMemo(() => {
    return [...attempts]
      .sort((a, b) => +new Date(b.submittedAt) - +new Date(a.submittedAt))
      .slice(0, 3);
  }, [attempts]);

  function examAttempts(examId: string): ExamAttempt[] {
    return attempts.filter((a) => a.examId === examId);
  }

  function bestScore(examId: string): { score: number; total: number; pct: number } | null {
    const list = examAttempts(examId);
    if (list.length === 0) return null;
    let best = list[0];
    for (const a of list) {
      if (a.score / Math.max(1, a.totalMarks) > best.score / Math.max(1, best.totalMarks)) best = a;
    }
    const pct = Math.round((best.score / Math.max(1, best.totalMarks)) * 100);
    return { score: best.score, total: best.totalMarks, pct };
  }

  async function handleGenerate(pattern: ExamPattern) {
    setGenerating(true);
    try {
      const { seenSignatures, recordSeenSignatures } = useStore.getState();
      const priorAttempts = examAttempts(pattern.id);
      const attemptNumber = priorAttempts.length + 1;
      const resp = await fetch('/api/mock-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: pattern.id,
          attemptNumber,
          seenSignatures: seenSignatures.slice(-2000),
          difficulty,
        }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to generate exam');
      }
      const payload = await resp.json();
      const newSigs: string[] = Array.isArray(payload._newSignatures) ? payload._newSignatures : [];
      // record new signatures so future attempts avoid them
      recordSeenSignatures(newSigs);

      // strip internal fields before constructing GeneratedExam
      const exam: GeneratedExam = {
        id: payload.id,
        examId: payload.examId,
        examName: payload.examName,
        durationSec: durationOverride === 'default'
          ? payload.durationSec
          : parseInt(durationOverride, 10) * 60,
        totalMarks: payload.totalMarks,
        startedAt: payload.startedAt,
        questions: payload.questions,
        sections: payload.sections,
      };

      startExam(exam, pattern.id);
      toast({
        title: `Attempt #${attemptNumber} started`,
        description: 'Fresh questions only · best of luck!',
      });
    } catch (e) {
      toast({ title: 'Generation failed', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setGenerating(false);
      setConfigFor(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="bg-hero-emerald border-emerald-200">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-md flex-shrink-0">
                <Atom className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">AI Mock Exam Engine</h1>
                <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                  Each attempt generates a brand-new paper from your syllabus weights. Our engine
                  tracks every question you&apos;ve seen and avoids repeats — so every mock is fresh.
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-white/60">
                    <Sparkles className="h-3 w-3" /> AI-generated questions
                  </Badge>
                  <Badge variant="outline" className="border-amber-300 text-amber-700 bg-white/60">
                    <ShieldCheck className="h-3 w-3" /> Cross-attempt dedup
                  </Badge>
                  <Badge variant="outline" className="border-teal-300 text-teal-700 bg-white/60">
                    <Layers className="h-3 w-3" /> {available.length} active pattern{available.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
            </div>
            <Button onClick={() => setManageOpen(true)} variant="outline" className="flex-shrink-0">
              <Settings2 className="h-4 w-4" /> Manage Exams
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Empty state */}
      {available.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-10 pb-10 flex flex-col items-center text-center gap-3">
            <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center">
              <Target className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">No target exams selected</h3>
              <p className="text-sm text-muted-foreground max-w-md mt-1">
                Add at least one exam (JEE Main, NEET, GRE, GMAT, etc.) to start generating mock papers.
              </p>
            </div>
            <Button onClick={() => setManageOpen(true)}>
              <Settings2 className="h-4 w-4" /> Choose your exams
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-emerald-600" /> Available Mock Papers
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setManageOpen(true)}>
                <Settings2 className="h-3.5 w-3.5" /> Manage
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {available.map((p) => {
                const best = bestScore(p.id);
                const count = examAttempts(p.id).length;
                const isPrimary = user.examGoal === p.id;
                return (
                  <Card key={p.id} className="card-lift border-stone-200">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                            <IconFor name={p.icon} />
                          </div>
                          <div className="min-w-0">
                            <CardTitle className="flex items-center gap-2">
                              <span className="truncate">{p.name}</span>
                              {isPrimary && (
                                <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                                  <Trophy className="h-3 w-3" /> Primary
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription className="truncate">{p.fullName}</CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="outline" className="border-stone-300">
                          <FileText className="h-3 w-3" /> {p.totalQuestions} Qs
                        </Badge>
                        <Badge variant="outline" className="border-stone-300">
                          <Clock className="h-3 w-3" /> {Math.round(p.durationSec / 60)} min
                        </Badge>
                        <Badge variant="outline" className="border-stone-300">
                          <Trophy className="h-3 w-3" /> {p.totalMarks} marks
                        </Badge>
                        <Badge variant="outline" className="border-stone-300">{p.marking}</Badge>
                      </div>

                      {count > 0 ? (
                        <div className="flex items-center justify-between gap-2 text-xs bg-stone-50 border border-stone-200 rounded-md p-2.5">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-emerald-600" />
                            <span className="text-muted-foreground">
                              {count} attempt{count > 1 ? 's' : ''} · Best
                            </span>
                          </div>
                          <span className="font-semibold text-emerald-700">
                            {best?.score}/{best?.total} · {best?.pct}%
                          </span>
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground bg-stone-50 border border-dashed border-stone-200 rounded-md p-2.5">
                          No attempts yet — start your first mock.
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" onClick={() => setConfigFor(p)}>
                        <Settings2 className="h-4 w-4" /> Configure &amp; start
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Recent attempts */}
          {recentAttempts.length > 0 && (
            <Card className="border-stone-200">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-600" /> Recent attempts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentAttempts.map((a) => {
                  const pct = Math.round((a.score / Math.max(1, a.totalMarks)) * 100);
                  return (
                    <div key={a.id} className="flex items-center justify-between gap-3 text-sm border border-stone-200 rounded-md p-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{a.examName}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(a.submittedAt).toLocaleDateString(undefined, {
                              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                            })}
                            {a.attemptNumber ? ` · Attempt #${a.attemptNumber}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-emerald-700">{a.score}/{a.totalMarks}</p>
                        <p className="text-xs text-muted-foreground">{pct}% · Acc {a.accuracy}%</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Configure dialog */}
      <Dialog open={!!configFor} onOpenChange={(v) => !generating && setConfigFor(v ? configFor : null)}>
        <DialogContent className="sm:max-w-lg">
          {configFor && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <IconFor name={configFor.icon} /> Configure {configFor.name}
                </DialogTitle>
                <DialogDescription>{configFor.fullName}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Pattern summary */}
                <div className="grid grid-cols-3 gap-2">
                  <SummaryTile label="Questions" value={String(configFor.totalQuestions)} icon={FileText} />
                  <SummaryTile label="Minutes" value={String(Math.round(configFor.durationSec / 60))} icon={Clock} />
                  <SummaryTile label="Total Marks" value={String(configFor.totalMarks)} icon={Trophy} />
                </div>

                {/* Sections */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Sections</p>
                  <div className="space-y-1.5">
                    {configFor.sections.map((s) => (
                      <div key={s.name} className="flex items-center justify-between text-sm border border-stone-200 rounded-md px-3 py-1.5">
                        <span className="font-medium">{s.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {s.questionCount} Qs · +{s.marksPerQuestion}/{s.negativeMarks > 0 ? `-${s.negativeMarks}` : '0'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Difficulty mode</label>
                  <Select value={difficulty} onValueChange={(v) => setDifficulty(v as typeof difficulty)}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balanced">Balanced (per syllabus weights)</SelectItem>
                      <SelectItem value="easy">Easy focus (foundation drill)</SelectItem>
                      <SelectItem value="hard">Hard focus (exam-level)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Duration override */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Duration</label>
                  <Select value={durationOverride} onValueChange={setDurationOverride}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Full ({Math.round(configFor.durationSec / 60)} min)</SelectItem>
                      <SelectItem value="30">Quick (30 min)</SelectItem>
                      <SelectItem value="60">Hour (60 min)</SelectItem>
                      <SelectItem value="90">Extended (90 min)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-start gap-2 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md p-2.5">
                  <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>
                    The engine tracks every question you have seen across all attempts and avoids repeating them.
                    You currently have <strong>{useStore.getState().seenSignatures.length}</strong> signatures on record.
                  </span>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setConfigFor(null)} disabled={generating}>
                  Cancel
                </Button>
                <Button onClick={() => handleGenerate(configFor)} disabled={generating}>
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" /> Generate &amp; Start
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ManageExamsDialog open={manageOpen} onOpenChange={setManageOpen} />
    </div>
  );
}

function SummaryTile({ label, value, icon: Icon }: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="border border-stone-200 rounded-md p-2.5 text-center bg-stone-50/40">
      <Icon className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
      <p className="text-base font-bold leading-none">{value}</p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-1">{label}</p>
    </div>
  );
}

function IconFor({ name }: { name: string }) {
  const map: Record<string, React.ComponentType<{ className?: string }>> = {
    Atom, HeartPulse, GraduationCap, BookOpen, Trophy, Briefcase, Cpu, Languages, Landmark,
  };
  const Cmp = map[name] || FileText;
  return <Cmp className="h-5 w-5" />;
}
