// Core types for Preparation AI

export type View =
  | 'auth'
  | 'dashboard'
  | 'mock-exam'
  | 'analytics'
  | 'mentor'
  | 'career'
  | 'university'
  | 'scholarship'
  | 'planner'
  | 'counsellor'
  | 'digital-twin'
  | 'success-simulator'
  | 'readiness'
  | 'rank-predictor'
  | 'university-predictor'
  | 'weakness-radar';

export type UserType = 'school-11' | 'school-12' | 'ug' | 'grad';

export interface User {
  id: string;
  name: string;
  email: string;
  type: UserType;
  examGoal: string;
  examGoals: string[];
  examDate: string;
  targetScore?: number;
  joinedAt: string;
}

export type QuestionType = 'mcq' | 'msq' | 'numerical' | 'descriptive' | 'reading' | 'listening' | 'speaking' | 'writing';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  text: string;
  passage?: string;
  mediaLabel?: string;
  options?: string[];
  correctOptions?: number[];
  correctNumeric?: number;
  tolerance?: number;
  answerKeys?: string[];
  marks: number;
  negativeMarks: number;
  unit?: string;
}

export type Question = BaseQuestion;

export interface QuestionMeta {
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  negativeMarks: number;
}

export type GenFn = (m: QuestionMeta, usedTexts?: Set<string>) => Question;

export interface ExamSection {
  name: string;
  subject: string;
  questionCount: number;
  marksPerQuestion: number;
  negativeMarks: number;
}

export interface ExamPattern {
  id: string;
  name: string;
  fullName: string;
  category: 'school' | 'ug' | 'grad';
  totalQuestions: number;
  durationSec: number;
  totalMarks: number;
  marking: string;
  description: string;
  sections: ExamSection[];
  syllabus: { subject: string; topics: { topic: string; weight: number }[] }[];
  icon: string;
  color: string;
}

export interface GeneratedExam {
  id: string;
  examId: string;
  examName: string;
  durationSec: number;
  totalMarks: number;
  startedAt: string;
  questions: Question[];
  sections: { name: string; subject: string; questionIds: string[] }[];
  draftAnswers?: Record<string, AnswerValue>;
  draftTimeTaken?: Record<string, number>;
  currentQuestion?: number;
}

export type AnswerValue =
  | { type: 'mcq'; optionIndex: number }
  | { type: 'msq'; optionIndices: number[] }
  | { type: 'numerical'; value: number }
  | { type: 'descriptive'; text: string }
  | { type: 'reading'; optionIndex: number }
  | { type: 'listening'; optionIndex: number }
  | { type: 'speaking'; text: string }
  | { type: 'writing'; text: string }
  | { type: 'unanswered' };

export interface QuestionResult {
  questionId: string;
  subject: string;
  topic: string;
  difficulty: string;
  correct: boolean;
  partial: boolean;
  awardedMarks: number;
  timeTakenSec: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface SubjectScore {
  subject: string;
  total: number;
  scored: number;
  correct: number;
  wrong: number;
  unattempted: number;
  accuracy: number;
}

export interface TopicScore {
  subject: string;
  topic: string;
  total: number;
  scored: number;
  correct: number;
  accuracy: number;
}

export interface YoutubeRec {
  topic: string;
  videoId: string;
  title: string;
  channel: string;
  duration: string;
  thumbnail: string;
  searchUrl: string;
}

export interface BehaviorAnalysis {
  avgTimeBySubject: { subject: string; avgSec: number }[];
  speedProgression: { decile: number; avgSec: number }[];
  idleTimeSec: number;
  idlePauses: number;
  startedAtHour: number;
  timeOfDay: 'Early Morning' | 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  paceTrend: 'speeding-up' | 'slowing-down' | 'steady';
  difficultyTimeGap: number;
  rapidGuesses: number;
  answerChanges: number;
  vsPrevious?: {
    scoreDelta: number;
    speedDelta: number;
    accuracyDelta: number;
    isImprovement: boolean;
  };
}

export interface ExamAttempt {
  id: string;
  examId: string;
  examName: string;
  startedAt: string;
  submittedAt: string;
  durationSec: number;
  answers: Record<string, AnswerValue>;
  score: number;
  totalMarks: number;
  percentile: number;
  rank: number;
  subjectScores: SubjectScore[];
  topicScores: TopicScore[];
  accuracy: number;
  speed: number;
  avgTimePerQuestion: number;
  weakTopics: string[];
  strongTopics: string[];
  results: QuestionResult[];
  youtubeRecs: YoutubeRec[];
  readinessIndex: number;
  attemptNumber?: number;
  behavior?: BehaviorAnalysis;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface DailyPlan {
  date: string;
  tasks: { id: string; title: string; type: 'mock' | 'revision' | 'study' | 'practice'; duration: string; done: boolean }[];
  mockScheduled: boolean;
  motivationalQuote: string;
  studyHoursTarget: number;
}

export interface Course {
  id: string;
  name: string;
  category: string;
  overview: string;
  futureScope: string;
  averageSalary: string;
  demandForecast: string;
  industryGrowth: string;
  skillRequirements: string[];
  workLifeBalance: string;
  careerProgression: string;
  topRecruiters: string[];
  icon: string;
}

export interface University {
  id: string;
  name: string;
  country: string;
  ranking: number;
  acceptanceRate: string;
  tuitionFees: string;
  scholarships: string[];
  livingCost: string;
  accommodation: string;
  visaDetails: string;
  employmentRate: string;
  popularCourses: string[];
}

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  amount: string;
  eligibility: string;
  deadline: string;
  countries: string[];
  level: string;
  link: string;
}

export interface StudyPlan {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'revision' | 'mock' | 'priority';
  title: string;
  description: string;
  blocks: { time: string; task: string; subject: string; duration: string }[];
  aiGenerated?: boolean;
}
