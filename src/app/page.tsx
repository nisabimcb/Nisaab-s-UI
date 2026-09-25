"use client";

import React, { useState, useEffect, useCallback } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import AuthPortal from "@/components/AuthPortal";
import AppHeader from "@/components/AppHeader";
import Sidebar from "@/components/Sidebar";
import DashboardView from "@/components/DashboardView";
import StudentsView from "@/components/StudentsView";
import CoursesView from "@/components/CoursesView";
import SettingsView from "@/components/SettingsView";
import OpenNotebookView from "@/components/OpenNotebookView";
import EduAgentView from "@/components/EduAgentView";
import ToastContainer from "@/components/ToastContainer";
import { Student, Course, UserProfile, ToastMessage } from "@/types/student";
import { OmniRouteConfig } from "@/types/stem";

const DEFAULT_STUDENTS: Student[] = [
  {
    id: "STU-2026-001",
    name: "Hashir Naveed",
    email: "hashir.naveed@academy.edu",
    grade: "Undergraduate",
    status: "Active",
    enrolledDate: "2026-01-15",
  },
  {
    id: "STU-2026-002",
    name: "Sophia Chen",
    email: "sophia.chen@academy.edu",
    grade: "Grade 12",
    status: "Active",
    enrolledDate: "2026-01-18",
  },
  {
    id: "STU-2026-003",
    name: "Marcus Vance",
    email: "m.vance@academy.edu",
    grade: "Grade 11",
    status: "Pending",
    enrolledDate: "2026-02-01",
  },
  {
    id: "STU-2026-004",
    name: "Elena Rostova",
    email: "elena.r@academy.edu",
    grade: "Undergraduate",
    status: "Active",
    enrolledDate: "2026-02-10",
  },
  {
    id: "STU-2026-005",
    name: "Tariq Al-Mansoor",
    email: "tariq.m@academy.edu",
    grade: "Grade 10",
    status: "Inactive",
    enrolledDate: "2026-02-14",
  },
];

const DEFAULT_COURSES: Course[] = [
  {
    code: "CS-101",
    title: "Introduction to Computer Science",
    instructor: "Dr. Alan Turing",
    department: "Computer Science",
    enrolled: 42,
    schedule: "Mon & Wed 09:00 - 10:30 AM",
  },
  {
    code: "MATH-202",
    title: "Linear Algebra & Calculus",
    instructor: "Prof. Katherine Johnson",
    department: "Mathematics",
    enrolled: 38,
    schedule: "Tue & Thu 11:00 - 12:30 PM",
  },
  {
    code: "PHYS-150",
    title: "Applied Physics & Mechanics",
    instructor: "Dr. Richard Feynman",
    department: "Natural Sciences",
    enrolled: 29,
    schedule: "Mon & Fri 01:00 - 02:30 PM",
  },
  {
    code: "ENG-104",
    title: "Advanced Academic Composition",
    instructor: "Prof. Maya Angelou",
    department: "Humanities",
    enrolled: 35,
    schedule: "Tue & Thu 02:00 - 03:30 PM",
  },
  {
    code: "DATA-301",
    title: "Data Structures & Algorithms",
    instructor: "Dr. Donald Knuth",
    department: "Computer Science",
    enrolled: 31,
    schedule: "Wed & Fri 10:00 - 11:30 AM",
  },
  {
    code: "BIO-110",
    title: "Molecular Biology & Genetics",
    instructor: "Dr. Rosalind Franklin",
    department: "Life Sciences",
    enrolled: 27,
    schedule: "Mon & Thu 03:30 - 05:00 PM",
  },
];

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [students, setStudents] = useState<Student[]>(DEFAULT_STUDENTS);
  const [currentView, setCurrentView] = useState<string>("dashboard");
  const [globalSearch, setGlobalSearch] = useState<string>("");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [omniConfig, setOmniConfig] = useState<OmniRouteConfig>({
    provider: "demo_fallback",
    geminiApiKey: "",
    ollamaBaseUrl: "http://127.0.0.1:11434",
    localModelName: "qwen2.5:14b",
  });

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

  // Load persistent user and student list from localStorage
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("sm_active_user");
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
      const savedStudents = localStorage.getItem("sm_students_list");
      if (savedStudents) {
        setStudents(JSON.parse(savedStudents));
      }
      const savedOmni = localStorage.getItem("sm_omni_config");
      if (savedOmni) {
        setOmniConfig(JSON.parse(savedOmni));
      }
      if (typeof window !== "undefined") {
        if (
          window.location.search.includes("view=students") ||
          window.location.hash.includes("students")
        ) {
          setCurrentView("students");
        } else if (window.location.search.includes("view=notebook")) {
          setCurrentView("notebook");
        } else if (window.location.search.includes("view=tutor")) {
          setCurrentView("tutor");
        }
      }
    } catch {
      // Fallback gracefully
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

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    showToast(`Welcome back, ${user.name}!`, "success");
  };

  const handleSignOut = () => {
    try {
      localStorage.removeItem("sm_active_user");
    } catch {
      // ignore
    }
    setCurrentUser(null);
    showToast("You have signed out.", "info");
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

  const handleResetSampleData = () => {
    saveStudents(DEFAULT_STUDENTS);
    showToast("Default student records restored.", "success");
  };

  const handleClearAllData = () => {
    saveStudents([]);
    showToast("All student records cleared.", "info");
  };

  const handleGlobalSearchChange = (q: string) => {
    setGlobalSearch(q);
    if (currentView !== "students") {
      setCurrentView("students");
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative z-10">
      {/* 1. Initial Loading Splash Screen */}
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}

      {/* 2. Authentication View (if not logged in) */}
      {!isLoading && !currentUser && (
        <AuthPortal onLoginSuccess={handleLoginSuccess} />
      )}

      {/* 3. Main Student Manager Application Shell */}
      {!isLoading && currentUser && (
        <div className="flex flex-col h-screen overflow-hidden">
          <AppHeader
            user={currentUser}
            currentView={currentView}
            onNavigateStudents={() => setCurrentView("students")}
            onSignOut={handleSignOut}
            onOpenAddStudent={() => setCurrentView("students")}
            onSearchChange={handleGlobalSearchChange}
            onOpenSettings={() => setCurrentView("settings")}
            omniProvider={omniConfig.provider}
          />

          <div className="flex flex-1 overflow-hidden">
            <Sidebar
              currentView={currentView}
              onViewChange={setCurrentView}
              studentCount={students.length}
            />

            <main
              className={`flex-1 overflow-y-auto ${
                currentView === "notebook" || currentView === "tutor"
                  ? "p-0 flex flex-col overflow-hidden"
                  : "p-6 md:p-8"
              }`}
            >
              {currentView === "dashboard" && (
                <DashboardView
                  students={students}
                  totalCourses={DEFAULT_COURSES.length}
                  onNavigateToStudents={() => setCurrentView("students")}
                  onRefresh={() => showToast("Dashboard metrics synchronized.", "info")}
                  onNavigateView={setCurrentView}
                />
              )}

              {currentView === "notebook" && (
                <OpenNotebookView omniConfig={omniConfig} />
              )}

              {currentView === "tutor" && (
                <EduAgentView omniConfig={omniConfig} />
              )}

              {currentView === "students" && (
                <StudentsView
                  students={students}
                  onAddStudent={handleAddStudent}
                  onEditStudent={handleEditStudent}
                  onDeleteStudent={handleDeleteStudent}
                  globalSearch={globalSearch}
                />
              )}

              {currentView === "courses" && (
                <CoursesView courses={DEFAULT_COURSES} />
              )}

              {currentView === "settings" && (
                <SettingsView
                  onResetSampleData={handleResetSampleData}
                  onClearAllData={handleClearAllData}
                  onSavePreferences={() =>
                    showToast("Portal preferences saved successfully!", "success")
                  }
                  omniConfig={omniConfig}
                  onUpdateOmniConfig={(newConf) => {
                    setOmniConfig(newConf);
                    showToast(
                      `AI Engine switched to ${newConf.provider.toUpperCase()}`,
                      "success"
                    );
                  }}
                />
              )}
            </main>
          </div>
        </div>
      )}

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
