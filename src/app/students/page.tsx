"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { GraduationCap, ArrowLeft, UserPlus, Sparkles } from "lucide-react";
import StudentsView from "@/components/StudentsView";
import ToastContainer from "@/components/ToastContainer";
import { Student, ToastMessage } from "@/types/student";

const DEFAULT_STUDENTS: Student[] = [
  {
    id: "STU-2026-001",
    name: "Hashir Naveed",
    email: "hashir.naveed@academy.edu",
    grade: "Undergraduate",
    status: "Active",
    enrolledDate: "2026-01-15",
    gpa: 3.92,
    attendanceRate: 97,
    major: "Computer Science",
    phone: "+1 (555) 019-2834",
    advisor: "Dr. Alan Turing",
  },
  {
    id: "STU-2026-002",
    name: "Sophia Chen",
    email: "sophia.chen@academy.edu",
    grade: "Grade 12",
    status: "Active",
    enrolledDate: "2026-01-18",
    gpa: 3.88,
    attendanceRate: 95,
    major: "Data Science",
    phone: "+1 (555) 019-4829",
    advisor: "Prof. Katherine Johnson",
  },
  {
    id: "STU-2026-003",
    name: "Marcus Vance",
    email: "m.vance@academy.edu",
    grade: "Grade 11",
    status: "Pending",
    enrolledDate: "2026-02-01",
    gpa: 3.45,
    attendanceRate: 88,
    major: "Mechanical Engineering",
    phone: "+1 (555) 019-5821",
    advisor: "Dr. Richard Feynman",
  },
  {
    id: "STU-2026-004",
    name: "Elena Rostova",
    email: "elena.r@academy.edu",
    grade: "Undergraduate",
    status: "Active",
    enrolledDate: "2026-02-10",
    gpa: 3.79,
    attendanceRate: 94,
    major: "Literature & Arts",
    phone: "+1 (555) 019-7412",
    advisor: "Prof. Maya Angelou",
  },
  {
    id: "STU-2026-005",
    name: "Tariq Al-Mansoor",
    email: "tariq.m@academy.edu",
    grade: "Grade 10",
    status: "Inactive",
    enrolledDate: "2026-02-14",
    gpa: 3.2,
    attendanceRate: 81,
    major: "Bio-Informatics",
    phone: "+1 (555) 019-9032",
    advisor: "Dr. Rosalind Franklin",
  },
];

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>(DEFAULT_STUDENTS);
  const [globalSearch, setGlobalSearch] = useState<string>("");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (message: string, type: "success" | "danger" | "info" = "success") => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    try {
      const savedStudents = localStorage.getItem("sm_students_list");
      if (savedStudents) {
        setStudents(JSON.parse(savedStudents));
      }
    } catch {
      // fallback
    }
  }, []);

  const saveStudents = (newStudents: Student[]) => {
    setStudents(newStudents);
    try {
      localStorage.setItem("sm_students_list", JSON.stringify(newStudents));
    } catch {
      // ignore
    }
  };

  const handleAddStudent = (studentData: Omit<Student, "enrolledDate">) => {
    const newStudent: Student = {
      ...studentData,
      enrolledDate: new Date().toISOString().split("T")[0],
    };
    const updated = [newStudent, ...students];
    saveStudents(updated);
    showToast(`Student ${newStudent.name} registered successfully!`, "success");
  };

  const handleEditStudent = (updatedStudent: Student) => {
    const updated = students.map((s) =>
      s.id === updatedStudent.id ? updatedStudent : s
    );
    saveStudents(updated);
    showToast(`Student ${updatedStudent.name} updated!`, "success");
  };

  const handleDeleteStudent = (id: string) => {
    const updated = students.filter((s) => s.id !== id);
    saveStudents(updated);
    showToast("Student record removed.", "info");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#060b14] text-slate-100">
      {/* Top Banner & Navigation Header */}
      <header className="h-16 px-6 flex items-center justify-between border-b border-blue-500/20 bg-[#091122]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900/60 border border-blue-500/25 text-blue-300 text-xs font-semibold transition-all"
            title="Return to Main Dashboard / Login"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Main Portal</span>
          </Link>

          <div className="h-4 w-px bg-blue-500/20" />

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-800 border border-blue-400/30 flex items-center justify-center text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white font-[family-name:var(--font-heading)]">
                  Student Area &bull; Dedicated Section
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Route: /students
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                Directory &bull; Academic Records &bull; Student Portal &bull; Roster Management
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-blue-300/80 bg-blue-950/40 px-3 py-1.5 rounded-lg border border-blue-500/20">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>{students.length} Total Enrolled Students</span>
          </div>
        </div>
      </header>

      {/* Main Student Section Container */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
        <StudentsView
          students={students}
          onAddStudent={handleAddStudent}
          onEditStudent={handleEditStudent}
          onDeleteStudent={handleDeleteStudent}
          globalSearch={globalSearch}
        />
      </main>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
