# FBISE STEM Intellect (Open-Notebook & Edu-Agent) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a competition-grade digital product for the Federal Directorate of Education (FDE) / FBISE Intra-Board HSSC Science Exhibition that fuses Open-Notebook (RAG, multi-source synthesis, audio podcast overviews) and Edu-Agent (Socratic tutor, <70% weak-spot diagnostics, SLO quizzes, mind maps) with an Omni-Route engine supporting Google Gemini 2.5 Flash and Local Qwen 14B (Ollama).

**Architecture:** Next.js 16 (App Router) + React 19 unified full-stack application. Backend routes under `/api/ai/omni-route` route requests to Google Gemini, local Ollama (Qwen 14B), or instant FBISE STEM offline caches with zero-crash fallbacks. Frontend components integrate directly into the existing midnight-blue glassmorphism theme with dedicated views for Open-Notebook, Edu-Agent, and Omni-Route Settings.

**Tech Stack:** Next.js 16.3.6, React 19.2.8, TypeScript 5, Tailwind CSS v4, Lucide React, `@google/genai` (Google Gen AI SDK), Web Speech API.

**Spec:** [`docs/superpowers/specs/2026-09-25-stem-fbise-student-helper-design.md`](file:///e:/MY%20PROJECTS/Student%20Manager/docs/superpowers/specs/2026-09-25-stem-fbise-student-helper-design.md)

## Global Constraints

- Must run on Next.js 16 (App Router) and React 19 in Windows PowerShell environment without syntax errors.
- Never use unescaped `&&` in PowerShell commands; use `;` instead.
- Strict zero-crash guarantee: All API calls must gracefully handle offline/missing-key scenarios without breaking UI rendering or throwing uncaught 500 errors.
- Preserve the existing midnight-blue glassmorphism design system (`#060b14`, `#091122`, `#2563eb`, `#06b6d4`).
- Grounded directly in FBISE HSSC (Grade 11 & 12) STEM subjects: Physics, Chemistry, Biology, Computer Science, and Mathematics.

## Review Focus

- Missing API Key or Network Disconnect: App must smoothly fall back to local Ollama or FBISE exhibition offline dataset with an informational banner, never freezing or showing an empty screen.
- Malformed JSON from LLM: Quiz and Mind-Map parsers must validate schema and fall back to structured defaults rather than throwing JSON parse errors.
- Large Document Ingestion: Text chunking must truncate gracefully and avoid browser memory lockup.
- Audio Podcast Playback on Browsers without full TTS: Audio engine must handle voice synthesis gracefully with visual transcript synchronization.
- Quick-Switching Models: Changing active model in Settings (Gemini <-> Qwen 14B <-> Demo) must reflect immediately in all views without requiring page reloads.

---

### Task 1: Type Definitions & Pre-Loaded FBISE Curriculum Knowledge Base

**Files:**
- Create: `src/types/stem.ts`
- Create: `src/lib/fbise-curriculum.ts`

**Interfaces:**
- Produces:
  - `StemSubject`: Union of `'physics' | 'chemistry' | 'biology' | 'computer_science' | 'mathematics'`
  - `NotebookDocument`, `Citation`, `StudySummary`, `AudioPodcastEpisode`
  - `SocraticMessage`, `QuizQuestion`, `QuizResult`, `WeakSpotRecord`, `MindMapData`
  - `OmniRouteConfig`, `OmniRouteRequest`, `OmniRouteResponse`
  - `FBISE_CURRICULUM_DATA`: Pre-indexed chapters, SLOs, textbook summaries, and past paper questions for all 5 STEM subjects.

- [ ] **Step 1: Write type definitions in `src/types/stem.ts`**

```typescript
export type StemSubject = 'physics' | 'chemistry' | 'biology' | 'computer_science' | 'mathematics';

export interface StemSubjectInfo {
  id: StemSubject;
  name: string;
  code: string;
  grade: 'HSSC-I' | 'HSSC-II';
  icon: string;
  color: string;
  totalChapters: number;
}

export interface NotebookDocument {
  id: string;
  subject: StemSubject;
  title: string;
  chapter: string;
  content: string;
  sourceType: 'textbook' | 'notes' | 'past_paper' | 'syllabus';
  uploadedAt: string;
}

export interface Citation {
  sourceId: string;
  sourceTitle: string;
  snippet: string;
  confidence: number;
}

export interface StudySummary {
  executiveSummary: string;
  keyFormulasAndDefinitions: string[];
  boardExamPitfalls: string[];
  suggestedReviewQuestions: string[];
}

export interface AudioPodcastSpeaker {
  speaker: 'Dr. Sarah (Concept Lead)' | 'Alex (Student Fellow)';
  text: string;
  timestamp: string;
}

export interface AudioPodcastEpisode {
  id: string;
  topic: string;
  subject: StemSubject;
  duration: string;
  dialogue: AudioPodcastSpeaker[];
}

export interface SocraticMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: Citation[];
  timestamp: string;
  guidedQuestions?: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  sloReference: string;
  difficulty: 'Conceptual' | 'Application' | 'Analytical';
}

export interface QuizResult {
  quizId: string;
  subject: StemSubject;
  topic: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: string;
  missedQuestions: {
    question: string;
    studentAnswer: string;
    correctAnswer: string;
    remediationTip: string;
  }[];
}

export interface WeakSpotRecord {
  id: string;
  subject: StemSubject;
  topic: string;
  chapter: string;
  masteryPercentage: number;
  status: 'critical' | 'recovering' | 'mastered';
  lastAssessed: string;
  prescribedRemediation: string[];
}

export interface MindMapNode {
  id: string;
  label: string;
  category: 'core' | 'prerequisite' | 'application' | 'exam_focus';
  description: string;
}

export interface MindMapLink {
  source: string;
  target: string;
  relation: string;
}

export interface MindMapData {
  topic: string;
  subject: StemSubject;
  nodes: MindMapNode[];
  links: MindMapLink[];
}

export type AIProvider = 'gemini' | 'qwen_local' | 'demo_fallback';

export interface OmniRouteConfig {
  provider: AIProvider;
  geminiApiKey: string;
  ollamaBaseUrl: string;
  localModelName: string;
}

export interface OmniRouteRequest {
  action: 'chat' | 'synthesize' | 'quiz' | 'audio_script' | 'mindmap' | 'diagnose' | 'ping';
  subject?: StemSubject;
  topic?: string;
  context?: string;
  userMessage?: string;
  history?: SocraticMessage[];
  quizAnswers?: { questionId: string; selectedIndex: number }[];
  config?: Partial<OmniRouteConfig>;
}

export interface OmniRouteResponse {
  success: boolean;
  providerUsed: AIProvider;
  latencyMs: number;
  data: any;
  error?: string;
  isOfflineFallback?: boolean;
}
```

- [ ] **Step 2: Write FBISE STEM Curriculum Dataset in `src/lib/fbise-curriculum.ts`**

Include rich, authentic curriculum modules for Physics (Thermodynamics, Carnot Cycle), Chemistry (Kinetics, Organic Reaction Mechanisms), Computer Science (Data Structures, Logic Gates), Biology (DNA Replication, Genetics), and Mathematics (Calculus, Vectors).

- [ ] **Step 3: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: PASS with 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/types/stem.ts src/lib/fbise-curriculum.ts; git commit -m "feat: add FBISE STEM types and curriculum knowledge base"
```

---

### Task 2: Install `@google/genai` & Implement Omni-Route AI Engine

**Files:**
- Modify: `package.json`
- Create: `src/lib/omni-router.ts`
- Create: `src/app/api/ai/omni-route/route.ts`

**Interfaces:**
- Consumes: `OmniRouteRequest`, `OmniRouteResponse`, `OmniRouteConfig` from `src/types/stem.ts`
- Produces: `/api/ai/omni-route` POST endpoint supporting all 7 actions with multi-provider dispatch and graceful offline fallbacks.

- [ ] **Step 1: Install `@google/genai` package**

Run: `npm install @google/genai`
Expected: Success, updated `package.json` & `package-lock.json`.

- [ ] **Step 2: Implement Omni-Router Engine in `src/lib/omni-router.ts`**

Write the engine that:
1. Detects preferred provider (Gemini -> Local Qwen Ollama -> Offline Fallback).
2. Connects to `@google/genai` using `GoogleGenAI` client when Gemini is active.
3. Connects to `http://localhost:11434/api/generate` via fetch when local Qwen is active.
4. Generates deterministic FBISE responses from `src/lib/fbise-curriculum.ts` when in fallback mode or when an error occurs.
5. Implements action handlers for `chat`, `synthesize`, `quiz`, `audio_script`, `mindmap`, `diagnose`, and `ping`.

- [ ] **Step 3: Create Next.js API Route in `src/app/api/ai/omni-route/route.ts`**

Export `POST` handler that receives `OmniRouteRequest` and returns `NextResponse.json<OmniRouteResponse>`.

- [ ] **Step 4: Verify API Route with a ping test**

Run: `npx tsc --noEmit`
Expected: PASS with 0 errors.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/lib/omni-router.ts src/app/api/ai/omni-route/route.ts; git commit -m "feat: implement Omni-Route AI engine with Gemini, Qwen and offline fallback"
```

---

### Task 3: Build Open-Notebook View (Research, RAG & Audio Podcast)

**Files:**
- Create: `src/components/OpenNotebookView.tsx`

**Interfaces:**
- Consumes: `NotebookDocument`, `StudySummary`, `AudioPodcastEpisode`, `/api/ai/omni-route`
- Produces: Interactive research hub with:
  1. Subject selector (Physics, Chemistry, Biology, CS, Math)
  2. Document library (pre-loaded FBISE textbook chapters + ability to add custom notes)
  3. Concept synthesizer (1-click Executive Summary, Key Formulas, Board Exam Pitfalls)
  4. Citation-backed RAG chat with exact document snippet highlights
  5. Built-in NotebookLM-style Two-Host Audio Podcast Player (Speech synthesis with animated sound waves & speaker dialogues)

- [ ] **Step 1: Implement `src/components/OpenNotebookView.tsx`**

Features:
- Clean 3-pane responsive layout:
  - Left: FBISE Subject & Document Navigator (with pre-loaded chapters + "Add Note/PDF" modal)
  - Center: Live Document Viewer / Synthesizer (Executive Summary, Formulas, Exam Pitfalls)
  - Right: Citation-backed Q&A and Audio Podcast Player with Web Speech synthesis
- Glassmorphic card styling matching the dark obsidian aesthetic.

- [ ] **Step 2: Verify component compiles cleanly**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/OpenNotebookView.tsx; git commit -m "feat: create Open-Notebook research and audio podcast view"
```

---

### Task 4: Build Edu-Agent View (Socratic STEM Tutor, Weak-Spot Diagnostic & Mind Maps)

**Files:**
- Create: `src/components/EduAgentView.tsx`

**Interfaces:**
- Consumes: `SocraticMessage`, `QuizQuestion`, `QuizResult`, `WeakSpotRecord`, `MindMapData`
- Produces: Complete educational tutoring suite:
  1. Socratic AI Chat with interactive question prompts and hints.
  2. Interactive SLO Quiz Engine with instant answer validation and explanations.
  3. Weak-Spot Diagnostic (<70% Mastery Rule) displaying critical topics and auto-generated study prescriptions.
  4. Interactive SVG Concept Mind Map displaying nodes, relations, and board exam focus areas.

- [ ] **Step 1: Implement `src/components/EduAgentView.tsx`**

Features:
- Sub-navigation tabs: `🤖 Socratic Tutor`, `📝 SLO Quiz Engine`, `⚠️ Weak-Spot Diagnostic (<70%)`, `🧠 Concept Mind Map`.
- Socratic Tutor: prompts user with questions rather than just handing answers.
- SLO Quiz: full 5-question interactive test with real-time scoring.
- Weak-Spot Diagnostic: highlights chapters with scores <70% with red badges and generates a 3-step remediation plan.
- Mind Map: dynamic visual node tree with clickable topic explanations.

- [ ] **Step 2: Verify component compiles cleanly**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/EduAgentView.tsx; git commit -m "feat: create Edu-Agent Socratic tutor, weak-spot diagnostic and mind map view"
```

---

### Task 5: App Integration & Omni-Route Settings Modal

**Files:**
- Modify: `src/components/Sidebar.tsx`
- Modify: `src/components/SettingsView.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/AppHeader.tsx` (if present)

**Interfaces:**
- Connects new views `notebook` and `tutor` to the sidebar navigation.
- Adds live AI model badge in top bar (e.g. `Gemini 2.5 Flash 🟢` or `Local Qwen 14B 🔵`).
- Adds Omni-Route settings inside `SettingsView` (API Key input, Provider toggle, Ollama URL, Live Ping Connection Test button).

- [ ] **Step 1: Update `src/components/Sidebar.tsx`**

Add nav items:
- `notebook` (Open Notebook, icon: `BookMarked`)
- `tutor` (Edu-Agent Tutor, icon: `Bot`)
Keep existing `dashboard`, `students`, `courses`, `settings`.

- [ ] **Step 2: Update `src/components/SettingsView.tsx`**

Add Omni-Route AI Model Configuration section:
- Active Provider Selector (Radio/Toggle: Google Gemini Cloud, Local Qwen 14B Ollama, Offline Exhibition Mode).
- Gemini API Key input field (masked with toggle to show).
- Local Ollama Base URL (`http://127.0.0.1:11434`) and model name input (`qwen2.5:14b`).
- "Test AI Connection" ping button with latency measurement in milliseconds.

- [ ] **Step 3: Update `src/app/page.tsx`**

Render `OpenNotebookView` when `currentView === 'notebook'`, `EduAgentView` when `currentView === 'tutor'`.
Expose global AI config state and toast notifications.

- [ ] **Step 4: Verify full application build**

Run: `npm run build`
Expected: Build succeeds with 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/Sidebar.tsx src/components/SettingsView.tsx src/app/page.tsx; git commit -m "feat: integrate Open-Notebook and Edu-Agent into main navigation and settings"
```

---

### Task 6: End-to-End Verification & Exhibition Demo Walkthrough

**Files:**
- Verify all routes and components.
- Create: `docs/EXHIBITION_GUIDE.md` (Step-by-step presentation script for the user to impress FDE judges in under 3 minutes).

- [ ] **Step 1: Run production build and lint checks**

Run: `npm run build`
Expected: Next.js production build succeeds, outputting static and dynamic routes.

- [ ] **Step 2: Verify API responsiveness across all providers**

Test `/api/ai/omni-route` with `ping` action in offline mode and mock Gemini mode.

- [ ] **Step 3: Create Exhibition Presentation Guide in `docs/EXHIBITION_GUIDE.md`**

Write a crisp, high-impact presentation guide matching the FDE judging rubric:
- 1. Subject Matter (20 Marks): How FBISE SLOs and STEM syllabi are integrated.
- 2. Presentation (10 Marks): Live 3-minute demo script (Carnot Cycle -> Socratic Tutor -> Weak Spot <70% -> Audio Podcast).
- 3. Impact on Audience (10 Marks): Solving real student problems (exam stress, active recall, personal tutoring).

- [ ] **Step 4: Commit**

```bash
git add docs/EXHIBITION_GUIDE.md; git commit -m "docs: add FDE STEM exhibition live presentation guide"
```
