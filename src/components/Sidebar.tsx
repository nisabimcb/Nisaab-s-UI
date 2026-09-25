"use client";

import React, { useEffect, useState } from "react";
import { Settings, BookMarked, Bot, Sparkles, GraduationCap } from "lucide-react";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export default function Sidebar({
  currentView,
  onViewChange,
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
    { id: "notebook", label: "My Notebooks", icon: BookMarked, badge: "RAG" },
    { id: "tutor", label: "AI Study Tutor", icon: Bot, badge: "AI" },
    { id: "settings", label: "AI & Model Settings", icon: Settings },
  ];

  return (
    <aside className="w-56 border-r border-blue-500/20 bg-[#070e1c]/80 backdrop-blur-md flex flex-col justify-between p-3.5 shrink-0 select-none">
      <div>
        <div className="px-3 py-2 mb-3 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center gap-2 text-cyan-300">
          <GraduationCap className="w-4 h-4 text-cyan-400" />
          <span className="text-[11px] font-bold tracking-wider uppercase">
            Student AI Station
          </span>
        </div>

        <nav className="space-y-1.5">
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
                    ? "bg-gradient-to-r from-blue-600/25 to-cyan-900/35 text-cyan-200 border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                    : "text-slate-400 hover:text-white hover:bg-blue-600/10"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-cyan-400 rounded-r" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer with Live Clock */}
      <div className="p-3 rounded-xl bg-[#060b16]/70 border border-blue-500/15 text-left">
        <div className="text-xs font-bold text-cyan-300 font-[family-name:var(--font-heading)]">
          {time || "12:00:00"}
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5">
          {date || "Academic Session 2026"}
        </div>
      </div>
    </aside>
  );
}
