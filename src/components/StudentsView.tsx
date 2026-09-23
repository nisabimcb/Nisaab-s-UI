"use client";

import React, { useState, useMemo } from "react";
import {
  UserPlus,
  Download,
  Search,
  Edit3,
  Trash2,
  X,
  Eye,
  BookOpen,
  Calendar,
  Award,
  CheckCircle2,
  Clock,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { Student } from "@/types/student";

interface StudentsViewProps {
  students: Student[];
  onAddStudent: (student: Omit<Student, "enrolledDate">) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  globalSearch: string;
}

export default function StudentsView({
  students,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  globalSearch,
}: StudentsViewProps) {
  const [activeTab, setActiveTab] = useState<"directory" | "portal">("directory");
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formId, setFormId] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formGrade, setFormGrade] = useState("Grade 10");
  const [formStatus, setFormStatus] = useState<"Active" | "Pending" | "Inactive">("Active");
  const [formGpa, setFormGpa] = useState("3.8");
  const [formMajor, setFormMajor] = useState("Computer Science");

  function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  const effectiveSearch = (search || globalSearch).toLowerCase().trim();

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchQuery =
        !effectiveSearch ||
        s.name.toLowerCase().includes(effectiveSearch) ||
        s.id.toLowerCase().includes(effectiveSearch) ||
        s.email.toLowerCase().includes(effectiveSearch);

      const matchGrade = gradeFilter === "ALL" || s.grade === gradeFilter;
      const matchStatus = statusFilter === "ALL" || s.status === statusFilter;

      return matchQuery && matchGrade && matchStatus;
    });
  }, [students, effectiveSearch, gradeFilter, statusFilter]);

  const openAddModal = () => {
    setFormName("");
    setFormId(`STU-2026-${String(students.length + 1).padStart(3, "0")}`);
    setFormEmail("");
    setFormGrade("Grade 10");
    setFormStatus("Active");
    setFormGpa("3.85");
    setFormMajor("Computer Science");
    setIsAddModalOpen(true);
  };

  const openEditModal = (s: Student) => {
    setEditingStudent(s);
    setFormName(s.name);
    setFormId(s.id);
    setFormEmail(s.email);
    setFormGrade(s.grade);
    setFormStatus(s.status);
    setFormGpa(String(s.gpa ?? 3.8));
    setFormMajor(s.major ?? "Computer Science");
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formId || !formEmail) return;
    onAddStudent({
      name: formName,
      id: formId,
      email: formEmail,
      grade: formGrade,
      status: formStatus,
      gpa: parseFloat(formGpa) || 3.8,
      major: formMajor,
      attendanceRate: 96,
      phone: "+1 (555) 019-2834",
      advisor: "Dr. Alan Turing",
    });
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !formName || !formId || !formEmail) return;
    onEditStudent({
      ...editingStudent,
      name: formName,
      id: formId,
      email: formEmail,
      grade: formGrade,
      status: formStatus,
      gpa: parseFloat(formGpa) || editingStudent.gpa || 3.8,
      major: formMajor,
    });
    setEditingStudent(null);
  };

  const handleExportCSV = () => {
    if (filteredStudents.length === 0) return;
    let csv = "Student ID,Full Name,Email,Grade,Status,GPA,Major,Enrolled Date\n";
    filteredStudents.forEach((s) => {
      csv += `"${s.id}","${s.name}","${s.email}","${s.grade}","${s.status}","${s.gpa || 3.8}","${s.major || 'General'}","${s.enrolledDate}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `student_roster_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Active student for student portal preview
  const primaryStudent = students[0] || {
    id: "STU-2026-001",
    name: "Hashir Naveed",
    email: "hashir.naveed@academy.edu",
    grade: "Undergraduate",
    status: "Active" as const,
    enrolledDate: "2026-01-15",
    gpa: 3.92,
    attendanceRate: 98,
    major: "Computer Science & Artificial Intelligence",
    advisor: "Dr. Alan Turing",
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl glass-card border border-blue-500/25 bg-gradient-to-r from-blue-950/40 via-[#0a1428]/60 to-blue-950/30">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] text-white">
              Student Section & Academic Area
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Directly access student records, individual profiles, and student workspace.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-[#060c16]/90 p-1 rounded-xl border border-blue-500/20 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("directory")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "directory"
                ? "bg-blue-600 text-white shadow-[0_2px_10px_rgba(37,99,235,0.4)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Student Roster
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("portal")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "portal"
                ? "bg-blue-600 text-white shadow-[0_2px_10px_rgba(37,99,235,0.4)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>Student Portal View</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: STUDENT DIRECTORY ================= */}
      {activeTab === "directory" && (
        <div className="space-y-4">
          {/* Action Toolbar */}
          <div className="p-3.5 rounded-2xl glass-card border border-blue-500/20 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:max-w-xs flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by student name, ID or email..."
                className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-[#060c16]/80 border border-blue-500/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-400"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[#060c16]/80 border border-blue-500/15 text-slate-300 text-xs focus:outline-none focus:border-blue-400 cursor-pointer"
              >
                <option value="ALL">All Grades / Levels</option>
                <option value="Grade 9">Grade 9</option>
                <option value="Grade 10">Grade 10</option>
                <option value="Grade 11">Grade 11</option>
                <option value="Grade 12">Grade 12</option>
                <option value="Undergraduate">Undergraduate</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[#060c16]/80 border border-blue-500/15 text-slate-300 text-xs focus:outline-none focus:border-blue-400 cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Inactive">Inactive</option>
              </select>

              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-950/40 hover:bg-blue-900/40 text-blue-200 border border-blue-500/20 text-xs font-semibold transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>

              <button
                type="button"
                onClick={openAddModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold text-xs border border-blue-400/30 shadow-[0_2px_10px_rgba(37,99,235,0.3)] transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Student</span>
              </button>
            </div>
          </div>

          {/* Students Table */}
          <div className="p-5 rounded-2xl glass-card border border-blue-500/20 space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-blue-500/15 text-slate-400 uppercase tracking-wider text-[10px] bg-slate-900/30">
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Student ID</th>
                    <th className="py-2.5 px-3">Grade / Level</th>
                    <th className="py-2.5 px-3">GPA</th>
                    <th className="py-2.5 px-3">Contact Email</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-500/10">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center">
                        <div className="text-slate-400 space-y-2">
                          <p className="font-semibold text-sm text-slate-300">No students found</p>
                          <p className="text-xs text-slate-500">
                            Try adjusting your search criteria or reset filters.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setSearch("");
                              setGradeFilter("ALL");
                              setStatusFilter("ALL");
                            }}
                            className="mt-2 px-3 py-1 rounded-lg bg-blue-950/40 text-blue-300 border border-blue-500/20 text-xs hover:bg-blue-900/40 cursor-pointer"
                          >
                            Reset Filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-blue-600/10 transition-colors">
                        <td className="py-3 px-3">
                          <div
                            className="flex items-center gap-2.5 cursor-pointer"
                            onClick={() => setViewingStudent(s)}
                          >
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-white font-bold text-[10px] flex items-center justify-center">
                              {getInitials(s.name)}
                            </div>
                            <div>
                              <span className="font-semibold text-white hover:text-blue-300 transition-colors">
                                {s.name}
                              </span>
                              <span className="block text-[10px] text-slate-400">
                                {s.major || "General"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-blue-300">{s.id}</td>
                        <td className="py-3 px-3 text-slate-300">{s.grade}</td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-cyan-300 font-mono">
                            {s.gpa ?? "3.85"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-400">{s.email}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              s.status === "Active"
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : s.status === "Pending"
                                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                : "bg-slate-500/15 text-slate-400 border border-slate-500/30"
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setViewingStudent(s)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/15 border border-transparent hover:border-cyan-400/20 transition-all cursor-pointer"
                              title="View Student Profile"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditModal(s)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-300 hover:bg-blue-600/15 border border-transparent hover:border-blue-400/20 transition-all cursor-pointer"
                              title="Edit Student"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingStudent(s)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/15 border border-transparent hover:border-rose-400/20 transition-all cursor-pointer"
                              title="Delete Student"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t border-blue-500/15 flex items-center justify-between text-[11px] text-slate-500">
              <span>
                Showing {filteredStudents.length} of {students.length} students enrolled
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: STUDENT PORTAL (STUDENT VIEW) ================= */}
      {activeTab === "portal" && (
        <div className="space-y-6">
          {/* Student Welcome Banner */}
          <div className="p-6 rounded-2xl glass-card border border-blue-500/30 bg-gradient-to-r from-blue-900/40 via-[#0d1b38]/60 to-blue-950/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white font-bold text-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                {getInitials(primaryStudent.name)}
              </div>
              <div>
                <span className="text-[10px] font-bold text-blue-400 tracking-wider uppercase">
                  Active Student Session &bull; {primaryStudent.id}
                </span>
                <h3 className="text-xl font-bold font-[family-name:var(--font-heading)] text-white">
                  {primaryStudent.name}
                </h3>
                <p className="text-xs text-slate-300">
                  {primaryStudent.major || "Computer Science & AI"} &bull; {primaryStudent.grade}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <span className="block text-xs font-semibold text-slate-400">Academic Standing</span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Dean&apos;s Honor List
                </span>
              </div>
            </div>
          </div>

          {/* Student Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl glass-card border border-blue-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">Cumulative GPA</span>
                <Award className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="text-2xl font-bold text-white font-[family-name:var(--font-heading)]">
                {primaryStudent.gpa || 3.92} / 4.0
              </span>
              <span className="block text-[10px] text-emerald-400 mt-1">Top 5% in Class</span>
            </div>

            <div className="p-4 rounded-2xl glass-card border border-blue-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">Attendance Rate</span>
                <Calendar className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-white font-[family-name:var(--font-heading)]">
                {primaryStudent.attendanceRate || 98}%
              </span>
              <span className="block text-[10px] text-slate-400 mt-1">118 / 120 Lectures</span>
            </div>

            <div className="p-4 rounded-2xl glass-card border border-blue-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">Completed Credits</span>
                <BookOpen className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="text-2xl font-bold text-white font-[family-name:var(--font-heading)]">
                84 / 120
              </span>
              <span className="block text-[10px] text-blue-300 mt-1">70% Degree Progress</span>
            </div>
          </div>

          {/* Enrolled Courses & Schedule */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* My Classes */}
            <div className="p-5 rounded-2xl glass-card border border-blue-500/20 space-y-3">
              <h4 className="text-sm font-bold text-white font-[family-name:var(--font-heading)] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span>My Registered Courses</span>
              </h4>

              <div className="space-y-2.5">
                {[
                  { code: "CS-101", title: "Introduction to Computer Science", grade: "A", instructor: "Dr. Alan Turing" },
                  { code: "MATH-202", title: "Linear Algebra & Calculus", grade: "A-", instructor: "Prof. Katherine Johnson" },
                  { code: "DATA-301", title: "Data Structures & Algorithms", grade: "A+", instructor: "Dr. Donald Knuth" },
                  { code: "PHYS-150", title: "Applied Physics & Mechanics", grade: "B+", instructor: "Dr. Richard Feynman" },
                ].map((c) => (
                  <div
                    key={c.code}
                    className="p-3 rounded-xl bg-[#060c16]/70 border border-blue-500/15 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono text-[10px] font-bold text-blue-400 mr-2">{c.code}</span>
                      <span className="font-semibold text-white">{c.title}</span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">{c.instructor}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded font-bold font-mono bg-blue-600/20 text-cyan-300 border border-blue-500/30">
                      {c.grade}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Today's Schedule & Deadlines */}
            <div className="p-5 rounded-2xl glass-card border border-blue-500/20 space-y-3">
              <h4 className="text-sm font-bold text-white font-[family-name:var(--font-heading)] flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Schedule & Upcoming Deadlines</span>
              </h4>

              <div className="space-y-2.5">
                {[
                  { time: "09:00 AM", event: "Data Structures Lecture", room: "Hall B-12", status: "Upcoming" },
                  { time: "11:30 AM", event: "Linear Algebra Problem Set Due", room: "Portal Submission", status: "Due Today" },
                  { time: "02:00 PM", event: "AI Lab: Python Neural Networks", room: "Lab 4", status: "Upcoming" },
                  { time: "04:30 PM", event: "Academic Advising Session", room: "Office 204", status: "Confirmed" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#060c16]/70 border border-blue-500/15 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono text-xs font-bold text-blue-300 mr-2">{item.time}</span>
                      <span className="font-semibold text-white">{item.event}</span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">{item.room}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/25">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: VIEW STUDENT DETAILS ================= */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-lg p-6 rounded-2xl glass-card border border-blue-500/30 shadow-2xl bg-[#0b1426] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-blue-500/15">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white font-bold text-sm flex items-center justify-center">
                  {getInitials(viewingStudent.name)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-[family-name:var(--font-heading)]">
                    {viewingStudent.name}
                  </h3>
                  <span className="text-xs font-mono text-blue-300">{viewingStudent.id}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingStudent(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#060c16]/70 border border-blue-500/15">
                <span className="text-slate-400 block text-[10px]">Academic Major</span>
                <span className="font-semibold text-white">{viewingStudent.major || "Computer Science"}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#060c16]/70 border border-blue-500/15">
                <span className="text-slate-400 block text-[10px]">Current GPA</span>
                <span className="font-bold text-cyan-300 font-mono">{viewingStudent.gpa ?? "3.85"} / 4.0</span>
              </div>
              <div className="p-3 rounded-xl bg-[#060c16]/70 border border-blue-500/15">
                <span className="text-slate-400 block text-[10px]">Grade / Standing</span>
                <span className="font-semibold text-white">{viewingStudent.grade}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#060c16]/70 border border-blue-500/15">
                <span className="text-slate-400 block text-[10px]">Status</span>
                <span className="font-semibold text-emerald-400">{viewingStudent.status}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#060c16]/70 border border-blue-500/15">
                <span className="text-slate-400 block text-[10px]">Email Address</span>
                <span className="font-semibold text-white truncate block">{viewingStudent.email}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#060c16]/70 border border-blue-500/15">
                <span className="text-slate-400 block text-[10px]">Academic Advisor</span>
                <span className="font-semibold text-white">{viewingStudent.advisor || "Dr. Alan Turing"}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewingStudent(null)}
                className="px-4 py-1.5 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-500"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT STUDENT ================= */}
      {(isAddModalOpen || editingStudent) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md p-6 rounded-2xl glass-card border border-blue-500/30 shadow-2xl bg-[#0b1426]">
            <div className="flex items-center justify-between pb-3 border-b border-blue-500/15 mb-4">
              <h3 className="text-base font-bold text-white font-[family-name:var(--font-heading)]">
                {editingStudent ? "Edit Student Record" : "Add New Student"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingStudent(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={editingStudent ? handleSaveEdit : handleSaveAdd}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Hashir Naveed"
                  className="w-full px-3 py-2 rounded-xl bg-[#060c16] border border-blue-500/20 text-white text-xs outline-none focus:border-blue-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Student ID / Roll No *
                  </label>
                  <input
                    type="text"
                    required
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                    placeholder="STU-2026-001"
                    className="w-full px-3 py-2 rounded-xl bg-[#060c16] border border-blue-500/20 text-white text-xs font-mono outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Grade / Level
                  </label>
                  <select
                    value={formGrade}
                    onChange={(e) => setFormGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#060c16] border border-blue-500/20 text-white text-xs outline-none focus:border-blue-400 cursor-pointer"
                  >
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                    <option value="Undergraduate">Undergraduate</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Major / Department
                  </label>
                  <input
                    type="text"
                    value={formMajor}
                    onChange={(e) => setFormMajor(e.target.value)}
                    placeholder="Computer Science"
                    className="w-full px-3 py-2 rounded-xl bg-[#060c16] border border-blue-500/20 text-white text-xs outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Target GPA (0 - 4.0)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    max="4.0"
                    min="0"
                    value={formGpa}
                    onChange={(e) => setFormGpa(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#060c16] border border-blue-500/20 text-white text-xs font-mono outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="student@academy.edu"
                    className="w-full px-3 py-2 rounded-xl bg-[#060c16] border border-blue-500/20 text-white text-xs outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Enrollment Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) =>
                      setFormStatus(e.target.value as "Active" | "Pending" | "Inactive")
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#060c16] border border-blue-500/20 text-white text-xs outline-none focus:border-blue-400 cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-blue-500/15 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingStudent(null);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-[0_2px_10px_rgba(37,99,235,0.4)]"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CONFIRM DELETE ================= */}
      {deletingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm p-6 rounded-2xl glass-card border border-rose-500/30 shadow-2xl bg-[#0b1426]">
            <h3 className="text-base font-bold text-rose-400 mb-2">Delete Student Record</h3>
            <p className="text-xs text-slate-300 mb-4">
              Are you sure you want to remove <strong>{deletingStudent.name}</strong> from the
              active student roster?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingStudent(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteStudent(deletingStudent.id);
                  setDeletingStudent(null);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-[0_2px_10px_rgba(244,63,94,0.4)]"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
