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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, Plus, Star, X, Clock, ListChecks, Award } from 'lucide-react';
import { useStore, userExamGoals } from '@/lib/store';
import { examsForUserType, getPattern } from '@/lib/exams/patterns';
import { useToast } from '@/hooks/use-toast';

export function ManageExamsDialog({ open, onOpenChange }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const user = useStore((s) => s.user);
  const addExamGoal = useStore((s) => s.addExamGoal);
  const removeExamGoal = useStore((s) => s.removeExamGoal);
  const updateUser = useStore((s) => s.updateUser);
  const { toast } = useToast();

  if (!user) return null;

  const goals = userExamGoals(user);
  const available = examsForUserType(user.type);
  const addable = available.filter((p) => !goals.includes(p.id));

  function handleRemove(id: string) {
    if (goals.length <= 1) {
      toast({
        title: 'Cannot remove last exam',
        description: 'You must keep at least one target exam.',
        variant: 'destructive',
      });
      return;
    }
    removeExamGoal(id);
    const p = getPattern(id);
    toast({ title: `Removed ${p?.name ?? id} from your targets` });
  }

  function handleAdd(id: string) {
    addExamGoal(id);
    const p = getPattern(id);
    toast({ title: `Added ${p?.name ?? id} to your targets` });
  }

  function handleMakePrimary(id: string) {
    updateUser({ examGoal: id });
    const p = getPattern(id);
    toast({ title: `${p?.name ?? id} is now your primary exam` });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Target Exams</DialogTitle>
          <DialogDescription>
            Pick the exams you are preparing for. The Mock Exam Engine and analytics tailor themselves to your selected exams.
          </DialogDescription>
        </DialogHeader>

        {/* Selected exams */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-amber-500" />
              Your target exams
            </h4>
            <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700">
              {goals.length} selected
            </Badge>
          </div>
          <div className="space-y-2">
            {goals.map((id) => {
              const p = getPattern(id);
              if (!p) return null;
              const isPrimary = user.examGoal === id;
              return (
                <Card
                  key={id}
                  className={`p-3 flex items-center justify-between gap-3 border-stone-200 ${isPrimary ? 'ring-1 ring-amber-300 bg-amber-50/40' : 'bg-emerald-50/30'}`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-stone-900">{p.name}</span>
                      {isPrimary && (
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200 border">
                          <Star className="h-3 w-3" /> Primary
                        </Badge>
                      )}
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <ListChecks className="h-3 w-3" /> {p.totalQuestions} Qs
                      </span>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {Math.round(p.durationSec / 60)} min
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{p.fullName}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {!isPrimary && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMakePrimary(id)}
                        title="Make this your primary exam"
                      >
                        <Star className="h-3.5 w-3.5" /> Primary
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemove(id)}
                      disabled={goals.length <= 1}
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 disabled:opacity-40"
                    >
                      <X className="h-3.5 w-3.5" /> Remove
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Addable exams */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex items-center justify-between mb-2 mt-1">
            <h4 className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5 text-emerald-600" />
              Add more exams
            </h4>
            <Badge variant="outline" className="bg-stone-50 border-stone-200 text-stone-600">
              {addable.length} available
            </Badge>
          </div>

          {addable.length === 0 ? (
            <div className="rounded-lg border border-dashed border-stone-300 p-6 text-center text-sm text-muted-foreground">
              <Award className="h-6 w-6 mx-auto mb-2 text-stone-400" />
              All available exams for your user type are already selected.
            </div>
          ) : (
            <ScrollArea className="flex-1 max-h-[40vh] pr-3">
              <div className="space-y-2">
                {addable.map((p) => (
                  <Card
                    key={p.id}
                    className="p-3 flex items-center justify-between gap-3 border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-stone-900">{p.name}</span>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <ListChecks className="h-3 w-3" /> {p.totalQuestions} Qs
                        </span>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {Math.round(p.durationSec / 60)} min
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{p.fullName}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAdd(p.id)}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add
                    </Button>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <div className="text-xs text-muted-foreground bg-stone-50 border border-stone-200 rounded-md p-3 flex items-start gap-2">
          <Check className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <span>
            Your primary exam is used as the default for dashboard, planner, and analytics. You can change it anytime by clicking <span className="font-medium">Primary</span> on another exam.
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
