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
> 1. **OmniRoute Gateway & Zero-Setting Auto-Routing**: Integration with the open-source AI gateway (`diegosouzapw/OmniRoute`). The system automatically routes structured generation (quizzes, flashcards, mind maps) to OmniRoute models, while **Google Gemini** answers out-of-the-box questions with live Google Search Grounding—without changing any settings!
> 2. **Agentic Socratic Tutor (Full App Controller)**: The tutor chat acts as a full workspace controller—students can type natural language commands (*"Make 5 flashcards on Carnot cycle"*, *"Generate a quiz on thermodynamics"*, *"Save note: ..."*) and the chat generates the items, persists them to the student's deck, and renders interactive widgets right inside the chat bubble!"*

---

### Phase 2: Live Feature Walkthrough (90 Seconds)
*Aim: Capture Subject Matter & Technical Depth (20 Marks)*

#### 1. Agentic Socratic Tutor & Workspace Controller
- Switch to **Socratic Tutor** from the Sidebar.
- **Show App Control via Chat**:
  - Type: *"Make 5 flashcards on Carnot cycle"*
  - Show how the AI generates flashcards, saves them to the student's deck, and renders an **interactive flip-card carousel inline** with a direct button to "Open in Flashcards Studio".
  - Type: *"Generate a quiz on thermodynamics"*
  - Show how the AI generates a practice quiz, renders a sample question with instant feedback inline, and updates the Practice Quiz tab.
  - Type: *"Check my weak spots"*
  - Show how the tutor inspects the student's `< 70%` diagnostic records and provides targeted remediation advice.
- **Show Out-of-the-Box Gemini Web Grounding**:
  - Ask an out-of-the-box question (e.g. *"What is the latest 2026 discovery from the James Webb Space Telescope?"*).
  - Highlight how the system automatically delegates the query to **Google Gemini** with live Google Search Grounding and clickable citations without any manual settings toggling!

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
- **Demonstrate NotebookLM-style Audio Podcast**:
  - Click **"Audio Podcast"** and press **Play**. Listen to Dr. Sarah and Alex conversing about core principles with speech synchronization and speed controls.

---

### Phase 3: OmniRoute Architecture & Minimal Aesthetic (45 Seconds)
*Aim: Capture Presentation & Novel Technical Ideas (10 Marks)*

- Click **Settings** (or the AI badge in the top bar).
- **Explain the Dual-Engine Architecture**:
  - **OmniRoute AI Gateway (`diegosouzapw/OmniRoute`)**: Runs locally on `http://localhost:20128/v1` (or hosted endpoint) to power structured quizzes, flashcards, and knowledge graphs.
  - **Google Gemini 2.5 Flash**: Seamlessly invoked for out-of-context inquiries, web research, and live search grounding.
  - **Zero-Crash Local Engine**: Dynamic fallback that guarantees high-speed responses under 10ms even if venue Wi-Fi drops.
- **Minimal, Distraction-Free Design**:
  - Highlight the clean, neutral dark interface inspired by Linear and Notion—completely free of distracting neon glows or futuristic clutter.

---

## 💡 Quick Tips for the Exhibition Table

1. **Localhost Command**:
   To start the app on your presentation laptop:
   ```bash
   npm run dev
   ```
   Open your browser to: **`http://localhost:3000`**
2. **OmniRoute Gateway Setup (Optional)**:
   - Run the OmniRoute gateway repository: `https://github.com/diegosouzapw/OmniRoute`
   - By default, it runs on `http://localhost:20128/v1`.
3. **If Venue Wi-Fi Drops**:
   - The app's built-in **Local Engine** operates automatically if external network calls fail, ensuring **zero crashes or frozen screens** in front of judges!
