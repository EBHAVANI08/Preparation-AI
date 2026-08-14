'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { AppShell } from '@/components/app-shell';
import { AuthScreen } from '@/components/auth/auth-screen';
import { DailyPlanModal } from '@/components/dashboard/daily-plan-modal';
import { Dashboard } from '@/components/dashboard/dashboard';
import { MockExamEngine } from '@/components/mock-exam/mock-exam-engine';
import { ExamRunner } from '@/components/mock-exam/exam-runner';
import { PerformanceAnalytics } from '@/components/views/performance-analytics';
import { MentorRoom } from '@/components/views/mentor-room';
import { CareerGuide } from '@/components/views/career-guide';
import { UniversityFinder } from '@/components/views/university-finder';
import { ScholarshipEngine } from '@/components/views/scholarship-engine';
import { StudyPlanner } from '@/components/views/study-planner';
import { WellnessCounsellor } from '@/components/views/wellness-counsellor';
import { UniversityPredictor } from '@/components/views/university-predictor';
import { DigitalTwin, ExamReadiness, RankPredictor, SuccessSimulator } from '@/components/views/ai-features';
import type { View } from '@/lib/types';
import { usePathname } from 'next/navigation';
import { viewForPath } from '@/lib/navigation';

function ViewRouter({ view }: { view: View }) {
  switch (view) {
    case 'dashboard':
      return <Dashboard />;
    case 'mock-exam':
      return <ExamRunnerOrEngine />;
    case 'analytics':
      return <PerformanceAnalytics />;
    case 'mentor':
      return <MentorRoom />;
    case 'career':
      return <CareerGuide />;
    case 'university':
      return <UniversityFinder />;
    case 'scholarship':
      return <ScholarshipEngine />;
    case 'planner':
      return <StudyPlanner />;
    case 'counsellor':
      return <WellnessCounsellor />;
    case 'university-predictor':
      return <UniversityPredictor />;
    case 'digital-twin':
      return <DigitalTwin />;
    case 'readiness':
      return <ExamReadiness />;
    case 'rank-predictor':
      return <RankPredictor />;
    case 'success-simulator':
      return <SuccessSimulator />;
    case 'weakness-radar':
      return <PerformanceAnalytics />;
    default:
      return <Dashboard />;
  }
}

function ExamRunnerOrEngine() {
  const { currentExam, setView, endExam } = useStore();
  if (currentExam) {
    return <ExamRunner onExit={() => { endExam(); setView('mock-exam'); }} />;
  }
  return <MockExamEngine onStart={() => {}} />;
}

export default function Home() {
  const pathname = usePathname();
  const { user, view, hydrated, setView, login, logout, setAttempts } = useStore();

  useEffect(() => { if (pathname !== '/') setView(viewForPath(pathname)); }, [pathname, setView]);

  useEffect(() => {
    if (!hydrated) return;
    fetch('/api/auth/me')
      .then(async (response) => ({ ok: response.ok, body: await response.json() }))
      .then(({ ok, body }) => {
        if (ok && body.user && !user) login(body.user);
        if (!ok && user) logout();
      })
      .catch(() => undefined);
  }, [hydrated]);

  useEffect(() => {
    if (!user) return;
    fetch('/api/attempts')
      .then((response) => response.ok ? response.json() : null)
      .then((body) => { if (body?.attempts) setAttempts(body.attempts); })
      .catch(() => undefined);
  }, [user?.id, setAttempts]);

  useEffect(() => {
    if (!user || useStore.getState().currentExam) return;
    fetch('/api/attempts', { method: 'POST' })
      .then((response) => response.ok ? response.json() : null)
      .then(async (body) => body?.attemptId ? fetch(`/api/attempts/${body.attemptId}`) : null)
      .then((response) => response?.ok ? response.json() : null)
      .then((body) => { if (body?.status === 'in_progress' && body.exam) useStore.getState().startExam(body.exam, body.exam.examId); })
      .catch(() => undefined);
  }, [user?.id]);

  useEffect(() => {
    if (hydrated && user && view === 'auth') {
      setView('dashboard');
    }
  }, [hydrated, user, view, setView]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center animate-pulse">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10" />
              <path d="M12 2v10l7 7" />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground">Loading Preparation AI...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <>
      <AppShell>
        <ViewRouter view={view} />
      </AppShell>
      <DailyPlanModal />
    </>
  );
}
