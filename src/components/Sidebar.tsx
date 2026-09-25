"use client";

import React, { useEffect, useState } from "react";
import { LayoutDashboard, Users, BookOpen, Settings, BookMarked, Bot } from "lucide-react";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  studentCount: number;
}

export default function Sidebar({
  currentView,
  onViewChange,
  studentCount,
}: SidebarProps) {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    function updateClock() {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
      setDate(
        now.toLocaleDateString([], {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      );
    }
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "notebook", label: "Open Notebook", icon: BookMarked, badge: "STEM" },
    { id: "tutor", label: "Edu-Agent Tutor", icon: Bot, badge: "AI" },
    { id: "students", label: "Students", icon: Users, count: studentCount },
    { id: "courses", label: "Courses", icon: BookOpen },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-56 border-r border-blue-500/20 bg-[#070e1c]/80 backdrop-blur-md flex flex-col justify-between p-3.5 shrink-0 select-none">
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold font-[family-name:var(--font-heading)] transition-all cursor-pointer relative ${
                isActive
                  ? "bg-gradient-to-r from-blue-600/25 to-blue-900/35 text-blue-300 border border-blue-400/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                  : "text-slate-400 hover:text-white hover:bg-blue-600/10"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300">
                  {item.count}
                </span>
              )}
              {item.badge && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  {item.badge}
                </span>
              )}
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 bg-blue-400 rounded-r" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer with Live Clock */}
      <div className="p-3 rounded-xl bg-[#060b16]/70 border border-blue-500/15 text-left">
        <div className="text-xs font-bold text-blue-300 font-[family-name:var(--font-heading)]">
          {time || "12:00:00"}
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5">
          {date || "Academic Year 2026"}
        </div>
      </div>
    </aside>
  );
}
