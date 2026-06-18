'use client';

import { useMemo, useState } from 'react';
import {
  Award,
  Search,
  Calendar,
  MapPin,
  ExternalLink,
  GraduationCap,
  Building2,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/shared';
import { SCHOLARSHIPS } from '@/lib/scholarship-data';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { Scholarship } from '@/lib/types';

const COUNTRIES = ['All', 'USA', 'UK', 'Canada', 'Germany', 'Australia', 'Singapore', 'Netherlands', 'Sweden', 'Ireland', 'New Zealand', 'India'];
const LEVELS = ['All', 'Bachelors', 'Masters', 'PhD'];

function matchScore(s: Scholarship, examGoal: string, userType: string): number {
  let score = 50;
  // +30 if level matches user type
  const level = s.level.toLowerCase();
  if (userType === 'school-11' || userType === 'school-12') {
    if (level.includes('bachelor')) score += 30;
  } else if (userType === 'ug') {
    if (level.includes('master')) score += 30;
  } else if (userType === 'grad') {
    if (level.includes('phd') || level.includes('master')) score += 30;
  }
  // +20 if exam name appears in eligibility
  if (examGoal && s.eligibility.toLowerCase().includes(examGoal.toLowerCase())) {
    score += 20;
  }
  return Math.min(100, score);
}

export function ScholarshipEngine() {
  const user = useStore((s) => s.user);
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('All');
  const [country, setCountry] = useState('All');

  const examGoalName = user?.examGoal || '';
  const userType = user?.type || 'school-12';

  const matched = useMemo(() => {
    return SCHOLARSHIPS.map((s) => ({
      ...s,
      score: matchScore(s, examGoalName, userType),
    }))
      .filter((s) => {
        if (level !== 'All' && !s.level.toLowerCase().includes(level.toLowerCase())) return false;
        if (country !== 'All' && !s.countries.includes(country)) return false;
        if (query) {
          const q = query.toLowerCase();
          if (!s.name.toLowerCase().includes(q) && !s.provider.toLowerCase().includes(q) && !s.eligibility.toLowerCase().includes(q)) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => b.score - a.score);
  }, [query, level, country, examGoalName, userType]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Award}
        title="Scholarship Match Engine"
        subtitle="AI-matched scholarships based on your profile and exam goal"
        accent="amber"
        right={
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
            {matched.length} matched
          </Badge>
        }
      />

      {/* Filter card */}
      <Card className="border-stone-200 p-4">
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search scholarships..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              {LEVELS.map((l) => (
                <SelectItem key={l} value={l}>{l === 'All' ? 'All Levels' : l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((c) => (
                <SelectItem key={c} value={c}>{c === 'All' ? 'All Countries' : c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Scholarship grid */}
      {matched.length === 0 ? (
        <Card className="p-10 border-stone-200 text-center">
          <div className="h-14 w-14 mx-auto rounded-2xl bg-stone-100 flex items-center justify-center mb-3">
            <Search className="h-6 w-6 text-stone-400" />
          </div>
          <h3 className="font-semibold text-stone-800">No scholarships match your filters</h3>
          <p className="text-sm text-muted-foreground mt-1">Try widening your search or clearing filters.</p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {matched.map((s) => {
            const scoreColor = s.score >= 80 ? 'text-emerald-600' : s.score >= 60 ? 'text-amber-600' : 'text-stone-600';
            const barColor = s.score >= 80 ? 'bg-emerald-500' : s.score >= 60 ? 'bg-amber-500' : 'bg-stone-400';
            return (
              <Card key={s.id} className="border-stone-200 hover:shadow-md transition overflow-hidden flex flex-col">
                <CardContent className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Sparkles className={cn('h-3.5 w-3.5', scoreColor)} />
                        <span className={cn('text-xs font-bold', scoreColor)}>{s.score}% match</span>
                      </div>
                      <div className="w-20 mt-1">
                        <Progress value={s.score} className={cn('h-1.5', barColor)} />
                      </div>
                    </div>
                  </div>

                  <h3 className="font-semibold text-stone-900 mt-3 leading-snug">{s.name}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Building2 className="h-3 w-3" /> {s.provider}
                  </p>

                  <div className="bg-emerald-50 rounded-lg p-2 mt-3">
                    <p className="text-[10px] text-emerald-700 font-medium uppercase">Amount</p>
                    <p className="text-xs text-stone-800 mt-0.5 line-clamp-2">{s.amount}</p>
                  </div>

                  <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{s.eligibility}</p>

                  <div className="flex flex-wrap gap-1 mt-3">
                    <Badge variant="secondary" className="bg-teal-50 text-teal-700 border-teal-200 text-[10px]">
                      <GraduationCap className="h-2.5 w-2.5" /> {s.level.split(',')[0]}
                    </Badge>
                    {s.countries.slice(0, 2).map((c) => (
                      <Badge key={c} variant="outline" className="text-[10px] bg-stone-50">
                        <MapPin className="h-2.5 w-2.5" /> {c}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-stone-100">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" /> {s.deadline.split('(')[0]}
                    </div>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      asChild
                    >
                      <a href={s.link} target="_blank" rel="noopener noreferrer">
                        Apply now <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
