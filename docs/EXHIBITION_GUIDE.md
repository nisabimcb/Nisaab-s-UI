# FBISE STEM Activities (Science Exhibition) — Live Presentation Guide

**Competition**: Federal Directorate of Education (FDE) / FBISE Intra-Board HSSC Science Exhibition  
**Session**: 2026-2027  
**Project**: **STEM Intellect** (Open-Notebook & Edu-Agent Student Workstation)  
**Evaluation Rubric**: 
- **Subject Matter (20 Marks)**
- **Presentation (10 Marks)**
- **Impact on Audience (10 Marks)**
- *Total: 40 Marks (Science Exhibition)*

---

## 🏆 The 3-Minute Live Judge Demonstration Script

### Phase 1: The Problem & Vision (45 Seconds)
*Aim: Capture Impact on Audience (10 Marks)*

> *"Respected Evaluators and Judges, every year thousands of FBISE HSSC students in Pre-Medical, Pre-Engineering, and ICS face a major roadblock: **passive memorization and generic AI tools that hallucinate**. Most study apps are cluttered with administrative overhead and static dummy data.
>
> Today, we present **STEM Intellect** — a student-centric personal AI workstation engineered with two breakthrough paradigms:
> 1. **Copilot Dual-Engine Architecture (OmniRoute + Gemini)**: When a student asks a query, Copilot checks the uploaded notebook contents. If notes exist, **OmniRoute** provides grounded conceptual derivations directly from student data. If content is not in notebooks, **Google Gemini** automatically activates with live Google Search Grounding to research the live web.
> 2. **Conversational Workspace Controller**: Copilot controls the entire app. When a student asks to generate a quiz or flashcards, Copilot intelligently prompts: *"How many questions?"* and *"Where should they come from?"* — allowing the student to select **Uploaded Content (OmniRoute)**, **Outside Web (Gemini)**, or a **Mixed 50/50 blend**! Interactive widgets render directly inside the chat bubble.

---

### Phase 2: Live Feature Walkthrough (90 Seconds)
*Aim: Capture Subject Matter & Technical Depth (20 Marks)*

#### 1. Copilot AI Partner & Workspace Controller
- Switch to **Copilot** from the Sidebar.
- **Demonstrate Notebook-Grounded vs. Live Web Routing**:
  - **Notebook Query**: Ask about content already in notebooks (e.g. *"Explain Carnot cycle derivation"*).
    - Notice badge: `⚡ OmniRoute Copilot (Answered from Uploaded Notebook Notes)`.
  - **Live Web Query**: Ask about an outside/recent topic (e.g. *"What are the latest breakthroughs in CRISPR gene editing?"*).
    - Notice badge: `🌐 Google Gemini 2.5 Flash (Live Web Search Grounding)` with clickable live web sources!
- **Demonstrate Conversational Quiz & Flashcard Generation**:
  - Type: *"Make a quiz on photosynthesis"*
  - Watch Copilot ask: *"How many questions? (3, 5, 10)"* and *"Source: Uploaded Notes (OmniRoute), Outside Web (Gemini), or Mixed Blend?"*
  - Click **"5 Questions • Mixed Blend"**:
    - OmniRoute crafts questions from student notes while Gemini pulls challenging external exam items in parallel!
    - The quiz renders directly in chat with interactive buttons, saves to the student's Practice Quiz tab, and tracks weak spots.
  - Type: *"Make 6 flashcards on organic chemistry from notes"*
  - Copilot parses count and source immediately, activates OmniRoute, and renders an interactive flip-card carousel inline.
- **Show Weak-Spot Diagnostics**:
  - Type: *"Check my weak spots"*
  - Copilot inspects `< 70%` diagnostic records and provides targeted remediation advice.

#### 2. Flashcards Studio (Active Recall & Spaced Repetition)
- Navigate to **Flashcards** from the Sidebar (or click "Open in Flashcards" from the chat).
- **Demonstrate Active Recall**:
  - Click on the flashcard to flip between Question and Answer.
  - Rate cards: **Needs Practice**, **Reviewing**, or **Mastered** to adjust spaced repetition mastery percentage.
- **Demonstrate On-Demand Generation**:
  - Use the AI Flashcard Generator bar to generate flashcards on any custom topic or past paper question.

#### 3. Open-Notebook Studio (Student-Driven Knowledge Base)
- Open the **My Notebooks** tab.
- **Show Note Grounding & 1-Click Synthesis**:
  - Click **"Synthesize Study Guide"** to extract executive summaries, formulas, and board exam traps.
- **Upload Textbook or Lecture PDFs**:
  - Click **"Upload PDF"** in the top action bar or drop zone inside the modal.
  - Upload textbook chapters, syllabus guides, or past paper PDFs (up to 20MB).
  - Uses Gemini 2.5 Flash's native PDF parser to extract chapters, formulas, and structured markdown notes directly into your notebook.
- **Demonstrate NotebookLM-style Audio Podcast**:
  - Click **"Audio Podcast"** and press **Play**. Listen to Dr. Sarah and Alex conversing about core principles with speech synchronization and speed controls.

#### 4. Computer Vision: Handwritten Math & Note Recognition
- Switch to **Vision Math & Notes** from the Sidebar (or via Academic Tools → Vision Solver).
- **Demonstrate Multimodal Handwriting Recognition**:
  - Select one of the 4 built-in handwritten presets (Calculus $\int x\sin(x)dx$, Carnot Efficiency $\eta = 1 - T_2/T_1$, Algebra $2x^2 + 5x - 3 = 0$, or Ampere's Law $\oint B \cdot dl = \mu_0 I_{enc}$).
  - Or click **Upload Photo** / **Live Camera** to snap a photo of a student's actual handwritten notebook page.
  - Click **"Analyze & Solve Blackboard Derivation"**.
- **Teacher-Grade Blackboard Derivation**:
  - **Verified LaTeX Rendering**: Clean mathematical typography with 1-click LaTeX clipboard copy.
  - **Student Calculation Mistake Detection**: Evaluates whether the student's handwritten steps have sign flips, algebra errors, or formula omissions.
  - **Step-by-Step Derivation**: Step numbers, derivation equations, and pedagogical explanations.
  - **Boxed Final Answer & Ask Copilot**: Seamlessly transition from the image solution into Copilot for conceptual follow-ups.

---

### Phase 3: OmniRoute Architecture & Minimal Aesthetic (45 Seconds)
*Aim: Capture Presentation & Novel Technical Ideas (10 Marks)*

- Click **Settings** (or the AI badge in the top bar).
- **Explain the Cooperative Multi-Engine Architecture**:
  - **Python Symbolic Math Backend (`python_backend/`)**: Runs locally on `http://127.0.0.1:8000` powered by **SymPy 1.14**, FastAPI, and NumPy for exact computer algebra, calculus limits/integrals/derivatives, and verified blackboard derivations with zero hallucinations.
  - **Google Gemini 2.5 Flash**: Invoked for multimodal handwritten equation vision, PDF ingestion, and live Google web search grounding.
  - **OmniRoute AI Gateway (`diegosouzapw/OmniRoute`)**: Runs on `http://localhost:20128/v1` for structured quiz synthesis and knowledge graph routing.
  - **Zero-Crash Local Engine**: Dynamic fallback that guarantees high-speed responses under 10ms even if venue Wi-Fi drops.
- **Minimal, Distraction-Free Design**:
  - Highlight the clean, neutral dark interface inspired by Linear and Notion—completely free of distracting neon glows or futuristic clutter.

---

## 💡 Quick Tips for the Exhibition Table

1. **One-Command Environment Setup (setup.py)**:
   For judges or users running the project for the first time:
   ```bash
   python setup.py
   ```
   Installs `sympy`, `fastapi`, `uvicorn`, `google-genai`, `pillow`, `pdfplumber`, etc.

2. **1-Click Launcher (Windows)**:
   - Double-click **`start_all.bat`** to start both the Python Math Backend (Port 8000) and Next.js Web App (Port 3000) automatically!
   - Or start manually:
     ```bash
     python run_python_backend.py
     npm run dev
     ```
   Open your browser to: **`http://localhost:3000`**

---

## 5. Cooperative Dual-Model Engine (OmniRoute + Gemini Working Together)

The platform implements an advanced **Dual-Engine Decision Pipeline**:

| Scenario | Primary Model | Decision Logic | Output / Experience |
| :--- | :--- | :--- | :--- |
| **Student Query (Notes Exist)** | **OmniRoute** | Matches keywords in student's uploaded notebook documents. | Answers strictly from student notes with citation badge: `⚡ OmniRoute Copilot (Answered from Uploaded Notebook Notes)`. |
| **Student Query (Notes Not Found)** | **Google Gemini 2.5 Flash** | No matching notebook text detected. | Activates live Google Search Grounding to research the web and return fresh sources. |
| **Quiz / Flashcard (Uploaded Notes)** | **OmniRoute** | User selects "Uploaded Notes". | Generates items strictly anchored to the student's notebook notes. |
| **Quiz / Flashcard (Outside Web)** | **Google Gemini 2.5 Flash** | User selects "Outside / Web". | Synthesizes challenging board exam questions from external curricula with live search. |
| **Quiz / Flashcard (Mixed Blend)** | **Both Models (50/50)** | User selects "Mixed Blend". | Runs parallel synthesis: OmniRoute generates from notes + Gemini generates from web, merged into one cohesive deck! |
| **Handwritten Notes & Vision** | **Google Gemini 2.5 Flash** (Multimodal Vision) | User uploads notebook photo or captures snapshot. | Deciphers handwriting, transcribes to LaTeX, identifies student calculation mistakes, and solves step-by-step blackboard derivation. |
| **PDF Textbook & Past Paper Upload** | **Google Gemini 2.5 Flash** (Document Multimodal) | User uploads `.pdf` textbook chapter or notes. | Ingests binary PDF bytes, extracts chapter outline, core theorems, and populates the Open Notebook knowledge base. |

### Dynamic Multi-Subject Intelligence:
- **Zero Hardcoding**: Queries are automatically classified across **Biology**, **Chemistry**, **Computer Science**, **Mathematics**, **Physics**, and **General STEM**.
- **Context-Aware Note Retrieval**: Uploaded notebook context is only injected when the student's query genuinely matches keywords from the note, eliminating unintended cross-subject pollution.
- **Two-Stage Conversational Controls**: When a student asks to make a quiz or flashcards without specifying parameters, Copilot interactively asks: *"How many questions/cards?"* and *"Where should they come from?"* with 1-click selectable chips.

