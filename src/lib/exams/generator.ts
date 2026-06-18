// ============================================================================
// Preparation AI — Exam Question Generator
// ----------------------------------------------------------------------------
// Comprehensive question generator producing unique, non-repeating exam papers.
// Exports: signature(text) and generateExam(pattern, seenSignatures?)
// ============================================================================
import type { ExamPattern, ExamSection, Question, QuestionMeta } from '@/lib/types';

// GenFn must be declared before any function that uses it as a parameter type
export type GenFn = (m: QuestionMeta, usedTexts?: Set<string>) => Question;

// ============================================================================
// RNG HELPERS
// ============================================================================

let _idCounter = 0;

export function uniqueId(): string {
  _idCounter += 1;
  return `q${Date.now().toString(36)}${_idCounter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randFloat(min: number, max: number, decimals = 2): number {
  const v = Math.random() * (max - min) + min;
  const f = Math.pow(10, decimals);
  return Math.round(v * f) / f;
}

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a;
}

// ============================================================================
// NUMBER FORMATTING (prevents floating-point noise like 7.380000000000001)
// ============================================================================

export function fmtNum(n: number): string {
  if (!isFinite(n)) return '0';
  const r = Math.round(n * 100) / 100;
  if (Number.isInteger(r)) return String(r);
  return r.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

// ============================================================================
// SIGNATURE — cross-attempt deduplication
// ============================================================================

export function signature(text: string): string {
  return text
    .toLowerCase()
    .replace(/\d+/g, '#')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
}

// ============================================================================
// OPTION BUILDERS
// ============================================================================

export function numericOptions(
  answer: number,
  unit = '',
): { options: string[]; correct: number } {
  const set = new Set<number>([answer]);
  const baseDeltas = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.5, 1, 2, 5, 10];
  let safety = 0;
  while (set.size < 4 && safety < 200) {
    safety += 1;
    const ratio = pick(baseDeltas);
    const sign = Math.random() < 0.5 ? -1 : 1;
    const candidate =
      Math.round(answer * (1 + sign * ratio) * 100) / 100;
    if (candidate !== answer && candidate >= 0 && isFinite(candidate)) {
      set.add(candidate);
    }
  }
  // Fallback if we couldn't generate enough distinct distractors
  let extra = 1;
  while (set.size < 4) {
    set.add(answer + extra);
    extra += 1;
  }
  const arr = shuffle([...set]);
  const correct = arr.indexOf(answer);
  const options = arr.map((o) => `${fmtNum(o)}${unit ? ' ' + unit : ''}`);
  return { options, correct };
}

export function mcqFromOptions(
  text: string,
  correct: string,
  distractors: string[],
  meta: QuestionMeta,
): Question {
  const seen = new Set<string>([correct.toLowerCase().trim()]);
  const cleanD: string[] = [];
  for (const d of distractors) {
    const k = String(d).toLowerCase().trim();
    if (!seen.has(k)) {
      seen.add(k);
      cleanD.push(d);
    }
    if (cleanD.length >= 3) break;
  }
  while (cleanD.length < 3) cleanD.push('None of the above');
  const all = shuffle([correct, ...cleanD]);
  const correctIdx = all.indexOf(correct);
  return {
    id: uniqueId(),
    type: 'mcq',
    subject: meta.subject,
    topic: meta.topic,
    difficulty: meta.difficulty,
    text,
    options: all,
    correctOptions: [correctIdx],
    marks: meta.marks,
    negativeMarks: meta.negativeMarks,
  };
}

// Helper for numeric MCQs (reduces boilerplate across parameterised generators)
function numericMcq(
  text: string,
  answer: number,
  unit: string,
  meta: QuestionMeta,
): Question {
  const { options, correct } = numericOptions(answer, unit);
  return {
    id: uniqueId(),
    type: 'mcq',
    subject: meta.subject,
    topic: meta.topic,
    difficulty: meta.difficulty,
    text,
    options,
    correctOptions: [correct],
    marks: meta.marks,
    negativeMarks: meta.negativeMarks,
    unit,
  };
}

// ============================================================================
// STATIC BANK + fromBank
// ============================================================================

export interface BankQuestion {
  topic: string;
  text: string;
  // opts[0] is correct; remaining are distractors.
  // Defensive: opts may contain nested arrays (legacy data bug), so we flatten.
  opts: unknown[];
  explanation?: string;
}

// Compact bank-question constructor for static banks below.
function BQ(
  topic: string,
  text: string,
  correct: string,
  ...distractors: string[]
): BankQuestion {
  return { topic, text, opts: [correct, ...distractors] };
}

export function fromBank(
  bank: BankQuestion[],
  meta: QuestionMeta,
  usedTexts?: Set<string>,
): Question {
  const shuffled = shuffle(bank);
  for (const bq of shuffled) {
    if (usedTexts && usedTexts.has(bq.text)) continue;

    // Flatten nested arrays defensively (legacy opts shape:
    // ['correct', ['d1','d2','d3'] as unknown as string[]])
    const flat: string[] = [];
    for (const o of bq.opts) {
      if (Array.isArray(o)) {
        for (const inner of o) flat.push(String(inner));
      } else {
        flat.push(String(o));
      }
    }
    if (flat.length < 2) continue;

    const correct = flat[0];
    const distractors = flat.slice(1);

    // Dedupe options within question (case-insensitive)
    const seen = new Set<string>([correct.toLowerCase().trim()]);
    const deduped: string[] = [correct];
    for (const d of distractors) {
      const k = String(d).toLowerCase().trim();
      if (!seen.has(k)) {
        seen.add(k);
        deduped.push(d);
      }
      if (deduped.length >= 4) break;
    }
    if (deduped.length < 2) continue;

    // Shuffle so the correct answer isn't always at index 0
    const opts = shuffle(deduped);
    const correctIdx = opts.indexOf(correct);

    if (usedTexts) usedTexts.add(bq.text);

    return {
      id: uniqueId(),
      type: 'mcq',
      subject: meta.subject,
      topic: meta.topic,
      difficulty: meta.difficulty,
      text: bq.text,
      options: opts,
      correctOptions: [correctIdx],
      marks: meta.marks,
      negativeMarks: meta.negativeMarks,
    };
  }

  // Fallback if bank is exhausted
  return mcqFromOptions(
    `Which statement about ${meta.topic} is correct?`,
    'It is a fundamental concept in the subject.',
    [
      'It is unrelated to the subject.',
      'It has no practical application.',
      'It only applies in rare circumstances.',
    ],
    meta,
  );
}

// ============================================================================
// TOPIC SELECTION
// ============================================================================

export function pickTopic(
  topicWeights: { topic: string; weight: number }[],
  preferTopics?: string[],
): string {
  let pool = topicWeights;
  if (preferTopics && preferTopics.length > 0) {
    const filtered = topicWeights.filter((tw) => preferTopics.includes(tw.topic));
    if (filtered.length > 0) pool = filtered;
  }
  const total = pool.reduce((s, tw) => s + tw.weight, 0);
  let r = Math.random() * total;
  for (const tw of pool) {
    r -= tw.weight;
    if (r <= 0) return tw.topic;
  }
  return pool[pool.length - 1].topic;
}

function leastUsedTopics(
  topicUsage: Map<string, number>,
  topicWeights: { topic: string; weight: number }[],
  n: number,
): string[] {
  const sorted = [...topicWeights].sort(
    (a, b) =>
      (topicUsage.get(a.topic) ?? 0) - (topicUsage.get(b.topic) ?? 0),
  );
  return sorted.slice(0, Math.min(n, sorted.length)).map((tw) => tw.topic);
}

// ============================================================================
// SECTION + EXAM GENERATION
// ============================================================================

export function generateForSection(
  subject: string,
  topicWeights: { topic: string; weight: number }[],
  count: number,
  section: ExamSection,
  crossAttemptSeen?: Set<string>,
): Question[] {
  const questions: Question[] = [];
  const usedTexts = new Set<string>();
  const usedSignatures = new Set<string>(crossAttemptSeen ?? []);
  const topicUsage = new Map<string, number>();
  for (const tw of topicWeights) topicUsage.set(tw.topic, 0);

  for (let i = 0; i < count; i++) {
    const ratio = i / Math.max(count, 1);
    const difficulty: 'easy' | 'medium' | 'hard' =
      ratio < 0.3 ? 'easy' : ratio < 0.8 ? 'medium' : 'hard';

    let generated: Question | null = null;
    let currentTopic = pickTopic(
      topicWeights,
      leastUsedTopics(topicUsage, topicWeights, 2),
    );

    for (let attempt = 0; attempt < 10; attempt++) {
      // Topic-fallback after 5 failed retries: try a different topic
      if (attempt >= 5) {
        const others = topicWeights.filter((tw) => tw.topic !== currentTopic);
        if (others.length > 0) {
          currentTopic = pickTopic(
            others,
            leastUsedTopics(topicUsage, others, 2),
          );
        }
      }

      const meta: QuestionMeta = {
        subject,
        topic: currentTopic,
        difficulty,
        marks: section.marksPerQuestion,
        negativeMarks: section.negativeMarks,
      };

      const gen = GENERATORS[`${subject}|${currentTopic}`];
      if (!gen) continue;

      let q: Question;
      try {
        q = gen(meta, usedTexts);
      } catch {
        continue;
      }

      const sig = signature(q.text);
      if (usedSignatures.has(sig) || usedTexts.has(q.text)) continue;

      generated = q;
      usedSignatures.add(sig);
      usedTexts.add(q.text);
      topicUsage.set(currentTopic, (topicUsage.get(currentTopic) ?? 0) + 1);
      break;
    }

    if (!generated) {
      // Last-resort fallback: force-generate any question (signature may collide)
      const topic = pickTopic(topicWeights);
      const meta: QuestionMeta = {
        subject,
        topic,
        difficulty,
        marks: section.marksPerQuestion,
        negativeMarks: section.negativeMarks,
      };
      const gen = GENERATORS[`${subject}|${topic}`];
      if (gen) {
        try {
          const q = gen(meta, usedTexts);
          usedTexts.add(q.text);
          usedSignatures.add(signature(q.text));
          generated = q;
        } catch {
          // ignore
        }
      }
    }

    if (generated) questions.push(generated);
  }

  return questions;
}

export function generateExam(
  pattern: ExamPattern,
  seenSignatures?: Set<string>,
): {
  questions: Question[];
  sections: { name: string; subject: string; questionIds: string[] }[];
} {
  const allQuestions: Question[] = [];
  const sections: { name: string; subject: string; questionIds: string[] }[] =
    [];
  // Seed internal accumulator with caller-provided signatures; this set
  // accumulates every signature generated during this run so that subsequent
  // sections (and subsequent attempts, via the mutation below) avoid repeats.
  const crossAttemptSeen = new Set<string>(seenSignatures ?? []);

  for (const section of pattern.sections) {
    const syllabus = pattern.syllabus.find((s) => s.subject === section.subject);
    const topicWeights = syllabus?.topics ?? [];
    const sectionQs = generateForSection(
      section.subject,
      topicWeights,
      section.questionCount,
      section,
      crossAttemptSeen,
    );
    // Propagate this section's signatures back into the accumulator so the
    // next section (and the caller, via the mutation below) sees them.
    for (const q of sectionQs) crossAttemptSeen.add(signature(q.text));
    sections.push({
      name: section.name,
      subject: section.subject,
      questionIds: sectionQs.map((q) => q.id),
    });
    allQuestions.push(...sectionQs);
  }

  // Propagate newly-seen signatures back to the caller's set so that the
  // same Set can be passed to generateExam again for cross-attempt dedup.
  if (seenSignatures) {
    for (const sig of crossAttemptSeen) seenSignatures.add(sig);
  }

  return { questions: allQuestions, sections };
}

// ============================================================================
// PHYSICS GENERATORS
// ============================================================================

const G = 9.8; // m/s^2

export function physicsKinematics(
  m: QuestionMeta,
  _usedTexts?: Set<string>,
): Question {
  const v = randInt(0, 6);
  switch (v) {
    case 0: {
      const d = randInt(50, 500);
      const t = randInt(5, 30);
      const ans = d / t;
      return numericMcq(
        `A car travels ${d} m in ${t} s on a straight road. What is its average velocity?`,
        ans,
        'm/s',
        m,
      );
    }
    case 1: {
      const vel = randInt(5, 30);
      const t = randInt(5, 25);
      const d = vel * t;
      return numericMcq(
        `An object moves at a constant velocity of ${vel} m/s for ${t} s. How far does it travel?`,
        d,
        'm',
        m,
      );
    }
    case 2: {
      const t = randInt(2, 8);
      const h = 0.5 * G * t * t;
      return numericMcq(
        `A ball is dropped from rest. How far does it fall in ${t} s (g = 9.8 m/s²)?`,
        h,
        'm',
        m,
      );
    }
    case 3: {
      const u = randInt(10, 40);
      const hMax = (u * u) / (2 * G);
      return numericMcq(
        `A ball is thrown vertically upward with an initial velocity of ${u} m/s. What is the maximum height it reaches (g = 9.8 m/s²)?`,
        hMax,
        'm',
        m,
      );
    }
    case 4: {
      const u = randInt(20, 60);
      const a = randInt(2, 8);
      const t = randInt(2, 6);
      const finalV = u - a * t;
      return numericMcq(
        `A vehicle moving at ${u} m/s decelerates at ${a} m/s² for ${t} s. What is its final velocity?`,
        finalV,
        'm/s',
        m,
      );
    }
    case 5: {
      const u = randInt(5, 25);
      const v = randInt(30, 60);
      const avg = (u + v) / 2;
      return numericMcq(
        `An object accelerates uniformly from ${u} m/s to ${v} m/s. What is its average velocity?`,
        avg,
        'm/s',
        m,
      );
    }
    default: {
      const u = randInt(10, 30);
      const v = randInt(35, 60);
      const t = randInt(3, 10);
      const a = (v - u) / t;
      return numericMcq(
        `A body accelerates from ${u} m/s to ${v} m/s in ${t} s. What is its acceleration?`,
        a,
        'm/s²',
        m,
      );
    }
  }
}

export function physicsLawsMotion(
  m: QuestionMeta,
  _usedTexts?: Set<string>,
): Question {
  const v = randInt(0, 6);
  switch (v) {
    case 0: {
      const mass = randInt(2, 20);
      const a = randInt(2, 12);
      const F = mass * a;
      return numericMcq(
        `A body of mass ${mass} kg accelerates at ${a} m/s². What net force acts on it?`,
        F,
        'N',
        m,
      );
    }
    case 1: {
      const mass = randInt(5, 30);
      const mu = randFloat(0.1, 0.6, 2);
      const f = mu * mass * G;
      return numericMcq(
        `A ${mass} kg block rests on a surface with coefficient of friction ${mu}. What is the force of friction (g = 9.8 m/s²)?`,
        f,
        'N',
        m,
      );
    }
    case 2: {
      const m1 = randInt(2, 8);
      const m2 = randInt(3, 10);
      const F = randInt(20, 80);
      const a = F / (m1 + m2);
      return numericMcq(
        `Two blocks of mass ${m1} kg and ${m2} kg are pushed by a force of ${F} N. What is the acceleration of the system?`,
        a,
        'm/s²',
        m,
      );
    }
    case 3: {
      const F = randInt(10, 60);
      const t = randInt(2, 8);
      const impulse = F * t;
      return numericMcq(
        `A force of ${F} N acts on a body for ${t} s. What is the impulse delivered?`,
        impulse,
        'N·s',
        m,
      );
    }
    case 4: {
      const mass = randInt(800, 2000);
      const a = randInt(2, 8);
      const F = mass * a;
      return numericMcq(
        `A ${mass} kg car accelerates at ${a} m/s². What is the net force exerted by the engine?`,
        F,
        'N',
        m,
      );
    }
    case 5: {
      const mass = randInt(2, 12);
      const a = randInt(1, 5);
      const T = mass * (G + a);
      return numericMcq(
        `A ${mass} kg mass is lifted upward with acceleration ${a} m/s². What is the tension in the rope (g = 9.8 m/s²)?`,
        T,
        'N',
        m,
      );
    }
    default: {
      const mass = randInt(2, 10);
      const a = randInt(1, 6);
      const Fnet = mass * a;
      return numericMcq(
        `What net force is required to give a ${mass} kg object an acceleration of ${a} m/s²?`,
        Fnet,
        'N',
        m,
      );
    }
  }
}

export function physicsWorkEnergy(
  m: QuestionMeta,
  _usedTexts?: Set<string>,
): Question {
  const v = randInt(0, 6);
  switch (v) {
    case 0: {
      const mass = randInt(1, 20);
      const vel = randInt(2, 20);
      const ke = 0.5 * mass * vel * vel;
      return numericMcq(
        `What is the kinetic energy of a ${mass} kg object moving at ${vel} m/s?`,
        ke,
        'J',
        m,
      );
    }
    case 1: {
      const mass = randInt(1, 20);
      const h = randInt(2, 30);
      const pe = mass * G * h;
      return numericMcq(
        `What is the potential energy of a ${mass} kg object at a height of ${h} m (g = 9.8 m/s²)?`,
        pe,
        'J',
        m,
      );
    }
    case 2: {
      const F = randInt(5, 50);
      const d = randInt(2, 20);
      const w = F * d;
      return numericMcq(
        `A force of ${F} N displaces an object by ${d} m in the direction of force. How much work is done?`,
        w,
        'J',
        m,
      );
    }
    case 3: {
      const mass = randInt(1, 15);
      const vel = randInt(2, 20);
      const p = mass * vel;
      return numericMcq(
        `What is the momentum of a ${mass} kg object moving at ${vel} m/s?`,
        p,
        'kg·m/s',
        m,
      );
    }
    case 4: {
      const W = randInt(50, 500);
      const t = randInt(2, 20);
      const P = W / t;
      return numericMcq(
        `If ${W} J of work is done in ${t} s, what is the power output?`,
        P,
        'W',
        m,
      );
    }
    case 5: {
      const mass = randInt(1, 10);
      const vel = randInt(2, 15);
      const h = randInt(2, 20);
      const E = 0.5 * mass * vel * vel + mass * G * h;
      return numericMcq(
        `A ${mass} kg object moves at ${vel} m/s at a height of ${h} m. What is its total mechanical energy (g = 9.8 m/s²)?`,
        E,
        'J',
        m,
      );
    }
    default: {
      const mass = randInt(1, 12);
      const vel = randInt(3, 18);
      const ke = 0.5 * mass * vel * vel;
      return numericMcq(
        `Calculate the kinetic energy of a ${mass} kg ball thrown at ${vel} m/s.`,
        ke,
        'J',
        m,
      );
    }
  }
}

export function physicsRotational(
  m: QuestionMeta,
  _usedTexts?: Set<string>,
): Question {
  const v = randInt(0, 5);
  switch (v) {
    case 0: {
      const I = randInt(2, 20);
      const omega = randInt(2, 15);
      const L = I * omega;
      return numericMcq(
        `A body with moment of inertia ${I} kg·m² rotates at ${omega} rad/s. What is its angular momentum?`,
        L,
        'kg·m²/s',
        m,
      );
    }
    case 1: {
      const I = randInt(2, 20);
      const alpha = randInt(2, 10);
      const tau = I * alpha;
      return numericMcq(
        `A body with moment of inertia ${I} kg·m² undergoes angular acceleration of ${alpha} rad/s². What torque acts on it?`,
        tau,
        'N·m',
        m,
      );
    }
    case 2: {
      const mass = randInt(1, 10);
      const r = randInt(1, 5);
      const I = mass * r * r;
      return numericMcq(
        `What is the moment of inertia of a point mass of ${mass} kg at a distance of ${r} m from the axis?`,
        I,
        'kg·m²',
        m,
      );
    }
    case 3: {
      const I = randInt(2, 15);
      const omega = randInt(2, 12);
      const KE = 0.5 * I * omega * omega;
      return numericMcq(
        `A rotating body (I = ${I} kg·m²) spins at ${omega} rad/s. What is its rotational kinetic energy?`,
        KE,
        'J',
        m,
      );
    }
    default: {
      const v = randInt(2, 20);
      const r = randInt(1, 5);
      const omega = v / r;
      return numericMcq(
        `A particle moves at ${v} m/s in a circle of radius ${r} m. What is its angular velocity?`,
        omega,
        'rad/s',
        m,
      );
    }
  }
}

export function physicsGravitation(
  m: QuestionMeta,
  _usedTexts?: Set<string>,
): Question {
  const v = randInt(0, 4);
  switch (v) {
    case 0: {
      const gEarth = 9.8;
      const ratio = randFloat(0.1, 0.9, 2);
      const gPlanet = gEarth * ratio;
      return numericMcq(
        `A planet has mass ${ratio} times that of Earth and similar radius. What is the approximate acceleration due to gravity on its surface?`,
        gPlanet,
        'm/s²',
        m,
      );
    }
    case 1: {
      const r = randInt(2, 10);
      const vOrb = Math.sqrt(G * 100 / r);
      return numericMcq(
        `A satellite orbits a body at a distance of ${r} × 10⁶ m (GM = 100 × 10¹² m³/s²). What is its orbital velocity?`,
        vOrb,
        'm/s',
        m,
      );
    }
    case 2: {
      const h = randInt(1000, 5000);
      const Re = 6400;
      const gH = 9.8 * Math.pow(Re / (Re + h), 2);
      return numericMcq(
        `What is the acceleration due to gravity at a height of ${h} km above Earth's surface (R = 6400 km)?`,
        gH,
        'm/s²',
        m,
      );
    }
    default: {
      const M = randInt(5, 12);
      const R = randInt(2, 8);
      const g = (6.67e-11 * M * 1e24) / (R * 1e6 * R * 1e6);
      return numericMcq(
        `A planet has mass ${M} × 10²⁴ kg and radius ${R} × 10⁶ m. What is g on its surface (G = 6.67 × 10⁻¹¹)?`,
        g,
        'm/s²',
        m,
      );
    }
  }
}

export function physicsThermo(
  m: QuestionMeta,
  _usedTexts?: Set<string>,
): Question {
  const v = randInt(0, 5);
  switch (v) {
    case 0: {
      const Q = randInt(100, 800);
      const W = randInt(50, 400);
      const dU = Q - W;
      return numericMcq(
        `A system absorbs ${Q} J of heat and does ${W} J of work. What is the change in internal energy?`,
        dU,
        'J',
        m,
      );
    }
    case 1: {
      const mass = randInt(1, 5);
      const c = randInt(2, 5);
      const dT = randInt(10, 50);
      const Q = mass * c * dT;
      return numericMcq(
        `How much heat is needed to raise ${mass} kg of a substance (c = ${c} J/kg·K) by ${dT} K?`,
        Q,
        'J',
        m,
      );
    }
    case 2: {
      return mcqFromOptions(
        'For an adiabatic process, which of the following is true?',
        'Q = 0',
        ['W = 0', 'ΔU = 0', 'T = constant'],
        m,
      );
    }
    case 3: {
      return mcqFromOptions(
        'For an isothermal process on an ideal gas, which quantity remains constant?',
        'Temperature',
        ['Pressure', 'Volume', 'Internal energy changes'],
        m,
      );
    }
    case 4: {
      const Q = randInt(200, 900);
      const W = randInt(50, 400);
      const dU = Q - W;
      return numericMcq(
        `In a thermodynamic process, ${Q} J of heat is added to the system and ${W} J of work is done by the system. Find ΔU.`,
        dU,
        'J',
        m,
      );
    }
    default: {
      return mcqFromOptions(
        'The first law of thermodynamics is a statement of conservation of:',
        'Energy',
        ['Momentum', 'Mass', 'Charge'],
        m,
      );
    }
  }
}

export function physicsWaves(
  m: QuestionMeta,
  _usedTexts?: Set<string>,
): Question {
  const v = randInt(0, 5);
  switch (v) {
    case 0: {
      const f = randInt(50, 500);
      const lambda = randFloat(0.5, 5, 2);
      const vWave = f * lambda;
      return numericMcq(
        `A wave has frequency ${f} Hz and wavelength ${lambda} m. What is its speed?`,
        vWave,
        'm/s',
        m,
      );
    }
    case 1: {
      const vWave = randInt(100, 400);
      const lambda = randFloat(0.5, 4, 2);
      const f = vWave / lambda;
      return numericMcq(
        `A wave travels at ${vWave} m/s with wavelength ${lambda} m. What is its frequency?`,
        f,
        'Hz',
        m,
      );
    }
    case 2: {
      const L = randFloat(0.5, 2.5, 2);
      const T = 2 * Math.PI * Math.sqrt(L / G);
      return numericMcq(
        `A simple pendulum has length ${L} m. What is its time period (g = 9.8 m/s²)?`,
        T,
        's',
        m,
      );
    }
    case 3: {
      const T = randFloat(0.5, 4, 2);
      const f = 1 / T;
      return numericMcq(
        `A pendulum completes one oscillation in ${T} s. What is its frequency?`,
        f,
        'Hz',
        m,
      );
    }
    default: {
      const vWave = randInt(200, 1500);
      const f = randInt(100, 1000);
      const lambda = vWave / f;
      return numericMcq(
        `A wave of frequency ${f} Hz travels at ${vWave} m/s. What is its wavelength?`,
        lambda,
        'm',
        m,
      );
    }
  }
}

export function physicsElectrostatics(
  m: QuestionMeta,
  _usedTexts?: Set<string>,
): Question {
  const v = randInt(0, 4);
  const k = 9e9;
  switch (v) {
    case 0: {
      const q1 = randInt(1, 10);
      const q2 = randInt(1, 10);
      const r = randInt(1, 5);
      const F = (k * q1 * 1e-6 * q2 * 1e-6) / (r * r);
      return numericMcq(
        `Two charges of ${q1} μC and ${q2} μC are placed ${r} m apart. What is the Coulomb force between them (k = 9 × 10⁹)?`,
        F,
        'N',
        m,
      );
    }
    case 1: {
      const q1 = randInt(1, 8);
      const q2 = randInt(1, 8);
      const r = randInt(1, 5);
      const U = (k * q1 * 1e-6 * q2 * 1e-6) / r;
      return numericMcq(
        `What is the electrostatic potential energy between ${q1} μC and ${q2} μC charges separated by ${r} m (k = 9 × 10⁹)?`,
        U,
        'J',
        m,
      );
    }
    case 2: {
      const Q = randInt(1, 12);
      const r = randInt(1, 5);
      const E = (k * Q * 1e-6) / (r * r);
      return numericMcq(
        `What is the electric field at ${r} m from a ${Q} μC point charge (k = 9 × 10⁹)?`,
        E,
        'N/C',
        m,
      );
    }
    default: {
      return mcqFromOptions(
        'Coulomb\'s law gives the force between:',
        'Two point charges',
        ['Two masses', 'Two magnets', 'Two currents'],
        m,
      );
    }
  }
}

export function physicsCurrent(
  m: QuestionMeta,
  _usedTexts?: Set<string>,
): Question {
  const v = randInt(0, 5);
  switch (v) {
    case 0: {
      const V = randInt(5, 30);
      const R = randInt(2, 20);
      const I = V / R;
      return numericMcq(
        `A potential difference of ${V} V is applied across a ${R} Ω resistor. What is the current?`,
        I,
        'A',
        m,
      );
    }
    case 1: {
      const V = randInt(5, 30);
      const I = randInt(1, 10);
      const P = V * I;
      return numericMcq(
        `A device operates at ${V} V drawing ${I} A. What is its power consumption?`,
        P,
        'W',
        m,
      );
    }
    case 2: {
      const R1 = randInt(2, 12);
      const R2 = randInt(3, 15);
      const R = (R1 * R2) / (R1 + R2);
      return numericMcq(
        `Two resistors of ${R1} Ω and ${R2} Ω are connected in parallel. What is the equivalent resistance?`,
        R,
        'Ω',
        m,
      );
    }
    case 3: {
      const R1 = randInt(2, 12);
      const R2 = randInt(3, 15);
      const R = R1 + R2;
      return numericMcq(
        `Two resistors of ${R1} Ω and ${R2} Ω are connected in series. What is the equivalent resistance?`,
        R,
        'Ω',
        m,
      );
    }
    case 4: {
      const I = randInt(1, 8);
      const R = randInt(3, 20);
      const V = I * R;
      return numericMcq(
        `A current of ${I} A flows through a ${R} Ω resistor. What is the voltage across it?`,
        V,
        'V',
        m,
      );
    }
    default: {
      const V = randInt(10, 50);
      const R = randInt(5, 25);
      const P = (V * V) / R;
      return numericMcq(
        `What is the power dissipated by a ${R} Ω resistor connected across a ${V} V supply?`,
        P,
        'W',
        m,
      );
    }
  }
}

export function physicsModern(
  m: QuestionMeta,
  _usedTexts?: Set<string>,
): Question {
  const v = randInt(0, 4);
  const h = 6.63e-34;
  switch (v) {
    case 0: {
      const f = randInt(1, 10) * 1e14;
      const E = h * f;
      return numericMcq(
        `What is the energy of a photon of frequency ${f.toExponential(1)} Hz (h = 6.63 × 10⁻³⁴ J·s)?`,
        E,
        'J',
        m,
      );
    }
    case 1: {
      const p = randInt(1, 10) * 1e-24;
      const lambda = h / p;
      return numericMcq(
        `What is the de Broglie wavelength of a particle with momentum ${p.toExponential(1)} kg·m/s (h = 6.63 × 10⁻³⁴)?`,
        lambda,
        'm',
        m,
      );
    }
    case 2: {
      const lambda = randInt(1, 6) * 1e-7;
      const E = (h * 3e8) / lambda;
      return numericMcq(
        `What is the energy of a photon of wavelength ${lambda.toExponential(1)} m (h = 6.63 × 10⁻³⁴, c = 3 × 10⁸)?`,
        E,
        'J',
        m,
      );
    }
    case 3: {
      return mcqFromOptions(
        'In the photoelectric effect, the kinetic energy of emitted electrons depends on:',
        'The frequency of incident light',
        ['The intensity of light', 'The duration of illumination', 'The angle of incidence'],
        m,
      );
    }
    default: {
      return mcqFromOptions(
        'The de Broglie wavelength associated with a moving particle is given by:',
        'λ = h/p',
        ['λ = hp', 'λ = p/h', 'λ = h²/p'],
        m,
      );
    }
  }
}

export function physicsMagnetism(
  m: QuestionMeta,
  _usedTexts?: Set<string>,
): Question {
  const v = randInt(0, 3);
  switch (v) {
    case 0: {
      const B = randFloat(0.1, 2, 2);
      const I = randInt(2, 15);
      const L = randFloat(0.2, 2, 2);
      const F = B * I * L;
      return numericMcq(
        `A ${L} m wire carrying ${I} A is placed perpendicular to a ${B} T magnetic field. What is the force on the wire?`,
        F,
        'N',
        m,
      );
    }
    case 1: {
      const q = randInt(1, 10);
      const vq = randInt(2, 20);
      const B = randFloat(0.1, 2, 2);
      const F = q * 1e-6 * vq * B;
      return numericMcq(
        `A ${q} μC charge moves at ${vq} m/s perpendicular to a ${B} T magnetic field. What is the magnetic force?`,
        F,
        'N',
        m,
      );
    }
    case 2: {
      return mcqFromOptions(
        'The force on a current-carrying conductor in a magnetic field is maximum when the angle between conductor and field is:',
        '90°',
        ['0°', '45°', '180°'],
        m,
      );
    }
    default: {
      return mcqFromOptions(
        'The SI unit of magnetic field is:',
        'Tesla',
        ['Weber', 'Henry', 'Gauss'],
        m,
      );
    }
  }
}

export function physicsOptics(
  m: QuestionMeta,
  _usedTexts?: Set<string>,
): Question {
  const v = randInt(0, 4);
  switch (v) {
    case 0: {
      const f = randInt(5, 30);
      const u = randInt(10, 40);
      const vi = (f * u) / (u - f);
      return numericMcq(
        `A convex lens has focal length ${f} cm. An object is placed ${u} cm from it. Where is the image formed?`,
        vi,
        'cm',
        m,
      );
    }
    case 1: {
      const f = randInt(10, 40);
      const u = randInt(20, 60);
      const vi = (f * u) / (u - f);
      const mag = vi / u;
      return numericMcq(
        `An object is placed ${u} cm from a concave mirror of focal length ${f} cm. What is the magnification?`,
        mag,
        '',
        m,
      );
    }
    case 2: {
      const c = 3e8;
      const n = randFloat(1.2, 2.4, 2);
      const vMedium = c / n;
      return numericMcq(
        `Light travels through a medium with refractive index ${n}. What is its speed in the medium (c = 3 × 10⁸)?`,
        vMedium,
        'm/s',
        m,
      );
    }
    case 3: {
      return mcqFromOptions(
        'A convex lens always forms a virtual, erect and magnified image when the object is placed:',
        'Between the lens and its focal point',
        [
          'At twice the focal length',
          'At the focal point',
          'Beyond twice the focal length',
        ],
        m,
      );
    }
    default: {
      return mcqFromOptions(
        'For total internal reflection to occur, light must travel from:',
        'A denser to a rarer medium',
        ['A rarer to a denser medium', 'Same density media', 'Vacuum to air'],
        m,
      );
    }
  }
}

export function physicsMechanics(
  m: QuestionMeta,
  usedTexts?: Set<string>,
): Question {
  return pick([
    physicsKinematics,
    physicsLawsMotion,
    physicsWorkEnergy,
    physicsRotational,
    physicsGravitation,
  ])(m, usedTexts);
}

export function physicsElectromag(
  m: QuestionMeta,
  usedTexts?: Set<string>,
): Question {
  return pick([physicsElectrostatics, physicsCurrent, physicsMagnetism])(
    m,
    usedTexts,
  );
}

// ============================================================================
// CHEMISTRY GENERATORS
// ============================================================================

export function chemAtomic(
  m: QuestionMeta,
  _usedTexts?: Set<string>,
): Question {
  const v = randInt(0, 5);
  switch (v) {
    case 0: {
      const n = randInt(1, 4);
      const maxE = 2 * n * n;
      return numericMcq(
        `What is the maximum number of electrons in the ${n}rd principal energy shell (n = ${n})?`,
        maxE,
        '',
        m,
      );
    }
    case 1: {
      return mcqFromOptions(
        'The maximum number of electrons in a subshell with azimuthal quantum number l is given by:',
        '2(2l + 1)',
        ['2l + 1', 'l²', '2l²'],
        m,
      );
    }
    case 2: {
      return mcqFromOptions(
        'Which quantum number describes the shape of an orbital?',
        'Azimuthal quantum number (l)',
        ['Principal (n)', 'Magnetic (m)', 'Spin (s)'],
        m,
      );
    }
    case 3: {
      return mcqFromOptions(
        'The maximum number of orbitals in a shell with n = 3 is:',
        '9',
        ['3', '6', '18'],
        m,
      );
    }
    case 4: {
      return mcqFromOptions(
        'Which set of quantum numbers is NOT possible?',
        'n = 2, l = 2, m = 0',
        ['n = 1, l = 0, m = 0', 'n = 2, l = 1, m = -1', 'n = 3, l = 2, m = 1'],
        m,
      );
    }
    default: {
      return mcqFromOptions(
        'The principal quantum number describes:',
        'The size and energy of the orbital',
        ['The shape of the orbital', 'The orientation of the orbital', 'The spin of the electron'],
        m,
      );
    }
  }
}

export function chemBonding(
  m: QuestionMeta,
  _usedTexts?: Set<string>,
): Question {
  const v = randInt(0, 5);
  switch (v) {
    case 0: {
      return mcqFromOptions(
        'What is the molecular shape of methane (CH₄)?',
        'Tetrahedral',
        ['Trigonal planar', 'Linear', 'Pyramidal'],
        m,
      );
    }
    case 1: {
      return mcqFromOptions(
        'What is the hybridization of carbon in ethyne (C₂H₂)?',
        'sp',
        ['sp²', 'sp³', 'sp³d'],
        m,
      );
    }
    case 2: {
      return mcqFromOptions(
        'Which of the following molecules has a non-polar bond?',
        'Cl₂',
        ['HCl', 'H₂O', 'NH₃'],
        m,
      );
    }
    case 3: {
      return mcqFromOptions(
        'The bond angle in a water molecule is approximately:',
        '104.5°',
        ['109.5°', '120°', '180°'],
        m,
      );
    }
    case 4: {
      return mcqFromOptions(
        'Which type of bond is present in sodium chloride (NaCl)?',
        'Ionic',
        ['Covalent', 'Metallic', 'Hydrogen'],
        m,
      );
    }
    default: {
      return mcqFromOptions(
        'The hybridization of the central atom in BF₃ is:',
        'sp²',
        ['sp', 'sp³', 'sp³d'],
        m,
      );
    }
  }
}

export function chemThermo(
  m: QuestionMeta,
  _usedTexts?: Set<string>,
): Question {
  const v = randInt(0, 5);
  switch (v) {
    case 0: {
      return mcqFromOptions(
        'In an exothermic reaction, the enthalpy change (ΔH) is:',
        'Negative',
        ['Positive', 'Zero', 'Infinite'],
        m,
      );
    }
    case 1: {
      return mcqFromOptions(
        'Which of the following is a state function?',
        'Enthalpy',
        ['Work', 'Heat', 'Path distance'],
        m,
      );
    }
    case 2: {
      const H1 = randInt(50, 200);
      const H2 = randInt(50, 200);
      const Hr = H1 + H2;
      return numericMcq(
        `A reaction has ΔH = ${H1} kJ/mol and ΔS = ${H2} J/mol·K. At what temperature does ΔG become zero (in K)?`,
        (H1 * 1000) / H2,
        'K',
        m,
      );
    }
    case 3: {
      return mcqFromOptions(
        'For an endothermic reaction:',
        'ΔH is positive',
        ['ΔH is negative', 'ΔH is zero', 'ΔH cannot be determined'],
        m,
      );
    }
    case 4: {
      return mcqFromOptions(
        'The standard enthalpy of formation of an element in its standard state is:',
        'Zero',
        ['Positive', 'Negative', 'Variable'],
        m,
      );
    }
    default: {
      return mcqFromOptions(
        'Hess\'s law is a consequence of:',
        'Conservation of energy',
        ['Conservation of mass', 'Conservation of charge', 'Conservation of momentum'],
        m,
      );
    }
  }
}

export function chemEquilibrium(
  m: QuestionMeta,
  _usedTexts?: Set<string>,
): Question {
  const v = randInt(0, 5);
  switch (v) {
    case 0: {
      return mcqFromOptions(
        'For the reaction N₂ + 3H₂ ⇌ 2NH₃, what are the units of Kc?',
        'mol⁻² L²',
        ['mol L⁻¹', 'mol⁻¹ L', 'dimensionless'],
        m,
      );
    }
    case 1: {
      return mcqFromOptions(
        'According to Le Chatelier\'s principle, increasing pressure on a gaseous equilibrium will shift the reaction towards:',
        'The side with fewer moles of gas',
        ['The side with more moles of gas', 'No shift occurs', 'The reactants only'],
        m,
      );
    }
    case 2: {
      const pH = randInt(1, 13);
      const h = Math.pow(10, -pH);
      return numericMcq(
        `What is the hydrogen ion concentration of a solution with pH = ${pH}?`,
        h,
        'mol/L',
        m,
      );
    }
    case 3: {
      return mcqFromOptions(
        'A buffer solution resists changes in:',
        'pH',
        ['Temperature', 'Volume', 'Conductivity'],
        m,
      );
    }
    case 4: {
      const Kw = 1e-14;
      const pOH = randInt(1, 13);
      const OH = Math.pow(10, -pOH);
      return numericMcq(
        `If pOH of a solution is ${pOH}, what is the hydroxide ion concentration (Kw = 1 × 10⁻¹⁴)?`,
        OH,
        'mol/L',
        m,
      );
    }
    default: {
      return mcqFromOptions(
        'For a reaction at equilibrium, increasing the concentration of reactants will:',
        'Shift the equilibrium towards products',
        ['Shift towards reactants', 'Have no effect', 'Stop the reaction'],
        m,
      );
    }
  }
}

export function chemElectrochem(
  m: QuestionMeta,
  _usedTexts?: Set<string>,
): Question {
  const v = randInt(0, 4);
  switch (v) {
    case 0: {
      return mcqFromOptions(
        'In a galvanic cell, oxidation occurs at the:',
        'Anode',
        ['Cathode', 'Salt bridge', 'Electrolyte'],
        m,
      );
    }
    case 1: {
      return mcqFromOptions(
        'The standard electrode potential of the Standard Hydrogen Electrode (SHE) is:',
        '0.00 V',
        ['+1.00 V', '-1.00 V', '+0.83 V'],
        m,
      );
    }
    case 2: {
      const I = randInt(1, 10);
      const t = randInt(100, 1000);
      const Q = I * t;
      return numericMcq(
        `What charge passes through a circuit when a current of ${I} A flows for ${t} s?`,
        Q,
        'C',
        m,
      );
    }
    case 3: {
      const n = randInt(1, 3);
      const F = 96500;
      const Q = n * F;
      return numericMcq(
        `How many coulombs are required to deposit 1 mole of a metal with valency ${n} (F = 96500 C/mol)?`,
        Q,
        'C',
        m,
      );
    }
    default: {
      return mcqFromOptions(
        'Faraday\'s constant is approximately:',
        '96500 C/mol',
        ['96.5 C/mol', '9650 C/mol', '965000 C/mol'],
        m,
      );
    }
  }
}

export function chemKinetics(
  m: QuestionMeta,
  _usedTexts?: Set<string>,
): Question {
  const v = randInt(0, 5);
  switch (v) {
    case 0: {
      return mcqFromOptions(
        'For a first-order reaction, the rate constant has units of:',
        's⁻¹',
        ['mol L⁻¹ s⁻¹', 'L mol⁻¹ s⁻¹', 'mol⁻² L² s⁻¹'],
        m,
      );
    }
    case 1: {
      const t = randFloat(2, 30, 2);
      const half = t / 2;
      return numericMcq(
        `A first-order reaction has rate constant k such that the half-life is ${t} s. After how many seconds is the concentration reduced to one-fourth?`,
        half * 2,
        's',
        m,
      );
    }
    case 2: {
      return mcqFromOptions(
        'A catalyst increases the rate of reaction by:',
        'Lowering the activation energy',
        ['Increasing temperature', 'Increasing reactant concentration', 'Shifting equilibrium'],
        m,
      );
    }
    case 3: {
      return mcqFromOptions(
        'For a zero-order reaction, the rate is:',
        'Independent of concentration',
        ['Proportional to concentration', 'Proportional to concentration squared', 'Inversely proportional'],
        m,
      );
    }
    case 4: {
      const k = randFloat(0.01, 0.5, 3);
      const half = 0.693 / k;
      return numericMcq(
        `For a first-order reaction with k = ${k} s⁻¹, what is the half-life?`,
        half,
        's',
        m,
      );
    }
    default: {
      return mcqFromOptions(
        'The half-life of a first-order reaction is:',
        'Independent of initial concentration',
        ['Proportional to initial concentration', 'Inversely proportional', 'Proportional to concentration squared'],
        m,
      );
    }
  }
}

export function chemCoord(
  m: QuestionMeta,
  _usedTexts?: Set<string>,
): Question {
  const v = randInt(0, 4);
  switch (v) {
    case 0: {
      return mcqFromOptions(
        'In [Co(NH₃)₆]Cl₃, what is the oxidation state of cobalt?',
        '+3',
        ['+2', '+1', '+6'],
        m,
      );
    }
    case 1: {
      return mcqFromOptions(
        'In [Co(NH₃)₆]Cl₃, what is the coordination number of cobalt?',
        '6',
        ['3', '4', '8'],
        m,
      );
    }
    case 2: {
      return mcqFromOptions(
        'The geometry of [Ni(CN)₄]²⁻ is:',
        'Square planar',
        ['Tetrahedral', 'Octahedral', 'Trigonal planar'],
        m,
      );
    }
    case 3: {
      return mcqFromOptions(
        'EDTA is a:',
        'Hexadentate ligand',
        ['Bidentate ligand', 'Monodentate ligand', 'Tridentate ligand'],
        m,
      );
    }
    default: {
      return mcqFromOptions(
        'In [PtCl₆]²⁻, the oxidation state of platinum is:',
        '+4',
        ['+2', '+6', '+3'],
        m,
      );
    }
  }
}

export function chemOrganic(
  m: QuestionMeta,
  _usedTexts?: Set<string>,
): Question {
  const v = randInt(0, 5);
  switch (v) {
    case 0: {
      return mcqFromOptions(
        'The IUPAC name of CH₃-CH₂-CH₂-CH₂-OH is:',
        'Butan-1-ol',
        ['Butan-2-ol', 'Propan-1-ol', 'Pentan-1-ol'],
        m,
      );
    }
    case 1: {
      return mcqFromOptions(
        'SN1 reactions proceed through which intermediate?',
        'Carbocation',
        ['Carbanion', 'Free radical', 'Carbene'],
        m,
      );
    }
    case 2: {
      return mcqFromOptions(
        'SN2 reactions are favoured by:',
        'Primary alkyl halides',
        ['Tertiary alkyl halides', 'Polar protic solvents', 'Bulky nucleophiles'],
        m,
      );
    }
    case 3: {
      return mcqFromOptions(
        'According to Markovnikov\'s rule, when HBr adds to propene, the H attaches to:',
        'The carbon with more hydrogens',
        ['The carbon with fewer hydrogens', 'Both carbons equally', 'The central carbon only'],
        m,
      );
    }
    case 4: {
      return mcqFromOptions(
        'The IUPAC name of (CH₃)₂CH-CH₂-CHO is:',
        '3-Methylbutanal',
        ['2-Methylbutanal', 'Butanal', 'Pentanal'],
        m,
      );
    }
    default: {
      return mcqFromOptions(
        'Which of the following undergoes SN1 reaction most readily?',
        'Tertiary butyl chloride',
        ['Methyl chloride', 'Ethyl chloride', 'Isopropyl chloride'],
        m,
      );
    }
  }
}

export function chemHydrocarbons(
  m: QuestionMeta,
  _usedTexts?: Set<string>,
): Question {
  const v = randInt(0, 5);
  switch (v) {
    case 0: {
      const n = randInt(2, 8);
      const h = 2 * n + 2;
      return numericMcq(
        `What is the number of hydrogen atoms in an alkane with ${n} carbon atoms?`,
        h,
        '',
        m,
      );
    }
    case 1: {
      return mcqFromOptions(
        'Benzene has how many pi (π) electrons in its ring?',
        '6',
        ['2', '4', '8'],
        m,
      );
    }
    case 2: {
      return mcqFromOptions(
        'Which of the following compounds is aromatic?',
        'Benzene',
        ['Cyclohexane', 'Cyclobutadiene', 'Cyclooctatetraene'],
        m,
      );
    }
    case 3: {
      return mcqFromOptions(
        'The general formula for alkenes is:',
        'CₙH₂ₙ',
        ['CₙH₂ₙ₊₂', 'CₙH₂ₙ₋₂', 'CₙHₙ'],
        m,
      );
    }
    case 4: {
      return mcqFromOptions(
        'Aromatic compounds follow Hückel\'s rule with how many π electrons?',
        '(4n + 2)',
        ['4n', '2n', '4n - 2'],
        m,
      );
    }
    default: {
      return mcqFromOptions(
        'The hybridization of carbon in benzene is:',
        'sp²',
        ['sp', 'sp³', 'sp³d'],
        m,
      );
    }
  }
}

export function chemBiomolecules(
  m: QuestionMeta,
  _usedTexts?: Set<string>,
): Question {
  const v = randInt(0, 4);
  switch (v) {
    case 0: {
      return mcqFromOptions(
        'Glucose is an example of a:',
        'Monosaccharide',
        ['Disaccharide', 'Polysaccharide', 'Trisaccharide'],
        m,
      );
    }
    case 1: {
      return mcqFromOptions(
        'The bond linking two amino acids in a protein is called:',
        'Peptide bond',
        ['Glycosidic bond', 'Ester bond', 'Phosphodiester bond'],
        m,
      );
    }
    case 2: {
      return mcqFromOptions(
        'DNA contains which of the following sugars?',
        'Deoxyribose',
        ['Ribose', 'Glucose', 'Fructose'],
        m,
      );
    }
    case 3: {
      return mcqFromOptions(
        'The two strands of DNA are held together by:',
        'Hydrogen bonds',
        ['Covalent bonds', 'Ionic bonds', 'Metallic bonds'],
        m,
      );
    }
    default: {
      return mcqFromOptions(
        'Which of the following is a non-essential amino acid?',
        'Glycine',
        ['Lysine', 'Tryptophan', 'Phenylalanine'],
        m,
      );
    }
  }
}

export function chemPhysical(
  m: QuestionMeta,
  usedTexts?: Set<string>,
): Question {
  return pick([
    chemAtomic,
    chemBonding,
    chemThermo,
    chemEquilibrium,
    chemElectrochem,
    chemKinetics,
  ])(m, usedTexts);
}

// chemInorganic MUST use array of arrow functions (NOT pick([fn, mcqFromOptions() as ...]))
// because mcqFromOptions returns a Question object, not a function.
export function chemInorganic(
  m: QuestionMeta,
  usedTexts?: Set<string>,
): Question {
  const fns: GenFn[] = [
    chemCoord,
    () =>
      mcqFromOptions(
        'Which of the following is a transition metal?',
        'Iron',
        ['Neon', 'Calcium', 'Sodium'],
        m,
      ),
    () =>
      mcqFromOptions(
        'What is the most abundant metal in Earth\'s crust?',
        'Aluminium',
        ['Iron', 'Copper', 'Sodium'],
        m,
      ),
    () =>
      mcqFromOptions(
        'Which of the following is a noble gas?',
        'Xenon',
        ['Chlorine', 'Oxygen', 'Nitrogen'],
        m,
      ),
    () =>
      mcqFromOptions(
        'Which element has the highest electronegativity?',
        'Fluorine',
        ['Oxygen', 'Chlorine', 'Nitrogen'],
        m,
      ),
  ];
  return pick(fns)(m, usedTexts);
}

export function chemOrganicBasics(
  m: QuestionMeta,
  usedTexts?: Set<string>,
): Question {
  return pick([chemOrganic, chemHydrocarbons, chemBiomolecules])(m, usedTexts);
}

// ============================================================================
// MATHEMATICS GENERATORS
// ============================================================================

export function mathAlgebra(
  m: QuestionMeta,
  _usedTexts?: Set<string>,
): Question {
  const v = randInt(0, 6);
  switch (v) {
    case 0: {
      const a = randInt(2, 10);
      const b = randInt(2, 10);
      const x = b / a;
      return numericMcq(
        `Solve for x: ${a}x = ${b}`,
        x,
        '',
        m,
      );
    }
    case 1: {
      const r1 = randInt(1, 6);
      const r2 = randInt(2, 7);
      const b = r1 + r2;
      const c = r1 * r2;
      return numericMcq(
        `Find the sum of the roots of x² − ${b}x + ${c} = 0.`,
        b,
        '',
        m,
      );
    }
    case 2: {
      const r1 = randInt(1, 6);
      const r2 = randInt(2, 7);
      const b = r1 + r2;
      const c = r1 * r2;
      return numericMcq(
        `Find the product of the roots of x² − ${b}x + ${c} = 0.`,
        c,
        '',
        m,
      );
    }
    case 3: {
      const n = randInt(2, 6);
      const a = randInt(2, 9);
      const result = Math.pow(a, n);
      return numericMcq(
        `What is ${a}^${n}?`,
        result,
        '',
        m,
      );
    }
    case 4: {
      const a = randInt(1, 9);
      const b = randInt(1, 9);
      const c = randInt(1, 9);
      const sum = a + b + c;
      const prod = a * b * c;
      return numericMcq(
        `If a = ${a}, b = ${b}, c = ${c}, find a + b + c + (a × b × c) − ${sum + prod - sum - prod}.`,
        sum + prod,
        '',
        m,
      );
    }
    case 5: {
      const a = randInt(2, 9);
      const b = randInt(2, 9);
      const c = a + b;
      return numericMcq(
        `Simplify: (${a}x + ${b}) − (${b}x − ${a}) + x − ${a + b - 1}, evaluated at x = 1.`,
        c,
        '',
        m,
      );
    }
    default: {
      const a = randInt(2, 12);
      const b = randInt(2, 12);
      return numericMcq(
        `If x + 5 = ${a + 5} and y − 3 = ${b - 3}, find x + y.`,
        a + b,
        '',
        m,
      );
    }
  }
}

export function mathTrig(
  m: QuestionMeta,
  _usedTexts?: Set<string>,
): Question {
  const v = randInt(0, 5);
  switch (v) {
    case 0: {
      return mcqFromOptions(
        'What is the value of sin(30°)?',
        '1/2',
        ['1', '√3/2', '0'],
        m,
      );
    }
    case 1: {
      return mcqFromOptions(
        'What is the value of cos(0°)?',
        '1',
        ['0', '1/2', '√3/2'],
        m,
      );
    }
    case 2: {
      return mcqFromOptions(
        'What is the value of tan(45°)?',
        '1',
        ['0', '√3', '1/√3'],
        m,
      );
    }
    case 3: {
      return mcqFromOptions(
        'Which identity is correct?',
        'sin²θ + cos²θ = 1',
        ['sin²θ − cos²θ = 1', 'sinθ + cosθ = 1', 'tan²θ + 1 = 1'],
        m,
      );
    }
    case 4: {
      return mcqFromOptions(
        'The value of sin(90°) is:',
        '1',
        ['0', '1/2', '√3/2'],
        m,
      );
    }
    default: {
      return mcqFromOptions(
        'What is the value of cos(60°)?',
        '1/2',
        ['1', '√3/2', '0'],
        m,
      );
    }
  }
}

export function mathCoordinate(
  m: QuestionMeta,
  _usedTexts?: Set<string>,
): Question {
  const v = randInt(0, 5);
  switch (v) {
    case 0: {
      const x1 = randInt(1, 10);
      const y1 = randInt(1, 10);
      const x2 = x1 + randInt(3, 8);
      const y2 = y1 + randInt(3, 8);
      const d = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      return numericMcq(
        `Find the distance between (${x1}, ${y1}) and (${x2}, ${y2}).`,
        d,
        '',
        m,
      );
    }
    case 1: {
      const x1 = randInt(1, 10);
      const y1 = randInt(1, 10);
      const x2 = randInt(2, 12);
      const y2 = randInt(2, 12);
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      return numericMcq(
        `Find the x-coordinate of the midpoint of (${x1}, ${y1}) and (${x2}, ${y2}).`,
        mx,
        '',
        m,
      );
    }
    case 2: {
      const m1 = randInt(1, 6);
      const yInt = randInt(1, 8);
      const x = randInt(2, 8);
      const y = m1 * x + yInt;
      return numericMcq(
        `For the line y = ${m1}x + ${yInt}, find y when x = ${x}.`,
        y,
        '',
        m,
      );
    }
    case 3: {
      const x1 = randInt(1, 6);
      const y1 = randInt(1, 6);
      const x2 = x1 + randInt(2, 6);
      const y2 = y1 + randInt(2, 6);
      const slope = (y2 - y1) / (x2 - x1);
      return numericMcq(
        `Find the slope of the line joining (${x1}, ${y1}) and (${x2}, ${y2}).`,
        slope,
        '',
        m,
      );
    }
    case 4: {
      const h = randInt(2, 8);
      const k = randInt(2, 8);
      const r = randInt(3, 10);
      const area = Math.PI * r * r;
      return numericMcq(
        `A circle has centre (${h}, ${k}) and radius ${r}. What is its area (use π ≈ 3.14)?`,
        Math.round(area * 100) / 100,
        '',
        m,
      );
    }
    default: {
      const x1 = randInt(1, 10);
      const y1 = randInt(1, 10);
      const x2 = randInt(2, 12);
      const y2 = randInt(2, 12);
      const my = (y1 + y2) / 2;
      return numericMcq(
        `Find the y-coordinate of the midpoint of (${x1}, ${y1}) and (${x2}, ${y2}).`,
        my,
        '',
        m,
      );
    }
  }
}

export function mathCalculus(
  m: QuestionMeta,
  _usedTexts?: Set<string>,
): Question {
  const v = randInt(0, 5);
  switch (v) {
    case 0: {
      const n = randInt(2, 6);
      const a = randInt(1, 8);
      return mcqFromOptions(
        `What is the derivative of f(x) = ${a}x^${n}?`,
        `${a * n}x^${n - 1}`,
        [`${a}x^${n - 1}`, `${a * n}x^${n}`, `${a * n}x^${n + 1}`],
        m,
      );
    }
    case 1: {
      const a = randInt(1, 8);
      const n = randInt(2, 6);
      return mcqFromOptions(
        `What is the integral of ${a}x^${n} with respect to x?`,
        `${fmtNum(a / (n + 1))}x^${n + 1} + C`,
        [`${a}x^${n + 1} + C`, `${a * n}x^${n - 1} + C`, `${fmtNum(a / n)}x^${n} + C`],
        m,
      );
    }
    case 2: {
      return mcqFromOptions(
        'What is the derivative of sin(x)?',
        'cos(x)',
        ['−cos(x)', '−sin(x)', 'tan(x)'],
        m,
      );
    }
    case 3: {
      const a = randInt(2, 9);
      const b = randInt(2, 9);
      const x = randInt(1, 5);
      const val = a * Math.pow(x, a - 1) + b;
      return numericMcq(
        `For f(x) = x^${a} + ${b}, find f'(${x}).`,
        val,
        '',
        m,
      );
    }
    case 4: {
      return mcqFromOptions(
        'What is the limit of (sin x)/x as x → 0?',
        '1',
        ['0', '∞', 'Does not exist'],
        m,
      );
    }
    default: {
      return mcqFromOptions(
        'The derivative of e^x is:',
        'e^x',
        ['x·e^(x−1)', '1', 'ln(x)'],
        m,
      );
    }
  }
}

export function mathVectors(
  m: QuestionMeta,
  _usedTexts?: Set<string>,
): Question {
  const v = randInt(0, 4);
  switch (v) {
    case 0: {
      const a1 = randInt(1, 6);
      const a2 = randInt(1, 6);
      const b1 = randInt(1, 6);
      const b2 = randInt(1, 6);
      const dot = a1 * b1 + a2 * b2;
      return numericMcq(
        `Find the dot product of vectors (${a1}, ${a2}) and (${b1}, ${b2}).`,
        dot,
        '',
        m,
      );
    }
    case 1: {
      const a = randInt(1, 6);
      const b = randInt(1, 6);
      const cross = a * b;
      return numericMcq(
        `Find the magnitude of the cross product of (${a}, 0, 0) and (0, ${b}, 0).`,
        cross,
        '',
        m,
      );
    }
    case 2: {
      const a = randInt(2, 8);
      const b = randInt(2, 8);
      const c = randInt(2, 8);
      const mag = Math.sqrt(a * a + b * b + c * c);
      return numericMcq(
        `Find the magnitude of the vector (${a}, ${b}, ${c}).`,
        mag,
        '',
        m,
      );
    }
    case 3: {
      const a = randInt(1, 6);
      const b = randInt(1, 6);
      const c = randInt(1, 6);
      const d = randInt(1, 6);
      const sum = Math.sqrt((a + c) ** 2 + (b + d) ** 2);
      return numericMcq(
        `Find the magnitude of the sum of vectors (${a}, ${b}) and (${c}, ${d}).`,
        sum,
        '',
        m,
      );
    }
    default: {
      return mcqFromOptions(
        'The dot product of two perpendicular vectors is:',
        '0',
        ['1', '−1', 'Their magnitudes multiplied'],
        m,
      );
    }
  }
}

export function math3D(
  m: QuestionMeta,
  _usedTexts?: Set<string>,
): Question {
  const v = randInt(0, 3);
  switch (v) {
    case 0: {
      const x = randInt(1, 6);
      const y = randInt(1, 6);
      const z = randInt(1, 6);
      const sumSq = x * x + y * y + z * z;
      const dc_x = x / Math.sqrt(sumSq);
      return numericMcq(
        `Find the direction cosine (l) of the vector (${x}, ${y}, ${z}).`,
        dc_x,
        '',
        m,
      );
    }
    case 1: {
      const x1 = randInt(1, 5);
      const y1 = randInt(1, 5);
      const z1 = randInt(1, 5);
      const x2 = randInt(6, 10);
      const y2 = randInt(6, 10);
      const z2 = randInt(6, 10);
      const d = Math.sqrt(
        (x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2,
      );
      return numericMcq(
        `Find the distance between (${x1}, ${y1}, ${z1}) and (${x2}, ${y2}, ${z2}).`,
        d,
        '',
        m,
      );
    }
    case 2: {
      return mcqFromOptions(
        'The sum of squares of direction cosines of a line is:',
        '1',
        ['0', '2', '3'],
        m,
      );
    }
    default: {
      return mcqFromOptions(
        'The direction cosines of the x-axis are:',
        '(1, 0, 0)',
        ['(0, 1, 0)', '(0, 0, 1)', '(1, 1, 1)'],
        m,
      );
    }
  }
}

export function mathProbability(
  m: QuestionMeta,
  _usedTexts?: Set<string>,
): Question {
  const v = randInt(0, 5);
  switch (v) {
    case 0: {
      const total = 6;
      const target = randInt(1, 6);
      const p = 1 / total;
      return numericMcq(
        `What is the probability of rolling a ${target} on a fair die?`,
        p,
        '',
        m,
      );
    }
    case 1: {
      const total = 52;
      const p = 4 / total;
      return numericMcq(
        `What is the probability of drawing an ace from a standard deck of 52 cards?`,
        p,
        '',
        m,
      );
    }
    case 2: {
      const p = 1 / 2;
      return numericMcq(
        `What is the probability of getting heads on a fair coin toss?`,
        p,
        '',
        m,
      );
    }
    case 3: {
      const red = randInt(3, 8);
      const total = randInt(10, 20);
      const p = red / total;
      return numericMcq(
        `A bag has ${red} red balls out of ${total} total balls. What is the probability of drawing a red ball?`,
        p,
        '',
        m,
      );
    }
    case 4: {
      return mcqFromOptions(
        'The probability of an impossible event is:',
        '0',
        ['1', '0.5', 'Undefined'],
        m,
      );
    }
    default: {
      return mcqFromOptions(
        'The probability of a sure event is:',
        '1',
        ['0', '0.5', '∞'],
        m,
      );
    }
  }
}

export function mathMatrices(
  m: QuestionMeta,
  _usedTexts?: Set<string>,
): Question {
  const v = randInt(0, 4);
  switch (v) {
    case 0: {
      const a = randInt(1, 6);
      const b = randInt(1, 6);
      const c = randInt(1, 6);
      const d = randInt(1, 6);
      const det = a * d - b * c;
      return numericMcq(
        `Find the determinant of the matrix [[${a}, ${b}], [${c}, ${d}]].`,
        det,
        '',
        m,
      );
    }
    case 1: {
      const a = randInt(1, 6);
      const b = randInt(1, 6);
      const c = randInt(1, 6);
      const d = randInt(1, 6);
      const det = a * d - b * c;
      const invExists = det !== 0;
      return mcqFromOptions(
        `For matrix [[${a}, ${b}], [${c}, ${d}]], does the inverse exist?`,
        invExists ? 'Yes' : 'No',
        [invExists ? 'No' : 'Yes', 'Cannot be determined', 'Only for square matrices'],
        m,
      );
    }
    case 2: {
      return mcqFromOptions(
        'A matrix with all elements zero is called:',
        'Null matrix',
        ['Identity matrix', 'Diagonal matrix', 'Symmetric matrix'],
        m,
      );
    }
    case 3: {
      return mcqFromOptions(
        'For a 2×2 matrix, the inverse exists if and only if the determinant is:',
        'Non-zero',
        ['Zero', 'Positive', 'Negative'],
        m,
      );
    }
    default: {
      return mcqFromOptions(
        'The identity matrix of order 2 has determinant:',
        '1',
        ['0', '2', '4'],
        m,
      );
    }
  }
}

export function mathSequences(
  m: QuestionMeta,
  _usedTexts?: Set<string>,
): Question {
  const v = randInt(0, 5);
  switch (v) {
    case 0: {
      const a = randInt(2, 10);
      const d = randInt(1, 8);
      const n = randInt(5, 20);
      const tn = a + (n - 1) * d;
      return numericMcq(
        `Find the ${n}th term of an AP with first term ${a} and common difference ${d}.`,
        tn,
        '',
        m,
      );
    }
    case 1: {
      const a = randInt(2, 10);
      const d = randInt(1, 8);
      const n = randInt(5, 20);
      const sum = (n / 2) * (2 * a + (n - 1) * d);
      return numericMcq(
        `Find the sum of the first ${n} terms of an AP with first term ${a} and common difference ${d}.`,
        sum,
        '',
        m,
      );
    }
    case 2: {
      const a = randInt(2, 8);
      const r = randInt(2, 4);
      const n = randInt(3, 6);
      const tn = a * Math.pow(r, n - 1);
      return numericMcq(
        `Find the ${n}th term of a GP with first term ${a} and common ratio ${r}.`,
        tn,
        '',
        m,
      );
    }
    case 3: {
      const a = randInt(2, 8);
      const r = randInt(2, 4);
      const n = randInt(3, 6);
      const sum = (a * (Math.pow(r, n) - 1)) / (r - 1);
      return numericMcq(
        `Find the sum of the first ${n} terms of a GP with first term ${a} and common ratio ${r}.`,
        sum,
        '',
        m,
      );
    }
    case 4: {
      const a = randInt(2, 10);
      const d = randInt(1, 5);
      const n = randInt(8, 20);
      const l = a + (n - 1) * d;
      const sum = (n * (a + l)) / 2;
      return numericMcq(
        `An AP has ${n} terms with first term ${a} and common difference ${d}. Find the sum.`,
        sum,
        '',
        m,
      );
    }
    default: {
      return mcqFromOptions(
        'The sum of an infinite GP with |r| < 1 is:',
        'a / (1 − r)',
        ['a / (1 + r)', 'a · r', 'a · (1 − r)'],
        m,
      );
    }
  }
}

export function mathGeometry(
  m: QuestionMeta,
  _usedTexts?: Set<string>,
): Question {
  const v = randInt(0, 5);
  switch (v) {
    case 0: {
      const r = randInt(2, 12);
      const area = Math.PI * r * r;
      return numericMcq(
        `Find the area of a circle with radius ${r} (use π ≈ 3.14).`,
        Math.round(area * 100) / 100,
        '',
        m,
      );
    }
    case 1: {
      const b = randInt(3, 12);
      const h = randInt(3, 12);
      const area = 0.5 * b * h;
      return numericMcq(
        `Find the area of a triangle with base ${b} and height ${h}.`,
        area,
        '',
        m,
      );
    }
    case 2: {
      const a = randInt(2, 12);
      const b = randInt(2, 12);
      const area = a * b;
      return numericMcq(
        `Find the area of a rectangle with sides ${a} and ${b}.`,
        area,
        '',
        m,
      );
    }
    case 3: {
      const a = randInt(60, 100);
      const b = randInt(40, 80);
      const third = 180 - a - b;
      return numericMcq(
        `Two angles of a triangle are ${a}° and ${b}°. Find the third angle.`,
        third,
        '°',
        m,
      );
    }
    case 4: {
      const r = randInt(2, 12);
      const circ = 2 * Math.PI * r;
      return numericMcq(
        `Find the circumference of a circle with radius ${r} (use π ≈ 3.14).`,
        Math.round(circ * 100) / 100,
        '',
        m,
      );
    }
    default: {
      const s = randInt(3, 12);
      const area = s * s;
      return numericMcq(
        `Find the area of a square with side ${s}.`,
        area,
        '',
        m,
      );
    }
  }
}

export function mathNumberTheory(
  m: QuestionMeta,
  _usedTexts?: Set<string>,
): Question {
  const v = randInt(0, 5);
  switch (v) {
    case 0: {
      return mcqFromOptions(
        'Which of the following is a prime number?',
        '17',
        ['15', '21', '27'],
        m,
      );
    }
    case 1: {
      const a = randInt(4, 12);
      const b = randInt(4, 12);
      const lcm = (a * b) / gcd(a, b);
      return numericMcq(
        `Find the LCM of ${a} and ${b}.`,
        lcm,
        '',
        m,
      );
    }
    case 2: {
      const a = randInt(4, 12);
      const b = randInt(4, 12);
      const g = gcd(a, b);
      return numericMcq(
        `Find the HCF (GCD) of ${a} and ${b}.`,
        g,
        '',
        m,
      );
    }
    case 3: {
      const n = randInt(2, 6);
      return mcqFromOptions(
        `A number is divisible by ${n * 2} if it is divisible by:`,
        `Both ${n} and 2`,
        [`Only ${n}`, 'Only 2', `Neither ${n} nor 2`],
        m,
      );
    }
    case 4: {
      return mcqFromOptions(
        'Which of the following numbers is divisible by 9?',
        '81',
        ['82', '83', '85'],
        m,
      );
    }
    default: {
      return mcqFromOptions(
        'The smallest prime number is:',
        '2',
        ['0', '1', '3'],
        m,
      );
    }
  }
}

function gcd(a: number, b: number): number {
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

export function mathCombinatorics(
  m: QuestionMeta,
  _usedTexts?: Set<string>,
): Question {
  const v = randInt(0, 4);
  switch (v) {
    case 0: {
      const n = randInt(4, 8);
      const r = randInt(2, n - 1);
      const perm = factorial(n) / factorial(n - r);
      return numericMcq(
        `Find the number of permutations of ${n} objects taken ${r} at a time.`,
        perm,
        '',
        m,
      );
    }
    case 1: {
      const n = randInt(4, 8);
      const r = randInt(2, n - 1);
      const comb = factorial(n) / (factorial(r) * factorial(n - r));
      return numericMcq(
        `Find the number of combinations of ${n} objects taken ${r} at a time.`,
        comb,
        '',
        m,
      );
    }
    case 2: {
      const n = randInt(3, 6);
      const fact = factorial(n);
      return numericMcq(
        `What is ${n}!?`,
        fact,
        '',
        m,
      );
    }
    case 3: {
      return mcqFromOptions(
        'The number of ways to arrange n distinct objects is:',
        'n!',
        ['n²', '2ⁿ', 'n(n−1)/2'],
        m,
      );
    }
    default: {
      return mcqFromOptions(
        'The value of 0! is:',
        '1',
        ['0', 'Undefined', '∞'],
        m,
      );
    }
  }
}

function factorial(n: number): number {
  let f = 1;
  for (let i = 2; i <= n; i++) f *= i;
  return f;
}

// ============================================================================
// STATIC QUESTION BANKS
// ============================================================================

export const BOTANY_BANK: BankQuestion[] = [
  // Cell Biology (8+)
  BQ('Cell Biology', 'Which organelle is the powerhouse of the cell?', 'Mitochondria', 'Nucleus', 'Ribosome', 'Golgi apparatus'),
  BQ('Cell Biology', 'The cell wall of plants is primarily composed of:', 'Cellulose', 'Chitin', 'Peptidoglycan', 'Lignin'),
  BQ('Cell Biology', 'Which structure is known as the "suicidal bag" of the cell?', 'Lysosome', 'Ribosome', 'Vacuole', 'Peroxisome'),
  BQ('Cell Biology', 'Photosynthesis occurs in which organelle?', 'Chloroplast', 'Mitochondrion', 'Nucleus', 'Endoplasmic reticulum'),
  BQ('Cell Biology', 'The fluid mosaic model describes the structure of the:', 'Plasma membrane', 'Cell wall', 'Nuclear envelope', 'Cytoskeleton'),
  BQ('Cell Biology', 'Which organelle is involved in protein synthesis?', 'Ribosome', 'Lysosome', 'Vacuole', 'Plastid'),
  BQ('Cell Biology', 'DNA is found in which part of the cell?', 'Nucleus', 'Cytoplasm', 'Cell wall', 'Vacuole'),
  BQ('Cell Biology', 'Which of the following is a prokaryotic organism?', 'Bacterium', 'Yeast', 'Algae', 'Fungus'),
  // Plant Physiology (6+)
  BQ('Plant Physiology', 'The process by which plants lose water through leaves is called:', 'Transpiration', 'Respiration', 'Translocation', 'Photosynthesis'),
  BQ('Plant Physiology', 'Which pigment is essential for photosynthesis?', 'Chlorophyll', 'Carotene', 'Anthocyanin', 'Xanthophyll'),
  BQ('Plant Physiology', 'The opening and closing of stomata is regulated by:', 'Guard cells', 'Epidermal cells', 'Palisade cells', 'Mesophyll cells'),
  BQ('Plant Physiology', 'Which hormone promotes ripening of fruits?', 'Ethylene', 'Auxin', 'Gibberellin', 'Cytokinin'),
  BQ('Plant Physiology', 'The light-dependent reactions of photosynthesis occur in:', 'Thylakoid membrane', 'Stroma', 'Matrix', 'Cytoplasm'),
  BQ('Plant Physiology', 'The ascent of sap in plants is mainly due to:', 'Transpiration pull', 'Root pressure', 'Capillarity', 'Imbibition'),
  // Genetics (5+)
  BQ('Genetics', 'The law of segregation was proposed by:', 'Gregor Mendel', 'Charles Darwin', 'Watson and Crick', 'Thomas Hunt Morgan'),
  BQ('Genetics', 'A test cross is performed between an organism with unknown genotype and:', 'A homozygous recessive', 'A homozygous dominant', 'A heterozygote', 'A wild-type organism'),
  BQ('Genetics', 'In a monohybrid cross, the phenotypic ratio in F2 generation is:', '3:1', '1:2:1', '9:3:3:1', '1:1'),
  BQ('Genetics', 'The genetic material in most organisms is:', 'DNA', 'RNA', 'Protein', 'Lipid'),
  BQ('Genetics', 'A mutation that changes a single nucleotide is called a:', 'Point mutation', 'Frameshift mutation', 'Deletion', 'Duplication'),
  // Plant Anatomy (5+)
  BQ('Plant Anatomy', 'The tissue responsible for transport of water in plants is:', 'Xylem', 'Phloem', 'Parenchyma', 'Collenchyma'),
  BQ('Plant Anatomy', 'The Casparian strip is found in the:', 'Endodermis', 'Epidermis', 'Cortex', 'Pericycle'),
  BQ('Plant Anatomy', 'Secondary growth in plants occurs due to activity of:', 'Cambium', 'Apical meristem', 'Parenchyma', 'Epidermis'),
  BQ('Plant Anatomy', 'The bark of a tree is composed of:', 'All tissues outside the vascular cambium', 'Only the phloem', 'Only the xylem', 'Only the cortex'),
  BQ('Plant Anatomy', 'Stomata are most abundant on the:', 'Lower epidermis of leaf', 'Upper epidermis of leaf', 'Stem', 'Root'),
  // Ecology (5+)
  BQ('Ecology', 'The ultimate source of energy in an ecosystem is:', 'Sun', 'Plants', 'Water', 'Soil'),
  BQ('Ecology', 'Organisms that obtain energy by consuming other organisms are called:', 'Heterotrophs', 'Autotrophs', 'Producers', 'Chemoautotrophs'),
  BQ('Ecology', 'The 10% law of energy transfer was given by:', 'Lindeman', 'Odum', 'Tansley', 'Elton'),
  BQ('Ecology', 'A group of individuals of the same species living in a given area is called a:', 'Population', 'Community', 'Ecosystem', 'Biome'),
  BQ('Ecology', 'The process by which nitrogen is converted into usable forms by bacteria is called:', 'Nitrogen fixation', 'Denitrification', 'Nitrification', 'Ammonification'),
  // Plant Reproduction (4+)
  BQ('Plant Reproduction', 'The male reproductive part of a flower is the:', 'Stamen', 'Pistil', 'Petal', 'Sepal'),
  BQ('Plant Reproduction', 'Double fertilization is a characteristic feature of:', 'Angiosperms', 'Gymnosperms', 'Bryophytes', 'Pteridophytes'),
  BQ('Plant Reproduction', 'The transfer of pollen from anther to stigma is called:', 'Pollination', 'Fertilization', 'Germination', 'Dispersion'),
  BQ('Plant Reproduction', 'Which of the following is a wind-pollinated flower?', 'Maize', 'Rose', 'Sunflower', 'Hibiscus'),
  // Biodiversity (4+)
  BQ('Biodiversity', 'The variety of living organisms on Earth is called:', 'Biodiversity', 'Ecology', 'Biogeography', 'Evolution'),
  BQ('Biodiversity', 'The IUCN Red List categorizes species based on:', 'Conservation status', 'Economic value', 'Geographic range', 'Body size'),
  BQ('Biodiversity', 'A hotspot of biodiversity is characterized by:', 'High endemism and habitat loss', 'Low species richness', 'Stable climate', 'Absence of human activity'),
  BQ('Biodiversity', 'In-situ conservation of biodiversity includes:', 'National parks', 'Zoos', 'Botanical gardens', 'Seed banks'),
];

export const ZOOLOGY_BANK: BankQuestion[] = [
  // Human Physiology (10+)
  BQ('Human Physiology', 'The functional unit of the kidney is the:', 'Nephron', 'Neuron', 'Alveolus', 'Hepatocyte'),
  BQ('Human Physiology', 'Insulin is secreted by which cells of the pancreas?', 'Beta cells of islets of Langerhans', 'Alpha cells', 'Delta cells', 'Acinar cells'),
  BQ('Human Physiology', 'The oxygen-carrying pigment in human blood is:', 'Hemoglobin', 'Myoglobin', 'Melanin', 'Carotene'),
  BQ('Human Physiology', 'Which chamber of the human heart pumps blood to the lungs?', 'Right ventricle', 'Left ventricle', 'Right atrium', 'Left atrium'),
  BQ('Human Physiology', 'The largest organ in the human body is the:', 'Skin', 'Liver', 'Brain', 'Lung'),
  BQ('Human Physiology', 'The hormone responsible for the fight-or-flight response is:', 'Adrenaline', 'Insulin', 'Thyroxine', 'Estrogen'),
  BQ('Human Physiology', 'Where does complete digestion of food occur?', 'Small intestine', 'Stomach', 'Large intestine', 'Mouth'),
  BQ('Human Physiology', 'The number of bones in an adult human body is:', '206', '201', '212', '198'),
  BQ('Human Physiology', 'Which part of the brain controls balance and coordination?', 'Cerebellum', 'Cerebrum', 'Medulla', 'Hypothalamus'),
  BQ('Human Physiology', 'The longest bone in the human body is the:', 'Femur', 'Tibia', 'Humerus', 'Fibula'),
  BQ('Human Physiology', 'The pH of human blood is approximately:', '7.4', '6.4', '8.4', '5.4'),
  // Animal Kingdom (5+)
  BQ('Animal Kingdom', 'Which phylum do earthworms belong to?', 'Annelida', 'Arthropoda', 'Mollusca', 'Echinodermata'),
  BQ('Animal Kingdom', 'Animals with a notochord are classified under:', 'Chordata', 'Arthropoda', 'Mollusca', 'Porifera'),
  BQ('Animal Kingdom', 'Which of the following is a cold-blooded animal?', 'Frog', 'Dog', 'Pigeon', 'Whale'),
  BQ('Animal Kingdom', 'Open circulatory system is found in:', 'Arthropods', 'Mammals', 'Birds', 'Fish'),
  BQ('Animal Kingdom', 'The body of a flatworm is:', 'Dorsoventrally flattened', 'Cylindrical', 'Spherical', 'Bilaterally symmetrical only'),
  // Reproduction (4+)
  BQ('Reproduction', 'The human female reproductive cycle is approximately:', '28 days', '14 days', '40 days', '60 days'),
  BQ('Reproduction', 'Fertilization in humans occurs in the:', 'Fallopian tube', 'Uterus', 'Ovary', 'Vagina'),
  BQ('Reproduction', 'The hormone that maintains pregnancy is:', 'Progesterone', 'FSH', 'LH', 'Estrogen'),
  BQ('Reproduction', 'The gestation period in humans is approximately:', '280 days', '180 days', '365 days', '120 days'),
  // Genetics Evolution (5+)
  BQ('Genetics Evolution', 'The theory of natural selection was proposed by:', 'Charles Darwin', 'Lamarck', 'Mendel', 'Wallace'),
  BQ('Genetics Evolution', 'Homologous organs indicate:', 'Common ancestry', 'Convergent evolution', 'Analogous function', 'No relation'),
  BQ('Genetics Evolution', 'The fossil record provides evidence for:', 'Evolution', 'Creationism', 'Spontaneous generation', 'Fixity of species'),
  BQ('Genetics Evolution', 'Industrial melanism in moths is an example of:', 'Natural selection', 'Genetic drift', 'Mutation pressure', 'Artificial selection'),
  BQ('Genetics Evolution', 'The concept of "survival of the fittest" was coined by:', 'Herbert Spencer', 'Charles Darwin', 'Jean-Baptiste Lamarck', 'Gregor Mendel'),
  // Biotechnology (4+)
  BQ('Biotechnology', 'The first transgenic crop approved for commercial release was:', 'Flavr Savr tomato', 'Bt cotton', 'Golden rice', 'Bt brinjal'),
  BQ('Biotechnology', 'Bt toxin is produced by:', 'Bacillus thuringiensis', 'Escherichia coli', 'Agrobacterium tumefaciens', 'Rhizobium'),
  BQ('Biotechnology', 'PCR stands for:', 'Polymerase Chain Reaction', 'Protein Chain Reaction', 'Polypeptide Chain Reaction', 'Polymerase Cell Replication'),
  BQ('Biotechnology', 'Restriction enzymes cut DNA at:', 'Specific recognition sequences', 'Random sites', 'Only at the ends', 'Only at the origin of replication'),
  // Human Health (5+)
  BQ('Human Health', 'The pathogen that causes malaria is:', 'Plasmodium', 'Salmonella', 'Mycobacterium tuberculosis', 'Influenza virus'),
  BQ('Human Health', 'AIDS is caused by:', 'HIV', 'HPV', 'HBV', 'HSV'),
  BQ('Human Health', 'Vaccines provide which type of immunity?', 'Active immunity', 'Passive immunity', 'Innate immunity', 'No immunity'),
  BQ('Human Health', 'The disease caused by deficiency of vitamin C is:', 'Scurvy', 'Rickets', 'Beri-beri', 'Night blindness'),
  BQ('Human Health', 'Antibiotics are effective against:', 'Bacteria', 'Viruses', 'Both bacteria and viruses', 'Fungi only'),
];

export const ENGLISH_BANK: BankQuestion[] = [
  // Grammar (8+)
  BQ('Grammar', 'Choose the correct sentence:', 'She has been studying for three hours.', 'She has been study for three hours.', 'She have been studying for three hours.', 'She been studying for three hours.'),
  BQ('Grammar', 'Identify the correct form: "If I ___ rich, I would travel the world."', 'were', 'was', 'am', 'be'),
  BQ('Grammar', 'Which sentence uses the correct article?', 'I saw an honest man.', 'I saw a honest man.', 'I saw the honest mans.', 'I saw honest man.'),
  BQ('Grammar', 'Choose the correct preposition: "She is good ___ mathematics."', 'at', 'in', 'on', 'for'),
  BQ('Grammar', 'Identify the passive voice of "She writes a letter."', 'A letter is written by her.', 'A letter was written by her.', 'A letter is being written by her.', 'A letter has written by her.'),
  BQ('Grammar', 'Pick the correctly punctuated sentence:', "It's a beautiful day, isn't it?", "Its a beautiful day, isn't it?", "It's a beautiful day isn't it?", "Its' a beautiful day, isn't it?"),
  BQ('Grammar', 'Choose the correct verb form: "Each of the students ___ a book."', 'has', 'have', 'having', 'are having'),
  BQ('Grammar', 'Which is the correct comparative form of "beautiful"?', 'more beautiful', 'beautifuller', 'beautifuler', 'most beautiful'),
  // Vocabulary (8+)
  BQ('Vocabulary', 'Choose the synonym of "Abundant":', 'Plentiful', 'Scarce', 'Empty', 'Rare'),
  BQ('Vocabulary', 'Choose the antonym of "Transparent":', 'Opaque', 'Clear', 'Visible', 'Lucid'),
  BQ('Vocabulary', 'What does the word "Benevolent" mean?', 'Kind and generous', 'Cruel and selfish', 'Indifferent', 'Hostile'),
  BQ('Vocabulary', 'Choose the correct meaning of "Ephemeral":', 'Short-lived', 'Eternal', 'Permanent', 'Lasting'),
  BQ('Vocabulary', 'A synonym for "Vigorous" is:', 'Energetic', 'Weak', 'Slow', 'Tired'),
  BQ('Vocabulary', 'The antonym of "Generous" is:', 'Stingy', 'Kind', 'Helpful', 'Open'),
  BQ('Vocabulary', 'What does "Lucid" mean?', 'Clear', 'Confusing', 'Dark', 'Hidden'),
  BQ('Vocabulary', 'Choose the synonym of "Diligent":', 'Hardworking', 'Lazy', 'Careless', 'Slow'),
  // Comprehension (3+)
  BQ('Comprehension', 'The main idea of a passage is usually found in:', 'The first or last sentence', 'The middle only', 'The title only', 'Any random sentence'),
  BQ('Comprehension', 'When reading for the main idea, you should:', 'Identify the central point the author makes', 'Memorize every detail', 'Skip the introduction', 'Focus only on examples'),
  BQ('Comprehension', 'An inference is:', 'A conclusion drawn from evidence', 'A direct quote', 'A summary', 'An opinion only'),
  // Verbal Ability (5+)
  BQ('Verbal Ability', 'Rearrange: "always / honest / be / should / you"', 'You should always be honest.', 'You be should always honest.', 'Honest you should always be.', 'Should you always be honest.'),
  BQ('Verbal Ability', 'Find the odd one out:', 'Tiger', 'Lion', 'Leopard', 'Wolf'),
  BQ('Verbal Ability', 'Complete the analogy: "Book is to Read as Food is to ___"', 'Eat', 'Cook', 'See', 'Buy'),
  BQ('Verbal Ability', 'Choose the correct spelling:', 'Necessary', 'Neccessary', 'Necesary', 'Neccesary'),
  BQ('Verbal Ability', 'Identify the correctly ordered sentence:', 'The cat sat on the mat.', 'Cat the sat mat on the.', 'Sat the cat on mat the.', 'On the mat sat cat the.'),
];

export const QUANT_BANK: BankQuestion[] = [
  // Arithmetic (8+)
  BQ('Arithmetic', 'What is 15% of 200?', '30', '25', '35', '20'),
  BQ('Arithmetic', 'If the cost of 5 pens is $25, what is the cost of 8 pens?', '$40', '$35', '$45', '$30'),
  BQ('Arithmetic', 'A shopkeeper sells an item for $120 with a profit of 20%. What was the cost price?', '$100', '$96', '$110', '$90'),
  BQ('Arithmetic', 'The average of 5 numbers is 18. If one number is removed, the average becomes 16. What is the removed number?', '26', '24', '20', '28'),
  BQ('Arithmetic', 'A train travels 60 km in 1.5 hours. What is its speed?', '40 km/h', '45 km/h', '50 km/h', '30 km/h'),
  BQ('Arithmetic', 'If a:b = 2:3 and b:c = 4:5, find a:c.', '8:15', '2:5', '4:9', '6:15'),
  BQ('Arithmetic', 'What is the simple interest on $1000 at 5% per annum for 2 years?', '$100', '$50', '$150', '$200'),
  BQ('Arithmetic', 'A man can do a piece of work in 10 days. How much work can he do in 3 days?', '3/10', '1/3', '7/10', '1/10'),
  // Algebra (6+)
  BQ('Algebra', 'If 2x + 5 = 15, find x.', '5', '10', '7.5', '6'),
  BQ('Algebra', 'Simplify: (x + 3)(x − 3).', 'x² − 9', 'x² + 9', 'x² − 6', 'x² + 6'),
  BQ('Algebra', 'If x² = 49, find x (x > 0).', '7', '6', '8', '5'),
  BQ('Algebra', 'Solve: 3(x − 2) = 12.', '6', '4', '8', '5'),
  BQ('Algebra', 'What is the value of x if 5x − 3 = 2x + 9?', '4', '3', '5', '6'),
  BQ('Algebra', 'Factorise: x² + 5x + 6.', '(x + 2)(x + 3)', '(x + 1)(x + 6)', '(x − 2)(x − 3)', '(x + 6)(x − 1)'),
  // Geometry (6+)
  BQ('Geometry', 'The sum of interior angles of a triangle is:', '180°', '360°', '90°', '270°'),
  BQ('Geometry', 'The area of a circle with radius 7 is (π = 22/7):', '154', '144', '164', '134'),
  BQ('Geometry', 'In a right triangle, the side opposite the right angle is called the:', 'Hypotenuse', 'Adjacent', 'Opposite', 'Base'),
  BQ('Geometry', 'The volume of a cube with side 3 is:', '27', '9', '81', '18'),
  BQ('Geometry', 'Two angles are supplementary if their sum is:', '180°', '90°', '360°', '270°'),
  BQ('Geometry', 'The circumference of a circle with diameter 14 is (π = 22/7):', '44', '22', '88', '154'),
  // Data Interpretation (5+)
  BQ('Data Interpretation', 'If sales in Q1 = 200, Q2 = 300, Q3 = 250, Q4 = 350, what is the average quarterly sale?', '275', '250', '300', '225'),
  BQ('Data Interpretation', 'A pie chart represents 360°. If a category occupies 90°, what percentage does it represent?', '25%', '50%', '75%', '20%'),
  BQ('Data Interpretation', 'If a bar grows from 40 to 60, what is the percentage increase?', '50%', '20%', '33%', '15%'),
  BQ('Data Interpretation', 'In a data set {2, 4, 6, 8, 10}, what is the mean?', '6', '5', '7', '8'),
  BQ('Data Interpretation', 'In a data set {3, 5, 7, 9}, what is the median?', '6', '5', '7', '8'),
  // Number System (5+)
  BQ('Number System', 'Which of the following is an irrational number?', '√2', '0.5', '3/4', '7'),
  BQ('Number System', 'The smallest natural number is:', '1', '0', '−1', '2'),
  BQ('Number System', 'What is the value of 2³ × 2²?', '32', '16', '8', '64'),
  BQ('Number System', 'Which of the following is a composite number?', '15', '13', '7', '2'),
  BQ('Number System', 'The HCF of 12 and 18 is:', '6', '3', '9', '36'),
];

export const REASONING_BANK: BankQuestion[] = [
  // Analogies (5+)
  BQ('Analogies', 'Book is to Author as Painting is to:', 'Painter', 'Canvas', 'Brush', 'Colour'),
  BQ('Analogies', 'Doctor is to Hospital as Teacher is to:', 'School', 'Student', 'Book', 'Class'),
  BQ('Analogies', 'Bird is to Sky as Fish is to:', 'Water', 'River', 'Ocean', 'Pond'),
  BQ('Analogies', 'Hot is to Cold as Tall is to:', 'Short', 'Long', 'Big', 'Small'),
  BQ('Analogies', 'Pen is to Write as Knife is to:', 'Cut', 'Sharp', 'Steel', 'Handle'),
  // Series (5+)
  BQ('Series', 'Find the next term: 2, 4, 8, 16, ___', '32', '24', '30', '20'),
  BQ('Series', 'Find the next term: 3, 6, 9, 12, ___', '15', '18', '14', '16'),
  BQ('Series', 'Find the next term: 1, 4, 9, 16, 25, ___', '36', '30', '49', '48'),
  BQ('Series', 'Find the missing term: 2, 5, 11, 23, 47, ___', '95', '94', '96', '92'),
  BQ('Series', 'Find the next term: A, C, E, G, ___', 'I', 'H', 'J', 'F'),
  // Coding Decoding (4+)
  BQ('Coding Decoding', 'If CAT is coded as 24, then DOG is coded as:', '26', '27', '25', '23'),
  BQ('Coding Decoding', 'If "TABLE" is coded as "UCBMF", then "CHAIR" is coded as:', 'DIBJS', 'DIBJR', 'DJBSJ', 'DIBJQ'),
  BQ('Coding Decoding', 'If A = 1, B = 2, ..., then the value of "CAB" is:', '6', '5', '7', '8'),
  BQ('Coding Decoding', 'In a certain code, "FRIEND" is written as "GSJFOE". How is "CANDLE" written?', 'DBOEMF', 'DBOEMG', 'DCOEMF', 'DBOEML'),
  // Blood Relations (4+)
  BQ('Blood Relations', 'Pointing to a man, a woman said, "His mother is the only daughter of my mother." How is the woman related to the man?', 'Mother', 'Sister', 'Aunt', 'Grandmother'),
  BQ('Blood Relations', 'If A is the brother of B, and B is the sister of C, then how is A related to C?', 'Brother', 'Sister', 'Cousin', 'Father'),
  BQ('Blood Relations', 'A man said to a woman, "Your brother\'s father is my father\'s son." How is the woman related to the man?', 'Daughter', 'Sister', 'Mother', 'Niece'),
  BQ('Blood Relations', 'Introducing a man, a woman said, "His wife is the only daughter of my father." How is the man related to the woman?', 'Son-in-law', 'Husband', 'Brother', 'Father'),
  // Syllogism (3+)
  BQ('Syllogism', 'All cats are animals. All animals are living beings. Therefore:', 'All cats are living beings', 'No cat is a living being', 'Some cats are not animals', 'No conclusion'),
  BQ('Syllogism', 'Some pens are pencils. All pencils are erasers. Therefore:', 'Some pens are erasers', 'No pen is an eraser', 'All pens are erasers', 'No conclusion'),
  BQ('Syllogism', 'All doctors are graduates. Some graduates are rich. Therefore:', 'Some doctors may be rich', 'All doctors are rich', 'No doctor is rich', 'All graduates are doctors'),
  // Logical (4+)
  BQ('Logical', 'If today is Monday, what day will it be 100 days from now?', 'Wednesday', 'Thursday', 'Tuesday', 'Friday'),
  BQ('Logical', 'A is taller than B but shorter than C. Who is the tallest?', 'C', 'A', 'B', 'Cannot be determined'),
  BQ('Logical', 'If all roses are flowers and some flowers fade quickly, then:', 'Some roses may fade quickly', 'All roses fade quickly', 'No rose fades quickly', 'All flowers are roses'),
  BQ('Logical', 'In a class, Ramesh ranks 7th from the top and 26th from the bottom. How many students are there?', '32', '33', '31', '34'),
  // Analytical (4+)
  BQ('Analytical', 'A clock shows 3:15. What is the angle between the hour and minute hands?', '7.5°', '0°', '15°', '22.5°'),
  BQ('Analytical', 'If you rearrange the letters "CIFAIPC", you get the name of a:', 'Ocean', 'Country', 'River', 'City'),
  BQ('Analytical', 'A cube is painted on all faces and cut into 27 smaller cubes. How many cubes have no face painted?', '1', '0', '6', '8'),
  BQ('Analytical', 'Find the missing number: 1, 8, 27, 64, ___', '125', '100', '144', '216'),
];

export const GK_BANK: BankQuestion[] = [
  // History (5+)
  BQ('History', 'Who was the first President of the United States?', 'George Washington', 'Thomas Jefferson', 'Abraham Lincoln', 'John Adams'),
  BQ('History', 'In which year did India gain independence?', '1947', '1945', '1950', '1942'),
  BQ('History', 'Who led the Non-Cooperation Movement in India?', 'Mahatma Gandhi', 'Jawaharlal Nehru', 'Subhash Chandra Bose', 'Sardar Patel'),
  BQ('History', 'The French Revolution began in the year:', '1789', '1776', '1804', '1812'),
  BQ('History', 'Who was the first Mughal emperor of India?', 'Babur', 'Akbar', 'Humayun', 'Aurangzeb'),
  // Geography (5+)
  BQ('Geography', 'What is the longest river in the world?', 'Nile', 'Amazon', 'Yangtze', 'Mississippi'),
  BQ('Geography', 'Which is the largest desert in the world?', 'Sahara', 'Gobi', 'Thar', 'Kalahari'),
  BQ('Geography', 'The capital of Australia is:', 'Canberra', 'Sydney', 'Melbourne', 'Perth'),
  BQ('Geography', 'Mount Everest is located in which mountain range?', 'Himalayas', 'Andes', 'Alps', 'Rockies'),
  BQ('Geography', 'Which is the smallest continent by area?', 'Australia', 'Europe', 'Antarctica', 'South America'),
  // Polity (4+)
  BQ('Polity', 'The Constitution of India came into effect on:', '26 January 1950', '15 August 1947', '26 November 1949', '2 October 1950'),
  BQ('Polity', 'Who is known as the "Father of the Indian Constitution"?', 'B. R. Ambedkar', 'Jawaharlal Nehru', 'Rajendra Prasad', 'Sardar Patel'),
  BQ('Polity', 'How many fundamental rights are guaranteed by the Indian Constitution?', '6', '5', '7', '8'),
  BQ('Polity', 'The President of India is elected by:', 'An electoral college', 'Direct vote', 'Parliament only', 'Supreme Court'),
  // Economy (4+)
  BQ('Economy', 'The Reserve Bank of India was established in:', '1935', '1947', '1950', '1921'),
  BQ('Economy', 'GST in India was implemented from:', '1 July 2017', '1 April 2017', '1 January 2018', '1 April 2018'),
  BQ('Economy', 'Which sector contributes the largest share to India\'s GDP?', 'Services', 'Agriculture', 'Manufacturing', 'Mining'),
  BQ('Economy', 'The term "GDP" stands for:', 'Gross Domestic Product', 'General Domestic Product', 'Gross Direct Product', 'Gross Demand Product'),
  // Environment (4+)
  BQ('Environment', 'The greenhouse gas primarily responsible for global warming is:', 'Carbon dioxide', 'Oxygen', 'Nitrogen', 'Helium'),
  BQ('Environment', 'The ozone layer protects Earth from which type of radiation?', 'Ultraviolet', 'Infrared', 'Microwave', 'Visible light'),
  BQ('Environment', 'Which of the following is a renewable source of energy?', 'Solar energy', 'Coal', 'Petroleum', 'Natural gas'),
  BQ('Environment', 'The phenomenon of increasing average temperature of Earth is called:', 'Global warming', 'Acid rain', 'Ozone depletion', 'Eutrophication'),
  // Science Tech (4+)
  BQ('Science Tech', 'Who is known as the father of modern physics?', 'Albert Einstein', 'Isaac Newton', 'Galileo Galilei', 'Niels Bohr'),
  BQ('Science Tech', 'The first artificial satellite launched was:', 'Sputnik 1', 'Apollo 11', 'Vostok', 'Explorer 1'),
  BQ('Science Tech', 'Who discovered penicillin?', 'Alexander Fleming', 'Louis Pasteur', 'Robert Koch', 'Edward Jenner'),
  BQ('Science Tech', 'The chemical formula of water is:', 'H₂O', 'CO₂', 'O₂', 'NaCl'),
  // Current Affairs (4+)
  BQ('Current Affairs', 'The 2024 Summer Olympics were held in:', 'Paris', 'Tokyo', 'Los Angeles', 'London'),
  BQ('Current Affairs', 'Who is the current Secretary-General of the United Nations (as of 2024)?', 'António Guterres', 'Ban Ki-moon', 'Kofi Annan', 'Boutros Boutros-Ghali'),
  BQ('Current Affairs', 'India hosted the G20 Summit in 2023 at:', 'New Delhi', 'Mumbai', 'Bengaluru', 'Chennai'),
  BQ('Current Affairs', 'Which country hosted the 2022 FIFA World Cup?', 'Qatar', 'Russia', 'Brazil', 'Germany'),
  // Static GK (4+)
  BQ('Static GK', 'How many continents are there on Earth?', '7', '5', '6', '8'),
  BQ('Static GK', 'The currency of Japan is:', 'Yen', 'Won', 'Yuan', 'Ringgit'),
  BQ('Static GK', 'The largest planet in our solar system is:', 'Jupiter', 'Earth', 'Saturn', 'Neptune'),
  BQ('Static GK', 'The national flower of India is:', 'Lotus', 'Rose', 'Sunflower', 'Marigold'),
];

export const CS_BANK: BankQuestion[] = [
  // Data Structures (5+)
  BQ('Data Structures', 'Which data structure uses LIFO (Last In, First Out) principle?', 'Stack', 'Queue', 'Linked List', 'Tree'),
  BQ('Data Structures', 'Which data structure uses FIFO (First In, First Out) principle?', 'Queue', 'Stack', 'Tree', 'Graph'),
  BQ('Data Structures', 'What is the time complexity of binary search on a sorted array?', 'O(log n)', 'O(n)', 'O(n²)', 'O(1)'),
  BQ('Data Structures', 'Which data structure is best suited for implementing a priority queue?', 'Heap', 'Stack', 'Array', 'Linked list'),
  BQ('Data Structures', 'In a binary search tree, the inorder traversal produces nodes in:', 'Sorted order', 'Reverse sorted order', 'Random order', 'Level order'),
  // Algorithms (4+)
  BQ('Algorithms', 'What is the worst-case time complexity of QuickSort?', 'O(n²)', 'O(n log n)', 'O(n)', 'O(log n)'),
  BQ('Algorithms', 'Which sorting algorithm has the best average-case time complexity of O(n log n)?', 'Merge Sort', 'Bubble Sort', 'Selection Sort', 'Insertion Sort'),
  BQ('Algorithms', 'Dynamic programming is used when the problem has:', 'Overlapping subproblems', 'No structure', 'Random behaviour', 'Linear structure only'),
  BQ('Algorithms', 'The time complexity of Dijkstra\'s algorithm using a binary heap is:', 'O((V + E) log V)', 'O(V²)', 'O(V·E)', 'O(E²)'),
  // Operating Systems (4+)
  BQ('Operating Systems', 'Which scheduling algorithm cannot cause starvation?', 'Round Robin', 'Priority Scheduling', 'Shortest Job First', 'Multilevel Queue'),
  BQ('Operating Systems', 'A deadlock occurs when:', 'All four Coffman conditions hold', 'Only mutual exclusion holds', 'Processes are too slow', 'Memory is full'),
  BQ('Operating Systems', 'Virtual memory uses which technique to load pages on demand?', 'Demand paging', 'Pre-paging', 'Clustering', 'Caching only'),
  BQ('Operating Systems', 'The process of switching from one process to another is called:', 'Context switching', 'Paging', 'Segmentation', 'Spooling'),
  // DBMS (4+)
  BQ('DBMS', 'Which normal form eliminates partial dependencies?', '2NF', '1NF', '3NF', 'BCNF'),
  BQ('DBMS', 'In SQL, which command is used to retrieve data from a database?', 'SELECT', 'FETCH', 'GET', 'RETRIEVE'),
  BQ('DBMS', 'Which key uniquely identifies a record in a table?', 'Primary key', 'Foreign key', 'Candidate key', 'Alternate key'),
  BQ('DBMS', 'ACID properties of transactions stand for:', 'Atomicity, Consistency, Isolation, Durability', 'Accuracy, Consistency, Integrity, Durability', 'Atomicity, Clarity, Isolation, Durability', 'Atomicity, Consistency, Identity, Durability'),
  // Computer Networks (4+)
  BQ('Computer Networks', 'Which layer of the OSI model is responsible for routing?', 'Network layer', 'Transport layer', 'Data link layer', 'Session layer'),
  BQ('Computer Networks', 'How many bits are there in an IPv4 address?', '32', '64', '128', '16'),
  BQ('Computer Networks', 'Which protocol is connection-oriented?', 'TCP', 'UDP', 'IP', 'ICMP'),
  BQ('Computer Networks', 'The default port for HTTP is:', '80', '443', '21', '22'),
  // TOC (3+)
  BQ('TOC', 'A deterministic finite automaton (DFA) has how many transitions per state per symbol?', 'Exactly one', 'Zero or more', 'At most one', 'Any number'),
  BQ('TOC', 'Which language is accepted by a Pushdown Automaton (PDA)?', 'Context-free languages', 'Regular languages', 'Context-sensitive languages', 'Recursively enumerable languages'),
  BQ('TOC', 'The Halting Problem is:', 'Undecidable', 'Decidable', 'In P', 'In NP'),
  // Digital Logic (3+)
  BQ('Digital Logic', 'How many input combinations are possible for a 3-input logic gate?', '8', '4', '6', '16'),
  BQ('Digital Logic', 'Which gate outputs 1 only when all inputs are 1?', 'AND', 'OR', 'XOR', 'NAND'),
  BQ('Digital Logic', 'The Boolean expression A + A\' equals:', '1', '0', 'A', 'A\''),
  // Computer Organization (3+)
  BQ('Computer Organization', 'Which memory is fastest in a computer system?', 'Registers', 'Cache', 'RAM', 'Hard disk'),
  BQ('Computer Organization', 'A 32-bit address bus can address how many memory locations?', '2^32', '2^16', '2^24', '2^8'),
  BQ('Computer Organization', 'Pipelining improves CPU performance by:', 'Overlapping instruction execution', 'Increasing clock speed', 'Adding more registers', 'Reducing memory latency'),
  // Compiler Design (3+)
  BQ('Compiler Design', 'Which phase of a compiler checks syntax?', 'Parser', 'Lexer', 'Semantic analyzer', 'Optimizer'),
  BQ('Compiler Design', 'Which phase of a compiler performs lexical analysis?', 'Lexer', 'Parser', 'Code generator', 'Optimizer'),
  BQ('Compiler Design', 'A symbol table is used to:', 'Store identifiers and their attributes', 'Optimize code', 'Generate machine code', 'Tokenize input'),
];

// ============================================================================
// READING PASSAGES + ENGLISH SKILL GENERATORS
// ============================================================================

export const READING_PASSAGES: { topic: string; passage: string; qs: { q: string; opts: string[] }[] }[] = [
  {
    topic: 'Environment',
    passage:
      'Climate change refers to long-term shifts in temperatures and weather patterns. While these shifts can be natural, since the 1800s human activities have been the main driver, primarily due to the burning of fossil fuels like coal, oil, and gas. The consequences include intense droughts, water scarcity, severe fires, rising sea levels, and declining biodiversity.',
    qs: [
      { q: 'What is the main cause of climate change since the 1800s?', opts: ['Human activities', 'Natural cycles', 'Solar flares', 'Volcanic eruptions'] },
      { q: 'Which is NOT mentioned as a consequence of climate change?', opts: ['Increased rainfall', 'Droughts', 'Rising sea levels', 'Declining biodiversity'] },
      { q: 'Which fossil fuel is mentioned?', opts: ['Coal', 'Uranium', 'Wood', 'Peat'] },
    ],
  },
  {
    topic: 'Technology',
    passage:
      'Artificial intelligence (AI) is the simulation of human intelligence by machines. It includes learning, reasoning, and self-correction. Applications include expert systems, natural language processing, speech recognition, and machine vision. As AI grows, ethical concerns around privacy, bias, and employment have become increasingly important.',
    qs: [
      { q: 'What does AI simulate?', opts: ['Human intelligence', 'Animal behaviour', 'Plant growth', 'Weather patterns'] },
      { q: 'Which is NOT an AI application mentioned?', opts: ['Rocket propulsion', 'Speech recognition', 'Natural language processing', 'Machine vision'] },
      { q: 'What ethical concern is raised about AI?', opts: ['Privacy', 'Color choice', 'Taste', 'Smell'] },
    ],
  },
  {
    topic: 'History',
    passage:
      'The Industrial Revolution, beginning in the late 18th century, marked a major turning point in history. Almost every aspect of daily life was influenced in some way. In particular, average income and population began to exhibit unprecedented sustained growth. Mechanisation of the textile industry, the development of iron-making techniques, and the improved efficiency of water power were key drivers.',
    qs: [
      { q: 'When did the Industrial Revolution begin?', opts: ['Late 18th century', 'Early 16th century', 'Mid 19th century', '20th century'] },
      { q: 'Which industry was mechanised first according to the passage?', opts: ['Textile', 'Steel', 'Automobile', 'Aerospace'] },
      { q: 'What improved efficiency is mentioned?', opts: ['Water power', 'Solar power', 'Wind power', 'Nuclear power'] },
    ],
  },
];

export function readingQuestion(
  m: QuestionMeta,
  _usedTexts?: Set<string>,
): Question {
  const p = pick(READING_PASSAGES);
  const q = pick(p.qs);
  const opts = shuffle(q.opts);
  const correctIdx = opts.indexOf(q.opts[0]);
  return {
    id: uniqueId(),
    type: 'reading',
    subject: m.subject,
    topic: m.topic,
    difficulty: m.difficulty,
    text: q.q,
    passage: p.passage,
    options: opts,
    correctOptions: [correctIdx],
    marks: m.marks,
    negativeMarks: m.negativeMarks,
  };
}

export function speakingQuestion(
  m: QuestionMeta,
  _usedTexts?: Set<string>,
): Question {
  const prompts = [
    'Describe a person who has influenced you the most in your life.',
    'Talk about a memorable trip you took recently.',
    'Discuss the advantages and disadvantages of working from home.',
    'Describe a book that left a lasting impression on you.',
    'Explain why environmental conservation is important.',
    'Describe your favourite hobby and why you enjoy it.',
    'Talk about a challenge you faced and how you overcame it.',
    'Discuss the role of technology in modern education.',
  ];
  return {
    id: uniqueId(),
    type: 'speaking',
    subject: m.subject,
    topic: m.topic,
    difficulty: m.difficulty,
    text: pick(prompts),
    mediaLabel: 'microphone',
    marks: m.marks,
    negativeMarks: m.negativeMarks,
  };
}

export function writingQuestion(
  m: QuestionMeta,
  _usedTexts?: Set<string>,
): Question {
  const prompts = [
    'Write an essay on the impact of social media on society.',
    'Describe the importance of time management in student life.',
    'Write a paragraph on "The Future of Renewable Energy".',
    'Argue for or against the statement: "Homework should be abolished."',
    'Write a letter to the editor about pollution in your city.',
    'Describe a recent technological advancement and its implications.',
    'Write a short essay on "The Value of Friendship".',
    'Discuss the impact of globalization on local cultures.',
  ];
  return {
    id: uniqueId(),
    type: 'writing',
    subject: m.subject,
    topic: m.topic,
    difficulty: m.difficulty,
    text: pick(prompts),
    marks: m.marks,
    negativeMarks: m.negativeMarks,
  };
}

export function listeningQuestion(
  m: QuestionMeta,
  _usedTexts?: Set<string>,
): Question {
  const prompts = [
    'Listen to the audio and identify the main topic discussed.',
    'Listen to the conversation and answer the question that follows.',
    'Listen to the lecture and summarize the key points.',
    'Listen to the dialogue and choose the correct answer.',
    'Listen to the news report and answer the comprehension question.',
  ];
  const opts = shuffle([
    'The main idea of the passage',
    'A supporting detail',
    'An unrelated topic',
    'A contradictory point',
  ]);
  return {
    id: uniqueId(),
    type: 'listening',
    subject: m.subject,
    topic: m.topic,
    difficulty: m.difficulty,
    text: pick(prompts),
    mediaLabel: 'audio',
    options: opts,
    correctOptions: [0],
    marks: m.marks,
    negativeMarks: m.negativeMarks,
  };
}

export function descriptiveQuestion(
  m: QuestionMeta,
  _usedTexts?: Set<string>,
): Question {
  const prompts = [
    `Explain the fundamental concepts of ${m.topic} with examples.`,
    `Discuss the applications and importance of ${m.topic}.`,
    `Describe a real-world problem related to ${m.topic} and propose a solution.`,
    `Compare and contrast two key concepts within ${m.topic}.`,
    `Critically analyse a recent development in ${m.topic}.`,
  ];
  return {
    id: uniqueId(),
    type: 'descriptive',
    subject: m.subject,
    topic: m.topic,
    difficulty: m.difficulty,
    text: pick(prompts),
    answerKeys: [],
    marks: m.marks,
    negativeMarks: m.negativeMarks,
  };
}

// ============================================================================
// GENERATORS REGISTRY — maps "Subject|Topic" to a GenFn
// ============================================================================

// Helper: build a fromBank-based generator for a single topic
function bankGen(
  bank: BankQuestion[],
  topic: string,
): GenFn {
  return (m, u) => fromBank(bank.filter((b) => b.topic === topic), m, u);
}

export const GENERATORS: Record<string, GenFn> = {
  // ---- Physics ----
  'Physics|Kinematics': physicsKinematics,
  'Physics|Laws of Motion': physicsLawsMotion,
  'Physics|Work Energy Power': physicsWorkEnergy,
  'Physics|Rotational Motion': physicsRotational,
  'Physics|Gravitation': physicsGravitation,
  'Physics|Thermodynamics': physicsThermo,
  'Physics|Oscillations Waves': physicsWaves,
  'Physics|Waves': physicsWaves,
  'Physics|Electrostatics': physicsElectrostatics,
  'Physics|Current Electricity': physicsCurrent,
  'Physics|Modern Physics': physicsModern,
  'Physics|Magnetism': physicsMagnetism,
  'Physics|Optics': physicsOptics,
  'Physics|Mechanics': physicsMechanics,
  'Physics|Electromagnetism': physicsElectromag,

  // ---- Chemistry ----
  'Chemistry|Atomic Structure': chemAtomic,
  'Chemistry|Chemical Bonding': chemBonding,
  'Chemistry|Thermodynamics': chemThermo,
  'Chemistry|Equilibrium': chemEquilibrium,
  'Chemistry|Electrochemistry': chemElectrochem,
  'Chemistry|Chemical Kinetics': chemKinetics,
  'Chemistry|Coordination Compounds': chemCoord,
  'Chemistry|Organic Basics': chemOrganicBasics,
  'Chemistry|Hydrocarbons': chemHydrocarbons,
  'Chemistry|Biomolecules': chemBiomolecules,
  'Chemistry|Physical Chemistry': chemPhysical,
  'Chemistry|Organic Chemistry': chemOrganic,
  'Chemistry|Inorganic Chemistry': chemInorganic,

  // ---- Mathematics ----
  'Mathematics|Algebra': mathAlgebra,
  'Mathematics|Trigonometry': mathTrig,
  'Mathematics|Coordinate Geometry': mathCoordinate,
  'Mathematics|Calculus': mathCalculus,
  'Mathematics|Vectors': mathVectors,
  'Mathematics|3D Geometry': math3D,
  'Mathematics|Vectors 3D': math3D,
  'Mathematics|Probability': mathProbability,
  'Mathematics|Matrices Determinants': mathMatrices,
  'Mathematics|Sequences Series': mathSequences,
  'Mathematics|Geometry': mathGeometry,
  'Mathematics|Number System': mathNumberTheory,
  'Mathematics|Number Theory': mathNumberTheory,
  'Mathematics|Combinatorics': mathCombinatorics,
  'Mathematics|Statistics': mathProbability,
  'Mathematics|Modern Math': mathCombinatorics,
  'Mathematics|Advanced Math': mathCalculus,
  'Mathematics|Word Problems': mathAlgebra,

  // ---- Math (SAT) ----
  'Math|Algebra': mathAlgebra,
  'Math|Geometry': mathGeometry,
  'Math|Number System': mathNumberTheory,
  'Math|Data Interpretation': bankGen(QUANT_BANK, 'Data Interpretation'),
  'Math|Advanced Math': mathCalculus,

  // ---- Botany (from bank) ----
  'Botany|Cell Biology': bankGen(BOTANY_BANK, 'Cell Biology'),
  'Botany|Plant Physiology': bankGen(BOTANY_BANK, 'Plant Physiology'),
  'Botany|Genetics': bankGen(BOTANY_BANK, 'Genetics'),
  'Botany|Plant Anatomy': bankGen(BOTANY_BANK, 'Plant Anatomy'),
  'Botany|Ecology': bankGen(BOTANY_BANK, 'Ecology'),
  'Botany|Plant Reproduction': bankGen(BOTANY_BANK, 'Plant Reproduction'),
  'Botany|Biodiversity': bankGen(BOTANY_BANK, 'Biodiversity'),

  // ---- Zoology (from bank) ----
  'Zoology|Human Physiology': bankGen(ZOOLOGY_BANK, 'Human Physiology'),
  'Zoology|Animal Kingdom': bankGen(ZOOLOGY_BANK, 'Animal Kingdom'),
  'Zoology|Reproduction': bankGen(ZOOLOGY_BANK, 'Reproduction'),
  'Zoology|Genetics Evolution': bankGen(ZOOLOGY_BANK, 'Genetics Evolution'),
  'Zoology|Biotechnology': bankGen(ZOOLOGY_BANK, 'Biotechnology'),
  'Zoology|Human Health': bankGen(ZOOLOGY_BANK, 'Human Health'),

  // ---- English ----
  'English|Reading Comprehension': readingQuestion,
  'English|Grammar': bankGen(ENGLISH_BANK, 'Grammar'),
  'English|Vocabulary': bankGen(ENGLISH_BANK, 'Vocabulary'),
  'English|Verbal Ability': bankGen(ENGLISH_BANK, 'Verbal Ability'),
  'English|Comprehension': bankGen(ENGLISH_BANK, 'Comprehension'),
  'English|Para Jumbles': bankGen(ENGLISH_BANK, 'Verbal Ability'),
  'English|Text Completion': bankGen(ENGLISH_BANK, 'Vocabulary'),
  'English|Sentence Equivalence': bankGen(ENGLISH_BANK, 'Grammar'),
  'English|Sentence Correction': bankGen(ENGLISH_BANK, 'Grammar'),

  // ---- Verbal (GRE/GMAT) ----
  'Verbal|Reading Comprehension': readingQuestion,
  'Verbal|Text Completion': bankGen(ENGLISH_BANK, 'Vocabulary'),
  'Verbal|Sentence Equivalence': bankGen(ENGLISH_BANK, 'Grammar'),
  'Verbal|Critical Reasoning': bankGen(REASONING_BANK, 'Logical'),
  'Verbal|Sentence Correction': bankGen(ENGLISH_BANK, 'Grammar'),

  // ---- Reading (SAT/IELTS/TOEFL) ----
  'Reading|Main Idea': readingQuestion,
  'Reading|Inference': readingQuestion,
  'Reading|Vocabulary Context': readingQuestion,
  'Reading|Author Purpose': readingQuestion,
  'Reading|Detail Evidence': readingQuestion,
  'Reading|Detail': readingQuestion,
  'Reading|Skimming Scanning': readingQuestion,
  'Reading|Gist': readingQuestion,

  // ---- Listening (IELTS/TOEFL) ----
  'Listening|Social': listeningQuestion,
  'Listening|Academic': listeningQuestion,
  'Listening|Detail': listeningQuestion,
  'Listening|Gist': listeningQuestion,
  'Listening|Inference': listeningQuestion,

  // ---- Writing (TOEFL — essay prompts) ----
  'Writing|Integrated': writingQuestion,
  'Writing|Independent': writingQuestion,

  // ---- Writing (SAT — MCQ on grammar/usage) ----
  'Writing|Grammar': bankGen(ENGLISH_BANK, 'Grammar'),
  'Writing|Punctuation': bankGen(ENGLISH_BANK, 'Grammar'),
  'Writing|Sentence Structure': bankGen(ENGLISH_BANK, 'Verbal Ability'),
  'Writing|Expression of Ideas': bankGen(ENGLISH_BANK, 'Verbal Ability'),

  // ---- Speaking (TOEFL) ----
  'Speaking|Independent': speakingQuestion,
  'Speaking|Integrated': speakingQuestion,

  // ---- Quantitative (CUET/GRE/GMAT/CAT) ----
  'Quantitative|Arithmetic': bankGen(QUANT_BANK, 'Arithmetic'),
  'Quantitative|Algebra': bankGen(QUANT_BANK, 'Algebra'),
  'Quantitative|Geometry': bankGen(QUANT_BANK, 'Geometry'),
  'Quantitative|Data Interpretation': bankGen(QUANT_BANK, 'Data Interpretation'),
  'Quantitative|Number System': bankGen(QUANT_BANK, 'Number System'),
  'Quantitative|Word Problems': bankGen(QUANT_BANK, 'Arithmetic'),
  'Quantitative|Data Sufficiency': bankGen(QUANT_BANK, 'Data Interpretation'),
  'Quantitative|Modern Math': bankGen(QUANT_BANK, 'Algebra'),

  // ---- Reasoning ----
  'Reasoning|Analogies': bankGen(REASONING_BANK, 'Analogies'),
  'Reasoning|Series': bankGen(REASONING_BANK, 'Series'),
  'Reasoning|Coding Decoding': bankGen(REASONING_BANK, 'Coding Decoding'),
  'Reasoning|Blood Relations': bankGen(REASONING_BANK, 'Blood Relations'),
  'Reasoning|Syllogism': bankGen(REASONING_BANK, 'Syllogism'),
  'Reasoning|Logical': bankGen(REASONING_BANK, 'Logical'),
  'Reasoning|Analytical': bankGen(REASONING_BANK, 'Analytical'),
  'Reasoning|Logical Reasoning': bankGen(REASONING_BANK, 'Logical'),
  'Reasoning|Critical Reasoning': bankGen(REASONING_BANK, 'Logical'),

  // ---- DILR (CAT) ----
  'DILR|Data Interpretation': bankGen(QUANT_BANK, 'Data Interpretation'),
  'DILR|Logical Reasoning': bankGen(REASONING_BANK, 'Logical'),

  // ---- Data Insights (GMAT) ----
  'Data Insights|Data Sufficiency': bankGen(QUANT_BANK, 'Data Interpretation'),
  'Data Insights|Graphics Analysis': bankGen(QUANT_BANK, 'Data Interpretation'),
  'Data Insights|Multi-Source Reasoning': bankGen(REASONING_BANK, 'Analytical'),

  // ---- Aptitude (GATE) ----
  'Aptitude|Verbal Aptitude': bankGen(ENGLISH_BANK, 'Verbal Ability'),
  'Aptitude|Quantitative Aptitude': bankGen(QUANT_BANK, 'Arithmetic'),
  'Aptitude|Analytical Aptitude': bankGen(REASONING_BANK, 'Analytical'),
  'Aptitude|Spatial Aptitude': bankGen(REASONING_BANK, 'Analytical'),

  // ---- Computer Science (GATE) ----
  'Computer Science|Data Structures': bankGen(CS_BANK, 'Data Structures'),
  'Computer Science|Algorithms': bankGen(CS_BANK, 'Algorithms'),
  'Computer Science|Operating Systems': bankGen(CS_BANK, 'Operating Systems'),
  'Computer Science|DBMS': bankGen(CS_BANK, 'DBMS'),
  'Computer Science|Computer Networks': bankGen(CS_BANK, 'Computer Networks'),
  'Computer Science|TOC': bankGen(CS_BANK, 'TOC'),
  'Computer Science|Digital Logic': bankGen(CS_BANK, 'Digital Logic'),
  'Computer Science|Computer Organization': bankGen(CS_BANK, 'Computer Organization'),
  'Computer Science|Compiler Design': bankGen(CS_BANK, 'Compiler Design'),

  // ---- General Knowledge / General Studies (CUET/UPSC) ----
  'General Knowledge|Current Affairs': bankGen(GK_BANK, 'Current Affairs'),
  'General Knowledge|Static GK': bankGen(GK_BANK, 'Static GK'),
  'General Knowledge|History': bankGen(GK_BANK, 'History'),
  'General Knowledge|Polity': bankGen(GK_BANK, 'Polity'),
  'General Knowledge|Economy': bankGen(GK_BANK, 'Economy'),
  'General Knowledge|Geography': bankGen(GK_BANK, 'Geography'),
  'General Knowledge|Environment': bankGen(GK_BANK, 'Environment'),
  'General Knowledge|Science Tech': bankGen(GK_BANK, 'Science Tech'),

  'General Studies|History': bankGen(GK_BANK, 'History'),
  'General Studies|Geography': bankGen(GK_BANK, 'Geography'),
  'General Studies|Polity': bankGen(GK_BANK, 'Polity'),
  'General Studies|Economy': bankGen(GK_BANK, 'Economy'),
  'General Studies|Environment': bankGen(GK_BANK, 'Environment'),
  'General Studies|Science Tech': bankGen(GK_BANK, 'Science Tech'),
  'General Studies|Current Affairs': bankGen(GK_BANK, 'Current Affairs'),

  // ---- Science (Olympiad) ----
  'Science|Physics': physicsMechanics,
  'Science|Chemistry': chemPhysical,
  'Science|Biology': (m, u) => fromBank(BOTANY_BANK, m, u),
  'Science|Number Theory': mathNumberTheory,
  'Science|Combinatorics': mathCombinatorics,

  // ---- AP Subject ----
  'AP Subject|Calculus': mathCalculus,
  'AP Subject|Statistics': mathProbability,
  'AP Subject|Physics': physicsMechanics,
  'AP Subject|Chemistry': chemPhysical,
  'AP Subject|Biology': (m, u) => fromBank(BOTANY_BANK, m, u),
};
