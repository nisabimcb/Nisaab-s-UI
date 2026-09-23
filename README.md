# Student Manager — Modern Academic UI Portal

A state-of-the-art, minimal, and responsive Student Management web application built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS v4**, featuring an aesthetic deep midnight-blue glassmorphism theme.

---

## 🚀 Quick Start & How to Access

### 1. Running Locally
The development server runs on `localhost:3000`:
```bash
npm run dev
```

### 2. How to Access the Student Section
You can access the Student Section in **three simple ways**:

1. **Direct Standalone Route (No Login Required)**:
   Navigate directly in your browser to:
   👉 **[http://localhost:3000/students](http://localhost:3000/students)**
   This immediately loads the full Student Section with both the **Student Directory & Roster** and the **Interactive Student Portal**.

2. **From the Login Screen (1-Click Instant Demo)**:
   Navigate to **[http://localhost:3000](http://localhost:3000)** and click the glowing button:
   👉 **"Open Student Area"** (bypasses credential entry and logs in instantly).

3. **From the Top Navigation Header**:
   Click the **"Student Area"** button located in the top navigation bar from any screen.

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
