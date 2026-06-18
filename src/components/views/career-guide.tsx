'use client';

import { useState } from 'react';
import {
  Briefcase,
  Cpu,
  HeartPulse,
  GraduationCap,
  Users,
  BookOpen,
  TrendingUp,
  IndianRupee,
  Building2,
  Scale,
  Award,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { PageHeader, StatCard } from '@/components/shared';
import { COURSES } from '@/lib/career-data';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { Course } from '@/lib/types';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Cpu,
  HeartPulse,
  GraduationCap,
  Briefcase,
  Users,
  BookOpen,
};

const CATEGORIES = ['All', 'Engineering', 'Medical', 'Management', 'Science', 'Design', 'Law'] as const;

const CATEGORY_ACCENTS: Record<string, string> = {
  Engineering: 'from-emerald-500 to-teal-600',
  Medical: 'from-rose-500 to-pink-600',
  Management: 'from-amber-500 to-orange-500',
  Science: 'from-teal-500 to-cyan-600',
  Design: 'from-amber-400 to-rose-400',
  Law: 'from-stone-600 to-stone-700',
};

export function CareerGuide() {
  const [category, setCategory] = useState<string>('All');
  const [selected, setSelected] = useState<Course | null>(null);
  const setView = useStore((s) => s.setView);

  const filtered =
    category === 'All' ? COURSES : COURSES.filter((c) => c.category === category);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Briefcase}
        title="Career Guide"
        subtitle="Explore 14 career paths — salaries, demand, recruiters and skill requirements"
        accent="amber"
      />

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium border transition',
              category === cat
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                : 'bg-white border-stone-200 text-stone-600 hover:border-emerald-300 hover:text-emerald-700'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Course grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((course) => {
          const Icon = ICON_MAP[course.icon] || BookOpen;
          const grad = CATEGORY_ACCENTS[course.category] || 'from-stone-500 to-stone-700';
          return (
            <Card
              key={course.id}
              className="border-stone-200 hover:shadow-md transition overflow-hidden cursor-pointer"
              onClick={() => setSelected(course)}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className={cn('h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0', grad)}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Badge variant="outline" className="text-[10px] mb-1">{course.category}</Badge>
                    <h3 className="font-semibold text-stone-900 leading-snug line-clamp-2">{course.name}</h3>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3 line-clamp-3">{course.overview}</p>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="bg-emerald-50 rounded-lg p-2">
                    <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-medium uppercase">
                      <IndianRupee className="h-3 w-3" /> Avg Salary
                    </div>
                    <p className="text-xs text-stone-800 mt-0.5 line-clamp-2">{course.averageSalary.split('.')[0]}</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-2">
                    <div className="flex items-center gap-1 text-[10px] text-amber-700 font-medium uppercase">
                      <TrendingUp className="h-3 w-3" /> Demand
                    </div>
                    <p className="text-xs text-stone-800 mt-0.5 line-clamp-2">{course.demandForecast.split('.')[0]}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5" />
                    {course.topRecruiters.length} recruiters
                  </div>
                  <Button size="sm" variant="ghost" className="text-emerald-700 hover:bg-emerald-50">
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (() => {
            const Icon = ICON_MAP[selected.icon] || BookOpen;
            const grad = CATEGORY_ACCENTS[selected.category] || 'from-stone-500 to-stone-700';
            return (
              <>
                <DialogHeader>
                  <div className="flex items-start gap-3">
                    <div className={cn('h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0', grad)}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl">{selected.name}</DialogTitle>
                      <DialogDescription className="mt-1">{selected.overview}</DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCard label="Avg Salary" value="View" sub={selected.averageSalary.split('.')[0]} icon={IndianRupee} accent="emerald" />
                  <StatCard label="Demand" value="View" sub={selected.demandForecast.split('.')[0]} icon={TrendingUp} accent="amber" />
                  <StatCard label="Future Scope" value="Strong" sub={selected.futureScope.split('.')[0]} icon={Award} accent="teal" />
                  <StatCard label="Industry Growth" value="High" sub={selected.industryGrowth} icon={TrendingUp} accent="rose" />
                </div>

                <div className="space-y-4 mt-2">
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Scale className="h-4 w-4 text-emerald-600" /> Skill Requirements
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.skillRequirements.map((s) => (
                        <Badge key={s} variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="bg-stone-50 rounded-lg p-3">
                    <h4 className="text-sm font-semibold mb-1">Work-Life Balance</h4>
                    <p className="text-sm text-muted-foreground">{selected.workLifeBalance}</p>
                  </div>

                  <div className="bg-stone-50 rounded-lg p-3">
                    <h4 className="text-sm font-semibold mb-1">Career Progression</h4>
                    <p className="text-sm text-muted-foreground">{selected.careerProgression}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">Top Recruiters</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.topRecruiters.map((r) => (
                        <Badge key={r} variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                          {r}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setView('university')}>
                    <GraduationCap className="h-4 w-4" /> Find Universities
                  </Button>
                  <Button variant="outline" onClick={() => setView('scholarship')}>
                    <Award className="h-4 w-4" /> Scholarships
                  </Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setView('mentor')}>
                    <ExternalLink className="h-4 w-4" /> Ask Mentor
                  </Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
