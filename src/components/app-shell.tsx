'use client';

import * as React from 'react';
import {
  Brain,
  LayoutDashboard,
  FileText,
  BarChart3,
  CalendarDays,
  MessageSquare,
  UserCog,
  Sparkles,
  Gauge,
  Trophy,
  School,
  Radar,
  Briefcase,
  GraduationCap,
  Award,
  HeartPulse,
  Bell,
  LogOut,
  Menu,
  Target,
  Calendar,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { getPattern } from '@/lib/exams/patterns';
import type { View } from '@/lib/types';

interface NavItem {
  id: View;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Core',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'mock-exam', label: 'Mock Exam', icon: FileText },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      { id: 'planner', label: 'Planner', icon: CalendarDays },
    ],
  },
  {
    title: 'AI Agents',
    items: [
      { id: 'mentor', label: 'AI Mentor', icon: MessageSquare },
      { id: 'digital-twin', label: 'Digital Twin', icon: UserCog },
      { id: 'success-simulator', label: 'Success Simulator', icon: Sparkles },
      { id: 'readiness', label: 'Readiness Index', icon: Gauge },
      { id: 'rank-predictor', label: 'Rank Predictor', icon: Trophy },
      { id: 'university-predictor', label: 'University Predictor', icon: School },
      { id: 'weakness-radar', label: 'Weakness Radar', icon: Radar },
    ],
  },
  {
    title: 'Explore',
    items: [
      { id: 'career', label: 'Career Guide', icon: Briefcase },
      { id: 'university', label: 'Universities', icon: GraduationCap },
      { id: 'scholarship', label: 'Scholarships', icon: Award },
      { id: 'counsellor', label: 'Wellness', icon: HeartPulse },
    ],
  },
];

export function daysToExam(examDate?: string): number {
  if (!examDate) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(examDate);
  target.setHours(0, 0, 0, 0);
  const diff = Math.ceil((target.getTime() - today.getTime()) / 86400000);
  return Math.max(0, diff);
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const view = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);
  const attempts = useStore((s) => s.attempts);

  return (
    <nav className="flex-1 overflow-y-auto scroll-thin px-3 py-3 space-y-5">
      {NAV_GROUPS.map((group) => (
        <div key={group.title}>
          <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            {group.title}
          </p>
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = view === item.id;
              const isMockExam = item.id === 'mock-exam';
              const attemptCount = attempts.length;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setView(item.id);
                    onNavigate?.();
                  }}
                  className={cn(
                    'w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all palette-btn',
                    active
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                      : 'text-stone-600 hover:bg-emerald-50 hover:text-emerald-700'
                  )}
                >
                  <Icon className={cn('h-4 w-4 flex-shrink-0', active ? 'text-white' : 'text-stone-500')} />
                  <span className="flex-1 text-left truncate">{item.label}</span>
                  {isMockExam && attemptCount > 0 && (
                    <Badge
                      variant="outline"
                      className={cn(
                        'h-5 px-1.5 text-[10px] border-none',
                        active ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
                      )}
                    >
                      {attemptCount}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function TargetExamCard() {
  const user = useStore((s) => s.user);
  if (!user) return null;
  const pattern = getPattern(user.examGoal);
  const days = daysToExam(user.examDate);
  const isNear = days <= 30;
  return (
    <div className="rounded-xl border border-stone-200 bg-gradient-to-br from-emerald-50 to-amber-50 p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-7 w-7 rounded-lg bg-emerald-600 flex items-center justify-center">
          <Target className="h-3.5 w-3.5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Primary exam</p>
          <p className="text-sm font-semibold text-stone-900 truncate">{pattern?.name ?? user.examGoal}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className={cn('text-2xl font-bold tabular-nums', isNear ? 'text-rose-600' : 'text-emerald-700')}>
            {days}
          </p>
          <p className="text-[10px] text-muted-foreground">days to go</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-muted-foreground flex items-center gap-1 justify-end">
            <Calendar className="h-3 w-3" />
            {new Date(user.examDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
          </p>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1 justify-end mt-0.5">
            <Clock className="h-3 w-3" />
            {pattern ? `${Math.round(pattern.durationSec / 60)} min` : '—'}
          </p>
        </div>
      </div>
    </div>
  );
}

function SidebarHeader() {
  return (
    <div className="flex items-center gap-2.5 px-4 h-16 border-b border-stone-200 flex-shrink-0">
      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-200">
        <Brain className="h-5 w-5 text-white" />
      </div>
      <div className="min-w-0">
        <p className="font-bold text-sm leading-tight">Preparation AI</p>
        <p className="text-[10px] text-muted-foreground leading-tight">AI Edu OS</p>
      </div>
    </div>
  );
}

function SidebarFooter() {
  const user = useStore((s) => s.user);
  const logout = useStore((s) => s.logout);
  if (!user) return null;
  return (
    <div className="border-t border-stone-200 p-3 flex-shrink-0">
      <div className="flex items-center gap-2 mb-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-semibold">
            {initials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate text-stone-900">{user.name}</p>
          <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-stone-500 hover:text-rose-600"
          onClick={logout}
          title="Log out"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function Topbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const user = useStore((s) => s.user);
  const setView = useStore((s) => s.setView);
  if (!user) return null;

  const pattern = getPattern(user.examGoal);
  const days = daysToExam(user.examDate);
  const firstName = user.name.split(' ')[0] ?? 'aspirant';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-stone-200 bg-white/80 backdrop-blur px-4 sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onOpenSidebar}
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted-foreground hidden sm:block">{greeting},</p>
        <p className="font-semibold text-stone-900 truncate text-sm sm:text-base">
          {firstName} <span className="hidden sm:inline text-muted-foreground font-normal">·</span>{' '}
          <span className="hidden sm:inline text-muted-foreground font-normal">{pattern?.name ?? user.examGoal}</span>
        </p>
      </div>

      <Button
        variant={days <= 30 ? 'destructive' : 'outline'}
        size="sm"
        className="hidden sm:inline-flex"
        onClick={() => setView('planner')}
      >
        <Calendar className="h-3.5 w-3.5" />
        {days} days to {pattern?.name ?? 'exam'}
      </Button>

      <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
        <Bell className="h-4 w-4" />
        <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
      </Button>

      <Avatar className="h-9 w-9 cursor-pointer" onClick={() => setView('dashboard')}>
        <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white text-xs font-semibold">
          {initials(user.name)}
        </AvatarFallback>
      </Avatar>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const user = useStore((s) => s.user);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-premium">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-72 flex-col bg-white border-r border-stone-200 z-40">
        <SidebarHeader />
        <NavList />
        <div className="px-3 pb-3">
          <TargetExamCard />
        </div>
        <SidebarFooter />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0 flex flex-col">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarHeader />
          <NavList onNavigate={() => setMobileOpen(false)} />
          <div className="px-3 pb-3">
            <TargetExamCard />
          </div>
          <SidebarFooter />
        </SheetContent>
      </Sheet>

      {/* Main */}
      <div className="lg:pl-72">
        <Topbar onOpenSidebar={() => setMobileOpen(true)} />
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
