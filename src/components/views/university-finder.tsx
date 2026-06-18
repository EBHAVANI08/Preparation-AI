'use client';

import { useState } from 'react';
import {
  Globe,
  Star,
  DollarSign,
  Briefcase,
  Percent,
  Award,
  GraduationCap,
  Plane,
  ExternalLink,
  Brain,
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
import { UNIVERSITIES } from '@/lib/university-data';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { University } from '@/lib/types';

const COUNTRY_FLAGS: { country: string; flag: string }[] = [
  { country: 'All', flag: '🌐' },
  { country: 'USA', flag: '🇺🇸' },
  { country: 'Canada', flag: '🇨🇦' },
  { country: 'UK', flag: '🇬🇧' },
  { country: 'Germany', flag: '🇩🇪' },
  { country: 'Australia', flag: '🇦🇺' },
  { country: 'New Zealand', flag: '🇳🇿' },
  { country: 'Ireland', flag: '🇮🇪' },
  { country: 'Singapore', flag: '🇸🇬' },
  { country: 'Netherlands', flag: '🇳🇱' },
  { country: 'Sweden', flag: '🇸🇪' },
];

const FLAG_BY_COUNTRY: Record<string, string> = COUNTRY_FLAGS.reduce(
  (acc, c) => ({ ...acc, [c.country]: c.flag }),
  {} as Record<string, string>
);

function renderStars(ranking: number) {
  // Map ranking to a 1-5 star score: rank 1-3 -> 5, rank 4-10 -> 4.5, etc.
  let score: number;
  if (ranking <= 3) score = 5;
  else if (ranking <= 10) score = 4.5;
  else if (ranking <= 30) score = 4;
  else if (ranking <= 70) score = 3.5;
  else if (ranking <= 150) score = 3;
  else score = 2.5;
  const fullStars = Math.floor(score);
  const hasHalf = score % 1 !== 0;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < fullStars;
        const half = i === fullStars && hasHalf;
        return (
          <Star
            key={i}
            className={cn(
              'h-3.5 w-3.5',
              filled ? 'fill-amber-400 text-amber-400' : half ? 'fill-amber-200 text-amber-400' : 'text-stone-300 fill-stone-100'
            )}
          />
        );
      })}
      <span className="text-xs text-muted-foreground ml-1">{score.toFixed(1)}</span>
    </div>
  );
}

export function UniversityFinder() {
  const [country, setCountry] = useState<string>('All');
  const [selected, setSelected] = useState<University | null>(null);
  const setView = useStore((s) => s.setView);

  const filtered = country === 'All' ? UNIVERSITIES : UNIVERSITIES.filter((u) => u.country === country);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Globe}
        title="University Finder"
        subtitle={`${UNIVERSITIES.length} top universities across 10 countries — fees, rankings, scholarships, visa`}
        accent="teal"
      />

      {/* Country chips */}
      <div className="flex flex-wrap gap-2">
        {COUNTRY_FLAGS.map((c) => (
          <button
            key={c.country}
            onClick={() => setCountry(c.country)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium border transition flex items-center gap-1.5',
              country === c.country
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                : 'bg-white border-stone-200 text-stone-600 hover:border-emerald-300 hover:text-emerald-700'
            )}
          >
            <span>{c.flag}</span>
            {c.country}
          </button>
        ))}
      </div>

      {/* University grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((uni) => {
          const flag = FLAG_BY_COUNTRY[uni.country] || '🌍';
          return (
            <Card
              key={uni.id}
              className="border-stone-200 hover:shadow-md transition overflow-hidden cursor-pointer"
              onClick={() => setSelected(uni)}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center flex-shrink-0 text-2xl">
                    {flag}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Badge variant="outline" className="text-[10px] mb-1">{uni.country}</Badge>
                    <h3 className="font-semibold text-stone-900 leading-snug line-clamp-2">{uni.name}</h3>
                    {renderStars(uni.ranking)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="bg-emerald-50 rounded-lg p-2">
                    <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-medium uppercase">
                      <DollarSign className="h-3 w-3" /> Tuition
                    </div>
                    <p className="text-xs text-stone-800 mt-0.5 line-clamp-2">{uni.tuitionFees.split('/')[0]}</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-2">
                    <div className="flex items-center gap-1 text-[10px] text-amber-700 font-medium uppercase">
                      <Briefcase className="h-3 w-3" /> Employed
                    </div>
                    <p className="text-xs text-stone-800 mt-0.5 line-clamp-2">{uni.employmentRate.split(' ')[0]}</p>
                  </div>
                  <div className="bg-teal-50 rounded-lg p-2">
                    <div className="flex items-center gap-1 text-[10px] text-teal-700 font-medium uppercase">
                      <Percent className="h-3 w-3" /> Accept
                    </div>
                    <p className="text-xs text-stone-800 mt-0.5">{uni.acceptanceRate.split(' ')[0]}</p>
                  </div>
                  <div className="bg-rose-50 rounded-lg p-2">
                    <div className="flex items-center gap-1 text-[10px] text-rose-700 font-medium uppercase">
                      <Award className="h-3 w-3" /> Scholarships
                    </div>
                    <p className="text-xs text-stone-800 mt-0.5">{uni.scholarships.length} available</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <Badge variant="secondary" className="bg-stone-100 text-stone-700">World Rank #{uni.ranking}</Badge>
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
          {selected && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center flex-shrink-0 text-2xl">
                    {FLAG_BY_COUNTRY[selected.country] || '🌍'}
                  </div>
                  <div>
                    <DialogTitle className="text-xl">{selected.name}</DialogTitle>
                    <DialogDescription className="mt-1">
                      {selected.country} · World Rank #{selected.ranking} · Acceptance {selected.acceptanceRate}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard label="Tuition Fees" value={selected.tuitionFees.split('/')[0]} icon={DollarSign} accent="emerald" />
                <StatCard label="Living Cost" value={selected.livingCost.split('/')[0]} icon={DollarSign} accent="amber" />
                <StatCard label="Employment" value={selected.employmentRate.split(' ')[0]} icon={Briefcase} accent="teal" />
                <StatCard label="Acceptance" value={selected.acceptanceRate.split(' ')[0]} icon={Percent} accent="rose" />
              </div>

              <div className="space-y-4 mt-2">
                <div className="bg-stone-50 rounded-lg p-3">
                  <h4 className="text-sm font-semibold mb-1 flex items-center gap-2">
                    <Plane className="h-4 w-4 text-emerald-600" /> Visa Details
                  </h4>
                  <p className="text-sm text-muted-foreground">{selected.visaDetails}</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">Scholarships</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.scholarships.map((s) => (
                      <Badge key={s} variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">Popular Courses</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.popularCourses.map((c) => (
                      <Badge key={c} variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="bg-stone-50 rounded-lg p-3">
                  <h4 className="text-sm font-semibold mb-1">Accommodation</h4>
                  <p className="text-sm text-muted-foreground">{selected.accommodation}</p>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setView('scholarship')}>
                  <Award className="h-4 w-4" /> Find Scholarships
                </Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setView('mentor')}>
                  <Brain className="h-4 w-4" /> Ask Mentor
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
