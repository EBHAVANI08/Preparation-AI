'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
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
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FeatureAccent = 'emerald' | 'amber' | 'teal' | 'rose';

const ACCENTS: Record<
  FeatureAccent,
  {
    iconBg: string;
    iconText: string;
    blob: string;
    badge: string;
    ring: string;
    cta: string;
  }
> = {
  emerald: {
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    iconText: 'text-white',
    blob: 'bg-emerald-100',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ring: 'group-hover:border-emerald-300',
    cta: 'text-emerald-700 hover:text-emerald-800',
  },
  amber: {
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500',
    iconText: 'text-white',
    blob: 'bg-amber-100',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    ring: 'group-hover:border-amber-300',
    cta: 'text-amber-700 hover:text-amber-800',
  },
  teal: {
    iconBg: 'bg-gradient-to-br from-teal-500 to-cyan-600',
    iconText: 'text-white',
    blob: 'bg-teal-100',
    badge: 'bg-teal-50 text-teal-700 border-teal-200',
    ring: 'group-hover:border-teal-300',
    cta: 'text-teal-700 hover:text-teal-800',
  },
  rose: {
    iconBg: 'bg-gradient-to-br from-rose-500 to-pink-500',
    iconText: 'text-white',
    blob: 'bg-rose-100',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    ring: 'group-hover:border-rose-300',
    cta: 'text-rose-700 hover:text-rose-800',
  },
};

export interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  accent?: FeatureAccent;
  onClick?: () => void;
  badge?: string;
  detailTitle?: string;
  detailDescription?: string;
  detailBody?: React.ReactNode;
  ctaLabel?: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  subtitle,
  accent = 'emerald',
  onClick,
  badge,
  detailTitle,
  detailDescription,
  detailBody,
  ctaLabel,
}: FeatureCardProps) {
  const a = ACCENTS[accent];
  const [open, setOpen] = React.useState(false);

  const hasDetail = Boolean(detailBody || detailDescription);

  function handleClick() {
    if (hasDetail) {
      setOpen(true);
      return;
    }
    onClick?.();
  }

  const CardInner = (
    <Card
      role={onClick || hasDetail ? 'button' : undefined}
      tabIndex={onClick || hasDetail ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={(e) => {
        if ((onClick || hasDetail) && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
      className={cn(
        'group relative overflow-hidden p-5 border-stone-200 cursor-pointer card-lift',
        a.ring
      )}
    >
      {/* Decorative blob */}
      <div
        className={cn(
          'pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full opacity-50 transition-transform group-hover:scale-110',
          a.blob
        )}
      />
      <div className="relative flex items-start gap-3">
        <div
          className={cn(
            'h-10 w-10 rounded-xl flex items-center justify-center shadow-md flex-shrink-0',
            a.iconBg,
            a.iconText
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-stone-900 text-sm leading-tight">{title}</p>
            {badge && (
              <Badge variant="outline" className={cn('text-[10px] py-0', a.badge)}>
                {badge}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{subtitle}</p>
        </div>
        <ChevronRight
          className={cn(
            'h-4 w-4 mt-1 flex-shrink-0 transition-all group-hover:translate-x-0.5',
            a.cta
          )}
        />
      </div>
    </Card>
  );

  return (
    <>
      {CardInner}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'h-10 w-10 rounded-xl flex items-center justify-center shadow-md',
                  a.iconBg,
                  a.iconText
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>{detailTitle || title}</DialogTitle>
                {detailDescription && (
                  <DialogDescription className="mt-0.5">{detailDescription}</DialogDescription>
                )}
              </div>
            </div>
          </DialogHeader>

          {detailBody && <div className="space-y-3 text-sm text-stone-700">{detailBody}</div>}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
            {onClick && (
              <Button
                className={cn(a.iconBg, 'hover:opacity-90')}
                onClick={() => {
                  setOpen(false);
                  onClick();
                }}
              >
                {ctaLabel || 'Open'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
