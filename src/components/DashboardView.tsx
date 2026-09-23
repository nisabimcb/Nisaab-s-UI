"use client";

import React from "react";
import { Users, BookOpen, Activity, Award, ArrowRight, RefreshCw } from "lucide-react";
import { Student } from "@/types/student";

interface DashboardViewProps {
  students: Student[];
  totalCourses: number;
  onNavigateToStudents: () => void;
  onRefresh: () => void;
}

export default function DashboardView({
  students,
  totalCourses,
  onNavigateToStudents,
  onRefresh,
}: DashboardViewProps) {
  function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  const recentStudents = students.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] text-white">
            Dashboard Overview
          </h2>
          <p className="text-xs text-slate-400">
            Real-time academic records & management summary
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-950/40 hover:bg-blue-900/40 text-blue-200 border border-blue-500/20 text-xs font-semibold transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-2xl glass-card border border-blue-500/20 flex items-center gap-3.5 transition-transform hover:-translate-y-0.5">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs text-slate-400 font-medium">Total Enrolled</span>
            <span className="block text-2xl font-bold font-[family-name:var(--font-heading)] text-white leading-tight">
              {students.length}
            </span>
            <span className="text-[10px] font-semibold text-emerald-400">↑ Active Roster</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-2xl glass-card border border-blue-500/20 flex items-center gap-3.5 transition-transform hover:-translate-y-0.5">
          <div className="w-12 h-12 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs text-slate-400 font-medium">Active Courses</span>
            <span className="block text-2xl font-bold font-[family-name:var(--font-heading)] text-white leading-tight">
              {totalCourses}
            </span>
            <span className="text-[10px] font-semibold text-slate-400">4 Departments</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-2xl glass-card border border-blue-500/20 flex items-center gap-3.5 transition-transform hover:-translate-y-0.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs text-slate-400 font-medium">Average Attendance</span>
            <span className="block text-2xl font-bold font-[family-name:var(--font-heading)] text-white leading-tight">
              95.4%
            </span>
            <span className="text-[10px] font-semibold text-emerald-400">+1.8% this term</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-2xl glass-card border border-blue-500/20 flex items-center gap-3.5 transition-transform hover:-translate-y-0.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs text-slate-400 font-medium">Academic Standing</span>
            <span className="block text-2xl font-bold font-[family-name:var(--font-heading)] text-white leading-tight">
              98.2%
            </span>
            <span className="text-[10px] font-semibold text-emerald-400">Above Target</span>
          </div>
        </div>
      </div>

      {/* Recent Students Table Preview */}
      <div className="p-5 rounded-2xl glass-card border border-blue-500/20 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white font-[family-name:var(--font-heading)]">
              Recently Enrolled Students
            </h3>
            <p className="text-xs text-slate-400">
              Latest additions to the academic roster
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToStudents}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-cyan-300 transition-colors cursor-pointer"
          >
            <span>View All Records</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-blue-500/15 text-slate-400 uppercase tracking-wider text-[10px] bg-slate-900/30">
                <th className="py-2.5 px-3">Student</th>
                <th className="py-2.5 px-3">Student ID</th>
                <th className="py-2.5 px-3">Grade / Level</th>
                <th className="py-2.5 px-3">Contact Email</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-500/10">
              {recentStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    No students currently registered.
                  </td>
                </tr>
              ) : (
                recentStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-blue-600/10 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-white font-bold text-[10px] flex items-center justify-center">
                          {getInitials(s.name)}
                        </div>
                        <span className="font-semibold text-white">{s.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-blue-300">{s.id}</td>
                    <td className="py-3 px-3 text-slate-300">{s.grade}</td>
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
