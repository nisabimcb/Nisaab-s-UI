# Full-Stack AI Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the student platform's AI into an elite, multi-turn cognitive assistant with expanded Python symbolic mathematics/physics solving, multi-document semantic RAG retrieval, and adaptive diagnostic learning loops.

**Architecture:** 
1. Client components (`EduAgentView`, `OpenNotebookView`) maintain conversational history and multi-document context buffers.
2. The Next.js API Gateway (`omni-router.ts`) orchestrates requests between Gemini 2.5 Flash, DeepSeek API, and Python SymPy 1.14.
3. The Python CAS engine (`math_solver.py`) resolves systems of equations, calculus derivatives/limits, and physics theorems with algorithmic error detection.
4. Quizzes adaptively classify Bloom's taxonomy tiers and automatically ingest deficiencies into Weak Spots for 1-click remediation drills.

**Tech Stack:** Next.js 15, TypeScript, Python 3.14, SymPy 1.14, FastAPI, Google GenAI SDK (`@google/genai`), KaTeX.

---

## Tasks

### Task 1: Multi-Turn Conversation Memory in Types & OmniRouter
- [ ] Add `conversationHistory?: { role: 'user' | 'assistant'; content: string }[]` to `OmniRouteRequest` in `src/types/stem.ts`.
- [ ] Update `executeWithGemini` and `executeWithDeepSeek` in `src/lib/omni-router.ts` to include multi-turn message history in model prompts.
- [ ] Update `EduAgentView.tsx` to send recent messages (last 6-8 turns) when calling `/api/ai/omni-route`.
- [ ] Verify multi-turn conversational recall (e.g. follow-up question references previous answers).

### Task 2: Expanded Python Symbolic Mathematics & Physics Engine
- [ ] In `python_backend/math_solver.py`, implement `solve_equation_system` for linear/nonlinear systems (e.g. `2x + y = 5, x - y = 1`).
- [ ] Implement `solve_derivative_calculus` for symbolic differentiation ($\frac{d}{dx} f(x)$), product/quotient rules, tangent slopes, and critical points.
- [ ] Implement `solve_limit_calculus` for symbolic limit evaluation ($\lim_{x \to a} f(x)$) with L'Hôpital's rule steps.
- [ ] Add physics laws: Projectile motion trajectory ($y(x)$), Work-Energy theorem ($W = \Delta K$), and Kirchhoff's loop laws.
- [ ] Expand student mistake detection rules (missing $+C$, sign errors, Celsius vs Kelvin).
- [ ] Test Python solver directly via `python -m python_backend.math_solver`.

### Task 3: Multi-Document Semantic RAG Across Notebooks & Uploaded PDFs
- [ ] In `src/lib/omni-router.ts`, build `rankAndExtractMultiDocExcerpts(query, docs)` that segments all notes/PDFs and ranks by TF-IDF term density.
- [ ] In `EduAgentView.tsx`, update `getNotebookNotesData` to scan across **all** uploaded documents in `student_notebook_docs` rather than only the first note.
- [ ] Pass the aggregated multi-document context into Gemini for chat, quizzes, and flashcards with explicit document citation tags.

### Task 4: Adaptive Quiz Engine & Automated Weak-Spot Remediation
- [ ] In `src/lib/omni-router.ts`, upgrade quiz prompt to generate 3-tiered questions (Conceptual, Application, Analytical) with explicit SLO tags.
- [ ] In `EduAgentView.tsx`, when an inline or full quiz question is answered incorrectly, automatically record or update a `WeakSpotRecord` in `localStorage.student_weak_spots`.
- [ ] In the Weak Spots tab, add a "Remediate This Weak Spot" action that prompts Copilot to launch an adaptive practice drill.

### Task 5: End-to-End System Verification
- [ ] Run `npx tsc --noEmit` to ensure 0 TypeScript compilation errors.
- [ ] Verify Python backend `/api/math/solve` handles systems of equations and derivatives.
- [ ] Verify multi-turn memory and multi-document RAG in Next.js web application.
