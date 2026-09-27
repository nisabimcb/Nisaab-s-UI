# Student Manager — Modern Academic UI Portal

A state-of-the-art, minimal, and responsive Student Management web application built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS v4**, featuring an aesthetic deep midnight-blue glassmorphism theme.

---

## 🚀 Quick Start & How to Access

### 1. Python Math Engine Setup (1-Click Installer)
When sharing this project with a new user or evaluator, they can install all necessary libraries with a single command:
```bash
python setup.py
```
This automatically verifies Python 3.9+, installs `sympy`, `fastapi`, `uvicorn`, `google-genai`, `pillow`, `pdfplumber`, etc., and verifies the SymPy Computer Algebra System.

To launch both the Python backend and web app together:
- On Windows: double-click `start_all.bat`
- Or manually:
  ```bash
  # Terminal 1: Python Math & Vision Backend (Port 8000)
  python run_python_backend.py

  # Terminal 2: Web App Interface (Port 3000)
  npm run dev
  ```

### 2. Standalone Python Math CLI
You can test symbolic solving and derivations directly from the command line:
```bash
python -m python_backend.cli solve "2x^2 + 5x - 3 = 0"
python -m python_backend.cli solve "integrate x*sin(x) dx"
```

---

## 🎓 Student Section Highlights

The Student Section contains two integrated views:

### 1. Student Directory & Roster
- **Live Search**: Instant search by Student Name, Roll ID (`STU-2026-xxx`), or Academic Email (with keyboard hotkey `/`).
- **Filters**: Filter by Grade (Grade 10, Grade 11, Grade 12, Undergraduate, Graduate) and Status (Active, Pending, Inactive).
- **CRUD Operations**:
  - **Add Student**: Register new students with automatic ID assignment, grade, GPA, and major.
  - **Edit Student**: Modify student details with instant state persistence.
  - **Delete Student**: Confirmation modal with safe removal.
- **Detailed Profile Drawer**: Inspect GPA, major, attendance percentage, emergency contact, advisor, and active course load.
- **CSV Data Export**: One-click download of the complete filtered roster as `.csv`.

### 2. Interactive Student Portal View
- **Academic KPI Meters**: Cumulative GPA (e.g. `3.92 / 4.00`), Attendance Rate (`97%`), and Degree Credits (`45 / 120`).
- **Weekly Schedule**: Visual breakdown of scheduled classes with times, room locations, and instructors.
- **Registered Courses**: Real-time list of enrolled courses, instructors, and credit units.
- **Deadlines & Exams**: Countdown timers for upcoming assignment submissions and midterm exams.

---

## 🎨 Aesthetic & Design System

- **Color Palette**: Midnight obsidian navy (`#060b14`), Deep Slate Blue (`#091122`), Royal/Electric Blue (`#2563eb`, `#3b82f6`), Cyan highlights (`#06b6d4`).
- **Glassmorphism**: Backdrop blur cards with subtle translucent borders (`border-blue-500/20`).
- **Typography**: Outfit for headings, Inter for clean numerical and tabular data.
- **Zero Voice Assistant Bloat**: All legacy audio/voice widgets, mic inputs, and background scripts have been completely eliminated.

---

## 📦 GitHub Repository

- **Repository**: `https://github.com/nisabimcb/Nisaab-s-UI`
- **Clone via HTTPS**: `https://github.com/nisabimcb/Nisaab-s-UI.git`
- **Clone via SSH**: `git@github.com:nisabimcb/Nisaab-s-UI.git`

To push changes to GitHub:
```bash
git push -u origin main
```
