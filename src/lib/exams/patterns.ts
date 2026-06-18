import type { ExamPattern } from '@/lib/types';

export const EXAM_PATTERNS: ExamPattern[] = [
  {
    id: 'jee-main', name: 'JEE Main', fullName: 'Joint Entrance Examination (Main)', category: 'school',
    totalQuestions: 75, durationSec: 180 * 60, totalMarks: 300, marking: '+4 / -1',
    description: 'Engineering entrance for NITs/IIITs. 75 questions (25 each in Physics, Chemistry, Mathematics).',
    icon: 'Atom', color: 'emerald',
    sections: [
      { name: 'Physics', subject: 'Physics', questionCount: 25, marksPerQuestion: 4, negativeMarks: 1 },
      { name: 'Chemistry', subject: 'Chemistry', questionCount: 25, marksPerQuestion: 4, negativeMarks: 1 },
      { name: 'Mathematics', subject: 'Mathematics', questionCount: 25, marksPerQuestion: 4, negativeMarks: 1 },
    ],
    syllabus: [
      { subject: 'Physics', topics: [
        { topic: 'Kinematics', weight: 0.12 }, { topic: 'Laws of Motion', weight: 0.1 }, { topic: 'Work Energy Power', weight: 0.1 },
        { topic: 'Rotational Motion', weight: 0.1 }, { topic: 'Gravitation', weight: 0.08 }, { topic: 'Thermodynamics', weight: 0.1 },
        { topic: 'Oscillations Waves', weight: 0.1 }, { topic: 'Electrostatics', weight: 0.1 }, { topic: 'Current Electricity', weight: 0.1 },
        { topic: 'Modern Physics', weight: 0.1 },
      ]},
      { subject: 'Chemistry', topics: [
        { topic: 'Atomic Structure', weight: 0.1 }, { topic: 'Chemical Bonding', weight: 0.12 }, { topic: 'Thermodynamics', weight: 0.1 },
        { topic: 'Equilibrium', weight: 0.1 }, { topic: 'Electrochemistry', weight: 0.1 }, { topic: 'Chemical Kinetics', weight: 0.1 },
        { topic: 'Coordination Compounds', weight: 0.1 }, { topic: 'Organic Basics', weight: 0.1 }, { topic: 'Hydrocarbons', weight: 0.1 },
        { topic: 'Biomolecules', weight: 0.08 },
      ]},
      { subject: 'Mathematics', topics: [
        { topic: 'Algebra', weight: 0.12 }, { topic: 'Trigonometry', weight: 0.1 }, { topic: 'Coordinate Geometry', weight: 0.12 },
        { topic: 'Calculus', weight: 0.16 }, { topic: 'Vectors', weight: 0.1 }, { topic: '3D Geometry', weight: 0.08 },
        { topic: 'Probability', weight: 0.1 }, { topic: 'Matrices Determinants', weight: 0.1 }, { topic: 'Sequences Series', weight: 0.12 },
      ]},
    ],
  },
  {
    id: 'jee-advanced', name: 'JEE Advanced', fullName: 'Joint Entrance Examination (Advanced)', category: 'school',
    totalQuestions: 54, durationSec: 180 * 60, totalMarks: 180, marking: 'Full / Partial / Zero',
    description: 'IIT entrance. 54 questions (18 per subject). Complex marking with partial credit.',
    icon: 'Atom', color: 'teal',
    sections: [
      { name: 'Physics', subject: 'Physics', questionCount: 18, marksPerQuestion: 4, negativeMarks: 0 },
      { name: 'Chemistry', subject: 'Chemistry', questionCount: 18, marksPerQuestion: 4, negativeMarks: 0 },
      { name: 'Mathematics', subject: 'Mathematics', questionCount: 18, marksPerQuestion: 4, negativeMarks: 0 },
    ],
    syllabus: [
      { subject: 'Physics', topics: [
        { topic: 'Mechanics', weight: 0.2 }, { topic: 'Electromagnetism', weight: 0.2 }, { topic: 'Optics', weight: 0.15 },
        { topic: 'Modern Physics', weight: 0.2 }, { topic: 'Thermodynamics', weight: 0.15 }, { topic: 'Waves', weight: 0.1 },
      ]},
      { subject: 'Chemistry', topics: [
        { topic: 'Physical Chemistry', weight: 0.3 }, { topic: 'Organic Chemistry', weight: 0.35 }, { topic: 'Inorganic Chemistry', weight: 0.35 },
      ]},
      { subject: 'Mathematics', topics: [
        { topic: 'Calculus', weight: 0.25 }, { topic: 'Algebra', weight: 0.25 }, { topic: 'Coordinate Geometry', weight: 0.2 },
        { topic: 'Trigonometry', weight: 0.15 }, { topic: 'Vectors 3D', weight: 0.15 },
      ]},
    ],
  },
  {
    id: 'neet', name: 'NEET', fullName: 'National Eligibility cum Entrance Test', category: 'school',
    totalQuestions: 180, durationSec: 200 * 60, totalMarks: 720, marking: '+4 / -1',
    description: 'Medical entrance. 180 questions: Physics 45, Chemistry 45, Botany 45, Zoology 45.',
    icon: 'HeartPulse', color: 'rose',
    sections: [
      { name: 'Physics', subject: 'Physics', questionCount: 45, marksPerQuestion: 4, negativeMarks: 1 },
      { name: 'Chemistry', subject: 'Chemistry', questionCount: 45, marksPerQuestion: 4, negativeMarks: 1 },
      { name: 'Botany', subject: 'Botany', questionCount: 45, marksPerQuestion: 4, negativeMarks: 1 },
      { name: 'Zoology', subject: 'Zoology', questionCount: 45, marksPerQuestion: 4, negativeMarks: 1 },
    ],
    syllabus: [
      { subject: 'Physics', topics: [
        { topic: 'Mechanics', weight: 0.2 }, { topic: 'Electrostatics', weight: 0.12 }, { topic: 'Current Electricity', weight: 0.12 },
        { topic: 'Magnetism', weight: 0.1 }, { topic: 'Optics', weight: 0.12 }, { topic: 'Modern Physics', weight: 0.14 },
        { topic: 'Thermodynamics', weight: 0.1 }, { topic: 'Waves', weight: 0.1 },
      ]},
      { subject: 'Chemistry', topics: [
        { topic: 'Physical Chemistry', weight: 0.3 }, { topic: 'Organic Chemistry', weight: 0.35 }, { topic: 'Inorganic Chemistry', weight: 0.35 },
      ]},
      { subject: 'Botany', topics: [
        { topic: 'Cell Biology', weight: 0.15 }, { topic: 'Plant Physiology', weight: 0.15 }, { topic: 'Genetics', weight: 0.15 },
        { topic: 'Plant Anatomy', weight: 0.1 }, { topic: 'Ecology', weight: 0.15 }, { topic: 'Plant Reproduction', weight: 0.15 },
        { topic: 'Biodiversity', weight: 0.15 },
      ]},
      { subject: 'Zoology', topics: [
        { topic: 'Human Physiology', weight: 0.25 }, { topic: 'Animal Kingdom', weight: 0.15 }, { topic: 'Reproduction', weight: 0.15 },
        { topic: 'Genetics Evolution', weight: 0.15 }, { topic: 'Biotechnology', weight: 0.15 }, { topic: 'Human Health', weight: 0.15 },
      ]},
    ],
  },
  {
    id: 'sat', name: 'SAT', fullName: 'Scholastic Assessment Test', category: 'school',
    totalQuestions: 154, durationSec: 180 * 60, totalMarks: 1600, marking: 'No negative marking',
    description: 'US college admissions test. Reading, Writing & Language, Math.',
    icon: 'GraduationCap', color: 'emerald',
    sections: [
      { name: 'Reading', subject: 'Reading', questionCount: 52, marksPerQuestion: 1, negativeMarks: 0 },
      { name: 'Writing', subject: 'Writing', questionCount: 44, marksPerQuestion: 1, negativeMarks: 0 },
      { name: 'Math', subject: 'Math', questionCount: 58, marksPerQuestion: 1, negativeMarks: 0 },
    ],
    syllabus: [
      { subject: 'Reading', topics: [
        { topic: 'Main Idea', weight: 0.15 }, { topic: 'Inference', weight: 0.15 }, { topic: 'Vocabulary Context', weight: 0.15 },
        { topic: 'Author Purpose', weight: 0.15 }, { topic: 'Detail Evidence', weight: 0.2 }, { topic: 'Detail', weight: 0.1 },
        { topic: 'Skimming Scanning', weight: 0.1 },
      ]},
      { subject: 'Writing', topics: [
        { topic: 'Grammar', weight: 0.3 }, { topic: 'Punctuation', weight: 0.2 }, { topic: 'Sentence Structure', weight: 0.25 },
        { topic: 'Expression of Ideas', weight: 0.25 },
      ]},
      { subject: 'Math', topics: [
        { topic: 'Algebra', weight: 0.3 }, { topic: 'Geometry', weight: 0.15 }, { topic: 'Number System', weight: 0.15 },
        { topic: 'Data Interpretation', weight: 0.2 }, { topic: 'Advanced Math', weight: 0.2 },
      ]},
    ],
  },
  {
    id: 'cuet', name: 'CUET', fullName: 'Common University Entrance Test', category: 'school',
    totalQuestions: 100, durationSec: 150 * 60, totalMarks: 500, marking: '+5 / -1',
    description: 'Central University admissions. 100 questions across sections.',
    icon: 'BookOpen', color: 'teal',
    sections: [
      { name: 'English', subject: 'English', questionCount: 25, marksPerQuestion: 5, negativeMarks: 1 },
      { name: 'General Knowledge', subject: 'General Knowledge', questionCount: 25, marksPerQuestion: 5, negativeMarks: 1 },
      { name: 'Quantitative', subject: 'Quantitative', questionCount: 25, marksPerQuestion: 5, negativeMarks: 1 },
      { name: 'Reasoning', subject: 'Reasoning', questionCount: 25, marksPerQuestion: 5, negativeMarks: 1 },
    ],
    syllabus: [
      { subject: 'English', topics: [
        { topic: 'Reading Comprehension', weight: 0.3 }, { topic: 'Grammar', weight: 0.25 }, { topic: 'Vocabulary', weight: 0.25 },
        { topic: 'Verbal Ability', weight: 0.2 },
      ]},
      { subject: 'General Knowledge', topics: [
        { topic: 'Current Affairs', weight: 0.25 }, { topic: 'Static GK', weight: 0.2 }, { topic: 'History', weight: 0.15 },
        { topic: 'Polity', weight: 0.15 }, { topic: 'Economy', weight: 0.1 }, { topic: 'Geography', weight: 0.15 },
      ]},
      { subject: 'Quantitative', topics: [
        { topic: 'Arithmetic', weight: 0.3 }, { topic: 'Algebra', weight: 0.2 }, { topic: 'Geometry', weight: 0.2 },
        { topic: 'Data Interpretation', weight: 0.15 }, { topic: 'Number System', weight: 0.15 },
      ]},
      { subject: 'Reasoning', topics: [
        { topic: 'Analogies', weight: 0.2 }, { topic: 'Series', weight: 0.2 }, { topic: 'Coding Decoding', weight: 0.15 },
        { topic: 'Blood Relations', weight: 0.15 }, { topic: 'Syllogism', weight: 0.15 }, { topic: 'Logical', weight: 0.15 },
      ]},
    ],
  },
  {
    id: 'ap', name: 'AP Exams', fullName: 'Advanced Placement Exams', category: 'school',
    totalQuestions: 63, durationSec: 180 * 60, totalMarks: 100, marking: 'No negative marking',
    description: 'US college-level exams for high school students. MCQs + Free Response.',
    icon: 'BookOpen', color: 'amber',
    sections: [{ name: 'AP Subject', subject: 'AP Subject', questionCount: 63, marksPerQuestion: 1, negativeMarks: 0 }],
    syllabus: [{ subject: 'AP Subject', topics: [
      { topic: 'Calculus', weight: 0.25 }, { topic: 'Statistics', weight: 0.15 }, { topic: 'Physics', weight: 0.25 },
      { topic: 'Chemistry', weight: 0.2 }, { topic: 'Biology', weight: 0.15 },
    ]}],
  },
  {
    id: 'olympiad', name: 'Olympiad (NSO/IMO)', fullName: 'Science / Math Olympiad', category: 'school',
    totalQuestions: 50, durationSec: 60 * 60, totalMarks: 60, marking: '+1, no negative',
    description: 'National Science Olympiad & International Math Olympiad. 50 questions in 60 min.',
    icon: 'Trophy', color: 'amber',
    sections: [
      { name: 'Science/Math', subject: 'Science', questionCount: 25, marksPerQuestion: 1, negativeMarks: 0 },
      { name: 'Reasoning', subject: 'Reasoning', questionCount: 15, marksPerQuestion: 1, negativeMarks: 0 },
      { name: 'Achiever', subject: 'Mathematics', questionCount: 10, marksPerQuestion: 2, negativeMarks: 0 },
    ],
    syllabus: [
      { subject: 'Science', topics: [
        { topic: 'Physics', weight: 0.3 }, { topic: 'Chemistry', weight: 0.3 }, { topic: 'Biology', weight: 0.2 },
        { topic: 'Number Theory', weight: 0.1 }, { topic: 'Combinatorics', weight: 0.1 },
      ]},
      { subject: 'Reasoning', topics: [
        { topic: 'Analogies', weight: 0.25 }, { topic: 'Series', weight: 0.25 }, { topic: 'Coding Decoding', weight: 0.25 },
        { topic: 'Analytical', weight: 0.25 },
      ]},
      { subject: 'Mathematics', topics: [
        { topic: 'Algebra', weight: 0.3 }, { topic: 'Geometry', weight: 0.3 }, { topic: 'Number Theory', weight: 0.2 },
        { topic: 'Combinatorics', weight: 0.2 },
      ]},
    ],
  },
  {
    id: 'gre', name: 'GRE', fullName: 'Graduate Record Examination', category: 'grad',
    totalQuestions: 54, durationSec: 102 * 60, totalMarks: 340, marking: 'No negative marking',
    description: 'Graduate school admissions. Verbal Reasoning, Quantitative Reasoning.',
    icon: 'Briefcase', color: 'emerald',
    sections: [
      { name: 'Verbal', subject: 'Verbal', questionCount: 27, marksPerQuestion: 1, negativeMarks: 0 },
      { name: 'Quantitative', subject: 'Quantitative', questionCount: 27, marksPerQuestion: 1, negativeMarks: 0 },
    ],
    syllabus: [
      { subject: 'Verbal', topics: [
        { topic: 'Reading Comprehension', weight: 0.5 }, { topic: 'Text Completion', weight: 0.25 },
        { topic: 'Sentence Equivalence', weight: 0.25 },
      ]},
      { subject: 'Quantitative', topics: [
        { topic: 'Arithmetic', weight: 0.25 }, { topic: 'Algebra', weight: 0.25 }, { topic: 'Geometry', weight: 0.25 },
        { topic: 'Data Interpretation', weight: 0.25 },
      ]},
    ],
  },
  {
    id: 'gmat', name: 'GMAT', fullName: 'Graduate Management Admission Test', category: 'grad',
    totalQuestions: 64, durationSec: 135 * 60, totalMarks: 805, marking: 'No negative marking',
    description: 'Business school admissions. Quantitative, Verbal, Data Insights.',
    icon: 'Briefcase', color: 'teal',
    sections: [
      { name: 'Quantitative', subject: 'Quantitative', questionCount: 21, marksPerQuestion: 1, negativeMarks: 0 },
      { name: 'Verbal', subject: 'Verbal', questionCount: 23, marksPerQuestion: 1, negativeMarks: 0 },
      { name: 'Data Insights', subject: 'Data Insights', questionCount: 20, marksPerQuestion: 1, negativeMarks: 0 },
    ],
    syllabus: [
      { subject: 'Quantitative', topics: [
        { topic: 'Arithmetic', weight: 0.3 }, { topic: 'Algebra', weight: 0.3 }, { topic: 'Word Problems', weight: 0.4 },
      ]},
      { subject: 'Verbal', topics: [
        { topic: 'Reading Comprehension', weight: 0.4 }, { topic: 'Critical Reasoning', weight: 0.4 },
        { topic: 'Sentence Correction', weight: 0.2 },
      ]},
      { subject: 'Data Insights', topics: [
        { topic: 'Data Sufficiency', weight: 0.4 }, { topic: 'Graphics Analysis', weight: 0.3 },
        { topic: 'Multi-Source Reasoning', weight: 0.3 },
      ]},
    ],
  },
  {
    id: 'gate', name: 'GATE', fullName: 'Graduate Aptitude Test in Engineering', category: 'grad',
    totalQuestions: 65, durationSec: 180 * 60, totalMarks: 100, marking: '+1/+2, -1/3',
    description: 'Engineering PG admissions + PSUs. 65 questions: 10 GA + 55 subject.',
    icon: 'Cpu', color: 'emerald',
    sections: [
      { name: 'Aptitude', subject: 'Aptitude', questionCount: 10, marksPerQuestion: 1, negativeMarks: 0.33 },
      { name: 'Computer Science', subject: 'Computer Science', questionCount: 55, marksPerQuestion: 2, negativeMarks: 0.66 },
    ],
    syllabus: [
      { subject: 'Aptitude', topics: [
        { topic: 'Verbal Aptitude', weight: 0.25 }, { topic: 'Quantitative Aptitude', weight: 0.25 },
        { topic: 'Analytical Aptitude', weight: 0.25 }, { topic: 'Spatial Aptitude', weight: 0.25 },
      ]},
      { subject: 'Computer Science', topics: [
        { topic: 'Data Structures', weight: 0.15 }, { topic: 'Algorithms', weight: 0.15 }, { topic: 'Operating Systems', weight: 0.1 },
        { topic: 'DBMS', weight: 0.1 }, { topic: 'Computer Networks', weight: 0.1 }, { topic: 'TOC', weight: 0.1 },
        { topic: 'Digital Logic', weight: 0.1 }, { topic: 'Computer Organization', weight: 0.1 }, { topic: 'Compiler Design', weight: 0.1 },
      ]},
    ],
  },
  {
    id: 'cat', name: 'CAT', fullName: 'Common Admission Test', category: 'grad',
    totalQuestions: 66, durationSec: 120 * 60, totalMarks: 198, marking: '+3 / -1',
    description: 'IIM MBA entrance. VARC, DILR, Quantitative Aptitude.',
    icon: 'Briefcase', color: 'amber',
    sections: [
      { name: 'VARC', subject: 'English', questionCount: 24, marksPerQuestion: 3, negativeMarks: 1 },
      { name: 'DILR', subject: 'DILR', questionCount: 20, marksPerQuestion: 3, negativeMarks: 1 },
      { name: 'Quant', subject: 'Quantitative', questionCount: 22, marksPerQuestion: 3, negativeMarks: 1 },
    ],
    syllabus: [
      { subject: 'English', topics: [
        { topic: 'Reading Comprehension', weight: 0.6 }, { topic: 'Para Jumbles', weight: 0.1 }, { topic: 'Vocabulary', weight: 0.1 },
        { topic: 'Grammar', weight: 0.1 }, { topic: 'Verbal Ability', weight: 0.1 },
      ]},
      { subject: 'DILR', topics: [
        { topic: 'Data Interpretation', weight: 0.5 }, { topic: 'Logical Reasoning', weight: 0.5 },
      ]},
      { subject: 'Quantitative', topics: [
        { topic: 'Arithmetic', weight: 0.3 }, { topic: 'Algebra', weight: 0.2 }, { topic: 'Geometry', weight: 0.2 },
        { topic: 'Number System', weight: 0.15 }, { topic: 'Modern Math', weight: 0.15 },
      ]},
    ],
  },
  {
    id: 'upsc', name: 'UPSC CSE', fullName: 'Civil Services Examination (Prelims)', category: 'grad',
    totalQuestions: 100, durationSec: 120 * 60, totalMarks: 200, marking: '+2 / -0.66',
    description: 'Indian Civil Services Prelims (GS Paper 1). 100 questions in 120 min.',
    icon: 'Landmark', color: 'teal',
    sections: [{ name: 'General Studies', subject: 'General Studies', questionCount: 100, marksPerQuestion: 2, negativeMarks: 0.66 }],
    syllabus: [{ subject: 'General Studies', topics: [
      { topic: 'History', weight: 0.15 }, { topic: 'Geography', weight: 0.15 }, { topic: 'Polity', weight: 0.15 },
      { topic: 'Economy', weight: 0.15 }, { topic: 'Environment', weight: 0.1 }, { topic: 'Science Tech', weight: 0.1 },
      { topic: 'Current Affairs', weight: 0.2 },
    ]}],
  },
  {
    id: 'ielts', name: 'IELTS', fullName: 'International English Language Testing System', category: 'grad',
    totalQuestions: 80, durationSec: 165 * 60, totalMarks: 9, marking: 'Banded scoring',
    description: 'English proficiency for study/work abroad. Listening, Reading.',
    icon: 'Languages', color: 'rose',
    sections: [
      { name: 'Reading', subject: 'Reading', questionCount: 40, marksPerQuestion: 1, negativeMarks: 0 },
      { name: 'Listening', subject: 'Listening', questionCount: 40, marksPerQuestion: 1, negativeMarks: 0 },
    ],
    syllabus: [
      { subject: 'Reading', topics: [
        { topic: 'Skimming Scanning', weight: 0.2 }, { topic: 'Detail', weight: 0.25 }, { topic: 'Gist', weight: 0.15 },
        { topic: 'Inference', weight: 0.2 }, { topic: 'Vocabulary Context', weight: 0.2 },
      ]},
      { subject: 'Listening', topics: [
        { topic: 'Social', weight: 0.25 }, { topic: 'Academic', weight: 0.35 }, { topic: 'Detail', weight: 0.2 },
        { topic: 'Gist', weight: 0.1 }, { topic: 'Inference', weight: 0.1 },
      ]},
    ],
  },
  {
    id: 'toefl', name: 'TOEFL', fullName: 'Test of English as a Foreign Language', category: 'grad',
    totalQuestions: 64, durationSec: 116 * 60, totalMarks: 120, marking: 'No negative marking',
    description: 'English proficiency for US universities. Reading, Listening, Speaking, Writing.',
    icon: 'Languages', color: 'amber',
    sections: [
      { name: 'Reading', subject: 'Reading', questionCount: 20, marksPerQuestion: 1, negativeMarks: 0 },
      { name: 'Listening', subject: 'Listening', questionCount: 28, marksPerQuestion: 1, negativeMarks: 0 },
      { name: 'Speaking', subject: 'Speaking', questionCount: 4, marksPerQuestion: 1, negativeMarks: 0 },
      { name: 'Writing', subject: 'Writing', questionCount: 2, marksPerQuestion: 1, negativeMarks: 0 },
    ],
    syllabus: [
      { subject: 'Reading', topics: [
        { topic: 'Detail', weight: 0.3 }, { topic: 'Inference', weight: 0.2 }, { topic: 'Vocabulary Context', weight: 0.2 },
        { topic: 'Author Purpose', weight: 0.15 }, { topic: 'Gist', weight: 0.15 },
      ]},
      { subject: 'Listening', topics: [
        { topic: 'Social', weight: 0.3 }, { topic: 'Academic', weight: 0.4 }, { topic: 'Detail', weight: 0.15 },
        { topic: 'Inference', weight: 0.15 },
      ]},
      { subject: 'Speaking', topics: [{ topic: 'Independent', weight: 0.5 }, { topic: 'Integrated', weight: 0.5 }]},
      { subject: 'Writing', topics: [{ topic: 'Integrated', weight: 0.5 }, { topic: 'Independent', weight: 0.5 }]},
    ],
  },
  {
    id: 'duolingo', name: 'Duolingo English Test', fullName: 'Duolingo English Test', category: 'grad',
    totalQuestions: 30, durationSec: 60 * 60, totalMarks: 160, marking: 'Adaptive scoring',
    description: 'Modern English proficiency test. 30 questions in 60 min, computer-adaptive.',
    icon: 'Languages', color: 'emerald',
    sections: [{ name: 'English', subject: 'English', questionCount: 30, marksPerQuestion: 5, negativeMarks: 0 }],
    syllabus: [{ subject: 'English', topics: [
      { topic: 'Reading Comprehension', weight: 0.25 }, { topic: 'Grammar', weight: 0.25 },
      { topic: 'Vocabulary', weight: 0.25 }, { topic: 'Comprehension', weight: 0.25 },
    ]}],
  },
];

export function getPattern(examId: string): ExamPattern | undefined {
  return EXAM_PATTERNS.find((p) => p.id === examId);
}

export function examsForUserType(userType: string): ExamPattern[] {
  if (userType === 'school-11' || userType === 'school-12') {
    return EXAM_PATTERNS.filter((p) => p.category === 'school' || p.id === 'olympiad');
  }
  return EXAM_PATTERNS;
}
