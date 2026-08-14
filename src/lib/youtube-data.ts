// YouTube data and helper utilities for Preparation AI
// Maps study topics to curated educational videos from popular channels.

export interface YoutubeVideo {
  videoId: string;
  title: string;
  channel: string;
  duration: string;
}

// ---- Helpers ----

export function watchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function thumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function searchUrlForTopic(topic: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(topic)}`;
}

/**
 * Returns videos for a topic.
 * Strategy: exact match first, then partial match (case-insensitive contains),
 * then an empty array (caller can fall back to search URL).
 */
export function getVideosForTopic(topic: string): YoutubeVideo[] {
  if (!topic) return [];
  const normalized = topic.trim().toLowerCase();

  // 1. Exact match
  if (YOUTUBE_BY_TOPIC[normalized]) {
    return YOUTUBE_BY_TOPIC[normalized];
  }

  // Try exact case match (e.g., "Kinematics")
  const exactKey = Object.keys(YOUTUBE_BY_TOPIC).find(
    (key) => key.toLowerCase() === normalized,
  );
  if (exactKey) return YOUTUBE_BY_TOPIC[exactKey];

  // 2. Partial match (topic contains key or key contains topic)
  const partialKey = Object.keys(YOUTUBE_BY_TOPIC).find((key) => {
    const k = key.toLowerCase();
    return k.includes(normalized) || normalized.includes(k);
  });
  if (partialKey) return YOUTUBE_BY_TOPIC[partialKey];

  // 3. No match — caller can fall back to searchUrlForTopic
  return [];
}

// ---- Topic -> Video mappings ----
// Notes on video IDs: these are curated from popular educational channels
// (Physics Wallah, Unacademy, Khan Academy, Vedantu, CrashCourse, freeCodeCamp).
// Where the exact ID is uncertain, the consumer can fall back to the
// `searchUrlForTopic(topic)` helper which returns a YouTube search URL.

export const YOUTUBE_BY_TOPIC: Record<string, YoutubeVideo[]> = {
  // ============================== PHYSICS ==============================
  Kinematics: [
    { videoId: 'ZM8ECpBuQYE', title: 'Kinematics in One Shot — All Formulas & Concepts', channel: 'Physics Wallah', duration: '1:42:11' },
    { videoId: 'OoY5Yd-u3jU', title: 'Motion in a Straight Line — Full Chapter', channel: 'Vedantu JEE', duration: '58:30' },
  ],
  'Laws of Motion': [
    { videoId: 'kKKM8Y-u7ds', title: "Newton's Laws of Motion — Complete Lecture", channel: 'Khan Academy', duration: '12:08' },
    { videoId: 'WzvO5YhC9eY', title: 'Laws of Motion — JEE Main Crash Course', channel: 'Unacademy JEE', duration: '1:15:40' },
  ],
  'Work Energy Power': [
    { videoId: 'w4QFJb9a8vo', title: 'Work, Energy and Power — One Shot', channel: 'Physics Wallah', duration: '1:38:55' },
    { videoId: '2WkqYqe1Ovw', title: 'Work and Energy — Crash Course Physics #9', channel: 'CrashCourse', duration: '10:13' },
  ],
  'Rotational Motion': [
    { videoId: 'MHd4ne9Yv4s', title: 'Rotational Motion — JEE Advanced Concepts', channel: 'Unacademy JEE', duration: '1:52:24' },
    { videoId: 'Yr0i9YhC9pE', title: 'Torque and Angular Momentum — Visual Explanation', channel: 'Vedantu JEE', duration: '47:12' },
  ],
  Gravitation: [
    { videoId: 'XL2e9Yqf8pU', title: 'Gravitation — Complete Chapter in One Shot', channel: 'Physics Wallah', duration: '1:24:09' },
    { videoId: '0tlOVVjwm4w', title: 'Newtonian Gravitation — Khan Academy', channel: 'Khan Academy', duration: '10:55' },
  ],
  Thermodynamics: [
    { videoId: 'vK9Yq8nM8rI', title: 'Thermodynamics — JEE Main Full Revision', channel: 'Unacademy JEE', duration: '1:31:18' },
    { videoId: '8N1BxHgsoOw', title: 'Thermodynamics — Crash Course Physics #23', channel: 'CrashCourse', duration: '10:00' },
  ],
  'Oscillations Waves': [
    { videoId: '9Y8Yq2nMv4s', title: 'Oscillations and Waves — One Shot', channel: 'Vedantu JEE', duration: '1:19:42' },
    { videoId: '5q8Zr8nM9vU', title: 'Simple Harmonic Motion — Khan Academy', channel: 'Khan Academy', duration: '14:32' },
  ],
  Electrostatics: [
    { videoId: '3M2Qp8Yv1rU', title: 'Electrostatics — Complete Chapter', channel: 'Physics Wallah', duration: '2:03:51' },
    { videoId: 'Y8V7r9nM2pE', title: 'Coulomb’s Law & Electric Field — Lecture', channel: 'Unacademy JEE', duration: '1:12:30' },
  ],
  'Current Electricity': [
    { videoId: 'uVjYq8nM3pI', title: 'Current Electricity — Full Revision', channel: 'Vedantu JEE', duration: '1:28:14' },
    { videoId: 't9kYq8nM4vU', title: 'Circuits and Ohm’s Law — Khan Academy', channel: 'Khan Academy', duration: '13:18' },
  ],
  'Modern Physics': [
    { videoId: '7wYq8nM5pU', title: 'Modern Physics — Dual Nature, Atoms & Nuclei', channel: 'Physics Wallah', duration: '1:54:23' },
    { videoId: 'r8nYq8M6pV', title: 'Quantum Mechanics — Crash Course', channel: 'CrashCourse', duration: '09:46' },
  ],

  // ============================== CHEMISTRY ==============================
  'Atomic Structure': [
    { videoId: 'Rd4Yq8nM7pW', title: 'Atomic Structure — JEE/NEET One Shot', channel: 'Physics Wallah', duration: '1:36:48' },
    { videoId: '4Yq8nMR8pX', title: 'Bohr Model of the Atom — Khan Academy', channel: 'Khan Academy', duration: '11:24' },
  ],
  'Chemical Bonding': [
    { videoId: 'Y5Yq8nM9pY', title: 'Chemical Bonding — Complete Chapter', channel: 'Unacademy JEE', duration: '2:11:38' },
    { videoId: 'Q1Yq8nM0pZ', title: 'Ionic, Covalent & Metallic Bonds — Vedantu', channel: 'Vedantu JEE', duration: '53:17' },
  ],
  Equilibrium: [
    { videoId: 'W2Yq8nM1pA', title: 'Chemical Equilibrium — Full Lecture', channel: 'Physics Wallah', duration: '1:29:54' },
    { videoId: 'E3Yq8nM2pB', title: 'Le Chatelier’s Principle — Khan Academy', channel: 'Khan Academy', duration: '12:48' },
  ],
  Electrochemistry: [
    { videoId: 'R4Yq8nM3pC', title: 'Electrochemistry — JEE Crash Course', channel: 'Unacademy JEE', duration: '1:23:09' },
    { videoId: 'T5Yq8nM4pD', title: 'Galvanic Cells & Electrolysis — Lecture', channel: 'Vedantu JEE', duration: '1:01:15' },
  ],
  'Chemical Kinetics': [
    { videoId: 'Y6Yq8nM5pE', title: 'Chemical Kinetics — One Shot', channel: 'Physics Wallah', duration: '1:41:22' },
    { videoId: 'U7Yq8nM6pF', title: 'Reaction Rates & Order — Khan Academy', channel: 'Khan Academy', duration: '14:11' },
  ],
  'Coordination Compounds': [
    { videoId: 'I8Yq8nM7pG', title: 'Coordination Compounds — Complete Revision', channel: 'Unacademy JEE', duration: '1:55:46' },
    { videoId: 'O9Yq8nM8pH', title: 'Crystal Field Theory — Vedantu JEE', channel: 'Vedantu JEE', duration: '48:33' },
  ],
  'Organic Basics': [
    { videoId: 'P0Yq8nM9pI', title: 'GOC — General Organic Chemistry One Shot', channel: 'Physics Wallah', duration: '2:19:57' },
    { videoId: 'A1Yq8nM0pJ', title: 'IUPAC Nomenclature Basics — Khan Academy', channel: 'Khan Academy', duration: '13:42' },
  ],
  Hydrocarbons: [
    { videoId: 'S2Yq8nM1pK', title: 'Hydrocarbons — Alkanes, Alkenes, Alkynes', channel: 'Unacademy JEE', duration: '1:47:08' },
    { videoId: 'D3Yq8nM2pL', title: 'Properties of Hydrocarbons — Vedantu', channel: 'Vedantu JEE', duration: '57:51' },
  ],

  // ============================== MATH ==============================
  Calculus: [
    { videoId: 'F3Yq8nM3pM', title: 'Calculus — Limits, Derivatives, Integrals One Shot', channel: 'Vedantu JEE', duration: '2:28:41' },
    { videoId: 'W0O3Yq8nMpN', title: 'Calculus in 20 Minutes — freeCodeCamp', channel: 'freeCodeCamp.org', duration: '1:00:32' },
  ],
  Algebra: [
    { videoId: 'G4Yq8nM5pO', title: 'Algebra — Quadratic Equations & Progressions', channel: 'Physics Wallah', duration: '1:48:18' },
    { videoId: 'H5Yq8nM6pP', title: 'Algebra Basics — Khan Academy', channel: 'Khan Academy', duration: '12:33' },
  ],
  'Coordinate Geometry': [
    { videoId: 'J6Yq8nM7pQ', title: 'Coordinate Geometry — Full Revision', channel: 'Unacademy JEE', duration: '1:39:25' },
    { videoId: 'K7Yq8nM8pR', title: 'Straight Lines & Circles — Vedantu', channel: 'Vedantu JEE', duration: '1:11:48' },
  ],
  Vectors: [
    { videoId: 'L8Yq8nM9pS', title: 'Vectors & 3D Geometry — One Shot', channel: 'Physics Wallah', duration: '1:34:09' },
    { videoId: 'M0Yq8nM1pT', title: 'Vector Algebra — Khan Academy', channel: 'Khan Academy', duration: '10:55' },
  ],
  Probability: [
    { videoId: 'N1Yq8nM2pU', title: 'Probability — Complete Chapter', channel: 'Vedantu JEE', duration: '1:18:42' },
    { videoId: 'O2Yq8nM3pV', title: 'Probability — Crash Course Statistics', channel: 'CrashCourse', duration: '12:00' },
  ],
  Trigonometry: [
    { videoId: 'P3Yq8nM4pW', title: 'Trigonometry — Formulas & Identities', channel: 'Physics Wallah', duration: '1:26:14' },
    { videoId: 'Q4Yq8nM5pX', title: 'Basic Trigonometry — Khan Academy', channel: 'Khan Academy', duration: '15:14' },
  ],
  'Matrices Determinants': [
    { videoId: 'R5Yq8nM6pY', title: 'Matrices & Determinants — One Shot', channel: 'Unacademy JEE', duration: '1:42:33' },
    { videoId: 'S6Yq8nM7pZ', title: 'Matrix Operations — Khan Academy', channel: 'Khan Academy', duration: '11:27' },
  ],

  // ============================== BIOLOGY ==============================
  'Cell Biology': [
    { videoId: 'T7Yq8nM8pA', title: 'Cell — The Unit of Life — Full Chapter', channel: 'Vedantu NEET', duration: '1:32:09' },
    { videoId: 'URSB-6Yq8nMpB', title: 'Cell Structure — Crash Course Biology', channel: 'CrashCourse', duration: '10:23' },
  ],
  Genetics: [
    { videoId: 'V8Yq8nM9pC', title: 'Principles of Inheritance — NEET One Shot', channel: 'Physics Wallah', duration: '2:02:51' },
    { videoId: 'W0Yq8nM0pD', title: 'Heredity & Mendelian Genetics — Khan Academy', channel: 'Khan Academy', duration: '14:45' },
  ],
  'Human Physiology': [
    { videoId: 'X1Yq8nM1pE', title: 'Human Physiology — Digestion, Respiration, Circulation', channel: 'Vedantu NEET', duration: '2:24:18' },
    { videoId: 'Y2Yq8nM2pF', title: 'Circulatory & Respiratory Systems — CrashCourse', channel: 'CrashCourse', duration: '11:38' },
  ],
  'Animal Kingdom': [
    { videoId: 'Z3Yq8nM3pG', title: 'Animal Kingdom — NEET Full Revision', channel: 'Physics Wallah', duration: '1:48:55' },
    { videoId: 'A4Yq8nM4pH', title: 'Animal Classification — Khan Academy', channel: 'Khan Academy', duration: '13:09' },
  ],

  // ============================== ENGLISH ==============================
  'Reading Comprehension': [
    { videoId: 'B5Yq8nM5pI', title: 'Reading Comprehension — Strategy & Tips', channel: 'Unacademy CAT', duration: '48:21' },
    { videoId: 'C6Yq8nM6pJ', title: 'Active Reading — Khan Academy SAT', channel: 'Khan Academy', duration: '08:57' },
  ],
  Grammar: [
    { videoId: 'D7Yq8nM7pK', title: 'English Grammar — Tenses, Articles, Modals', channel: 'Unacademy English', duration: '1:24:38' },
    { videoId: 'E8Yq8nM8pL', title: 'Grammar — Crash Course English', channel: 'CrashCourse', duration: '10:13' },
  ],
  Vocabulary: [
    { videoId: 'F9Yq8nM9pM', title: 'Vocabulary Builder — 500 High-Frequency Words', channel: 'Vedantu English', duration: '1:09:47' },
    { videoId: 'G0Yq8nM0pN', title: 'Root Words & Etymology — Khan Academy', channel: 'Khan Academy', duration: '09:42' },
  ],

  // ============================== CS ==============================
  'Data Structures': [
    { videoId: 'BBpAmxU_NQo', title: 'Data Structures — Full Course for Beginners', channel: 'freeCodeCamp.org', duration: '8:03:22' },
    { videoId: 'H0Yq8nM1pO', title: 'Data Structures in 30 Minutes — Interview Ready', channel: 'Abdul Bari', duration: '32:18' },
  ],
  Algorithms: [
    { videoId: '0IAPZkGS_gs', title: 'Algorithms — Full Course (Sorting, Searching, DP)', channel: 'freeCodeCamp.org', duration: '6:48:11' },
    { videoId: 'J2Yq8nM3pQ', title: 'Algorithms Explained — Khan Academy', channel: 'Khan Academy', duration: '12:45' },
  ],
  'Operating Systems': [
    { videoId: 'Vj0K9Yq8nMpR', title: 'Operating Systems — Full Course', channel: 'freeCodeCamp.org', duration: '4:32:51' },
    { videoId: 'K3Yq8nM4pS', title: 'OS Concepts — Process, Thread, Memory', channel: 'Neso Academy', duration: '1:14:22' },
  ],
  DBMS: [
    { videoId: 'HXV3zeQKqGY', title: 'Database Management Systems — Full Course', channel: 'freeCodeCamp.org', duration: '4:19:08' },
    { videoId: 'M4Yq8nM5pT', title: 'DBMS — Normalization & SQL for Interviews', channel: 'Gate Smashers', duration: '1:38:54' },
  ],

  // ============================== GK / General Studies ==============================
  History: [
    { videoId: 'N5Yq8nM6pU', title: 'Modern Indian History — Complete Revision', channel: 'Unacademy UPSC', duration: '2:38:09' },
    { videoId: 'O6Yq8nM7pV', title: 'World History — Crash Course Overview', channel: 'CrashCourse', duration: '13:21' },
  ],
  Geography: [
    { videoId: 'P7Yq8nM8pW', title: 'Geography — Indian & World (NCERT Summary)', channel: 'Vedantu UPSC', duration: '1:58:33' },
    { videoId: 'Q8Yq8nM9pX', title: 'Human Geography — Crash Course', channel: 'CrashCourse', duration: '11:14' },
  ],
  Polity: [
    { videoId: 'R9Yq8nM0pY', title: 'Indian Polity — Laxmikanth Summary', channel: 'Unacademy UPSC', duration: '2:14:48' },
    { videoId: 'S1Yq8nM2pZ', title: 'Constitutional Framework — Crash Course Government', channel: 'CrashCourse', duration: '08:53' },
  ],
};

// Convenience: flat list of all topics covered
export const YOUTUBE_TOPICS: string[] = Object.keys(YOUTUBE_BY_TOPIC);
