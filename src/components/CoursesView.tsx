"use client";

import React from "react";
import { BookOpen, Clock, Users, GraduationCap } from "lucide-react";
import { Course } from "@/types/student";

interface CoursesViewProps {
  courses: Course[];
}

export default function CoursesView({ courses }: CoursesViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] text-white">
          Courses & Programs
        </h2>
        <p className="text-xs text-slate-400">
          Active academic subjects, assigned teachers, and enrollments
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((c) => (
          <div
            key={c.code}
            className="p-5 rounded-2xl glass-card border border-blue-500/20 flex flex-col justify-between hover:border-blue-400/40 transition-all hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-600/20 border border-blue-500/30 text-blue-300 font-mono text-[11px] font-bold">
                  {c.code}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {c.department}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white font-[family-name:var(--font-heading)] mb-1">
                {c.title}
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Instructor: <strong className="text-slate-300">{c.instructor}</strong>
              </p>
            </div>

            <div className="pt-3 border-t border-blue-500/15 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-blue-300">
                <Users className="w-3.5 h-3.5" />
                <span>{c.enrolled} Students</span>
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span className="truncate max-w-[130px]">{c.schedule}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
