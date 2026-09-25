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
> 1. **Open-Notebook Studio**: Student-owned knowledge base with citation-grounded RAG, automatic study synthesis, and 2-host audio podcasts.
> 2. **Edu-Agent Socratic Mentor**: Live web search grounding via **Google Gemini**, deep step-by-step reasoning via **DeepSeek Omni-Route (V3 & R1)**, on-demand custom quizzes, and automatic <70% weak-spot diagnostics."*

---

### Phase 2: Live Feature Walkthrough (90 Seconds)
*Aim: Capture Subject Matter & Technical Depth (20 Marks)*

#### 1. Open-Notebook Studio (Student-Driven Knowledge)
- Open the **Open Notebook** tab.
- **Show Note Management**:
  - Point out that all notes are student-uploaded (custom notes, past paper excerpts, textbook summaries) with persistent local storage.
  - Click **"+ Add Study Note"** to show how easy it is to add any chapter or custom topic.
- **Demonstrate 1-Click Synthesis**:
  - Click **"Synthesize Brief"**: Highlight the executive summary, key formulas, and FBISE exam traps extracted directly from the notes.
- **Demonstrate Audio Podcast (NotebookLM style)**:
  - Click the **"Audio Podcast"** tab and press **Play Dialogue**.
  - Let judges hear Dr. Sarah and Alex conversing about the thermodynamics derivation with real-time speech synchronization and speed controls!
- **Demonstrate Citation-Grounded Q&A**:
  - Ask a question in the notebook assistant. Show how answers link directly back to notes and web sources.

#### 2. Edu-Agent: Socratic Tutor & <70% Diagnostic Engine
- Switch to **Edu-Agent** from the Sidebar.
- **Show Live Google Search Grounding**:
  - Point out the **"Web Search: ON"** badge powered by Google Gemini Search Grounding.
  - Ask: *"What are the most recent applications of the Carnot cycle in cryogenic engineering?"*
  - Show the live clickable web sources returned directly beneath the explanation.
- **Show DeepSeek Omni-Route Reasoning**:
  - If DeepSeek is active, highlight the **DeepSeek Chain-of-Thought (R1 Reasoner)** box showing step-by-step mathematical deductions.
- **Generate an On-Demand Quiz for ANY Topic**:
  - Switch to the **Practice Quiz** tab.
  - Type any topic (e.g., *"Photoelectric Effect and Work Function"*) and click **"Generate 5 MCQs"**.
  - Show how the AI generates questions tailored to that specific concept on-the-fly!
- **Demonstrate the <70% Weak-Spot Diagnostic Engine**:
  - Answer the quiz. If the score is `< 70%`, show how the system automatically registers the topic into the **Weak Spots** tab with a tailored 3-step recovery prescription.
- **Interactive Concept Knowledge Graph**:
  - Switch to the **Mind Map** tab. Generate a concept map for any topic to visualize prerequisite relationships.

---

### Phase 3: Omni-Route Architecture & Reliability (45 Seconds)
*Aim: Capture Presentation & Novel Technical Ideas (10 Marks)*

- Click **Settings** (or the AI badge in the top bar).
- Show the **Omni-Route Model Architecture**:
  - **Google Gemini 2.5 Flash**: Cloud speed, 1M+ token window, and live Google Search Grounding.
  - **DeepSeek AI (Omni-Route)**: DeepSeek-V3 for lightning-fast tutor interaction and DeepSeek-R1 for chain-of-thought mathematical derivations.
  - **Exhibition Engine (Fallback)**: 100% resilient dynamic engine guaranteeing 10ms responses if venue Wi-Fi drops.
- Click **"Test Connection Latency"** to demonstrate live ping diagnostics in front of the evaluators.

---

## 💡 Quick Tips for the Exhibition Table

1. **Localhost Command**:
   To start the app on your presentation laptop:
   ```bash
   npm run dev
   ```
   Open your browser to: **`http://localhost:3000`**
2. **If Venue Wi-Fi is Slow or Unreliable**:
   - The app's **Exhibition Engine** operates automatically if external network calls fail, ensuring **zero crashes or frozen screens** in front of judges!
3. **To Use Your Own API Keys**:
   - Navigate to **Settings** and paste your `GEMINI_API_KEY` or `DEEPSEEK_API_KEY`.
   - Toggle DeepSeek between `deepseek-chat` and `deepseek-reasoner` depending on whether you want high-speed Q&A or deep mathematical proofs.
