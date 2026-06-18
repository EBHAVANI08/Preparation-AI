'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function PageHeader({ icon: Icon, title, subtitle, accent = 'emerald', right }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  accent?: 'emerald' | 'amber' | 'teal' | 'rose';
  right?: React.ReactNode;
}) {
  const grads = {
    emerald: 'from-emerald-600 to-teal-600',
    amber: 'from-amber-500 to-orange-500',
    teal: 'from-teal-600 to-cyan-600',
    rose: 'from-rose-500 to-pink-500',
  };
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div className="flex items-start gap-3">
        <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${grads[accent]} flex items-center justify-center shadow-md flex-shrink-0`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

export function StatCard({ label, value, sub, icon: Icon, accent = 'emerald' }: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ComponentType<{ className?: string }>;
  accent?: 'emerald' | 'amber' | 'teal' | 'rose';
}) {
  const bgs = {
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    teal: 'bg-teal-50 text-teal-600',
    rose: 'bg-rose-50 text-rose-600',
  };
  return (
    <Card className="p-4 border-stone-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-stone-900">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
        {Icon && <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${bgs[accent]}`}><Icon className="h-4 w-4" /></div>}
      </div>
    </Card>
  );
}

export function SectionTitle({ icon: Icon, title, right }: { icon: React.ComponentType<{ className?: string }>; title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-semibold flex items-center gap-2">
        <Icon className="h-4 w-4 text-emerald-600" /> {title}
      </h3>
      {right}
    </div>
  );
}
