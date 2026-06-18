import type { StudyPlan } from './types';

// Study plan templates for Preparation AI
// Each plan covers ~8 hours/day (daily), 54 hours/week, etc.

export const STUDY_PLAN_TEMPLATES: StudyPlan[] = [
  // ============================================================
  // 1. DAILY PLAN — 8-hour day with 13 time blocks
  // ============================================================
  {
    id: 'plan-daily-default',
    type: 'daily',
    title: 'Daily Study Plan (8-Hour Productive Day)',
    description:
      'A balanced 8-hour day covering Physics, Chemistry, Mathematics, breaks, revision and a mock/practice block. Designed for JEE/NEET aspirants but customisable for any exam goal.',
    blocks: [
      { time: '06:00 - 06:30', task: 'Wake up, hydrate, light stretching & plan the day', subject: 'Routine', duration: '30 min' },
      { time: '06:30 - 08:30', task: 'Physics — new concept + 10 solved examples (Rotational Motion)', subject: 'Physics', duration: '2 hr' },
      { time: '08:30 - 09:00', task: 'Breakfast + short walk', subject: 'Break', duration: '30 min' },
      { time: '09:00 - 11:00', task: 'Chemistry — Organic GOC deep dive + 15 MCQs', subject: 'Chemistry', duration: '2 hr' },
      { time: '11:00 - 11:15', task: 'Short break — tea, hydrate', subject: 'Break', duration: '15 min' },
      { time: '11:15 - 13:00', task: 'Mathematics — Calculus (Limits & Continuity) practice', subject: 'Mathematics', duration: '1 hr 45 min' },
      { time: '13:00 - 14:00', task: 'Lunch + power nap (20 min)', subject: 'Break', duration: '1 hr' },
      { time: '14:00 - 15:30', task: 'Practice session — mixed-subject DPP (Daily Practice Problems)', subject: 'Practice', duration: '1 hr 30 min' },
      { time: '15:30 - 16:00', task: 'Break — snack, hydrate', subject: 'Break', duration: '30 min' },
      { time: '16:00 - 17:30', task: 'Mock test / timed practice (chapter or section test)', subject: 'Mock', duration: '1 hr 30 min' },
      { time: '17:30 - 18:30', task: 'Mock test analysis — review mistakes, log weak topics', subject: 'Revision', duration: '1 hr' },
      { time: '18:30 - 19:30', task: 'Dinner + family time / walk', subject: 'Break', duration: '1 hr' },
      { time: '19:30 - 21:00', task: 'Revision — flashcards + spaced repetition of weak topics', subject: 'Revision', duration: '1 hr 30 min' },
    ],
    aiGenerated: false,
  },

  // ============================================================
  // 2. WEEKLY PLAN — 54-hour week broken into days with focus areas
  // ============================================================
  {
    id: 'plan-weekly-default',
    type: 'weekly',
    title: 'Weekly Study Plan (54-Hour Sprint Week)',
    description:
      'A 6-day intensive week (~9 hours/day) with day-wise focus areas. Day 7 is light revision + mock test. Total study load ~54 hours including mocks.',
    blocks: [
      { time: 'Monday', task: 'Physics — Mechanics deep dive (3hr study + 1.5hr DPP + 1.5hr mock analysis + 3hr Math Algebra)', subject: 'Physics + Math', duration: '9 hr' },
      { time: 'Tuesday', task: 'Chemistry — Physical Chemistry (Thermodynamics, Electrochemistry) + Math Calculus', subject: 'Chemistry + Math', duration: '9 hr' },
      { time: 'Wednesday', task: 'Physics — Electrodynamics + Math Coordinate Geometry + 1.5hr revision', subject: 'Physics + Math', duration: '9 hr' },
      { time: 'Thursday', task: 'Chemistry — Organic (GOC + Hydrocarbons) + Biology/CS elective + 1.5hr DPP', subject: 'Chemistry', duration: '9 hr' },
      { time: 'Friday', task: 'Physics — Modern Physics + Chemistry Inorganic revision + Math Probability', subject: 'Physics + Math', duration: '9 hr' },
      { time: 'Saturday', task: 'Mixed-subject problem-solving marathon + previous-year question bank', subject: 'Practice', duration: '9 hr' },
      { time: 'Sunday', task: 'Full mock test (3hr) + analysis (2hr) + spaced-repetition revision (2hr) + buffer (2hr)', subject: 'Mock + Revision', duration: '9 hr' },
    ],
    aiGenerated: false,
  },

  // ============================================================
  // 3. MONTHLY PLAN — 4-week structure with week-by-week goals
  // ============================================================
  {
    id: 'plan-monthly-default',
    type: 'monthly',
    title: 'Monthly Study Plan (4-Week Structure)',
    description:
      'A 4-week macro plan alternating new-concept weeks with revision + mock weeks. Goal: complete 60% syllabus coverage + 2 full mocks per month.',
    blocks: [
      { time: 'Week 1', task: 'New concepts — Physics Mechanics & Electrostatics; Chemistry GOC & Atomic Structure; Math Algebra & Trigonometry. Target: 40 hours + 1 sectional mock.', subject: 'Physics + Chemistry + Math', duration: '40 hr' },
      { time: 'Week 2', task: 'New concepts — Physics Current Electricity & Magnetism; Chemistry Bonding & Equilibrium; Math Calculus + Vectors. Target: 40 hours + 1 sectional mock.', subject: 'Physics + Chemistry + Math', duration: '40 hr' },
      { time: 'Week 3', task: 'New concepts + integration — Physics Optics & Modern; Chemistry Electrochemistry & Kinetics; Math Coordinate Geometry + Probability. Target: 40 hours + 1 full mock.', subject: 'Physics + Chemistry + Math', duration: '40 hr' },
      { time: 'Week 4', task: 'Revision + Mock week — spaced repetition of all W1-W3 topics, 2 full-length mocks with full analysis. Target: 38 hours + 2 full mocks.', subject: 'Revision + Mock', duration: '38 hr' },
    ],
    aiGenerated: false,
  },

  // ============================================================
  // 4. REVISION PLAN — Spaced repetition for weak topics
  // ============================================================
  {
    id: 'plan-revision-default',
    type: 'revision',
    title: 'Revision Plan — Spaced Repetition for Weak Topics',
    description:
      'A 14-day spaced-repetition schedule that revisits weak topics at increasing intervals (1 day, 3 days, 7 days, 14 days) to consolidate long-term memory. Pairs well with the priority matrix.',
    blocks: [
      { time: 'Day 1', task: 'Initial learning pass — Rotational Motion (Physics) + Coordination Compounds (Chemistry). Create one-page summary notes.', subject: 'Physics + Chemistry', duration: '2 hr' },
      { time: 'Day 2', task: 'First recall — 30-min active recall of Day-1 topics via flashcards + 5 MCQs each.', subject: 'Physics + Chemistry', duration: '1 hr 30 min' },
      { time: 'Day 4', task: 'Second recall — full 1-hour recall session + 10 MCQs each on Day-1 topics. Add Vector Algebra (Math) as new weak topic.', subject: 'Physics + Chemistry + Math', duration: '2 hr' },
      { time: 'Day 8', task: 'Third recall — 1-hour recall on Day-1 topics + 30-min on Day-4 new topic. Practice 15 mixed MCQs.', subject: 'Physics + Chemistry + Math', duration: '2 hr' },
      { time: 'Day 11', task: 'New weak topic introduction — Chemical Kinetics + Electrochemistry. 2-hour learning pass.', subject: 'Chemistry', duration: '2 hr' },
      { time: 'Day 14', task: 'Final consolidation — full 2.5-hour mixed recall of all weak topics above + 25 MCQs under timed conditions.', subject: 'All weak topics', duration: '2 hr 30 min' },
    ],
    aiGenerated: true,
  },

  // ============================================================
  // 5. MOCK TEST PLAN — Every 3rd day
  // ============================================================
  {
    id: 'plan-mock-default',
    type: 'mock',
    title: 'Mock Test Plan — Every 3rd Day',
    description:
      'A 30-day mock-test cadence with a full-length mock every 3rd day (10 mocks total). Non-mock days alternate between topic tests and analysis.',
    blocks: [
      { time: 'Day 1', task: 'Full Mock #1 (3 hr) + analysis (2 hr) — set baseline percentile', subject: 'Full Mock', duration: '5 hr' },
      { time: 'Day 2', task: 'Targeted practice on weak topics from Mock #1 + DPP', subject: 'Practice', duration: '3 hr' },
      { time: 'Day 3', task: 'Sectional test — Physics (90 min) + revision (60 min)', subject: 'Physics', duration: '2 hr 30 min' },
      { time: 'Day 4', task: 'Full Mock #2 (3 hr) + analysis (2 hr)', subject: 'Full Mock', duration: '5 hr' },
      { time: 'Day 5', task: 'Targeted practice on weak topics from Mock #2 + DPP', subject: 'Practice', duration: '3 hr' },
      { time: 'Day 6', task: 'Sectional test — Chemistry (90 min) + revision (60 min)', subject: 'Chemistry', duration: '2 hr 30 min' },
      { time: 'Day 7', task: 'Full Mock #3 (3 hr) + analysis (2 hr)', subject: 'Full Mock', duration: '5 hr' },
      { time: 'Day 8', task: 'Targeted practice on weak topics from Mock #3 + DPP', subject: 'Practice', duration: '3 hr' },
      { time: 'Day 9', task: 'Sectional test — Math (90 min) + revision (60 min)', subject: 'Mathematics', duration: '2 hr 30 min' },
      { time: 'Day 10', task: 'Full Mock #4 (3 hr) + analysis (2 hr)', subject: 'Full Mock', duration: '5 hr' },
      { time: 'Day 13', task: 'Full Mock #5 (3 hr) + analysis (2 hr)', subject: 'Full Mock', duration: '5 hr' },
      { time: 'Day 16', task: 'Full Mock #6 (3 hr) + analysis (2 hr)', subject: 'Full Mock', duration: '5 hr' },
      { time: 'Day 19', task: 'Full Mock #7 (3 hr) + analysis (2 hr)', subject: 'Full Mock', duration: '5 hr' },
      { time: 'Day 22', task: 'Full Mock #8 (3 hr) + analysis (2 hr)', subject: 'Full Mock', duration: '5 hr' },
      { time: 'Day 25', task: 'Full Mock #9 (3 hr) + analysis (2 hr)', subject: 'Full Mock', duration: '5 hr' },
      { time: 'Day 28', task: 'Full Mock #10 (3 hr) + deep analysis (2 hr)', subject: 'Full Mock', duration: '5 hr' },
      { time: 'Day 30', task: 'Final revision + light practice — confidence building, no new topics', subject: 'Revision', duration: '2 hr' },
    ],
    aiGenerated: true,
  },

  // ============================================================
  // 6. PRIORITY MATRIX PLAN — Based on weak topics
  // ============================================================
  {
    id: 'plan-priority-default',
    type: 'priority',
    title: 'Priority Matrix — High-Impact Weak Topics First',
    description:
      'Eisenhower-style priority matrix that ranks weak topics by exam weightage × current accuracy. Focus first on high-weightage, low-accuracy topics for maximum score uplift.',
    blocks: [
      { time: 'Quadrant 1 — Urgent & Important', task: 'Topics with >8% weightage AND <40% accuracy. Examples: Rotational Motion, Coordination Compounds, Calculus. Allocate 50% of study time here.', subject: 'High-priority weak topics', duration: '4 hr / day' },
      { time: 'Quadrant 2 — Important but Not Urgent', task: 'Topics with >8% weightage AND 40-70% accuracy. Examples: Electrostatics, Organic GOC, Vectors. Allocate 30% of study time for steady improvement.', subject: 'Medium-priority topics', duration: '2 hr 30 min / day' },
      { time: 'Quadrant 3 — Urgent but Less Important', task: 'Topics with <5% weightage AND <40% accuracy. Examples: obscure inorganic reactions. Allocate 10% of study time — do not over-invest.', subject: 'Low-weightage weak topics', duration: '45 min / day' },
      { time: 'Quadrant 4 — Maintain', task: 'Topics with >70% accuracy. Allocate 10% of study time for spaced-repetition maintenance to prevent forgetting. Examples: Kinematics, Atomic Structure basics.', subject: 'Strong topics', duration: '45 min / day' },
      { time: 'Weekly Review', task: 'Re-rank topics based on latest mock test results. Promote/demote topics between quadrants. Update the priority matrix every Sunday.', subject: 'Review', duration: '1 hr / week' },
    ],
    aiGenerated: true,
  },
];
