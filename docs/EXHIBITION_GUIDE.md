# FBISE STEM Activities (Science Exhibition) — Live Presentation Guide

**Competition**: Federal Directorate of Education (FDE) / FBISE Intra-Board HSSC Science Exhibition  
**Session**: 2026-2027  
**Project**: **STEM Intellect** (Open-Notebook & Edu-Agent Integration)  
**Evaluation Rubric**: 
- **Subject Matter (20 Marks)**
- **Presentation (10 Marks)**
- **Impact on Audience (10 Marks)**
- *Total: 40 Marks (Science Exhibition)*

---

## 🏆 The 3-Minute Live Judge Demonstration Script

### Phase 1: The Problem & Pitch (45 Seconds)
*Aim: Capture Impact on Audience (10 Marks)*

> *"Respected Evaluators and Judges, every year thousands of FBISE HSSC students in Pre-Medical, Pre-Engineering, and ICS face a universal challenge: **textbook fragmentation and passive memorization**. Students read hundreds of pages across Physics, Chemistry, Biology, Math, and CS, yet struggle with concept retention, board numericals, and identifying their real exam weak spots.*
>
> *Today, we present **STEM Intellect** — a state-of-the-art digital learning ecosystem that fuses the research grounding of **Open-Notebook** with the adaptive tutoring intelligence of **Edu-Agent**, powered by an **Omni-Route AI Engine** that works both in the cloud and **100% offline air-gapped** on our local machine."*

---

### Phase 2: Live Feature Walkthrough (90 Seconds)
*Aim: Capture Subject Matter & Technical Depth (20 Marks)*

#### 1. Open-Notebook Research Studio (Show Notebook Tab)
- Click **"Open Notebook"** from the Sidebar or Dashboard spotlight card.
- Select **Physics (HSSC)** -> **Chapter 11: Heat and Thermodynamics**.
- **Demonstrate Grounding**:
  - Show the **Executive Study Brief**: Highlight how the system automatically extracted key formulas (Carnot Efficiency $\eta = 1 - T_2/T_1$) and FBISE board exam pitfalls (e.g. Kelvin conversion traps).
  - Ask a question in the **Citation-Grounded Q&A**: Type *"Why can't efficiency reach 100%?"*.
  - Point to the **highlighted source citation** proving the answer is grounded in the National Book Foundation textbook without hallucination.
- **Demonstrate Audio Podcast (NotebookLM style)**:
  - Click the **"Audio Podcast"** tab and press **Play**.
  - Let the judges hear Dr. Sarah and Alex conversing about the Carnot cycle with synchronized dialogue highlighting!

#### 2. Edu-Agent: Socratic Tutor & <70% Mastery Diagnostic (Show Tutor Tab)
- Click **"Edu-Agent Tutor"** from the Sidebar.
- **Show Socratic Interaction**:
  - Show how the AI doesn't spoon-feed answers, but guides the student through Socratic inquiry.
- **Run the SLO Interactive Quiz**:
  - Go to the **SLO Quiz Engine** tab. Answer the questions on Carnot engine numericals.
  - Show the instant scoring and explain:
    > *"Whenever a student's chapter score drops below 70%, Edu-Agent automatically classifies the topic as an **Academic Weak Spot**."*
- **Inspect Weak-Spot Diagnostic**:
  - Switch to the **Weak-Spot Diagnostic (<70%)** tab.
  - Show the 3-step remedial action plan automatically prescribed for the student.
- **Show Concept Mind Map**:
  - Switch to the **Concept Mind Map** tab. Click on a node (e.g. *Carnot Efficiency*) to show prerequisite relations connecting First Law $\to$ Isothermal/Adiabatic Strokes $\to$ Second Law limits.

---

### Phase 3: Technical Resilience & Omni-Route (45 Seconds)
*Aim: Capture Presentation & Novel Scientific Ideas (10 Marks)*

- Click **Settings** (or the AI badge in the top bar).
- Show the **Omni-Route AI Model Selector**:
  - **Google Gemini 2.5 Flash**: For cloud research with 1M+ token context.
  - **Local Qwen 14B (Ollama)**: For private, air-gapped offline inference on the competition laptop without requiring venue Wi-Fi.
  - **Exhibition Engine**: For instant 12ms failover guaranteeing zero crashes.
- Click **"Test Connection Latency"** to show real-time live ping diagnostics.

---

## 💡 Quick Tips for the Exhibition Table

1. **Localhost Command**:
   To start the app on your presentation laptop:
   ```bash
   npm run dev
   ```
   Open your browser to: **`http://localhost:3000`**
2. **If Venue Wi-Fi is Slow or Unavailable**:
   - The app has the **Exhibition Engine** active by default. It responds in 12ms with authentic FBISE data for all 5 subjects, so your demo will **never fail or freeze** in front of judges!
   - If you have Ollama installed with `qwen2.5:14b`, switch to **Local Qwen 14B** in Settings to demonstrate on-device local AI.
3. **Keyboard Shortcut**:
   - Press `/` at any time to instantly focus the global search bar.
