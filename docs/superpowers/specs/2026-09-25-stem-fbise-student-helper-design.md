# Design Specification: FBISE STEM Intellect (Open-Notebook & Edu-Agent Integration)

- **Date**: 2026-09-25
- **Competition**: Federal Directorate of Education (FDE) / FBISE Intra-Board STEM & Co-Curricular Activities (HSSC Level Science Exhibition)
- **Status**: Approved for Planning
- **Project Base**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 ([`Student Manager`](file:///e:/MY%20PROJECTS/Student%20Manager))

---

## 1. Executive Summary & Competition Alignment

The Federal Directorate of Education (FDE) and Federal Board of Intermediate and Secondary Education (FBISE) have scheduled the **Intra-Board STEM Activities (Science Exhibition)** for HSSC classes. Page 2 of the official directive mandates:
> *"Preference will be given to scientific models which are related to the respective syllabi and containing novel/new scientific ideas."*  
> **Judgment Parameters**: Subject Matter (20 Marks), Presentation (10 Marks), Impact on Audience (10 Marks) — Total 40 Marks for Science Exhibition.

**FBISE STEM Intellect** solves the critical problem faced by HSSC students (FSc Pre-Medical, Pre-Engineering, ICS Computer Science, and General Science): fragmented textbooks, passive memorization without deep conceptual mastery, lack of citation-grounded study synthesizers, and absent Socratic guidance.

By fusing the strengths of **Open-Notebook** (NotebookLM-style grounded multi-source RAG, study notes, audio podcast overviews) and **Edu-Agent** (Socratic agent tutor, <70% mastery weak-spot diagnostics, interactive SLO quizzes, and concept mind maps) with an **Omni-Route** engine supporting **Google Gemini 2.5 Flash** and **Local Qwen 14B (Ollama)**, this product delivers an unshakeable, competition-grade platform.

---

## 2. System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Next.js 16 (App Router) / React 19                   │
│          Midnight-Blue Glassmorphism UI (Tailwind CSS v4)              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┴───────────────────────────────┐
    ▼                                                               ▼
┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│ Module A: Open-Notebook Hub     │   │ Module B: Edu-Agent STEM Tutor  │
│ • FBISE Multi-Subject Notebooks │   │ • Socratic AI Learning Agent    │
│ • Multi-Source RAG & Citations  │   │ • Weak-Spot (<70%) Diagnostics  │
│ • Concept & Study Summaries     │   │ • Interactive SLO Quiz Engine   │
│ • Audio Podcast Study Overview  │   │ • Interactive Concept Mind Map  │
└────────────────┬────────────────┘   └────────────────┬────────────────┘
                 │                                     │
                 └──────────────────┬──────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                Unified Omni-Route Engine (`/api/ai/omni-route`)         │
│  - Parses multimodal text, syllabus docs, past papers, quiz requests   │
│  - Selects and executes provider based on user settings                │
└───────┬───────────────────────────┬───────────────────────────┬────────┘
        ▼                           ▼                           ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│ Google Gemini │           │ Local Qwen    │           │ Offline STEM  │
│ 2.5 Flash     │           │ 14B (Ollama)  │           │ Fallback      │
│ (Cloud, High  │           │ (Air-Gapped,  │           │ (Zero Wi-Fi,  │
│ Speed, RAG)   │           │ 100% Private) │           │ Zero Failure) │
└───────────────┘           └───────────────┘           └───────────────┘
```

---

## 3. Core Modules & Feature Specifications

### 3.1 Module A: Open-Notebook (Research & Synthesis Hub)
*Inspired by `lfnovo/open-notebook`*
1. **Curriculum-Segmented Notebooks**:
   - Pre-configured notebooks for FBISE HSSC Subjects: **Physics**, **Chemistry**, **Biology**, **Computer Science**, and **Mathematics**.
   - Students can upload custom notes, paste textbook chapters, or import FBISE past exam papers.
2. **Citation-Backed Contextual Q&A (RAG)**:
   - Queries are answered with explicit, highlighted inline citations linking directly back to the source text paragraphs.
3. **Automated Study Guide & Key Insights**:
   - One-click generation of:
     - Executive Concept Summary
     - Key Equations & Definitions
     - Common Board Exam Pitfalls / Common Misconceptions
4. **NotebookLM-Style Audio Podcast Overview**:
   - Synthesizes an interactive two-speaker educational dialogue ("Dr. Sarah & Alex") breaking down complex STEM concepts in an engaging, conversational manner.
   - Built-in visual audio player with play/pause, time scrubber, speaker avatar animation, and adjustable playback speeds (1x, 1.25x, 1.5x).

### 3.2 Module B: Edu-Agent (Adaptive Socratic STEM Tutor)
*Inspired by `StudentTraineeCenter/edu-agent`*
1. **Socratic AI Tutor**:
   - Specializes in FBISE HSSC SLO-based curriculum.
   - Guides students through multi-turn questions rather than simply handing over final answers, prompting active recall and critical thinking.
2. **Weak-Spot Diagnostic Engine (<70% Rule)**:
   - Records student quiz results across specific topics and chapters.
   - Any topic scoring below 70% is automatically classified as a **High-Priority Weak Spot**.
   - Generates an immediate remedial study prescription (key concepts to review + 3 targeted practice questions).
3. **SLO-Based Interactive Quiz Engine**:
   - Generates 5–10 question assessments tailored to the selected FBISE STEM chapter.
   - Immediate answer evaluation with comprehensive step-by-step solutions and rationale.
4. **Visual Concept Mind Maps**:
   - Renders interactive node-and-edge graphs depicting prerequisite knowledge trees (e.g. *Organic Chemistry → Hybridization → Reaction Mechanisms → Electrophilic Addition*).

---

## 4. Omni-Route AI Engine Architecture

### 4.1 Dispatcher Endpoints
- **Primary Endpoint**: `/api/ai/omni-route`
- **Supported Actions**:
  - `action: "chat"`: Conversational Socratic tutoring with chat history.
  - `action: "synthesize"`: Document analysis, summary extraction, and citation mapping.
  - `action: "quiz"`: Strict JSON structured generation of SLO quizzes.
  - `action: "audio_script"`: Script generation for two-host podcast overviews.
  - `action: "mindmap"`: Node & link JSON generation for concept maps.
  - `action: "diagnose"`: Evaluates quiz history and produces weak-spot remedies.

### 4.2 Model Providers
1. **Google Gemini (Default Cloud)**:
   - Uses `@google/genai` with `gemini-2.5-flash` (or `gemini-1.5-flash`).
   - Env variable: `GEMINI_API_KEY` (configured in `.env.local` or via UI Settings modal).
2. **Local Qwen 14B (Localhost / Ollama)**:
   - Connects to `http://localhost:11434/api/generate` with model `qwen2.5:14b` (or `qwen2.5-coder:14b`).
   - Perfect for 100% offline, air-gapped science exhibition demonstrations.
3. **Exhibition Offline Fallback**:
   - If neither cloud API nor local Ollama is active, the route detects the missing backend and seamlessly returns high-fidelity pre-indexed FBISE STEM knowledge responses with an informative indicator banner, guaranteeing zero 500 crashes in front of judges.

---

## 5. UI/UX Design System & Navigation

- **Design Aesthetic**: Midnight obsidian navy (`#060b14`), deep slate blue cards (`#091122`), electric/royal blue highlights (`#2563eb`), cyan accents (`#06b6d4`), translucent borders (`border-blue-500/20`), and backdrop glassmorphism.
- **Navigation Integration**:
  - Update [`src/components/Sidebar.tsx`](file:///e:/MY%20PROJECTS/Student%20Manager/src/components/Sidebar.tsx) to feature:
    - 📊 **Dashboard** (Academic stats + Weak-spot indicators)
    - 👥 **Students** (Existing directory & roster)
    - 📓 **Open Notebook** (Research, notes, RAG, audio overviews)
    - 🤖 **Edu-Agent Tutor** (Socratic chat, quiz engine, mind maps)
    - 📚 **FBISE Syllabus** (Subject chapters, SLOs, past papers)
    - ⚙️ **Settings** (Omni-Route selector, API Key config, Ollama URL, test ping)
- **Top Header Integration**:
  - Displays current active model badge (e.g. `Gemini 2.5 Flash 🟢` or `Local Qwen 14B 🔵`) and quick-switch modal trigger.

---

## 6. Error Handling & Reliability Guarantees

1. **Structured Outputs with Strict Fallbacks**: All JSON-dependent features (Quizzes, Mind Maps) validate schemas and fallback to resilient internal mock generators if an LLM returns unexpected markdown or malformed tokens.
2. **Connection Diagnostic Panel**: Inside Settings, a one-click "Test Connection" button tests both Google Gemini API and Local Ollama, giving clear status feedback.
3. **Graceful UI Toasts**: All network or configuration errors display helpful floating toast alerts with remediation steps instead of freezing the user interface.

---

## 7. Verification & Live Exhibition Demonstration Plan

1. **Build Validation**:
   - `npm run build` must succeed with zero TypeScript or ESLint errors.
2. **API Verification**:
   - Validate `/api/ai/omni-route` with Gemini API, local Ollama mock, and offline fallback.
3. **Live Demonstration Walkthrough for FDE Judges**:
   - **Step 1**: Open **Open Notebook**, select *Physics (Thermodynamics / Carnot Cycle)*, view synthesized notes and trigger the **Audio Podcast Overview**.
   - **Step 2**: Open **Edu-Agent**, engage the Socratic AI Tutor on *Carnot Engine Efficiency*, request a hint, and see source citations.
   - **Step 3**: Launch an **SLO Interactive Quiz**, intentionally answer a question incorrectly, demonstrate the **<70% Weak-Spot Diagnostic**, and view the automatically generated remedial study plan.
   - **Step 4**: Explore the **Concept Mind Map** showing prerequisite links across FBISE topics.
   - **Step 5**: Show the **Omni-Route Settings** demonstrating seamless switching between Gemini and local Qwen 14B.
