# Preparation AI — Worklog

---
Task ID: GEN-1
Agent: general-purpose
Task: Rebuild exam generator with parameterised templates, static banks, cross-attempt signature dedup

Work Log:
- Created `/home/z/my-project/src/lib/exams/generator.ts` (3,402 lines) — comprehensive question generator
- Added `QuestionMeta` interface and `GenFn` type to `/home/z/my-project/src/lib/types.ts` (they were referenced by the task as "already defined" but were missing from the types file)
- Implemented RNG helpers: `uniqueId`, `randInt`, `randFloat`, `pick`, `shuffle`
- Implemented `fmtNum(n)` — rounds to 2 decimals, strips trailing zeros; prevents FP artifacts like `7.380000000000001`
- Implemented `signature(text)` — lowercases, replaces digits with `#`, collapses whitespace, slices to 80 chars; used for cross-attempt deduplication
- Implemented `numericOptions(answer, unit)` — builds 4 plausible distractors near a numeric answer, shuffles, returns `{options, correct}`
- Implemented `mcqFromOptions(text, correct, distractors, meta)` — builds MCQ from explicit options with within-question dedup
- Implemented `fromBank(bank, meta, usedTexts?)` — picks from static bank; defensively flattens nested arrays in `opts` (legacy bug fix); dedupes within question; shuffles options so correct answer isn't always at index 0; accepts `usedTexts` for within-exam dedup
- Implemented `pickTopic(topicWeights, preferTopics?)` — weighted topic selection with optional narrowing + renormalisation
- Implemented `generateForSection(subject, topicWeights, count, section, crossAttemptSeen?)` — 10-attempt retry loop with topic-fallback after 5 failed retries; topic-rotation preferring least-used topics; seeds `usedSignatures` from `crossAttemptSeen`
- Implemented `generateExam(pattern, seenSignatures?)` — iterates sections, carries `crossAttemptSeen` across sections, mutates the caller's `seenSignatures` set so it accumulates across attempts
- Created 14 parameterised Physics generators (kinematics, laws of motion, work/energy, rotational, gravitation, thermo, waves, electrostatics, current, modern, magnetism, optics, mechanics delegate, electromag delegate) — each with 5-7 randomised variants
- Created 12 parameterised Chemistry generators (atomic, bonding, thermo, equilibrium, electrochem, kinetics, coord, organic, hydrocarbons, biomolecules, physical delegate, inorganic with arrow-function array fix, organicBasics delegate)
- Created 12 parameterised Mathematics generators (algebra, trig, coordinate, calculus, vectors, 3D, probability, matrices, sequences, geometry, number theory, combinatorics)
- Created 7 static question banks totalling ~230 questions: BOTANY_BANK (37), ZOOLOGY_BANK (33), ENGLISH_BANK (24), QUANT_BANK (30), REASONING_BANK (29), GK_BANK (35), CS_BANK (33)
- Created READING_PASSAGES array with 3 passages × 3 questions each
- Created 5 English-skill generators: `readingQuestion`, `speakingQuestion` (with mediaLabel), `writingQuestion`, `listeningQuestion` (with mediaLabel), `descriptiveQuestion`
- Built `GENERATORS` registry — `Record<string, GenFn>` mapping ~110 `"Subject|Topic"` keys to generator functions, covering all 16 exam patterns in patterns.ts
- Used `bankGen(bank, topic)` helper to reduce boilerplate for fromBank-based generators
- Fixed `chemInorganic` to use array of arrow functions (NOT `pick([fn, mcqFromOptions() as ...])` which crashes because mcqFromOptions returns a Question object, not a function)
- Added missing SAT Writing generators (`Writing|Grammar`, `Writing|Punctuation`, `Writing|Sentence Structure`, `Writing|Expression of Ideas`) mapping to ENGLISH_BANK — without these, SAT Writing section generated 0 questions
- Fixed unformatted fractions in `mathCalculus` integral distractors (e.g. `1.1428571428571428x^6` → `1.14x^6`) by routing through `fmtNum`

Verification:
- `bun run lint` → exit 0, no errors
- `bunx tsc --noEmit` → no errors in src/lib/exams or src/lib/types (pre-existing errors in examples/ and skills/ are unrelated)
- Smoke-tested all 16 exam patterns: every pattern generates the correct question count matching its section sums
- Within-exam dedup: 75/75 unique question texts for JEE Main (no exact duplicates)
- Cross-attempt dedup: passing a shared `Set<string>` across 3 JEE Main attempts yields 187 unique signatures out of 225 questions (some overlap unavoidable given finite variant count per topic)
- Zero floating-point noise in options (verified with strict decimal-expansion regex)
- Sample question: "A force of 26 N acts on a body for 7 s. What is the impulse delivered?" → options ["364 N·s", "236.6 N·s", "182 N·s", "145.6 N·s"], correct at index 2 ✓

Stage Summary:
- Generator is production-ready and supports all 16 exam patterns (JEE Main/Advanced, NEET, SAT, CUET, AP, Olympiad, GRE, GMAT, GATE, CAT, UPSC, IELTS, TOEFL, Duolingo)
- ~110 Subject|Topic generator mappings covering Physics, Chemistry, Mathematics, Botany, Zoology, English, Reading, Writing, Speaking, Listening, Quantitative, Reasoning, DILR, Data Insights, Aptitude, Computer Science, General Knowledge, General Studies, Science, AP Subject
- Cross-attempt signature dedup works by mutating the caller-provided `seenSignatures` Set; the API route can persist this Set per user to avoid repeating questions across mock attempts
- Note: TOEFL pattern has a pre-existing metadata bug (`totalQuestions: 64` but section counts sum to 54); generator correctly produces 54 based on section counts

---
Task ID: UI-MOCK
Agent: general-purpose
Task: Rebuild mock exam engine, question card, exam runner, exam results with behavior analysis

Work Log:
- Created `/home/z/my-project/src/components/dashboard/manage-exams-dialog.tsx` (dependency — was missing from workspace; provides the ManageExamsDialog that mock-exam-engine imports)
- Created `/home/z/my-project/src/components/mock-exam/mock-exam-engine.tsx` (~415 lines) — picker page with hero card (bg-hero-emerald), filters EXAM_PATTERNS by userExamGoals(user), per-exam cards with icon/name/fullName/badges/best-score/Primary badge, recent-attempts list, configure dialog (pattern summary tiles + sections + difficulty select + duration override + seen-signatures info), async handleGenerate that calls /api/mock-exam with seenSignatures.slice(-2000), extracts _newSignatures via recordSeenSignatures, strips internal fields, calls startExam(exam, examId), shows toast. Uses useStore.getState() inside async for seenSignatures + recordSeenSignatures.
- Created `/home/z/my-project/src/components/mock-exam/question-card.tsx` (~290 lines) — header with Q# / total + subject + topic + difficulty (color-coded emerald/amber/rose) + marks (+X/-Y) badges; passage block (teal); media label (amber, for listening/speaking); question text (text-base leading-relaxed font-medium); AnswerInput component handling MCQ/Reading/Listening (RadioGroup with flex layout — RadioGroupItem flex-shrink-0 + fixed w-6 h-6 letter badge emerald-600 when selected / stone-100 otherwise + option text flex-1 break-words leading-relaxed + emerald ring-1 + bg on selection); MSQ (same with Checkbox); Numerical (Input type=number step=any); Descriptive/Writing (Textarea + char count + word count); Speaking (Mic placeholder + Textarea). `renderOption(opt)` helper defensively flattens nested arrays/objects/numbers via recursive walk.
- Created `/home/z/my-project/src/components/mock-exam/exam-runner.tsx` (~462 lines) — pulls currentExam/endExam/addAttempt/user/attempts from store; state for currentIdx/answers (Record<id, AnswerValue>)/marked (Set)/visited (Set)/timeLeft/timeTaken (Record<id, sec>)/evaluating/result. Timer counts down from currentExam.durationSec, auto-submits at 0, color-coded (emerald >30min, amber <30min, rose <10min with timer-critical pulse). Top bar with exam name + section + timer + AlertDialog Submit + Exit. Main grid: question area (QuestionCard + action bar with Mark/Clear/Previous/Save&Next) + palette sidebar (grid of 1..N with answered/marked/visited/not-visited color states, ring-2 on current, legend, section progress bars, tip). goTo(idx) records time spent on current question. handleSubmit(auto) finds prior attempts of same exam, computes attemptNumber, posts to /api/evaluate, patches behavior.vsPrevious with scoreDelta/speedDelta/accuracyDelta/isImprovement, calls setResult + addAttempt. Does NOT call endExam() (would unmount + lose result). onExit prop clears state via parent. Renders ExamResults when result set; "No active exam" message + Back button when currentExam is null.
- Created `/home/z/my-project/src/components/mock-exam/exam-results.tsx` (~880 lines) — score hero (bg-hero-emerald) with exam name, submitted date, 4 StatCards (Score/total + grade, Percentile, Predicted AIR, Readiness Index), Back/Retake buttons. 5 tabs: Subjects (subject-wise performance bars color-coded by %, strengths card emerald, weaknesses card rose); Topics (heatmap grid color-coded by accuracy, gradient legend); Behavior (NEW — BehaviorPanel); Insights (accuracy/speed/time StatCards, confidence distribution bars, time-sinks slowest-5, AI improvement plan with study-hours/projected-percentile/7-day plan, Generate AI Study Plan button); YouTube Fixes (videos grouped by weak topic, thumbnails, channel/duration, "Mark as learned" toggle, Ask Mentor + Retake buttons). Footer CTA with Digital Twin / Weakness Radar / Full Analytics buttons. BehaviorPanel: 4 stat cards (Total Time, Speed Q/hr, Idle Time, Time of Day); pace-trend banner (emerald speeding-up / amber slowing-down / teal steady with explanation); speed-progression bar chart with up to 10 deciles (D1-D10) rendered as flex divs with height-% bars color-coded green/amber/rose + avg-sec labels + legend; time-per-subject horizontal bars; difficulty-vs-time big-number card with rapid-guesses and idle-pauses sub-cards; ComparisonCard with 3 delta cards (Score/Speed/Accuracy green/red) shown only if attempt.behavior.vsPrevious exists; CoachingCard auto-generating recommendations from rapidGuesses/idlePauses/paceTrend/difficultyTimeGap with "Excellent exam discipline!" message when all good. Friendly "not available" message when behavior is null.

Verification:
- `bun run lint` → exit 0, 0 errors, 0 warnings
- `bunx tsc --noEmit` → 0 errors in src/components/mock-exam/ and src/components/dashboard/ (1 pre-existing error in src/app/api/mentor/route.ts is unrelated to this task)

Stage Summary:
- All 4 requested mock-exam UI components are production-ready plus a missing dependency (ManageExamsDialog)
- Mock exam flow end-to-end: picker → configure → generate (via /api/mock-exam) → take exam (timer + palette + per-question time tracking) → submit (via /api/evaluate with previousAttempt for vsPrevious deltas) → results (5 tabs with rich BehaviourPanel bar chart built from divs, no external chart lib)
- Question card flex layout with fixed-width letter badges matches spec exactly; renderOption defensively handles the legacy nested-array data bug from the GEN-1 generator
- BehaviorPanel is visually rich: 4 stat cards + pace-trend banner + decile bar chart with color-coded on-pace/rushing/fatigue + per-subject bars + difficulty-vs-time + comparison-to-previous + auto-coaching
- All components use 'use client', shadcn/ui (Card, Button, Badge, RadioGroup, Checkbox, Input, Textarea, Label, Tabs, AlertDialog, Dialog, Progress, Select), lucide-react icons, light theme emerald/amber/teal/rose/stone palette
- Does NOT call endExam() after submit (intentional — would unmount and lose the result state); parent calls onExit to clean up via the Back/Retake buttons on results

---
Task ID: UI-VIEWS
Agent: general-purpose
Task: Rebuild all view components (mentor, career, university, scholarship, planner, wellness, university-predictor, analytics, ai-features)

Work Log:
- Created `/home/z/my-project/src/components/views/mentor-room.tsx` — AI Mentor chat with GLM-4.6, 5 quick-prompt buttons, typing indicator (3 bouncing dots), user/assistant avatars, Enter-to-send, 3 capability cards, calls /api/mentor with {messages, profile}
- Created `/home/z/my-project/src/components/views/career-guide.tsx` — 14-course grid with category chips (7 categories), gradient icon badges, salary/demand stat boxes, detail dialog with 4 StatCards + skill badges + recruiters + Find Universities/Scholarships CTAs, local ICON_MAP (Cpu/HeartPulse/GraduationCap/Briefcase/Users/BookOpen)
- Created `/home/z/my-project/src/components/views/university-finder.tsx` — 24-university grid with 11 country flag chips, star rating derived from world rank, 4-stat mini grid (tuition/employment/acceptance/scholarships), detail dialog with 4 StatCards + visa + scholarships + popular courses + Ask Mentor CTA
- Created `/home/z/my-project/src/components/views/scholarship-engine.tsx` — 18-scholarship grid with AI match score heuristic (base 50, +30 if level matches user type, +20 if exam name in eligibility), search + level Select + country Select filters, "X matched" badge, progress bars, Apply now button opens link in new tab, empty state
- Created `/home/z/my-project/src/components/views/study-planner.tsx` — 6 tab buttons (Daily/Weekly/Monthly/Revision/Mock/Priority), amber gradient today snapshot card, clickable time blocks with check-circle + subject color-coded badges, weak-topics-based list for priority/revision tabs, "Ask AI Mentor" CTA, reset plan button, completed summary cards
- Created `/home/z/my-project/src/components/views/wellness-counsellor.tsx` — daily-rotating motivational quote banner, 6 topic chips (Stress/Exam Anxiety/Burnout/Motivation/Focus/Study Habits) with color-coded active state, 4 numbered tips per topic, "Talk to AI Mentor" CTA, rose crisis support card with iCall + Vandrevala helpline info
- Created `/home/z/my-project/src/components/views/university-predictor.tsx` — `computeAdmissionProb(scorePct, ranking, targetScorePct)` heuristic (top-20 need 90%+, top-50 80%+, etc.), 3 bucket cards (Safe ≥70% emerald / Reach 35-70% amber / Ambitious <35% rose) with top 5 unis each, full predictions list of all 24 with progress bars, status banner (emerald if latest attempt, amber if none), static BUCKET_INFO class maps to avoid Tailwind dynamic class purging
- Created `/home/z/my-project/src/components/views/performance-analytics.tsx` — 4 StatCards (Avg Score/Accuracy/Speed/Trend), inline SVG line chart (score + dashed accuracy) + SVG radar chart for subject mastery, strengths (emerald) + weaknesses (rose) cards from recurring topics across attempts, scrollable attempt history with score/percentile/accuracy/weak/strong badges, empty state, Digital Twin / Get plan CTAs
- Created `/home/z/my-project/src/components/views/ai-features.tsx` — exports 4 components:
  - `DigitalTwin`: hero with "Meet your future self", 4 StatCards, 30/60/90-day SVG trajectory chart with gradient area, failure risk assessment (progress bar), key drivers, 4 AI recommendations
  - `ExamReadiness`: big readiness number (/1000) in circular SVG gauge, 5 dimension cards (Knowledge/Accuracy/Speed/Consistency/Coverage) with progress bars, "Path to 850+" improvement checklist with check-circle UI
  - `RankPredictor`: big predicted AIR number, percentile context, 3 StatCards, vs Top Ranker comparison bars (you vs top overlaid), SVG rank trajectory chart, 4-point action plan
  - `SuccessSimulator`: hours/day Slider (1-12), 3 StatCards (current/predicted/improvement), "What this means" explanation, AI advice based on hours, comparison bars (2hr vs 5hr vs 8hr) with current selection highlighted

Critical requirements met:
- All 9 files use `'use client'` directive
- All use shadcn/ui (Card, Button, Badge, Input, Textarea, Select, Progress, Slider, Dialog, Avatar, ScrollArea)
- All use lucide-react icons (Brain, Briefcase, Globe, Award, CalendarDays, HeartPulse, GraduationCap, BarChart3, Sparkles, Gauge, Trophy, TrendingUp, etc.)
- All use `cn()` from `@/lib/utils`
- Light/daylight theme — emerald/amber/teal/rose/stone palette only, NO indigo/blue
- Mobile-first responsive with sm:/lg: breakpoints
- SVG charts (line + radar + circular gauge) and div-based bar charts — no external chart libs
- All exports are named (MentorRoom, CareerGuide, UniversityFinder, ScholarshipEngine, StudyPlanner, WellnessCounsellor, UniversityPredictor, PerformanceAnalytics, DigitalTwin, ExamReadiness, RankPredictor, SuccessSimulator)
- Used static class lookup maps (BUCKET_INFO in university-predictor, ACCENT_MAP in wellness-counsellor) to avoid Tailwind dynamic class purging issues

Verification:
- `bun run lint` → exit 0, no errors
- `bunx eslint src/components/views/ --max-warnings 0` → exit 0
- `bunx tsc --noEmit` → no errors in src/components/views/ (pre-existing errors in examples/, skills/, and src/app/api/mentor/route.ts are unrelated to this task)
- All 9 files created successfully (verified with LS)

Stage Summary:
- All 12 secondary view components for the Preparation AI platform rebuilt from scratch
- Components are ready to be imported by the main app shell (which previous agents will wire up using `useStore`'s `view` field and the View type union: mentor, career, university, scholarship, planner, counsellor, university-predictor, analytics, digital-twin, readiness, rank-predictor, success-simulator)
- All interactive components hook into the Zustand store for user/attempts/setView/mentorMessages state
- The mentor-room posts to /api/mentor with the exact {messages, profile: {examGoal, name, type}} contract
- Scholarship match score, university admission probability, and rank/score predictions all use deterministic heuristics (no external API calls)
- SVG charts are pure inline (no chart libs) — line, radar, circular gauge, and div-based bar charts

---
Task ID: UI-CORE
Agent: general-purpose
Task: Rebuild auth screen, app shell, dashboard, manage exams, feature card, daily plan, exam countdown

Work Log:
- Created `/home/z/my-project/src/components/auth/auth-screen.tsx` (~490 lines) — split-screen layout: left brand panel (Brain logo in emerald gradient, value prop, 4 feature cards, social proof with 50k+ aspirants), right auth Card with Tabs (Log In / Sign Up). Both tabs share AuthFormFields: name (signup only) / email / password with leading icons, 2×2 user-type selector cards (school-11, school-12, ug, grad), and a multi-exam selector. Multi-exam selector: grid of ExamToggle cards each showing exam name + totalQuestions + duration (formatted as "3 hr" / "45 min") + check badge, "X selected" counter Badge (rose when 0), removable chips at bottom with amber Star on primary. Pre-selects 'jee-main'. useEffect re-filters selectedExams when userType changes (falls back to first available if none match). On submit: validates name (signup), email (contains @), password (>=4 chars), and at least 1 exam; calls login() with full User object (examGoals array, examGoal = first selected, examDate = defaultExamDate(), targetScore = 75% of pattern totalMarks). Uses examsForUserType so school-11/12 only see school-category + olympiad while ug/grad see all 16.
- Created `/home/z/my-project/src/components/app-shell.tsx` (~340 lines) — fixed desktop sidebar (w-72, hidden on mobile) with SidebarHeader (logo + "Preparation AI"), NavList (3 groups: Core / AI Agents / Explore, 15 nav items total), TargetExamCard (gradient card with days-left countdown, exam date, duration, rose color when <=30 days), SidebarFooter (avatar + name + email + logout button). Mobile: Sheet sidebar triggered by hamburger in Topbar. Topbar (sticky, backdrop-blur): greeting based on time of day, user name + primary exam name, "X days to {exam}" button (destructive when <=30 days, opens planner), notifications bell with rose dot, avatar with initials. NavList items: emerald-600 bg + white text when active; mock-exam shows attempt-count Badge. Exports daysToExam() helper. Each nav button has palette-btn active scale animation.
- Created `/home/z/my-project/src/components/dashboard/feature-card.tsx` (~190 lines) — FeatureCard component with props icon, title, subtitle, accent (emerald/amber/teal/rose), onClick, badge, detailTitle, detailDescription, detailBody (ReactNode), ctaLabel. ACCENTS map provides iconBg gradient, blob color, badge classes, ring color, cta text color. Card has card-lift hover effect, decorative gradient blob in top-right that scales on hover, gradient icon badge, chevron-right that slides on hover. If detailBody provided, wraps click in Dialog (with detail popup showing icon + title + description + body + Close/Open buttons); otherwise calls onClick directly. Accessible: role=button, tabIndex=0, Enter/Space key handlers.
- Created `/home/z/my-project/src/components/dashboard/exam-countdown-card.tsx` (~140 lines) — Card with bg-gradient-to-br from-amber-50 to-white, decorative blurred amber blob. Shows exam name + formatted date + duration Badge. 3 stat tiles (days / weeks / months left, rose color when <=30 days). Embeds shadcn/ui Calendar with today + examDay modifiers (exam day highlighted amber-500, today ring-amber-400), disabled past dates, current month. Footer chips: focus area (emerald) + streak (rose with Flame icon) + "Open planner" link.
- Rewrote `/home/z/my-project/src/components/dashboard/manage-exams-dialog.tsx` (~170 lines) — two-section layout per spec: "Your target exams" section with cards (primary marked with amber Star badge, others with emerald styling) each having "Make Primary" + "Remove" buttons; remove refuses last exam with destructive toast. "Add more exams" section: ScrollArea with one-click Add buttons for all exams not yet selected (filtered by user type). Empty state when no addable exams. Footer info banner explaining primary exam.
- Created `/home/z/my-project/src/components/dashboard/daily-plan-modal.tsx` (~245 lines) — auto-popup Dialog showing only when dailyPlanDismissed !== today's date (yyyy-mm-dd). Greeting with time-of-day icon (Sunrise/Sun/Sunset/Moon). Countdown card (amber gradient) with days to exam + attempts Badge. 5 default tasks (study/study/practice/mock/revision) rendered as clickable buttons with task-type icon, circle → check-circle toggle, strikethrough on done, progress Badge. Mock-exam scheduled alert (rose bg) with Start button → setView('mock-exam'). Motivational quote (rotates from 5 quotes). "Later" / "Let's go" buttons → dismissDailyPlan(today); "Let's go" also navigates to planner. Hooks declared before early return to satisfy Rules of Hooks.
- Created `/home/z/my-project/src/components/dashboard/dashboard.tsx` (~480 lines) — Hero Card (bg-hero-emerald) with welcome heading, target-exams Badge, days-to-exam Badge, last-mock-percentile Badge, target-exam chips (primary starred amber), 3 action buttons (Start Mock / Ask Mentor / Manage Exams), and ReadinessRing SVG (gradient stroke emerald→teal→amber, color dot indicator green/amber/rose by readiness level). Quick stats grid (4 StatCards): Avg Score, Mocks Taken, Best Percentile, Accuracy. Exam Countdown Card + Score Trend Card (custom SVG area chart with gradient fill). Feature grid: 15 FeatureCards covering Mock Exam Engine, Performance Analytics, AI Mentor Room, Digital Twin, Success Simulator, Readiness, Rank Predictor, University Predictor, Weakness Radar, Career Guide, University Finder, Scholarship Engine, Study Planner, Wellness Counsellor, Behaviour Insights — each with detailBody showing bullet list of capabilities and onClick → setView. Today's Focus card (weak topics from latest attempt with Fix buttons) + Quick Start card (4-tile grid). Manages manageOpen state for ManageExamsDialog; renders DailyPlanModal for auto-popup.

Verification:
- `bun run lint` → exit 0, 0 errors, 0 warnings
- `bunx tsc --noEmit` → 0 errors in src/components/auth/, src/components/app-shell.tsx, src/components/dashboard/* (pre-existing errors in examples/, skills/, and src/app/api/mentor/route.ts are unrelated to this task)

Stage Summary:
- All 7 requested files created (auth-screen, app-shell, dashboard, manage-exams-dialog rewrite, feature-card, daily-plan-modal, exam-countdown-card)
- Auth flow: signup/login → multi-exam selection (pre-selected jee-main) → user-type-aware filtering → login() populates User with examGoals[] + primary examGoal + 120-day default examDate
- App shell: 15 nav items grouped into Core/AI Agents/Explore, desktop sidebar + mobile Sheet, sticky topbar with greeting/days-to-exam/avatar/logout
- Dashboard: hero with SVG readiness ring + target-exam chips, 4 stat cards, exam countdown with embedded Calendar, 15 feature cards (each opening a detail Dialog with capabilities list), today's focus driven by latest attempt weakTopics, auto-popup DailyPlanModal that fires once per day
- Multi-exam manage dialog has two distinct sections (selected with Remove + Make Primary; addable with one-click Add) and refuses to remove the last selected exam
- All components use 'use client', shadcn/ui (Card, Button, Badge, Dialog, Tabs, Input, Label, Avatar, Sheet, Calendar, ScrollArea), lucide-react icons, cn() from @/lib/utils, light emerald/amber/teal/rose/stone theme with NO indigo/blue, responsive sm:/lg: breakpoints
- DailyPlanModal correctly handles React hooks ordering (all useState declared before early return); the dialog auto-dismisses via store's dismissDailyPlan(todayKey) and won't reappear until tomorrow
- Note: spec said "15 FeatureCard components" but listed 14 names — added a 15th "Behaviour Insights" card pointing to the analytics view to reach 15 while keeping the listed 14 intact

---
Task ID: REBUILD-FINAL
Agent: Super Z (main)
Task: Rebuild entire Preparation AI application after workspace wipe. Fix MockExamEngine user prop bug. Wire up page.tsx.

Work Log:
- Discovered workspace was wiped — only .git, download/, skills/, upload/ remained. No source code.
- Ran init-fullstack.sh to restore Next.js scaffold.
- Rebuilt core infrastructure: types.ts (User with examGoals[], ExamAttempt with behavior, BehaviorAnalysis interface), store.ts (Zustand with addExamGoal/removeExamGoal/recordSeenSignatures/userExamGoals), patterns.ts (17 exam patterns).
- Dispatched 3 parallel subagents:
  - GEN-1: Built generator.ts (3,402 lines) with 38 parameterised generators, 7 static banks (~230 questions), cross-attempt signature dedup, topic-fallback retry logic.
  - DATA-1: Built career-data.ts (13 courses), university-data.ts (26 universities), scholarship-data.ts (18 scholarships), youtube-data.ts (33 topics), study-plan-templates.ts (6 plans).
  - UI-CORE: Built auth-screen.tsx (multi-exam selector), app-shell.tsx (sidebar+topbar), dashboard.tsx (hero+stats+feature grid), manage-exams-dialog.tsx, feature-card.tsx, daily-plan-modal.tsx, exam-countdown-card.tsx.
  - UI-MOCK: Built mock-exam-engine.tsx, question-card.tsx (flex layout with fixed-width letter badges), exam-runner.tsx (timer+palette+submit), exam-results.tsx (5 tabs with BehaviorPanel).
  - UI-VIEWS: Built mentor-room.tsx, career-guide.tsx, university-finder.tsx, scholarship-engine.tsx, study-planner.tsx, wellness-counsellor.tsx, university-predictor.tsx, performance-analytics.tsx, ai-features.tsx (DigitalTwin, ExamReadiness, RankPredictor, SuccessSimulator).
- Built 3 API routes: mock-exam/route.ts (accepts seenSignatures, returns _newSignatures), evaluate/route.ts (computes BehaviorAnalysis), mentor/route.ts (GLM-4.6 chat).
- Updated globals.css with daylight emerald/amber theme, layout.tsx with Preparation AI metadata.
- Wired page.tsx with AppShell + ViewRouter (15 views) + DailyPlanModal + hydration-safe loader.
- Fixed mentor/route.ts TypeScript error (role type casting).
- Fixed critical bug: MockExamEngine expected `user` as a prop but page.tsx didn't pass it. Changed to read user from useStore.
- Verified end-to-end with Agent Browser:
  - Auth screen: multi-exam selector with 7 school-level exams, JEE Main pre-selected, "3 selected" after picking JEE Main + NEET + SAT
  - Signup → daily plan modal → dashboard with "Welcome back, Aarav", target exam chips, Manage Exams button
  - Mock exam engine: shows ONLY 3 selected exams (JEE Main Primary, NEET, SAT), no others
  - Started JEE Main mock: 75 questions, exam runner with timer, palette, A/B/C/D options with proper alignment
  - Submitted → results page with 5 tabs (Subjects, Topics, Behavior, Insights, YouTube Fixes)
  - Behavior tab: Total Time, Speed, Idle Time, Time of Day, Pace Trend (Steady), Speed Progression chart, Difficulty vs Time, Comparison to previous attempt — all rendering correctly
- Lint: 0 errors, 0 warnings
- Dev server: clean compiles, POST /api/mock-exam 200, POST /api/evaluate 200

Stage Summary:
- Entire Preparation AI platform rebuilt from scratch after workspace wipe
- All features restored: multi-exam signup, Manage Exams dialog, mock exam engine with cross-attempt question variety, Behavior Analysis tab, 15 views, AI mentor, YouTube recommendations
- Preview panel and "Open in New Tab" button restored (dev server running on port 3000)
