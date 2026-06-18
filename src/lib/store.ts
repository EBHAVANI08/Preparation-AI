'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, View, ExamAttempt, GeneratedExam, ChatMessage } from '@/lib/types';

function uid(): string {
  return Math.random().toString(36).slice(2, 11);
}

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function seedAttempts(): ExamAttempt[] {
  const now = Date.now();
  const mk = (
    idx: number,
    examId: string,
    examName: string,
    totalMarks: number,
    scorePct: number,
    subjectScores: { subject: string; scored: number; total: number }[],
    weakTopics: string[],
    strongTopics: string[],
    daysAgo: number
  ): ExamAttempt => {
    const score = Math.round(totalMarks * scorePct);
    const total = subjectScores.reduce((a, s) => a + s.total, 0);
    const scored = subjectScores.reduce((a, s) => a + s.scored, 0);
    const correct = Math.round(scored / 4);
    const wrong = Math.round((total - scored) / 4);
    const unattempted = Math.max(0, Math.round(total / 4) - correct - wrong);
    return {
      id: uid(),
      examId,
      examName,
      startedAt: new Date(now - daysAgo * 86400000).toISOString(),
      submittedAt: new Date(now - daysAgo * 86400000 + 7200000).toISOString(),
      durationSec: 5400 + idx * 600,
      answers: {},
      score,
      totalMarks,
      percentile: Math.round((1 - scorePct) * 60 + 40),
      rank: Math.round((1 - scorePct) * 50000 + 1000),
      subjectScores: subjectScores.map((s) => ({
        subject: s.subject,
        total: s.total,
        scored: s.scored,
        correct: Math.round(s.scored / 4),
        wrong: Math.round((s.total - s.scored) / 4),
        unattempted: 0,
        accuracy: Math.round((s.scored / s.total) * 100),
      })),
      topicScores: [],
      accuracy: Math.round(scorePct * 100),
      speed: 18 + idx * 2,
      avgTimePerQuestion: 90 - idx * 5,
      weakTopics,
      strongTopics,
      results: [],
      youtubeRecs: [],
      readinessIndex: Math.round(scorePct * 1000),
    };
  };

  return [
    mk(0, 'jee-main', 'JEE Main', 300, 0.58, [
      { subject: 'Physics', scored: 70, total: 100 },
      { subject: 'Chemistry', scored: 56, total: 100 },
      { subject: 'Mathematics', scored: 48, total: 100 },
    ], ['Rotational Motion', 'Calculus', 'Coordination Compounds'], ['Kinematics', 'Organic Basics'], 21),
    mk(1, 'jee-main', 'JEE Main', 300, 0.64, [
      { subject: 'Physics', scored: 80, total: 100 },
      { subject: 'Chemistry', scored: 64, total: 100 },
      { subject: 'Mathematics', scored: 48, total: 100 },
    ], ['Calculus', 'Vectors', 'Electrostatics'], ['Kinematics', 'Atomic Structure'], 14),
    mk(2, 'jee-main', 'JEE Main', 300, 0.71, [
      { subject: 'Physics', scored: 88, total: 100 },
      { subject: 'Chemistry', scored: 72, total: 100 },
      { subject: 'Mathematics', scored: 56, total: 100 },
    ], ['Modern Physics', 'Probability'], ['Kinematics', 'Organic Basics'], 7),
    mk(3, 'neet', 'NEET', 720, 0.55, [
      { subject: 'Physics', scored: 140, total: 180 },
      { subject: 'Chemistry', scored: 150, total: 180 },
      { subject: 'Botany', scored: 56, total: 180 },
      { subject: 'Zoology', scored: 50, total: 180 },
    ], ['Human Physiology', 'Genetics', 'Electrostatics'], ['Cell Biology', 'Chemical Bonding'], 3),
  ];
}

interface StoreState {
  user: User | null;
  view: View;
  currentExam: GeneratedExam | null;
  currentExamId: string | null;
  attempts: ExamAttempt[];
  mentorMessages: ChatMessage[];
  dailyPlanDismissed: string | null;
  hydrated: boolean;
  seenSignatures: string[];

  setHydrated: (v: boolean) => void;
  login: (user: User) => void;
  logout: () => void;
  setView: (v: View) => void;
  startExam: (exam: GeneratedExam, examId: string) => void;
  endExam: () => void;
  addAttempt: (a: ExamAttempt) => void;
  addMentorMessage: (m: ChatMessage) => void;
  setMentorMessages: (m: ChatMessage[]) => void;
  dismissDailyPlan: (date: string) => void;
  updateUser: (u: Partial<User>) => void;
  addExamGoal: (examId: string) => void;
  removeExamGoal: (examId: string) => void;
  recordSeenSignatures: (sigs: string[]) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      user: null,
      view: 'auth',
      currentExam: null,
      currentExamId: null,
      attempts: [],
      mentorMessages: [],
      dailyPlanDismissed: null,
      hydrated: false,
      seenSignatures: [],

      setHydrated: (v) => set({ hydrated: v }),
      login: (user) => set({ user, view: 'dashboard', attempts: seedAttempts() }),
      logout: () => set({ user: null, view: 'auth', currentExam: null, currentExamId: null, attempts: [], mentorMessages: [], seenSignatures: [] }),
      setView: (v) => set({ view: v }),
      startExam: (exam, examId) => set({ currentExam: exam, currentExamId: examId, view: 'mock-exam' }),
      endExam: () => set({ currentExam: null, currentExamId: null }),
      addAttempt: (a) => set((s) => ({ attempts: [a, ...s.attempts] })),
      addMentorMessage: (m) => set((s) => ({ mentorMessages: [...s.mentorMessages, m] })),
      setMentorMessages: (m) => set({ mentorMessages: m }),
      dismissDailyPlan: (date) => set({ dailyPlanDismissed: date }),
      updateUser: (u) => set((s) => ({ user: s.user ? { ...s.user, ...u } : null })),
      addExamGoal: (examId) => set((s) => {
        if (!s.user) return {};
        const current = s.user.examGoals?.length ? s.user.examGoals : [s.user.examGoal];
        if (current.includes(examId)) return {};
        const next = [...current, examId];
        return { user: { ...s.user, examGoals: next } };
      }),
      removeExamGoal: (examId) => set((s) => {
        if (!s.user) return {};
        const current = s.user.examGoals?.length ? s.user.examGoals : [s.user.examGoal];
        if (current.length <= 1) return {};
        const next = current.filter((id) => id !== examId);
        const newPrimary = s.user.examGoal === examId ? next[0] : s.user.examGoal;
        return { user: { ...s.user, examGoals: next, examGoal: newPrimary } };
      }),
      recordSeenSignatures: (sigs) => set((s) => {
        const existing = new Set(s.seenSignatures);
        for (const sig of sigs) existing.add(sig);
        const arr = Array.from(existing).slice(-5000);
        return { seenSignatures: arr };
      }),
    }),
    {
      name: 'prep-ai-store',
      onRehydrateStorage: () => (state) => {
        if (state?.user && (!state.user.examGoals || state.user.examGoals.length === 0)) {
          state.user.examGoals = [state.user.examGoal];
        }
        state?.setHydrated(true);
      },
    }
  )
);

export function defaultExamDate(): string {
  return daysFromNow(120);
}

export function uidGen(): string {
  return uid();
}

export function userExamGoals(user: User | null): string[] {
  if (!user) return [];
  if (user.examGoals && user.examGoals.length > 0) return user.examGoals;
  return user.examGoal ? [user.examGoal] : [];
}
